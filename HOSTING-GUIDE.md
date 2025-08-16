# 🚀 Free Hosting Guide for Medicare/Medicaid Plans App

## 📋 API Keys & Requirements

### ✅ **NO API KEYS REQUIRED!**
- **CMS APIs**: `data.cms.gov` and `data.medicaid.gov` are completely **PUBLIC** and **FREE**
- **No registration** or authentication needed
- **No rate limits** for reasonable usage
- Ready to deploy immediately!

---

## 🆓 Free Hosting Options (Ranked by Ease)

### 1. 🥇 **Railway** (Recommended - Easiest)

**Why Railway?** Dead simple, great free tier, automatic deployments from GitHub.

#### Setup Steps:
```bash
# 1. Create railway.json in your project root
echo '{"build": {"command": "npm install"}, "start": {"command": "npm start"}}' > railway.json

# 2. Add environment variables (optional)
echo 'PORT=8000' > .env
```

#### Deploy:
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select your repository
5. **That's it!** 🎉

**Free Tier:** 500 hours/month, 1GB RAM, 1GB storage

---

### 2. 🥈 **Render** (Great Alternative)

#### Setup:
1. Add `render.yaml`:
```yaml
services:
  - type: web
    name: medicare-plans-app
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: PORT
        value: 10000
```

#### Deploy:
1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Auto-deploys on every push!

**Free Tier:** 750 hours/month, 512MB RAM

---

### 3. 🥉 **Vercel** (Best for Frontend + Serverless)

#### Setup:
```bash
# Install Vercel CLI
npm i -g vercel

# Add vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
EOF
```

#### Deploy:
```bash
vercel --prod
```

**Free Tier:** 100GB bandwidth/month, serverless functions

---

### 4. 📱 **Google Apps Script** (Serverless Option)

Perfect for **data processing** and **API endpoints** without traditional server hosting.

#### Create `gas-version.js`:
```javascript
function doGet(e) {
  const action = e.parameter.action || 'plans';
  
  switch(action) {
    case 'medicare':
      return ContentService
        .createTextOutput(JSON.stringify(getMedicareData()))
        .setMimeType(ContentService.MimeType.JSON);
    case 'medicaid':
      return ContentService
        .createTextOutput(JSON.stringify(getMedicaidData()))
        .setMimeType(ContentService.MimeType.JSON);
    default:
      return ContentService
        .createTextOutput(JSON.stringify(getAllPlans()))
        .setMimeType(ContentService.MimeType.JSON);
  }
}

function getMedicareData() {
  // Fetch from CMS API
  const response = UrlFetchApp.fetch('https://data.cms.gov/api/1/datastore/query/9c71c6e5-7f1b-434a-bd0e-4b18b6b99f7e?limit=100');
  return JSON.parse(response.getContentText());
}

function getMedicaidData() {
  // Your sample data or API calls
  return [
    {
      planName: "Molina Healthcare Medicaid",
      state: "CA",
      enrollment: 75000,
      starRating: 3.9
    }
    // ... more plans
  ];
}

function getAllPlans() {
  return {
    medicare: getMedicareData(),
    medicaid: getMedicaidData()
  };
}
```

#### Deploy Apps Script:
1. Go to [script.google.com](https://script.google.com)
2. Create new project
3. Paste the code
4. Deploy as web app
5. Set permissions to "Anyone"
6. Get your web app URL

**Benefits:** 
- Completely free forever
- Google's infrastructure
- Built-in caching
- No server maintenance

---

### 5. 🐙 **GitHub Pages + Netlify Functions**

#### Setup:
```bash
# Create netlify.toml
cat > netlify.toml << 'EOF'
[build]
  functions = "netlify/functions"
  publish = "."

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
EOF

# Create serverless function
mkdir -p netlify/functions
cat > netlify/functions/plans.js << 'EOF'
const { fetchMedicareData } = require('../../fetchMedicare');
const { fetchMedicaidData } = require('../../fetchMedicaid');

exports.handler = async (event, context) => {
  try {
    const medicareData = await fetchMedicareData();
    const medicaidData = await fetchMedicaidData();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        medicare: medicareData,
        medicaid: medicaidData
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
EOF
```

#### Deploy:
1. Push to GitHub
2. Connect repository to [netlify.com](https://netlify.com)
3. Auto-deploys with serverless functions!

---

### 6. 🌊 **DigitalOcean App Platform**

#### Setup:
```yaml
# .do/app.yaml
name: medicare-plans-app
services:
- name: api
  source_dir: /
  github:
    repo: your-username/medicare-medicaid-plans
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 8000
```

**Free Tier:** $0/month for static sites, $5/month for apps (but has free credits)

---

## 🔧 Production Optimizations

### Add these files for better hosting:

#### `Procfile` (for Heroku-like platforms):
```
web: node server.js
```

#### `.env.example`:
```
PORT=8000
NODE_ENV=production
```

#### `ecosystem.config.js` (PM2 config):
```javascript
module.exports = {
  apps: [{
    name: 'medicare-app',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

---

## 🚀 Quick Deploy Commands

### Railway:
```bash
npx @railway/cli deploy
```

### Vercel:
```bash
vercel --prod
```

### Render:
```bash
# Just push to GitHub - auto-deploys!
git push origin main
```

### Netlify:
```bash
npx netlify-cli deploy --prod
```

---

## 🎯 Recommended Choice

**For beginners:** 👉 **Railway** (easiest setup)
**For developers:** 👉 **Vercel** (best features)
**For zero cost:** 👉 **Google Apps Script** (completely free forever)
**For high traffic:** 👉 **Netlify** (best performance)

---

## 🔍 Testing Your Deployment

After deployment, test these endpoints:
- `https://your-app.domain.com/` - Main app
- `https://your-app.domain.com/api/health` - Health check
- `https://your-app.domain.com/api/plans` - All plans
- `https://your-app.domain.com/api/medicare-advantage` - Medicare plans
- `https://your-app.domain.com/api/medicaid` - Medicaid plans

---

## 🎉 You're Ready!

Your app will be live at your chosen platform's URL. The CMS APIs are public, so no additional setup needed. Just deploy and go! 🚀
