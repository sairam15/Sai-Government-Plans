# 🚀 Google Apps Script Deployment Guide

## Step-by-Step Instructions

### 1. 📝 Create the Script
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Delete the default code
4. Copy and paste the entire contents of `google-apps-script.js`
5. Click "Save" (💾) or `Ctrl+S`
6. Name your project: "Medicare Medicaid Plans API"

### 2. 🚀 Deploy as Web App
1. Click "Deploy" button (top right)
2. Choose "New Deployment"
3. Click the "Type" gear icon ⚙️
4. Select "Web app"
5. Fill in the settings:
   - **Description**: "Medicare Medicaid Plans API v1"
   - **Execute as**: "Me (your-email@gmail.com)"
   - **Who has access**: "Anyone" ⚠️ (Important!)
6. Click "Deploy"
7. **Copy the Web App URL** - this is your API endpoint!

### 3. ✅ Test Your Deployment
Test these URLs in your browser:

```
# Health check
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=health

# Get all plans
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=plans

# Get Medicare plans only
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=medicare

# Get Medicaid plans only
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=medicaid
```

### 4. 🔧 Update Your Frontend
Replace the URL in your `script.js` file:

```javascript
// Old (localhost)
this.apiBaseUrl = 'http://localhost:8000/api';

// New (Google Apps Script)
this.apiBaseUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
this.isGoogleAppsScript = true;
```

---

## 🛠️ Troubleshooting

### ❌ "Access Denied" Error
**Solution**: Make sure you set "Who has access" to "Anyone" during deployment.

### ❌ "Internal Server Error"
**Solution**: Check the Apps Script logs:
1. Go to your Apps Script project
2. Click "Executions" (left sidebar)
3. Look for error details

### ❌ CORS Issues
**Solution**: Google Apps Script automatically handles CORS. No additional setup needed.

### ❌ "Script function not found"
**Solution**: Make sure you saved your script before deploying.

---

## 🔄 Updating Your Script

When you make changes to your Google Apps Script:

1. Save the script (`Ctrl+S`)
2. Go to "Deploy" > "Manage deployments"
3. Click the edit icon (✏️) next to your deployment
4. Create "New version"
5. Click "Deploy"

---

## 📊 Features Available

Your Google Apps Script API provides:

✅ **Real Medicare Data** - Fetches live data from CMS  
✅ **Sample Medicaid Data** - High-quality test data  
✅ **Automatic Caching** - Stores data for faster responses  
✅ **Daily Refresh** - Updates data automatically  
✅ **Error Handling** - Graceful fallbacks  
✅ **CORS Support** - Works from any website  
✅ **Free Forever** - No hosting costs  

---

## 🎯 Expected Response Format

Your API will return data in this format:

```json
{
  "totalPlans": 6,
  "medicareCount": 3,
  "medicaidCount": 3,
  "plans": [
    {
      "planType": "Medicare Advantage",
      "contractId": "H1234",
      "planId": "001",
      "planName": "Blue Cross Medicare Advantage Premier",
      "orgName": "Blue Cross Blue Shield",
      "state": "CA",
      "county": "Los Angeles",
      "enrollment": 125000,
      "overallStarRating": 4.5,
      "lastUpdated": "2025-01-15T10:30:00.000Z",
      "source": "data.cms.gov via Google Apps Script"
    }
    // ... more plans
  ],
  "lastUpdated": "2025-01-15T10:30:00.000Z"
}
```

---

## 🎉 Success!

Once deployed, your Medicare/Medicaid plans app will be:
- ✅ **Completely free** to host and run
- ✅ **Globally accessible** via Google's CDN
- ✅ **Automatically updated** with fresh data
- ✅ **Zero maintenance** required

Your app is now running on Google's infrastructure at no cost! 🚀
