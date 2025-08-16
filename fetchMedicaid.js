/**
 * fetchMedicaid.js - Medicaid data fetcher with sample/fallback data
 * Note: Medicaid data often requires state-specific APIs
 */

const axios = require('axios');

/**
 * Fetch Medicaid plan data
 * Currently returns sample data as Medicaid APIs vary by state
 * @returns {Promise<Array>} Array of Medicaid plan records
 */
async function fetchMedicaidData() {
    console.log('🏥 Starting Medicaid data fetch...');
    
    try {
        // TODO: Implement actual state-specific Medicaid APIs
        // For now, return sample data representing typical Medicaid managed care plans
        console.log('📋 Using sample Medicaid data (state APIs vary)...');
        
        const medicaidPlans = getSampleMedicaidData();
        
        console.log(`✅ Medicaid data complete. Total plans: ${medicaidPlans.length}`);
        return medicaidPlans;
        
    } catch (error) {
        console.error('❌ Error fetching Medicaid data:', error.message);
        return getSampleMedicaidData();
    }
}

/**
 * Generate sample Medicaid managed care plan data
 * Represents typical Medicaid plans across different states
 * @returns {Array} Sample Medicaid plan data
 */
function getSampleMedicaidData() {
    const states = ['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI'];
    const plans = [];
    
    states.forEach((state, stateIndex) => {
        // Generate 2-3 Medicaid managed care plans per state
        for (let i = 1; i <= 3; i++) {
            plans.push({
                Plan_Type: 'Medicaid Managed Care',
                Contract_ID: `MCD-${state}-${String(i).padStart(3, '0')}`,
                Plan_ID: `${state}-MEDICAID-${i}`,
                Plan_Name: `${state} Medicaid Health Plan ${i}`,
                Org_Name: `${state} Medicaid Organization ${i}`,
                State: state,
                County: getCountyForState(state, i),
                Enrollment: Math.floor(Math.random() * 50000) + 10000,
                Overall_Star_Rating: 'N/A', // Medicaid doesn't use star ratings like Medicare
                Measure_Scores: 'HEDIS Quality Measures Available',
                Notes: 'Medicaid Managed Care Plan - Sample Data',
                Data_Source: 'Sample Data',
                Last_Updated: new Date().toISOString().split('T')[0],
                Contact_Info: `1-800-${state}-MCD`,
                Website: `https://${state.toLowerCase()}-medicaid.gov`,
                Plan_Benefits: 'Medical, Dental, Vision, Pharmacy'
            });
        }
    });
    
    return plans;
}

/**
 * Get representative county for each state
 * @param {string} state - State abbreviation
 * @param {number} index - Plan index for variety
 * @returns {string} County name
 */
function getCountyForState(state, index) {
    const counties = {
        'CA': ['Los Angeles', 'San Diego', 'Orange'][index - 1] || 'Los Angeles',
        'TX': ['Harris', 'Dallas', 'Tarrant'][index - 1] || 'Harris',
        'FL': ['Miami-Dade', 'Orange', 'Hillsborough'][index - 1] || 'Miami-Dade',
        'NY': ['New York', 'Kings', 'Queens'][index - 1] || 'New York',
        'PA': ['Philadelphia', 'Allegheny', 'Montgomery'][index - 1] || 'Philadelphia',
        'IL': ['Cook', 'DuPage', 'Lake'][index - 1] || 'Cook',
        'OH': ['Cuyahoga', 'Hamilton', 'Franklin'][index - 1] || 'Cuyahoga',
        'GA': ['Fulton', 'Gwinnett', 'DeKalb'][index - 1] || 'Fulton',
        'NC': ['Mecklenburg', 'Wake', 'Guilford'][index - 1] || 'Mecklenburg',
        'MI': ['Wayne', 'Oakland', 'Macomb'][index - 1] || 'Wayne'
    };
    
    return counties[state] || 'Unknown County';
}

/**
 * Fetch Medicaid data for a specific state (placeholder for future implementation)
 * @param {string} stateCode - State code (e.g., 'CA', 'TX')
 * @returns {Promise<Array>} State-specific Medicaid plans
 */
async function fetchMedicaidDataByState(stateCode) {
    console.log(`Fetching Medicaid data for state: ${stateCode}`);
    
    // TODO: Implement state-specific Medicaid APIs
    // Each state has different systems and APIs for Medicaid data
    
    return getSampleMedicaidData().filter(plan => plan.State === stateCode);
}

module.exports = {
    fetchMedicaidData,
    fetchMedicaidDataByState,
    getSampleMedicaidData
};