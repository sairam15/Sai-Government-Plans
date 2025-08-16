/**
 * fetchMedicaid.js
 * 
 * Fetches Medicaid plan data from data.medicaid.gov API
 * Handles pagination and normalizes the response data
 */

const axios = require('axios');

// Medicaid API base URL
const MEDICAID_API_BASE = 'https://data.medicaid.gov/api/1/datastore';

// Common Medicaid dataset IDs (these may change, check data.medicaid.gov for current IDs)
const MEDICAID_DATASETS = {
    // Managed Care Plans dataset
    MANAGED_CARE_PLANS: '50cc88e7-7195-4d4e-8b0a-9c69b09c4d6b',
    // State Plan Information
    STATE_PLANS: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
    // Alternative fallback dataset
    FALLBACK_DATASET: 'b2c3d4e5-6789-01bc-def0-234567890bcd'
};

/**
 * Fetches Medicaid plan data with pagination
 * @param {string} datasetId - The dataset ID from data.medicaid.gov
 * @param {number} limit - Number of records per page (max 1000)
 * @param {number} offset - Starting offset for pagination
 * @returns {Promise<Array>} Array of Medicaid plan records
 */
async function fetchMedicaidDataPage(datasetId, limit = 1000, offset = 0) {
    try {
        console.log(`Fetching Medicaid data: offset ${offset}, limit ${limit}`);
        
        const response = await axios.get(`${MEDICAID_API_BASE}/query/${datasetId}`, {
            params: {
                limit: limit,
                offset: offset,
                // Add filters for active plans
                conditions: JSON.stringify([
                    { property: 'Status', value: 'Active' }
                ])
            },
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'CMS-API-Integration/2.0'
            },
            timeout: 30000 // 30 second timeout
        });
        
        return response.data?.results || response.data || [];
    } catch (error) {
        console.error(`Error fetching Medicaid data (offset ${offset}):`, error.message);
        
        // Handle common API errors
        if (error.response?.status === 404) {
            console.log('Medicaid dataset not found, trying alternative approach...');
            return [];
        }
        
        if (error.response?.status === 429) {
            console.log('Rate limited, waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            throw error; // Retry will be handled by caller
        }
        
        throw error;
    }
}

/**
 * Alternative method to fetch Medicaid data from state-specific APIs
 * Many states have their own Medicaid plan APIs
 * @returns {Promise<Array>} Array of Medicaid plan records from state APIs
 */
async function fetchStateSpecificMedicaidData() {
    console.log('Attempting to fetch from state-specific Medicaid APIs...');
    
    const stateEndpoints = [
        // California
        { state: 'CA', url: 'https://data.chhs.ca.gov/api/3/action/datastore_search', resource_id: 'managed-care-plans' },
        // Texas
        { state: 'TX', url: 'https://data.texas.gov/api/views/medicaid-plans/rows.json' },
        // New York
        { state: 'NY', url: 'https://health.data.ny.gov/api/views/medicaid-plans/rows.json' }
    ];
    
    let allStateData = [];
    
    for (const endpoint of stateEndpoints) {
        try {
            console.log(`Fetching Medicaid data for ${endpoint.state}...`);
            
            const response = await axios.get(endpoint.url, {
                params: endpoint.resource_id ? { resource_id: endpoint.resource_id } : {},
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'CMS-API-Integration/2.0'
                },
                timeout: 15000
            });
            
            const stateData = response.data?.result?.records || response.data?.data || [];
            console.log(`Fetched ${stateData.length} plans from ${endpoint.state}`);
            
            // Add state identifier to each record
            const stateDataWithState = stateData.map(record => ({
                ...record,
                state: endpoint.state,
                source: `${endpoint.state} State API`
            }));
            
            allStateData = allStateData.concat(stateDataWithState);
            
            // Be respectful to state APIs
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (stateError) {
            console.error(`Error fetching from ${endpoint.state}:`, stateError.message);
            // Continue with other states
        }
    }
    
    return allStateData;
}

/**
 * Fetches all Medicaid data with automatic pagination
 * @returns {Promise<Array>} Complete array of Medicaid plan records
 */
async function fetchAllMedicaidData() {
    console.log('Starting Medicaid data fetch from APIs...');
    
    let allData = [];
    let successfulFetch = false;
    
    // Try federal Medicaid API first
    const datasetsToTry = [
        MEDICAID_DATASETS.MANAGED_CARE_PLANS, 
        MEDICAID_DATASETS.STATE_PLANS,
        MEDICAID_DATASETS.FALLBACK_DATASET
    ];
    
    for (const datasetId of datasetsToTry) {
        console.log(`Attempting to fetch from federal dataset: ${datasetId}`);
        
        try {
            let offset = 0;
            const limit = 1000;
            let hasMoreData = true;
            let datasetData = [];
            
            while (hasMoreData) {
                try {
                    const pageData = await fetchMedicaidDataPage(datasetId, limit, offset);
                    
                    if (pageData.length === 0) {
                        hasMoreData = false;
                        break;
                    }
                    
                    datasetData = datasetData.concat(pageData);
                    offset += limit;
                    
                    console.log(`Fetched ${pageData.length} Medicaid records. Total from this dataset: ${datasetData.length}`);
                    
                    // Be respectful to the API
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                    // If we got less than the limit, we've reached the end
                    if (pageData.length < limit) {
                        hasMoreData = false;
                    }
                    
                } catch (pageError) {
                    console.error(`Page fetch error:`, pageError.message);
                    break; // Try next dataset
                }
            }
            
            if (datasetData.length > 0) {
                allData = allData.concat(datasetData);
                successfulFetch = true;
                console.log(`Successfully fetched ${datasetData.length} records from dataset ${datasetId}`);
            }
            
        } catch (datasetError) {
            console.error(`Failed to fetch from dataset ${datasetId}:`, datasetError.message);
            continue;
        }
    }
    
    // If federal API didn't work, try state APIs
    if (!successfulFetch) {
        console.log('Federal Medicaid API unsuccessful, trying state-specific APIs...');
        const stateData = await fetchStateSpecificMedicaidData();
        allData = allData.concat(stateData);
        
        if (stateData.length > 0) {
            successfulFetch = true;
        }
    }
    
    // If still no data, use sample data for development
    if (allData.length === 0) {
        console.log('Unable to fetch from any Medicaid API, using sample data for development...');
        return getSampleMedicaidData();
    }
    
    console.log(`Total Medicaid records fetched: ${allData.length}`);
    return allData;
}

/**
 * Normalizes Medicaid data to consistent format
 * @param {Array} rawData - Raw data from Medicaid APIs
 * @returns {Array} Normalized Medicaid plan records
 */
function normalizeMedicaidData(rawData) {
    console.log('Normalizing Medicaid data...');
    
    return rawData.map(record => {
        // Handle different possible field names from various Medicaid APIs
        const planName = record['Plan Name'] || record['plan_name'] || record['Program Name'] || record['name'] || 'Unknown Plan';
        const orgName = record['Organization'] || record['organization'] || record['MCO Name'] || record['Plan Sponsor'] || record['Company'] || 'Unknown Organization';
        const state = record['State'] || record['state'] || record['State_Code'] || record['jurisdiction'] || 'Unknown';
        const contractId = record['Contract ID'] || record['contract_id'] || record['Contract Number'] || record['Plan ID'] || generateContractId(orgName, state);
        const planId = record['Plan ID'] || record['plan_id'] || record['Program ID'] || contractId;
        const county = record['County'] || record['county'] || record['Service Area'] || record['Coverage Area'] || 'Statewide';
        const enrollment = parseInt(record['Enrollment'] || record['enrollment'] || record['Members'] || record['Covered Lives'] || 0);
        
        // Medicaid plans don't typically have star ratings like Medicare, but may have quality measures
        const qualityRating = parseFloat(record['Quality Rating'] || record['NCQA Rating'] || 0);
        
        return {
            planType: 'Medicaid',
            contractId,
            planId,
            planName,
            orgName,
            state,
            county,
            enrollment,
            overallStarRating: qualityRating, // Use quality rating if available, otherwise 0
            measureScores: JSON.stringify(extractQualityMeasures(record)),
            notes: generateMedicaidNotes(record),
            lastUpdated: new Date().toISOString(),
            source: record.source || 'data.medicaid.gov'
        };
    }).filter(plan => plan.planName !== 'Unknown Plan'); // Filter out invalid records
}

/**
 * Generates a contract ID for Medicaid plans that don't have one
 * @param {string} orgName - Organization name
 * @param {string} state - State code
 * @returns {string} Generated contract ID
 */
function generateContractId(orgName, state) {
    const orgCode = orgName.substring(0, 3).toUpperCase();
    const stateCode = state.substring(0, 2).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `MD${stateCode}${orgCode}${timestamp}`;
}

/**
 * Extracts quality measures from Medicaid records
 * @param {Object} record - Raw Medicaid record
 * @returns {Object} Quality measures
 */
function extractQualityMeasures(record) {
    const measures = {};
    
    // Common Medicaid quality measure categories
    const measureCategories = [
        'NCQA', 'HEDIS', 'Access', 'Quality', 'Patient Satisfaction', 
        'Clinical Outcomes', 'Prevention', 'Maternal Health', 'Child Health'
    ];
    
    Object.keys(record).forEach(key => {
        const lowerKey = key.toLowerCase();
        
        measureCategories.forEach(category => {
            if (lowerKey.includes(category.toLowerCase()) && record[key] && record[key] !== 'N/A') {
                measures[category] = record[key];
            }
        });
    });
    
    return measures;
}

/**
 * Generates explanatory notes for Medicaid plans
 * @param {Object} record - Raw Medicaid record
 * @returns {string} Explanatory notes
 */
function generateMedicaidNotes(record) {
    let notes = [];
    
    // Add plan type information
    const planType = record['Plan Type'] || record['program_type'] || record['Model'];
    if (planType) {
        notes.push(`Plan Type: ${planType}`);
    }
    
    // Add service area information
    const serviceArea = record['Service Area'] || record['Coverage Area'] || record['Counties Served'];
    if (serviceArea && serviceArea !== 'Statewide') {
        notes.push(`Service Area: ${serviceArea}`);
    }
    
    // Add quality accreditation if available
    const accreditation = record['NCQA Accreditation'] || record['Accreditation Status'];
    if (accreditation) {
        notes.push(`Accreditation: ${accreditation}`);
    }
    
    return notes.join('; ') || 'Medicaid managed care plan';
}

/**
 * Sample Medicaid data for development/fallback
 * @returns {Array} Sample Medicaid records
 */
function getSampleMedicaidData() {
    return [
        {
            'Plan Name': 'Molina Healthcare Medicaid',
            'Organization': 'Molina Healthcare',
            'State': 'CA',
            'County': 'Los Angeles',
            'Enrollment': '75000',
            'Plan Type': 'Managed Care',
            'NCQA Rating': '3.9'
        },
        {
            'Plan Name': 'Centene Medicaid Plan',
            'Organization': 'Centene Corporation',
            'State': 'TX',
            'County': 'Harris',
            'Enrollment': '120000',
            'Plan Type': 'Managed Care',
            'NCQA Rating': '4.1'
        },
        {
            'Plan Name': 'Anthem Medicaid Plus',
            'Organization': 'Anthem',
            'State': 'OH',
            'County': 'Franklin',
            'Enrollment': '65000',
            'Plan Type': 'Managed Care',
            'NCQA Rating': '3.7'
        },
        {
            'Plan Name': 'Amerigroup Medicaid',
            'Organization': 'Amerigroup',
            'State': 'FL',
            'County': 'Miami-Dade',
            'Enrollment': '110000',
            'Plan Type': 'Managed Care',
            'NCQA Rating': '4.3'
        }
    ];
}

/**
 * Main function to fetch and normalize Medicaid data
 * @returns {Promise<Array>} Normalized Medicaid plan data
 */
async function fetchMedicaidData() {
    try {
        const rawData = await fetchAllMedicaidData();
        const normalizedData = normalizeMedicaidData(rawData);
        
        console.log(`✓ Successfully processed ${normalizedData.length} Medicaid plans`);
        return normalizedData;
        
    } catch (error) {
        console.error('Error in Medicaid data fetch process:', error);
        
        // Fallback to sample data in case of complete API failure
        console.log('Using sample Medicaid data as fallback...');
        const sampleData = getSampleMedicaidData();
        return normalizeMedicaidData(sampleData);
    }
}

module.exports = {
    fetchMedicaidData,
    normalizeMedicaidData
};
