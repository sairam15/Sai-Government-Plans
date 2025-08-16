/**
 * Google Apps Script Version
 * Deploy this as a web app to get a free hosted API
 * 
 * Instructions:
 * 1. Go to script.google.com
 * 2. Create new project
 * 3. Paste this code
 * 4. Deploy as web app (Anyone can access)
 * 5. Use the web app URL as your API endpoint
 */

function doGet(e) {
  const action = e.parameter.action || 'plans';
  const callback = e.parameter.callback; // For JSONP support
  
  let response;
  
  try {
    switch(action) {
      case 'medicare':
        response = getMedicareData();
        break;
      case 'medicaid':
        response = getMedicaidData();
        break;
      case 'health':
        response = { status: 'OK', timestamp: new Date().toISOString() };
        break;
      default:
        response = getAllPlans();
    }
    
    const output = JSON.stringify(response);
    
    // Support JSONP for cross-origin requests
    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + output + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService
      .createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        error: 'Internal server error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  // Handle refresh data requests
  if (e.parameter.action === 'refresh') {
    try {
      // Refresh data from CMS APIs
      const medicare = fetchMedicareFromCMS();
      const medicaid = fetchMedicaidFromCMS();
      
      // Cache the results
      PropertiesService.getScriptProperties().setProperties({
        'medicare_data': JSON.stringify(medicare),
        'medicaid_data': JSON.stringify(medicaid),
        'last_updated': new Date().toISOString()
      });
      
      return ContentService
        .createTextOutput(JSON.stringify({
          message: 'Data refreshed successfully',
          medicare_count: medicare.length,
          medicaid_count: medicaid.length
        }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } catch (error) {
      return ContentService
        .createTextOutput(JSON.stringify({
          error: 'Refresh failed',
          message: error.toString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return doGet(e);
}

function getMedicareData() {
  try {
    // Try to get cached data first
    const cached = PropertiesService.getScriptProperties().getProperty('medicare_data');
    if (cached) {
      return JSON.parse(cached);
    }
    
    // If no cache, fetch fresh data
    return fetchMedicareFromCMS();
  } catch (error) {
    Logger.log('Medicare fetch error: ' + error.toString());
    return getSampleMedicareData();
  }
}

function getMedicaidData() {
  try {
    // Try to get cached data first
    const cached = PropertiesService.getScriptProperties().getProperty('medicaid_data');
    if (cached) {
      return JSON.parse(cached);
    }
    
    // If no cache, return sample data (Medicaid APIs are more complex)
    return getSampleMedicaidData();
  } catch (error) {
    Logger.log('Medicaid fetch error: ' + error.toString());
    return getSampleMedicaidData();
  }
}

function getAllPlans() {
  const medicare = getMedicareData();
  const medicaid = getMedicaidData();
  
  // Add type field to each plan
  const medicarePlans = medicare.map(plan => ({ ...plan, type: 'Medicare Advantage' }));
  const medicaidPlans = medicaid.map(plan => ({ ...plan, type: 'Medicaid' }));
  
  const allPlans = [...medicarePlans, ...medicaidPlans];
  
  // Sort by star rating
  allPlans.sort((a, b) => {
    const aRating = parseFloat(a.overallStarRating || a['Overall Star Rating'] || 0);
    const bRating = parseFloat(b.overallStarRating || b['Overall Star Rating'] || 0);
    return bRating - aRating;
  });
  
  return {
    totalPlans: allPlans.length,
    medicareCount: medicarePlans.length,
    medicaidCount: medicaidPlans.length,
    plans: allPlans,
    lastUpdated: new Date().toISOString()
  };
}

function fetchMedicareFromCMS() {
  const baseUrl = 'https://data.cms.gov/api/1/datastore/query/9c71c6e5-7f1b-434a-bd0e-4b18b6b99f7e';
  
  try {
    // Fetch limited data due to Apps Script quotas
    const response = UrlFetchApp.fetch(baseUrl + '?limit=100&offset=0', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GoogleAppsScript-CMS-Integration/1.0'
      },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      return normalizeMedicareData(data.results || data || []);
    } else {
      Logger.log('CMS API Error: ' + response.getResponseCode());
      return getSampleMedicareData();
    }
  } catch (error) {
    Logger.log('CMS Fetch Error: ' + error.toString());
    return getSampleMedicareData();
  }
}

function fetchMedicaidFromCMS() {
  // Medicaid APIs are more complex and vary by state
  // For now, return sample data
  return getSampleMedicaidData();
}

function normalizeMedicareData(rawData) {
  return rawData.map(record => {
    return {
      planType: 'Medicare Advantage',
      contractId: record['Contract ID'] || record['Contract_ID'] || 'N/A',
      planId: record['Plan ID'] || record['Plan_ID'] || 'N/A',
      planName: record['Plan Name'] || record['Plan_Name'] || 'Unknown Plan',
      orgName: record['Organization Name'] || record['Organization_Name'] || 'Unknown Org',
      state: record['State'] || record['State_Code'] || 'Unknown',
      county: record['County'] || record['County_Name'] || 'Unknown',
      enrollment: parseInt(record['Enrollment'] || record['Total Enrollment'] || 0),
      overallStarRating: parseFloat(record['Overall Star Rating'] || record['Overall_Star_Rating'] || 0),
      lastUpdated: new Date().toISOString(),
      source: 'data.cms.gov via Google Apps Script'
    };
  });
}

function getSampleMedicareData() {
  return [
    {
      planType: 'Medicare Advantage',
      contractId: 'H1234',
      planId: '001',
      planName: 'Blue Cross Medicare Advantage Premier',
      orgName: 'Blue Cross Blue Shield',
      state: 'CA',
      county: 'Los Angeles',
      enrollment: 125000,
      overallStarRating: 4.5,
      lastUpdated: new Date().toISOString(),
      source: 'Sample Data'
    },
    {
      planType: 'Medicare Advantage',
      contractId: 'H5678',
      planId: '002',
      planName: 'Aetna Better Health Medicare',
      orgName: 'Aetna',
      state: 'TX',
      county: 'Harris',
      enrollment: 89000,
      overallStarRating: 4.0,
      lastUpdated: new Date().toISOString(),
      source: 'Sample Data'
    },
    {
      planType: 'Medicare Advantage',
      contractId: 'H9876',
      planId: '003',
      planName: 'UnitedHealthcare AARP Medicare',
      orgName: 'UnitedHealthcare',
      state: 'FL',
      county: 'Miami-Dade',
      enrollment: 150000,
      overallStarRating: 4.2,
      lastUpdated: new Date().toISOString(),
      source: 'Sample Data'
    }
  ];
}

function getSampleMedicaidData() {
  return [
    {
      planType: 'Medicaid',
      contractId: 'MD001',
      planId: 'MD001',
      planName: 'Molina Healthcare Medicaid',
      orgName: 'Molina Healthcare',
      state: 'CA',
      county: 'Los Angeles',
      enrollment: 75000,
      overallStarRating: 3.9,
      lastUpdated: new Date().toISOString(),
      source: 'Sample Data'
    },
    {
      planType: 'Medicaid',
      contractId: 'MD002',
      planId: 'MD002',
      planName: 'Centene Medicaid Plan',
      orgName: 'Centene Corporation',
      state: 'TX',
      county: 'Harris',
      enrollment: 120000,
      overallStarRating: 4.1,
      lastUpdated: new Date().toISOString(),
      source: 'Sample Data'
    },
    {
      planType: 'Medicaid',
      contractId: 'MD003',
      planId: 'MD003',
      planName: 'Anthem Medicaid Plus',
      orgName: 'Anthem',
      state: 'OH',
      county: 'Franklin',
      enrollment: 65000,
      overallStarRating: 3.7,
      lastUpdated: new Date().toISOString(),
      source: 'Sample Data'
    }
  ];
}

// Scheduled function to refresh data daily
function scheduledRefresh() {
  try {
    const medicare = fetchMedicareFromCMS();
    const medicaid = fetchMedicaidFromCMS();
    
    PropertiesService.getScriptProperties().setProperties({
      'medicare_data': JSON.stringify(medicare),
      'medicaid_data': JSON.stringify(medicaid),
      'last_updated': new Date().toISOString()
    });
    
    Logger.log('Scheduled refresh completed successfully');
  } catch (error) {
    Logger.log('Scheduled refresh failed: ' + error.toString());
  }
}

// Setup function - run once to initialize
function setup() {
  // Create a daily trigger for data refresh
  ScriptApp.newTrigger('scheduledRefresh')
    .timeBased()
    .everyDays(1)
    .atHour(2) // 2 AM
    .create();
    
  Logger.log('Setup completed - daily refresh trigger created');
}
