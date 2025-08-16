/**
 * mergePlans.js
 * 
 * Normalizes and merges Medicare and Medicaid datasets into a unified format
 * Handles data validation, deduplication, and quality scoring
 */

/**
 * Merges Medicare and Medicaid plan datasets into unified format
 * @param {Array} medicareData - Normalized Medicare plan data
 * @param {Array} medicaidData - Normalized Medicaid plan data
 * @returns {Array} Unified dataset with consistent schema
 */
function mergePlanData(medicareData, medicaidData) {
    console.log('Merging Medicare and Medicaid plan datasets...');
    console.log(`Medicare plans: ${medicareData.length}`);
    console.log(`Medicaid plans: ${medicaidData.length}`);
    
    // Combine all plans
    let allPlans = [...medicareData, ...medicaidData];
    
    // Remove duplicates based on contract ID + plan ID combination
    allPlans = removeDuplicates(allPlans);
    
    // Validate and clean data
    allPlans = validateAndCleanData(allPlans);
    
    // Add computed fields
    allPlans = addComputedFields(allPlans);
    
    // Sort by star rating (descending) and enrollment (descending)
    allPlans.sort((a, b) => {
        if (b.overallStarRating !== a.overallStarRating) {
            return b.overallStarRating - a.overallStarRating;
        }
        return b.enrollment - a.enrollment;
    });
    
    console.log(`✓ Merged dataset contains ${allPlans.length} unique plans`);
    return allPlans;
}

/**
 * Removes duplicate plans based on contract ID and plan ID
 * @param {Array} plans - Array of plan objects
 * @returns {Array} Deduplicated plans array
 */
function removeDuplicates(plans) {
    const seen = new Set();
    const deduplicated = [];
    
    for (const plan of plans) {
        const key = `${plan.contractId}-${plan.planId}`;
        
        if (!seen.has(key)) {
            seen.add(key);
            deduplicated.push(plan);
        } else {
            console.log(`Duplicate found and removed: ${plan.planName} (${key})`);
        }
    }
    
    console.log(`Removed ${plans.length - deduplicated.length} duplicates`);
    return deduplicated;
}

/**
 * Validates and cleans plan data
 * @param {Array} plans - Array of plan objects
 * @returns {Array} Cleaned plans array
 */
function validateAndCleanData(plans) {
    console.log('Validating and cleaning plan data...');
    
    const cleaned = plans.map(plan => {
        // Ensure required fields are present
        const cleanedPlan = {
            planType: plan.planType || 'Unknown',
            contractId: cleanString(plan.contractId) || 'N/A',
            planId: cleanString(plan.planId) || 'N/A',
            planName: cleanString(plan.planName) || 'Unknown Plan',
            orgName: cleanString(plan.orgName) || 'Unknown Organization',
            state: cleanString(plan.state)?.toUpperCase() || 'Unknown',
            county: cleanString(plan.county) || 'Unknown',
            enrollment: validateNumber(plan.enrollment, 0),
            overallStarRating: validateStarRating(plan.overallStarRating),
            measureScores: plan.measureScores || '{}',
            notes: cleanString(plan.notes) || generateDefaultNotes(plan),
            lastUpdated: plan.lastUpdated || new Date().toISOString(),
            source: cleanString(plan.source) || 'Unknown'
        };
        
        return cleanedPlan;
    });
    
    // Filter out plans with critical missing data
    const valid = cleaned.filter(plan => 
        plan.planName !== 'Unknown Plan' && 
        plan.contractId !== 'N/A' && 
        plan.planId !== 'N/A'
    );
    
    console.log(`Filtered out ${cleaned.length - valid.length} invalid records`);
    return valid;
}

/**
 * Cleans string values by trimming and handling null/undefined
 * @param {string} value - String to clean
 * @returns {string|null} Cleaned string or null
 */
function cleanString(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    
    const cleaned = String(value).trim();
    return cleaned === '' ? null : cleaned;
}

/**
 * Validates numeric values with fallback
 * @param {number|string} value - Value to validate
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} Valid number
 */
function validateNumber(value, defaultValue = 0) {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : Math.max(0, num);
}

/**
 * Validates star rating values (0-5 scale)
 * @param {number|string} rating - Rating to validate
 * @returns {number} Valid star rating between 0-5
 */
function validateStarRating(rating) {
    const num = parseFloat(rating);
    if (isNaN(num)) return 0;
    return Math.min(5, Math.max(0, num));
}

/**
 * Generates default notes for plans missing notes
 * @param {Object} plan - Plan object
 * @returns {string} Default notes
 */
function generateDefaultNotes(plan) {
    const notes = [];
    
    if (plan.planType) {
        notes.push(`${plan.planType} plan`);
    }
    
    if (plan.overallStarRating > 4) {
        notes.push('High-performing plan');
    } else if (plan.overallStarRating > 3) {
        notes.push('Average performing plan');
    } else if (plan.overallStarRating > 0) {
        notes.push('Plan with room for improvement');
    }
    
    return notes.join('; ') || 'Healthcare plan';
}

/**
 * Adds computed fields to plan data
 * @param {Array} plans - Array of plan objects
 * @returns {Array} Plans with computed fields added
 */
function addComputedFields(plans) {
    console.log('Adding computed fields...');
    
    return plans.map(plan => {
        // Add performance tier based on star rating
        let performanceTier = 'Not Rated';
        if (plan.overallStarRating >= 4.5) {
            performanceTier = 'Excellent';
        } else if (plan.overallStarRating >= 4.0) {
            performanceTier = 'Good';
        } else if (plan.overallStarRating >= 3.0) {
            performanceTier = 'Average';
        } else if (plan.overallStarRating > 0) {
            performanceTier = 'Below Average';
        }
        
        // Add enrollment tier
        let enrollmentTier = 'Small';
        if (plan.enrollment >= 100000) {
            enrollmentTier = 'Large';
        } else if (plan.enrollment >= 50000) {
            enrollmentTier = 'Medium';
        }
        
        // Parse measure scores for analysis
        let measureCount = 0;
        try {
            const measures = JSON.parse(plan.measureScores);
            measureCount = Object.keys(measures).length;
        } catch (e) {
            // Invalid JSON, keep count as 0
        }
        
        return {
            ...plan,
            performanceTier,
            enrollmentTier,
            measureCount,
            dataQualityScore: calculateDataQualityScore(plan)
        };
    });
}

/**
 * Calculates data quality score based on completeness
 * @param {Object} plan - Plan object
 * @returns {number} Quality score between 0-100
 */
function calculateDataQualityScore(plan) {
    let score = 0;
    const maxScore = 10;
    
    // Required fields (each worth 2 points)
    if (plan.planName && plan.planName !== 'Unknown Plan') score += 2;
    if (plan.orgName && plan.orgName !== 'Unknown Organization') score += 2;
    if (plan.state && plan.state !== 'Unknown') score += 2;
    if (plan.contractId && plan.contractId !== 'N/A') score += 2;
    
    // Optional but valuable fields (each worth 1 point)
    if (plan.overallStarRating > 0) score += 1;
    if (plan.enrollment > 0) score += 1;
    
    return Math.round((score / maxScore) * 100);
}

/**
 * Generates summary statistics for the merged dataset
 * @param {Array} plans - Merged plan data
 * @returns {Object} Summary statistics
 */
function generateSummaryStats(plans) {
    const stats = {
        totalPlans: plans.length,
        medicareCount: plans.filter(p => p.planType === 'Medicare Advantage').length,
        medicaidCount: plans.filter(p => p.planType === 'Medicaid').length,
        statesCount: new Set(plans.map(p => p.state)).size,
        organizationsCount: new Set(plans.map(p => p.orgName)).size,
        totalEnrollment: plans.reduce((sum, p) => sum + p.enrollment, 0),
        avgStarRating: plans.reduce((sum, p) => sum + p.overallStarRating, 0) / plans.length,
        highPerformingPlans: plans.filter(p => p.overallStarRating >= 4.0).length,
        topStates: getTopStates(plans),
        topOrganizations: getTopOrganizations(plans)
    };
    
    return stats;
}

/**
 * Gets top states by plan count
 * @param {Array} plans - Plan data
 * @returns {Array} Top states with counts
 */
function getTopStates(plans) {
    const stateCounts = {};
    plans.forEach(plan => {
        stateCounts[plan.state] = (stateCounts[plan.state] || 0) + 1;
    });
    
    return Object.entries(stateCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([state, count]) => ({ state, count }));
}

/**
 * Gets top organizations by plan count
 * @param {Array} plans - Plan data
 * @returns {Array} Top organizations with counts
 */
function getTopOrganizations(plans) {
    const orgCounts = {};
    plans.forEach(plan => {
        orgCounts[plan.orgName] = (orgCounts[plan.orgName] || 0) + 1;
    });
    
    return Object.entries(orgCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([organization, count]) => ({ organization, count }));
}

module.exports = {
    mergePlanData,
    generateSummaryStats,
    validateAndCleanData,
    addComputedFields
};
