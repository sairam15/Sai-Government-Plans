#!/usr/bin/env node

/**
 * index.js - Main orchestrator for CMS API Integration
 * 
 * Fetches Medicare and Medicaid data, merges them, and exports to CSV
 * This is the main entry point for the data fetching process
 */

const fs = require('fs-extra');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { fetchMedicareData } = require('./fetchMedicare');
const { fetchMedicaidData } = require('./fetchMedicaid');
const { mergePlanData, generateSummaryStats } = require('./mergePlans');

// Configuration
const OUTPUT_DIR = './output';
const CSV_OUTPUT_FILE = path.join(OUTPUT_DIR, 'cms_plans.csv');
const STATS_OUTPUT_FILE = path.join(OUTPUT_DIR, 'summary_stats.json');
const LOG_FILE = path.join(OUTPUT_DIR, 'fetch_log.txt');

// CSV column definitions
const CSV_COLUMNS = [
    { id: 'planType', title: 'Plan_Type' },
    { id: 'contractId', title: 'Contract_ID' },
    { id: 'planId', title: 'Plan_ID' },
    { id: 'planName', title: 'Plan_Name' },
    { id: 'orgName', title: 'Org_Name' },
    { id: 'state', title: 'State' },
    { id: 'county', title: 'County' },
    { id: 'enrollment', title: 'Enrollment' },
    { id: 'overallStarRating', title: 'Overall_Star_Rating' },
    { id: 'performanceTier', title: 'Performance_Tier' },
    { id: 'enrollmentTier', title: 'Enrollment_Tier' },
    { id: 'measureScores', title: 'Measure_Scores' },
    { id: 'measureCount', title: 'Measure_Count' },
    { id: 'dataQualityScore', title: 'Data_Quality_Score' },
    { id: 'notes', title: 'Notes' },
    { id: 'lastUpdated', title: 'Last_Updated' },
    { id: 'source', title: 'Source' }
];

/**
 * Sets up logging to capture process output
 */
function setupLogging() {
    const logStream = fs.createWriteStream(LOG_FILE, { flags: 'w' });
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    console.log = (...args) => {
        const timestamp = new Date().toISOString();
        const message = `[${timestamp}] ${args.join(' ')}\n`;
        logStream.write(message);
        originalConsoleLog(...args);
    };
    
    console.error = (...args) => {
        const timestamp = new Date().toISOString();
        const message = `[${timestamp}] ERROR: ${args.join(' ')}\n`;
        logStream.write(message);
        originalConsoleError(...args);
    };
    
    return logStream;
}

/**
 * Creates CSV file from merged plan data
 * @param {Array} planData - Merged and normalized plan data
 * @returns {Promise<string>} Path to created CSV file
 */
async function createCsvOutput(planData) {
    console.log('Creating CSV output...');
    
    const csvWriter = createCsvWriter({
        path: CSV_OUTPUT_FILE,
        header: CSV_COLUMNS,
        encoding: 'utf8'
    });
    
    try {
        await csvWriter.writeRecords(planData);
        console.log(`✓ CSV exported successfully: ${CSV_OUTPUT_FILE}`);
        console.log(`✓ Total records: ${planData.length}`);
        
        // Get file size for reporting
        const stats = await fs.stat(CSV_OUTPUT_FILE);
        const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`✓ File size: ${fileSizeMB} MB`);
        
        return CSV_OUTPUT_FILE;
    } catch (error) {
        console.error('Error creating CSV file:', error);
        throw error;
    }
}

/**
 * Saves summary statistics to JSON file
 * @param {Object} stats - Summary statistics object
 * @returns {Promise<string>} Path to created stats file
 */
async function saveSummaryStats(stats) {
    console.log('Saving summary statistics...');
    
    try {
        await fs.writeJson(STATS_OUTPUT_FILE, stats, { spaces: 2 });
        console.log(`✓ Summary stats saved: ${STATS_OUTPUT_FILE}`);
        return STATS_OUTPUT_FILE;
    } catch (error) {
        console.error('Error saving summary stats:', error);
        throw error;
    }
}

/**
 * Displays summary statistics to console
 * @param {Object} stats - Summary statistics object
 */
function displaySummaryStats(stats) {
    console.log('\n' + '='.repeat(60));
    console.log('CMS PLAN DATA INTEGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Plans Processed: ${stats.totalPlans.toLocaleString()}`);
    console.log(`├── Medicare Advantage: ${stats.medicareCount.toLocaleString()}`);
    console.log(`└── Medicaid: ${stats.medicaidCount.toLocaleString()}`);
    console.log(`States Covered: ${stats.statesCount}`);
    console.log(`Organizations: ${stats.organizationsCount.toLocaleString()}`);
    console.log(`Total Enrollment: ${stats.totalEnrollment.toLocaleString()}`);
    console.log(`Average Star Rating: ${stats.avgStarRating.toFixed(2)}`);
    console.log(`High-Performing Plans (4+ stars): ${stats.highPerformingPlans.toLocaleString()}`);
    
    console.log('\nTop 5 States by Plan Count:');
    stats.topStates.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ${item.state}: ${item.count} plans`);
    });
    
    console.log('\nTop 5 Organizations by Plan Count:');
    stats.topOrganizations.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ${item.organization}: ${item.count} plans`);
    });
    
    console.log('='.repeat(60));
}

/**
 * Validates output data quality
 * @param {Array} planData - Plan data to validate
 * @returns {Object} Validation results
 */
function validateOutputData(planData) {
    console.log('Validating output data quality...');
    
    const validation = {
        totalRecords: planData.length,
        validRecords: 0,
        missingStarRatings: 0,
        missingEnrollment: 0,
        missingStateInfo: 0,
        averageDataQuality: 0,
        issues: []
    };
    
    let totalQualityScore = 0;
    
    planData.forEach((plan, index) => {
        let isValid = true;
        
        // Check for missing critical data
        if (!plan.overallStarRating || plan.overallStarRating === 0) {
            validation.missingStarRatings++;
        }
        
        if (!plan.enrollment || plan.enrollment === 0) {
            validation.missingEnrollment++;
        }
        
        if (!plan.state || plan.state === 'Unknown') {
            validation.missingStateInfo++;
            isValid = false;
        }
        
        if (!plan.planName || plan.planName === 'Unknown Plan') {
            validation.issues.push(`Row ${index + 1}: Missing plan name`);
            isValid = false;
        }
        
        if (isValid) {
            validation.validRecords++;
        }
        
        totalQualityScore += plan.dataQualityScore || 0;
    });
    
    validation.averageDataQuality = Math.round(totalQualityScore / planData.length);
    validation.completeness = Math.round((validation.validRecords / validation.totalRecords) * 100);
    
    console.log(`Data Quality Validation Results:`);
    console.log(`├── Valid Records: ${validation.validRecords}/${validation.totalRecords} (${validation.completeness}%)`);
    console.log(`├── Missing Star Ratings: ${validation.missingStarRatings}`);
    console.log(`├── Missing Enrollment: ${validation.missingEnrollment}`);
    console.log(`├── Missing State Info: ${validation.missingStateInfo}`);
    console.log(`└── Average Data Quality Score: ${validation.averageDataQuality}/100`);
    
    if (validation.issues.length > 0) {
        console.log(`\nData Issues Found: ${validation.issues.length}`);
        validation.issues.slice(0, 5).forEach(issue => console.log(`  - ${issue}`));
        if (validation.issues.length > 5) {
            console.log(`  ... and ${validation.issues.length - 5} more issues`);
        }
    }
    
    return validation;
}

/**
 * Main execution function
 */
async function main() {
    const startTime = Date.now();
    let logStream;
    
    try {
        // Setup
        console.log('🚀 Starting CMS API Data Integration Process...');
        console.log(`Started at: ${new Date().toISOString()}\n`);
        
        // Ensure output directory exists
        await fs.ensureDir(OUTPUT_DIR);
        
        // Setup logging
        logStream = setupLogging();
        
        // Step 1: Fetch Medicare data
        console.log('📋 Step 1/5: Fetching Medicare Advantage data...');
        const medicareData = await fetchMedicareData();
        
        // Step 2: Fetch Medicaid data
        console.log('\n📋 Step 2/5: Fetching Medicaid data...');
        const medicaidData = await fetchMedicaidData();
        
        // Step 3: Merge and normalize datasets
        console.log('\n📋 Step 3/5: Merging and normalizing datasets...');
        const mergedData = mergePlanData(medicareData, medicaidData);
        
        // Step 4: Generate summary statistics
        console.log('\n📋 Step 4/5: Generating summary statistics...');
        const summaryStats = generateSummaryStats(mergedData);
        
        // Step 5: Export data
        console.log('\n📋 Step 5/5: Exporting data...');
        
        // Validate data quality
        const validation = validateOutputData(mergedData);
        summaryStats.dataValidation = validation;
        
        // Create CSV output
        const csvPath = await createCsvOutput(mergedData);
        
        // Save summary statistics
        const statsPath = await saveSummaryStats(summaryStats);
        
        // Display results
        displaySummaryStats(summaryStats);
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log(`\n✅ CMS Data Integration completed successfully!`);
        console.log(`⏱️  Total execution time: ${duration} seconds`);
        console.log(`📄 Output files created:`);
        console.log(`   • CSV Data: ${csvPath}`);
        console.log(`   • Statistics: ${statsPath}`);
        console.log(`   • Process Log: ${LOG_FILE}`);
        
        // Final recommendations
        if (validation.completeness < 90) {
            console.log(`\n⚠️  Data completeness is ${validation.completeness}%. Consider reviewing data sources for missing information.`);
        }
        
        if (validation.averageDataQuality < 80) {
            console.log(`⚠️  Average data quality score is ${validation.averageDataQuality}/100. Some records may need manual review.`);
        }
        
        console.log('\n🎉 Ready for analysis! You can now:');
        console.log('   • Import cms_plans.csv into Excel, Tableau, or other analytics tools');
        console.log('   • Use the data for healthcare plan comparisons and analysis');
        console.log('   • Review summary_stats.json for key insights');
        
    } catch (error) {
        console.error('\n❌ CMS Data Integration failed:', error.message);
        console.error('\nFull error details:', error);
        
        // Try to save partial results if available
        try {
            if (typeof medicareData !== 'undefined' && medicareData.length > 0) {
                const partialPath = path.join(OUTPUT_DIR, 'partial_medicare_data.json');
                await fs.writeJson(partialPath, medicareData, { spaces: 2 });
                console.log(`Partial Medicare data saved to: ${partialPath}`);
            }
            
            if (typeof medicaidData !== 'undefined' && medicaidData.length > 0) {
                const partialPath = path.join(OUTPUT_DIR, 'partial_medicaid_data.json');
                await fs.writeJson(partialPath, medicaidData, { spaces: 2 });
                console.log(`Partial Medicaid data saved to: ${partialPath}`);
            }
        } catch (saveError) {
            console.error('Could not save partial results:', saveError.message);
        }
        
        process.exit(1);
    } finally {
        // Close log stream
        if (logStream) {
            logStream.end();
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n⏹️  Process interrupted by user. Cleaning up...');
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Export main function for testing
module.exports = { main };

// Run if called directly
if (require.main === module) {
    main();
}
