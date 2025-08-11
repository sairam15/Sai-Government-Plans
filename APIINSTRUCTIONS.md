# API Setup Instructions for Medicare/Medicaid Plans Application

## Overview
This application uses real government and healthcare APIs to fetch Medicare and Medicaid plan data. No fake or hardcoded data is used.

## Required API Keys

### 1. Data.gov API Key (REQUIRED)
**Purpose**: Access to regulations.gov and other government data APIs
**Cost**: Free
**Setup Steps**:
1. Visit https://api.data.gov/signup/
2. Fill out the registration form
3. Verify your email address
4. Copy your API key
5. Replace `YOUR_DATA_GOV_API_KEY_HERE` in `config/api-keys.js`

### 2. Census Bureau API Key (OPTIONAL)
**Purpose**: Higher rate limits for demographic data
**Cost**: Free
**Setup Steps**:
1. Visit https://api.census.gov/data/key_signup.html
2. Fill out the registration form
3. Verify your email address
4. Copy your API key
5. Replace `YOUR_CENSUS_API_KEY_HERE` in `config/api-keys.js`

### 3. GitHub API Token (OPTIONAL)
**Purpose**: Higher rate limits for GitHub API searches
**Cost**: Free
**Setup Steps**:
1. Visit https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `public_repo`, `read:user`
4. Copy your token
5. Replace `YOUR_GITHUB_API_TOKEN_HERE` in `config/api-keys.js`

### 4. Federal Reserve API Key (OPTIONAL)
**Purpose**: Economic data and healthcare spending statistics
**Cost**: Free
**Setup Steps**:
1. Visit https://fred.stlouisfed.org/docs/api/api_key.html
2. Fill out the registration form
3. Verify your email address
4. Copy your API key
5. Replace `YOUR_FRED_API_KEY_HERE` in `config/api-keys.js`

## API Endpoints Used

### Government Data APIs (No Key Required)
- **Census Bureau**: https://api.census.gov/data/2020/dec/pl
- **FDA Open Data**: https://api.fda.gov/drug/label.json
- **Healthcare.gov**: https://www.healthcare.gov/api/plans.json
- **Medicare.gov**: https://data.medicare.gov/resource/

### APIs Requiring Data.gov Key
- **Regulations.gov**: https://api.data.gov/regulations/v3/documents.json
- **CMS Data**: https://data.cms.gov/api/v1/
- **Health Data**: https://healthdata.gov/api/

### APIs Requiring Specific Keys
- **GitHub API**: https://api.github.com/search/repositories
- **Federal Reserve**: https://api.stlouisfed.org/fred/series

## Configuration Steps

### Step 1: Get Required API Keys
1. Get your Data.gov API key (required)
2. Optionally get other API keys for better performance

### Step 2: Update Configuration
1. Open `config/api-keys.js`
2. Replace all `YOUR_*_HERE` placeholders with your actual API keys
3. Save the file

### Step 3: Test Configuration
1. Open the application in your browser
2. Check the browser console for any API key errors
3. Verify that data is loading from real APIs

## Rate Limiting and Performance

### Current Configuration
- **Concurrent Requests**: 10 simultaneous API calls
- **Batch Delay**: 1 second between batches
- **Max Retries**: 3 attempts per failed request
- **Timeout**: 15 seconds per request

### Performance Optimization
- The application uses multithreaded requests for faster data loading
- Failed APIs are automatically skipped
- Data is cached for 24 hours to reduce API calls
- Real-time progress updates during data loading

## Troubleshooting

### Common Issues
1. **"API_KEY_INVALID" errors**: Check that your API keys are correctly entered
2. **Rate limiting errors**: Reduce `CONCURRENT_REQUESTS` in the config
3. **Timeout errors**: Increase `TIMEOUT` value in the config
4. **CORS errors**: The application handles CORS automatically with proxy fallbacks

### Debug Mode
To enable debug logging, add this to your browser console:
```javascript
localStorage.setItem('debug_mode', 'true');
```

## Data Sources

### Medicare Data
- CMS Medicare Advantage Plans
- Medicare.gov Plan Finder
- Healthcare.gov Marketplace Plans

### Medicaid Data
- State Medicaid Managed Care Plans
- CMS Medicaid Data
- Healthcare.gov Medicaid Information

### Additional Data
- FDA Drug Information
- Census Demographic Data
- Economic Indicators (FRED)
- Healthcare Regulations

## Security Notes
- API keys are stored locally in the browser
- No keys are sent to external servers
- All API calls are made directly from the user's browser
- HTTPS is used for all API communications

## Support
If you encounter issues with specific APIs:
1. Check the API status at the provider's website
2. Verify your API key is active
3. Check rate limiting status
4. Review the browser console for detailed error messages
