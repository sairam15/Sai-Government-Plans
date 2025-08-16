/**
 * mergePlans.js - Merge and normalize Medicare and Medicaid plan data
 */

/**
 * Merge Medicare and Medicaid plan data into unified dataset
 * @param {Array} medicareData - Array of Medicare plan objects
 * @param {Array} medicaidData - Array of Medicaid plan objects
 * @returns {Array} Unified array of all plans
 */
function mergePlans(medicareData, medicaidData) {
    console.log('🔄 Merging Medicare and Medicaid plan data...');
    
    const allPlans = [];
    
    // Add Medicare plans
    medicareData.forEach(plan => {
        allPlans.push(normalizePlan(plan, 'Medicare'));
    });
    
    // Add Medicaid plans
    medicaidData.forEach(plan => {
        allPlans.push(normalizePlan(plan, 'Medicaid'));
    });
    
    // Sort by state, then by plan name
    allPlans.sort((a, b) => {
        if (a.State !== b.State) {
            return a.State.localeCompare(b.State);
        }
        return a.Plan_Name.localeCompare(b.Plan_Name);
    });
    
    console.log(`✅ Merged plans complete. Total: ${allPlans.length} (Medicare: ${medicareData.length}, Medicaid: ${medicaidData.length})`);
    
    return allPlans;
}

/**
 * Normalize plan data to consistent format
 * @param {Object} plan - Plan object to normalize
 * @param {string} source - Source type ('Medicare' or 'Medicaid')
 * @returns {Object} Normalized plan object
 */
function normalizePlan(plan, source) {
    return {
        Plan_Type: plan.Plan_Type || source,
        Contract_ID: plan.Contract_ID || 'N/A',
        Plan_ID: plan.Plan_ID || 'N/A',
        Plan_Name: plan.Plan_Name || 'Unknown Plan',
        Org_Name: plan.Org_Name || plan.Organization_Name || 'Unknown Organization',
        State: plan.State || 'Unknown',
        County: plan.County || 'Unknown',
        Enrollment: parseInt(plan.Enrollment) || 0,
        Overall_Star_Rating: plan.Overall_Star_Rating || 'N/A',
        Measure_Scores: plan.Measure_Scores || 'Not Available',
        Notes: plan.Notes || '',
        Data_Source: plan.Data_Source || source,
        Last_Updated: plan.Last_Updated || new Date().toISOString().split('T')[0],
        // Additional fields for Medicaid
        Contact_Info: plan.Contact_Info || 'Contact information not available',
        Website: plan.Website || 'Website not available',
        Plan_Benefits: plan.Plan_Benefits || 'Benefits information not available'
    };
}

/**
 * Generate summary statistics for the merged dataset
 * @param {Array} allPlans - Array of all merged plans
 * @returns {Object} Summary statistics
 */
function generateSummaryStats(allPlans) {
    const stats = {
        total_plans: allPlans.length,
        medicare_plans: allPlans.filter(p => p.Plan_Type.includes('Medicare')).length,
        medicaid_plans: allPlans.filter(p => p.Plan_Type.includes('Medicaid')).length,
        states_covered: [...new Set(allPlans.map(p => p.State))].length,
        total_enrollment: allPlans.reduce((sum, p) => sum + p.Enrollment, 0),
        avg_star_rating: 0,
        data_sources: [...new Set(allPlans.map(p => p.Data_Source))]
    };
    
    // Calculate average star rating for Medicare plans only
    const medicareWithRatings = allPlans.filter(p => 
        p.Plan_Type.includes('Medicare') && 
        !isNaN(parseFloat(p.Overall_Star_Rating))
    );
    
    if (medicareWithRatings.length > 0) {
        stats.avg_star_rating = (
            medicareWithRatings.reduce((sum, p) => sum + parseFloat(p.Overall_Star_Rating), 0) / 
            medicareWithRatings.length
        ).toFixed(2);
    }
    
    return stats;
}

/**
 * Filter plans by various criteria
 * @param {Array} plans - Array of plan objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered plans
 */
function filterPlans(plans, filters = {}) {
    let filtered = [...plans];
    
    if (filters.state) {
        filtered = filtered.filter(p => p.State === filters.state);
    }
    
    if (filters.plan_type) {
        filtered = filtered.filter(p => p.Plan_Type.includes(filters.plan_type));
    }
    
    if (filters.min_enrollment) {
        filtered = filtered.filter(p => p.Enrollment >= filters.min_enrollment);
    }
    
    if (filters.min_star_rating) {
        filtered = filtered.filter(p => {
            const rating = parseFloat(p.Overall_Star_Rating);
            return !isNaN(rating) && rating >= filters.min_star_rating;
        });
    }
    
    return filtered;
}

/**
 * Group plans by state for analysis
 * @param {Array} plans - Array of plan objects
 * @returns {Object} Plans grouped by state
 */
function groupPlansByState(plans) {
    const grouped = {};
    
    plans.forEach(plan => {
        if (!grouped[plan.State]) {
            grouped[plan.State] = [];
        }
        grouped[plan.State].push(plan);
    });
    
    return grouped;
}

module.exports = {
    mergePlans,
    normalizePlan,
    generateSummaryStats,
    filterPlans,
    groupPlansByState
};