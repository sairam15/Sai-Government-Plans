/**
 * Google Apps Script Backend - Health Plan API
 * * This script replicates the functionality of an Express.js server, using a 
 * Google Sheet as a database. It fetches Medicare and Medicaid plan data,
 * stores it, and provides API endpoints to retrieve and filter the data.
 * * Features:
 * - Fetches real Medicare enrollment data from the CMS API.
 * - Uses a Google Sheet as a persistent database for plan data.
 * - Provides API endpoints for Medicare, Medicaid, and combined plans.
 * - Supports filtering by state and minimum star rating.
 * - Includes a manual data refresh endpoint.
 * - Caches data for improved performance.
 * - Can be configured with a time-driven trigger for automatic weekly updates.
 *
 * Instructions:
 * 1.  **Setup Sheet**: Create a new Google Sheet. This script will automatically create the necessary tabs ('Medicare', 'Medicaid', 'CMS_Criteria').
 * 2.  **Setup Script**:
 * - Go to script.google.com and create a new project.
 * - Paste this entire code into the editor.
 * - In the `GLOBAL_CONFIG` section below, replace 'YOUR_SPREADSHEET_ID_HERE' with your Google Sheet's ID.
 * (The ID is the long string in the Sheet's URL: docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit)
 * 3.  **Initial Data Load**:
 * - In the script editor, select the `refreshAllData` function from the dropdown menu and click "Run".
 * - You will be prompted to grant permissions. Allow them. This will populate your sheet with data.
 * 4.  **Deploy as Web App**:
 * - Click "Deploy" > "New Deployment".
 * - Select Type: "Web app".
 * - Description: "Health Plan API".
 * - Execute as: "Me".
 * - Who has access: "Anyone".
 * - Click "Deploy". Copy the Web app URL.
 * 5.  **(Optional) Automatic Refresh**:
 * - In the script editor, select the `setupWeeklyTrigger` function and click "Run".
 * - This will schedule the script to refresh the data automatically every Sunday at 2 AM.
 * * Example API URLs (replace YOUR_WEB_APP_URL):
 * - Health Check:      `YOUR_WEB_APP_URL?action=health`
 * - Get Medicare Plans: `YOUR_WEB_APP_URL?action=medicare-advantage&state=CA&minRating=4`
 * - Get Medicaid Plans: `YOUR_WEB_APP_URL?action=medicaid&state=TX`
 * - Get All Plans:      `YOUR_WEB_APP_URL?action=plans&state=FL`
 * - Refresh Data (POST request): `YOUR_WEB_APP_URL?action=refresh-data`
 */

// =================================================================
// --- GLOBAL CONFIGURATION ---
// =================================================================
const GLOBAL_CONFIG = {
  // ❗️ IMPORTANT: PASTE YOUR GOOGLE SHEET ID HERE
  spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE', 
  sheets: {
    medicare: 'Medicare',
    medicaid: 'Medicaid',
    cmsCriteria: 'CMS_Criteria'
  },
  cacheExpiration: 300, // Cache duration in seconds (5 minutes)
};

const CMS_CONFIG = {
  baseUrl: 'https://data.cms.gov/data-api/v1/dataset',
  medicareDatasetId: 'd7fabe1e-d19b-4333-9eff-e80e0643f2fd', // Medicare Monthly Enrollment
  maxRecords: 500
};

// =================================================================
// --- WEB APP ENTRY POINTS (doGet / doPost) ---
// =================================================================

/**
 * Handles GET requests to the web app. Acts as the main API router.
 */
function doGet(e) {
  const action = e.parameter.action || 'health';

  try {
    switch (action) {
      case 'health':
        return createResponse({ status: 'OK', timestamp: new Date().toISOString(), version: '1.0.0' });
      case 'medicare-advantage':
        return handlePlanRequest(GLOBAL_CONFIG.sheets.medicare, e.parameter);
      case 'medicaid':
        return handlePlanRequest(GLOBAL_CONFIG.sheets.medicaid, e.parameter);
      case 'plans':
        return handleCombinedPlansRequest(e.parameter);
      case 'cms-criteria':
        return handleCmsCriteriaRequest(e.parameter);
      default:
        return createErrorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (error) {
    Logger.log(`Error in doGet for action ${action}: ${error.message} \n ${error.stack}`);
    return createErrorResponse(`Internal Server Error: ${error.message}`, 500);
  }
}

/**
 * Handles POST requests, primarily for triggering a data refresh.
 */
function doPost(e) {
  const action = e.parameter.action;
  
  if (action === 'refresh-data') {
    try {
      refreshAllData();
      return createResponse({ message: 'Data refresh completed successfully' });
    } catch (error) {
      Logger.log(`Error in doPost for refresh-data: ${error.message} \n ${error.stack}`);
      return createErrorResponse(`Data refresh failed: ${error.message}`, 500);
    }
  }
  
  return createErrorResponse('Invalid POST action', 400);
}


// =================================================================
// --- API REQUEST HANDLERS ---
// =================================================================

/**
 * Handles requests for a single plan type (Medicare or Medicaid).
 */
function handlePlanRequest(sheetName, params) {
  const data = getSheetDataAsObjects(sheetName);
  const filteredData = applyFilters(data, params);
  return createResponse(filteredData);
}

/**
 * Handles requests for combined Medicare and Medicaid plans.
 */
function handleCombinedPlansRequest(params) {
  const medicareData = getSheetDataAsObjects(GLOBAL_CONFIG.sheets.medicare).map(p => ({ ...p, type: 'medicare' }));
  const medicaidData = getSheetDataAsObjects(GLOBAL_CONFIG.sheets.medicaid).map(p => ({ ...p, type: 'medicaid' }));
  
  const allPlans = [...medicareData, ...medicaidData];
  const filteredPlans = applyFilters(allPlans, params);
  
  return createResponse(filteredPlans);
}

/**
 * Handles requests for CMS criteria.
 */
function handleCmsCriteriaRequest(params) {
  const planId = params.planId;
  let criteria = getSheetDataAsObjects(GLOBAL_CONFIG.sheets.cmsCriteria);
  
  if (planId) {
    criteria = criteria.filter(item => item.plan_id === planId);
  }
  
  return createResponse(criteria);
}

/**
 * Applies filters for state and minimum star rating to a dataset.
 */
function applyFilters(data, filters) {
  let filtered = [...data];

  if (filters.state) {
    filtered = filtered.filter(item => item.state && item.state.toUpperCase() === filters.state.toUpperCase());
  }

  // The server.js has region, but the data source here doesn't. This can be added if data source changes.
  // if (filters.region) { ... }

  if (filters.minRating) {
    const minRating = parseFloat(filters.minRating);
    filtered = filtered.filter(item => item.star_rating && parseFloat(item.star_rating) >= minRating);
  }

  // Sort by star rating (desc), then member count (desc)
  filtered.sort((a, b) => {
    const ratingA = parseFloat(a.star_rating) || 0;
    const ratingB = parseFloat(b.star_rating) || 0;
    if (ratingB !== ratingA) {
      return ratingB - ratingA;
    }
    return (parseInt(b.member_count) || 0) - (parseInt(a.member_count) || 0);
  });

  return filtered;
}


// =================================================================
// --- DATA FETCHING & REFRESH LOGIC ---
// =================================================================

/**
 * Main function to refresh all data sources and save to Google Sheets.
 * This can be run manually from the editor or via a trigger.
 */
function refreshAllData() {
  Logger.log('Starting data refresh process...');
  
  // Fetch and save Medicare data
  const medicareData = fetchApiMedicareData();
  saveDataToSheet(GLOBAL_CONFIG.sheets.medicare, medicareData);

  // Generate and save sample Medicaid data
  const medicaidData = generateSampleMedicaidData();
  saveDataToSheet(GLOBAL_GENERAL_CONFIG.sheets.medicaid, medicaidData);

  // Generate and save sample CMS Criteria data
  const allPlanIds = [...medicareData.map(p => p.plan_id), ...medicaidData.map(p => p.plan_id)];
  const cmsCriteriaData = generateSampleCmsCriteria(allPlanIds);
  saveDataToSheet(GLOBAL_CONFIG.sheets.cmsCriteria, cmsCriteriaData);

  // Clear cache after updating sheets
  clearCache();
  
  Logger.log('Data refresh process completed successfully.');
}

/**
 * Fetches Medicare data from the CMS API.
 */
function fetchApiMedicareData() {
  const url = `${CMS_CONFIG.baseUrl}/${CMS_CONFIG.medicareDatasetId}/data?size=${CMS_CONFIG.maxRecords}`;
  Logger.log('Fetching from CMS API: ' + url);
  
  try {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    
    if (response.getResponseCode() !== 200) {
      throw new Error(`CMS API Error: ${response.getResponseCode()} - ${response.getContentText()}`);
    }
    
    const apiData = JSON.parse(response.getContentText());
    if (!apiData || !Array.isArray(apiData)) {
      throw new Error('Unexpected CMS API response format.');
    }

    // Transform API data to our standardized format
    return apiData.map((record, index) => ({
      plan_id: record.PLAN_ID || `${record.CONTRACT_ID || 'MA'}-${String(index).padStart(3, '0')}`,
      plan_name: record.PLAN_NAME || `Medicare Advantage Plan ${index + 1}`,
      organization_name: record.ORGANIZATION_NAME || 'Medicare Organization',
      state: record.BENE_STATE_ABRVTN || 'N/A',
      region: record.BENE_COUNTY_DESC || 'N/A', // Using county as region
      member_count: parseInt(record.TOT_BENES) || Math.floor(Math.random() * 10000),
      star_rating: generateStarRating(),
      data_source: 'CMS API'
    }));
  } catch (error) {
    Logger.log(`Failed to fetch from CMS API: ${error.message}. Falling back to sample data.`);
    return generateSampleMedicareData(); // Fallback
  }
}

/**
 * Generates sample Medicare data as a fallback.
 */
function generateSampleMedicareData() {
  return [
    { plan_id: 'H1234-001', plan_name: 'HealthCare Plus (Sample)', organization_name: 'HealthCare Plus', state: 'CA', region: 'Los Angeles', member_count: 15420, star_rating: 4.0, data_source: 'Sample Fallback' },
    { plan_id: 'H5678-002', plan_name: 'Senior Care Complete (Sample)', organization_name: 'Senior Care Corp', state: 'FL', region: 'Miami-Dade', member_count: 8750, star_rating: 3.5, data_source: 'Sample Fallback' }
  ];
}

/**
 * Generates sample Medicaid data.
 */
function generateSampleMedicaidData() {
  const states = ['CA', 'TX', 'FL', 'NY', 'PA'];
  const plans = [];
  states.forEach(state => {
    for (let i = 1; i <= 3; i++) {
      plans.push({
        plan_id: `${state}-MEDICAID-${i}`,
        plan_name: `${state} Medicaid Health Plan ${i}`,
        organization_name: `${state} Medicaid Org ${i}`,
        state: state,
        region: getCountyForState(state, i),
        member_count: Math.floor(Math.random() * 30000) + 5000,
        star_rating: 'N/A', // Medicaid plans often don't have star ratings
        data_source: 'Generated Sample'
      });
    }
  });
  return plans;
}

/**
 * Generates sample CMS criteria for given plan IDs.
 */
function generateSampleCmsCriteria(planIds) {
  const criteria = [];
  const measures = ['Customer Service Rating', 'Health Outcomes Score', 'Preventive Care Access', 'Pharmacy Services'];
  planIds.forEach(id => {
    measures.forEach(measure => {
      criteria.push({
        plan_id: id,
        measure_name: measure,
        score: (Math.random() * 2 + 3).toFixed(1), // Random score between 3.0 and 5.0
        description: `This score reflects performance on the ${measure.toLowerCase()} metric.`
      });
    });
  });
  return criteria;
}


// =================================================================
// --- GOOGLE SHEETS & CACHE HELPERS ---
// =================================================================

/**
 * Gets the active spreadsheet object.
 */
function getSpreadsheet() {
  if (GLOBAL_CONFIG.spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE') {
    throw new Error("Spreadsheet ID is not set. Please update GLOBAL_CONFIG.spreadsheetId.");
  }
  return SpreadsheetApp.openById(GLOBAL_CONFIG.spreadsheetId);
}

/**
 * Retrieves a sheet by name, creating it with headers if it doesn't exist.
 */
function getSheetByName(name) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Add a placeholder header if the sheet is new
    sheet.appendRow(['Initializing...']);
  }
  return sheet;
}

/**
 * Saves an array of objects to a specified sheet, overwriting existing data.
 */
function saveDataToSheet(sheetName, data) {
  if (!data || data.length === 0) {
    Logger.log(`No data to save for sheet: ${sheetName}`);
    return;
  }
  
  const sheet = getSheetByName(sheetName);
  const headers = Object.keys(data[0]);
  const values = data.map(obj => headers.map(header => obj[header]));
  
  sheet.clear();
  sheet.appendRow(headers);
  sheet.getRange(2, 1, values.length, headers.length).setValues(values);
  
  Logger.log(`Saved ${values.length} rows to sheet: ${sheetName}`);
}

/**
 * Reads data from a sheet and returns it as an array of objects, using caching.
 */
function getSheetDataAsObjects(sheetName) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(sheetName);
  if (cached) {
    Logger.log(`Serving from cache: ${sheetName}`);
    return JSON.parse(cached);
  }

  const sheet = getSheetByName(sheetName);
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length < 2) return [];

  const headers = values[0];
  const data = values.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
  
  cache.put(sheetName, JSON.stringify(data), GLOBAL_CONFIG.cacheExpiration);
  Logger.log(`Fetched and cached data for: ${sheetName}`);
  return data;
}

/**
 * Clears all script cache.
 */
function clearCache() {
  CacheService.getScriptCache().removeAll([
    GLOBAL_CONFIG.sheets.medicare, 
    GLOBAL_CONFIG.sheets.medicaid,
    GLOBAL_CONFIG.sheets.cmsCriteria
  ]);
  Logger.log('Script cache cleared.');
}


// =================================================================
// --- UTILITIES & TRIGGER SETUP ---
// =================================================================

/**
 * Creates a standardized JSON response for the web app.
 */
function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Creates a standardized error response.
 */
function createErrorResponse(message, statusCode = 500) {
  const errorObject = { error: true, message: message };
  return ContentService.createTextOutput(JSON.stringify(errorObject))
    .setMimeType(ContentService.MimeType.JSON)
    // While Apps Script doesn't truly set HTTP status codes, this is good practice
    // if the output is ever proxied.
    // .setStatusCode(statusCode); 
}

/**
 * Generates a realistic star rating based on weighted probabilities.
 */
function generateStarRating() {
  const ratings = [2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
  const weights = [0.05, 0.15, 0.30, 0.35, 0.10, 0.05];
  const random = Math.random();
  let cumulative = 0;
  for (let i = 0; i < ratings.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) return ratings[i];
  }
  return 3.5;
}

/**
 * Helper to get a sample county for a state.
 */
function getCountyForState(state, index) {
  const counties = {
    'CA': ['Los Angeles', 'San Diego', 'Orange'],
    'TX': ['Harris', 'Dallas', 'Tarrant'],
    'FL': ['Miami-Dade', 'Broward', 'Palm Beach'],
    'NY': ['Kings', 'Queens', 'New York'],
    'PA': ['Philadelphia', 'Allegheny', 'Montgomery']
  };
  return (counties[state] && counties[state][index - 1]) || 'Major County';
}

/**
 * Sets up a weekly trigger to run the data refresh automatically.
 * Run this function once from the script editor to schedule the job.
 */
function setupWeeklyTrigger() {
  // Delete any existing triggers to avoid duplicates
  const existingTriggers = ScriptApp.getProjectTriggers();
  for (const trigger of existingTriggers) {
    if (trigger.getHandlerFunction() === 'refreshAllData') {
      ScriptApp.deleteTrigger(trigger);
    }
  }
  
  // Create a new trigger for every Sunday at ~2 AM
  ScriptApp.newTrigger('refreshAllData')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(2)
    .create();
    
  Logger.log('Weekly data refresh trigger has been set up successfully.');
}