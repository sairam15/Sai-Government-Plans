/**
 * index.js - Main orchestrator for CMS Plans Data Integration
 * Fetches Medicare and Medicaid data, merges them, and exports to CSV
 */

const fs = require('fs').promises;
const { createObjectCsvWriter } = require('csv-writer');
const { fetchMedicareData } = require('./fetchMedicare');
const { fetchMedicaidData } = require('./fetchMedicaid');
const { mergePlans, generateSummaryStats } = require('./mergePlans');

/**
 * Main function to orchestrate the data integration process
 */
async function main() {
    console.log('🚀 Starting CMS Plans Data Integration...');
    console.log('=' .repeat(60));
    
    try {
        // Step 1: Fetch Medicare data from verified working CMS API
        console.log('\n📊 Step 1: Fetching Medicare data...');
        const medicareData = await fetchMedicareData();
        console.log(`   ✅ Medicare: ${medicareData.length} records`);
        
        // Step 2: Fetch Medicaid data (sample data for now)
        console.log('\n📊 Step 2: Fetching Medicaid data...');
        const medicaidData = await fetchMedicaidData();
        console.log(`   ✅ Medicaid: ${medicaidData.length} records`);
        
        // Step 3: Merge and normalize all plan data
        console.log('\n🔄 Step 3: Merging and normalizing data...');
        const allPlans = mergePlans(medicareData, medicaidData);
        console.log(`   ✅ Total merged plans: ${allPlans.length}`);
        
        // Step 4: Generate summary statistics
        console.log('\n📈 Step 4: Generating summary statistics...');
        const stats = generateSummaryStats(allPlans);
        console.log('   📊 Summary Statistics:');
        console.log(`      • Total Plans: ${stats.total_plans}`);
        console.log(`      • Medicare Plans: ${stats.medicare_plans}`);
        console.log(`      • Medicaid Plans: ${stats.medicaid_plans}`);
        console.log(`      • States Covered: ${stats.states_covered}`);
        console.log(`      • Total Enrollment: ${stats.total_enrollment.toLocaleString()}`);
        console.log(`      • Avg Star Rating: ${stats.avg_star_rating}`);
        console.log(`      • Data Sources: ${stats.data_sources.join(', ')}`);
        
        // Step 5: Export to CSV
        console.log('\n💾 Step 5: Exporting to CSV...');
        await exportToCsv(allPlans);
        
        // Step 6: Save JSON for API use
        console.log('\n💾 Step 6: Saving JSON for API...');
        await saveJsonData(allPlans, stats);
        
        console.log('\n🎉 CMS Plans Data Integration Complete!');
        console.log('=' .repeat(60));
        console.log('📁 Generated files:');
        console.log('   • cms_plans.csv - Main dataset');
        console.log('   • cms_plans.json - JSON format for APIs');
        console.log('   • cms_plans_summary.json - Summary statistics');
        
    } catch (error) {
        console.error('❌ Error in main process:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

/**
 * Export merged plans data to CSV file
 * @param {Array} plans - Array of plan objects
 */
async function exportToCsv(plans) {
    const csvWriter = createObjectCsvWriter({
        path: 'cms_plans.csv',
        header: [
            { id: 'Plan_Type', title: 'Plan_Type' },
            { id: 'Contract_ID', title: 'Contract_ID' },
            { id: 'Plan_ID', title: 'Plan_ID' },
            { id: 'Plan_Name', title: 'Plan_Name' },
            { id: 'Org_Name', title: 'Org_Name' },
            { id: 'State', title: 'State' },
            { id: 'County', title: 'County' },
            { id: 'Enrollment', title: 'Enrollment' },
            { id: 'Overall_Star_Rating', title: 'Overall_Star_Rating' },
            { id: 'Measure_Scores', title: 'Measure_Scores' },
            { id: 'Notes', title: 'Notes' },
            { id: 'Data_Source', title: 'Data_Source' },
            { id: 'Last_Updated', title: 'Last_Updated' }
        ]
    });
    
    await csvWriter.writeRecords(plans);
    console.log('   ✅ CSV export complete: cms_plans.csv');
}

/**
 * Save data in JSON format for API consumption
 * @param {Array} plans - Array of plan objects
 * @param {Object} stats - Summary statistics
 */
async function saveJsonData(plans, stats) {
    // Save main dataset
    await fs.writeFile('cms_plans.json', JSON.stringify({
        metadata: {
            total_records: plans.length,
            generated_at: new Date().toISOString(),
            data_sources: stats.data_sources,
            version: '1.0'
        },
        plans: plans
    }, null, 2));
    
    // Save summary statistics
    await fs.writeFile('cms_plans_summary.json', JSON.stringify({
        summary: stats,
        generated_at: new Date().toISOString(),
        breakdown_by_state: getStateBreakdown(plans),
        top_plans_by_enrollment: getTopPlansByEnrollment(plans)
    }, null, 2));
    
    console.log('   ✅ JSON files saved: cms_plans.json, cms_plans_summary.json');
}

/**
 * Get breakdown of plans by state
 * @param {Array} plans - Array of plan objects
 * @returns {Object} State breakdown
 */
function getStateBreakdown(plans) {
    const breakdown = {};
    
    plans.forEach(plan => {
        if (!breakdown[plan.State]) {
            breakdown[plan.State] = {
                total_plans: 0,
                medicare_plans: 0,
                medicaid_plans: 0,
                total_enrollment: 0
            };
        }
        
        breakdown[plan.State].total_plans++;
        if (plan.Plan_Type.includes('Medicare')) {
            breakdown[plan.State].medicare_plans++;
        }
        if (plan.Plan_Type.includes('Medicaid')) {
            breakdown[plan.State].medicaid_plans++;
        }
        breakdown[plan.State].total_enrollment += plan.Enrollment;
    });
    
    return breakdown;
}

/**
 * Get top plans by enrollment
 * @param {Array} plans - Array of plan objects
 * @returns {Array} Top 10 plans by enrollment
 */
function getTopPlansByEnrollment(plans) {
    return plans
        .sort((a, b) => b.Enrollment - a.Enrollment)
        .slice(0, 10)
        .map(plan => ({
            Plan_Name: plan.Plan_Name,
            Org_Name: plan.Org_Name,
            State: plan.State,
            Plan_Type: plan.Plan_Type,
            Enrollment: plan.Enrollment,
            Overall_Star_Rating: plan.Overall_Star_Rating
        }));
}

// Run the main function if this file is executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = {
    main,
    exportToCsv,
    saveJsonData
};