const axios = require('axios');

// Sample Medicare Advantage data for testing
const sampleMedicareData = [
    {
        plan_id: 'MA001',
        plan_name: 'Blue Cross Medicare Advantage Premier',
        organization: 'Blue Cross Blue Shield',
        contract_id: 'H1234',
        star_rating: 4.5,
        member_count: 125000,
        state: 'CA',
        region: 'West',
        plan_type: 'HMO',
        ncqa_rating: 'Excellent',
        website: 'https://www.bcbs.com/medicare',
        phone: '1-800-MEDICARE',
        last_updated: new Date().toISOString(),
        source: 'CMS.gov'
    },
    {
        plan_id: 'MA002',
        plan_name: 'Aetna Better Health Medicare',
        organization: 'Aetna',
        contract_id: 'H5678',
        star_rating: 4.0,
        member_count: 89000,
        state: 'TX',
        region: 'South',
        plan_type: 'PPO',
        ncqa_rating: 'Good',
        website: 'https://www.aetna.com/medicare',
        phone: '1-855-AETNA-MC',
        last_updated: new Date().toISOString(),
        source: 'CMS.gov'
    },
    {
        plan_id: 'MA003',
        plan_name: 'UnitedHealthcare AARP Medicare',
        organization: 'UnitedHealthcare',
        contract_id: 'H9876',
        star_rating: 4.2,
        member_count: 150000,
        state: 'FL',
        region: 'South',
        plan_type: 'HMO',
        ncqa_rating: 'Very Good',
        website: 'https://www.uhc.com/medicare',
        phone: '1-800-UHC-CARE',
        last_updated: new Date().toISOString(),
        source: 'CMS.gov'
    },
    {
        plan_id: 'MA004',
        plan_name: 'Humana Gold Plus Medicare',
        organization: 'Humana',
        contract_id: 'H5432',
        star_rating: 3.8,
        member_count: 95000,
        state: 'NY',
        region: 'Northeast',
        plan_type: 'PPO',
        ncqa_rating: 'Good',
        website: 'https://www.humana.com/medicare',
        phone: '1-800-HUMANA-1',
        last_updated: new Date().toISOString(),
        source: 'CMS.gov'
    },
    {
        plan_id: 'MA005',
        plan_name: 'Kaiser Permanente Medicare',
        organization: 'Kaiser Permanente',
        contract_id: 'H1111',
        star_rating: 4.7,
        member_count: 180000,
        state: 'CA',
        region: 'West',
        plan_type: 'HMO',
        ncqa_rating: 'Excellent',
        website: 'https://www.kp.org/medicare',
        phone: '1-800-KAISER-P',
        last_updated: new Date().toISOString(),
        source: 'CMS.gov'
    }
];

// Sample Medicaid data for testing
const sampleMedicaidData = [
    {
        plan_id: 'MD001',
        plan_name: 'Molina Healthcare Medicaid',
        organization: 'Molina Healthcare',
        contract_id: 'MC1234',
        star_rating: 3.9,
        member_count: 75000,
        state: 'CA',
        region: 'West',
        plan_type: 'Medicaid',
        ncqa_rating: 'Good',
        website: 'https://www.molina.com/medicaid',
        phone: '1-800-MOLINA-1',
        last_updated: new Date().toISOString(),
        source: 'State Medicaid Office'
    },
    {
        plan_id: 'MD002',
        plan_name: 'Centene Medicaid Plan',
        organization: 'Centene Corporation',
        contract_id: 'MC5678',
        star_rating: 4.1,
        member_count: 120000,
        state: 'TX',
        region: 'South',
        plan_type: 'Medicaid',
        ncqa_rating: 'Very Good',
        website: 'https://www.centene.com/medicaid',
        phone: '1-800-CENTENE',
        last_updated: new Date().toISOString(),
        source: 'State Medicaid Office'
    },
    {
        plan_id: 'MD003',
        plan_name: 'Anthem Medicaid Plus',
        organization: 'Anthem',
        contract_id: 'MC9876',
        star_rating: 3.7,
        member_count: 65000,
        state: 'OH',
        region: 'Midwest',
        plan_type: 'Medicaid',
        ncqa_rating: 'Good',
        website: 'https://www.anthem.com/medicaid',
        phone: '1-800-ANTHEM-M',
        last_updated: new Date().toISOString(),
        source: 'State Medicaid Office'
    },
    {
        plan_id: 'MD004',
        plan_name: 'Amerigroup Medicaid',
        organization: 'Amerigroup',
        contract_id: 'MC5432',
        star_rating: 4.3,
        member_count: 110000,
        state: 'FL',
        region: 'South',
        plan_type: 'Medicaid',
        ncqa_rating: 'Very Good',
        website: 'https://www.amerigroup.com/medicaid',
        phone: '1-800-AMERIG-1',
        last_updated: new Date().toISOString(),
        source: 'State Medicaid Office'
    }
];

// Sample CMS criteria data
const sampleCMSCriteria = [
    { plan_id: 'MA001', criteria_name: 'Customer Service', criteria_value: 'Pass', impact_level: 'Low' },
    { plan_id: 'MA001', criteria_name: 'Network Adequacy', criteria_value: 'Pass', impact_level: 'Medium' },
    { plan_id: 'MA002', criteria_name: 'Quality Reporting', criteria_value: 'Fail', impact_level: 'High' },
    { plan_id: 'MA003', criteria_name: 'Appeals Process', criteria_value: 'Pass', impact_level: 'Medium' },
    { plan_id: 'MA004', criteria_name: 'Pharmacy Network', criteria_value: 'Fail', impact_level: 'Critical' },
    { plan_id: 'MA005', criteria_name: 'Preventive Care', criteria_value: 'Pass', impact_level: 'Low' }
];

/**
 * Fetch Medicare Advantage plans data
 * In production, this would fetch from actual CMS APIs or data sources
 */
async function fetchMedicareData(db) {
    try {
        console.log('Fetching Medicare Advantage data...');
        
        // Save Medicare data
        await db.saveMedicareData(sampleMedicareData);
        
        // Save CMS criteria
        await db.saveCMSCriteria(sampleCMSCriteria);
        
        console.log(`Successfully saved ${sampleMedicareData.length} Medicare Advantage plans`);
        console.log(`Successfully saved ${sampleCMSCriteria.length} CMS criteria records`);
        
        return { success: true, count: sampleMedicareData.length };
        
    } catch (error) {
        console.error('Error fetching Medicare data:', error);
        throw error;
    }
}

/**
 * Fetch Medicaid plans data
 * In production, this would fetch from state Medicaid offices or aggregated sources
 */
async function fetchMedicaidData(db) {
    try {
        console.log('Fetching Medicaid data...');
        
        // Save Medicaid data
        await db.saveMedicaidData(sampleMedicaidData);
        
        console.log(`Successfully saved ${sampleMedicaidData.length} Medicaid plans`);
        
        return { success: true, count: sampleMedicaidData.length };
        
    } catch (error) {
        console.error('Error fetching Medicaid data:', error);
        throw error;
    }
}

/**
 * Fetch data from real CMS APIs (for future implementation)
 * This is a placeholder for when you want to connect to real data sources
 */
async function fetchRealCMSData() {
    // Example of what real API calls might look like:
    /*
    try {
        const response = await axios.get('https://data.cms.gov/api/1/datastore/query/[dataset-id]', {
            params: {
                conditions: [
                    { property: 'year', value: '2024' }
                ],
                limit: 1000
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching real CMS data:', error);
        throw error;
    }
    */
    
    console.log('Real CMS API integration not yet implemented');
    console.log('Using sample data for demonstration purposes');
    return null;
}

module.exports = {
    fetchMedicareData,
    fetchMedicaidData,
    fetchRealCMSData
};