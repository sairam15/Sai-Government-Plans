const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const cron = require('node-cron');
const { fetchMedicareData, fetchMedicaidData } = require('./scripts/fetchData');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Data storage paths
const DATA_DIR = './data';
const MEDICARE_FILE = path.join(DATA_DIR, 'medicare_plans.json');
const MEDICAID_FILE = path.join(DATA_DIR, 'medicaid_plans.json');
const CMS_CRITERIA_FILE = path.join(DATA_DIR, 'cms_criteria.json');

// Ensure data directory exists
fs.ensureDirSync(DATA_DIR);

// Database functions using JSON files
class JSONDatabase {
    constructor() {
        this.initializeFiles();
    }

    async initializeFiles() {
        try {
            // Initialize empty files if they don't exist
            if (!await fs.pathExists(MEDICARE_FILE)) {
                await fs.writeJson(MEDICARE_FILE, []);
            }
            if (!await fs.pathExists(MEDICAID_FILE)) {
                await fs.writeJson(MEDICAID_FILE, []);
            }
            if (!await fs.pathExists(CMS_CRITERIA_FILE)) {
                await fs.writeJson(CMS_CRITERIA_FILE, []);
            }
            console.log('JSON database initialized');
        } catch (error) {
            console.error('Error initializing JSON database:', error);
        }
    }

    async getMedicareData(filters = {}) {
        try {
            const data = await fs.readJson(MEDICARE_FILE);
            return this.applyFilters(data, filters);
        } catch (error) {
            console.error('Error reading Medicare data:', error);
            return [];
        }
    }

    async getMedicaidData(filters = {}) {
        try {
            const data = await fs.readJson(MEDICAID_FILE);
            return this.applyFilters(data, filters);
        } catch (error) {
            console.error('Error reading Medicaid data:', error);
            return [];
        }
    }

    async getCMSCriteria(planId) {
        try {
            const data = await fs.readJson(CMS_CRITERIA_FILE);
            return planId ? data.filter(item => item.plan_id === planId) : data;
        } catch (error) {
            console.error('Error reading CMS criteria:', error);
            return [];
        }
    }

    async saveMedicareData(data) {
        try {
            await fs.writeJson(MEDICARE_FILE, data, { spaces: 2 });
            console.log(`Saved ${data.length} Medicare plans`);
        } catch (error) {
            console.error('Error saving Medicare data:', error);
            throw error;
        }
    }

    async saveMedicaidData(data) {
        try {
            await fs.writeJson(MEDICAID_FILE, data, { spaces: 2 });
            console.log(`Saved ${data.length} Medicaid plans`);
        } catch (error) {
            console.error('Error saving Medicaid data:', error);
            throw error;
        }
    }

    async saveCMSCriteria(data) {
        try {
            await fs.writeJson(CMS_CRITERIA_FILE, data, { spaces: 2 });
            console.log(`Saved ${data.length} CMS criteria records`);
        } catch (error) {
            console.error('Error saving CMS criteria:', error);
            throw error;
        }
    }

    applyFilters(data, filters) {
        let filtered = [...data];
        
        if (filters.state) {
            filtered = filtered.filter(item => item.state === filters.state);
        }
        if (filters.region) {
            filtered = filtered.filter(item => item.region === filters.region);
        }
        if (filters.minRating) {
            filtered = filtered.filter(item => item.star_rating >= parseFloat(filters.minRating));
        }
        
        // Sort by rating and member count
        filtered.sort((a, b) => {
            if (b.star_rating !== a.star_rating) {
                return b.star_rating - a.star_rating;
            }
            return b.member_count - a.member_count;
        });
        
        return filtered;
    }
}

// Initialize database
const db = new JSONDatabase();

// API Routes

// Get all Medicare Advantage plans
app.get('/api/medicare-advantage', async (req, res) => {
    try {
        const { state, region, minRating } = req.query;
        const data = await db.getMedicareData({ state, region, minRating });
        res.json(data);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Failed to fetch Medicare data' });
    }
});

// Get all Medicaid plans
app.get('/api/medicaid', async (req, res) => {
    try {
        const { state, region, minRating } = req.query;
        const data = await db.getMedicaidData({ state, region, minRating });
        res.json(data);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Failed to fetch Medicaid data' });
    }
});

// Get all plans (combined)
app.get('/api/plans', async (req, res) => {
    try {
        const { type, state, region, minRating } = req.query;
        
        if (type === 'medicare') {
            const data = await db.getMedicareData({ state, region, minRating });
            return res.json(data);
        } else if (type === 'medicaid') {
            const data = await db.getMedicaidData({ state, region, minRating });
            return res.json(data);
        }
        
        // Get both types
        const medicareData = await db.getMedicareData({ state, region, minRating });
        const medicaidData = await db.getMedicaidData({ state, region, minRating });
        
        // Add type field
        const medicarePlans = medicareData.map(plan => ({ ...plan, type: 'medicare' }));
        const medicaidPlans = medicaidData.map(plan => ({ ...plan, type: 'medicaid' }));
        
        const allPlans = [...medicarePlans, ...medicaidPlans];
        
        // Sort combined data
        allPlans.sort((a, b) => {
            if (b.star_rating !== a.star_rating) {
                return b.star_rating - a.star_rating;
            }
            return b.member_count - a.member_count;
        });
        
        res.json(allPlans);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Failed to fetch combined plan data' });
    }
});

// Get CMS criteria for a specific plan
app.get('/api/plan/:planId/cms-criteria', async (req, res) => {
    try {
        const { planId } = req.params;
        const data = await db.getCMSCriteria(planId);
        res.json(data);
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ error: 'Failed to fetch CMS criteria' });
    }
});

// Manual data refresh endpoint
app.post('/api/refresh-data', async (req, res) => {
    try {
        console.log('Manual data refresh initiated...');
        await fetchMedicareData(db);
        await fetchMedicaidData(db);
        res.json({ message: 'Data refresh completed successfully' });
    } catch (error) {
        console.error('Data refresh error:', error);
        res.status(500).json({ error: 'Data refresh failed' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize with sample data and start server
async function startServer() {
    try {
        await db.initializeFiles();
        
        // Load initial sample data
        console.log('Loading initial sample data...');
        await fetchMedicareData(db);
        await fetchMedicaidData(db);
        
        // Schedule weekly data refresh (every Sunday at 2 AM)
        cron.schedule('0 2 * * 0', async () => {
            console.log('Running scheduled data refresh...');
            try {
                await fetchMedicareData(db);
                await fetchMedicaidData(db);
                console.log('Scheduled data refresh completed successfully');
            } catch (error) {
                console.error('Scheduled data refresh failed:', error);
            }
        });
        
        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Access the application at: http://localhost:${PORT}`);
            console.log(`API Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    process.exit(0);
});

// Start the server
startServer();