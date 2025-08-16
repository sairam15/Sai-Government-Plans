# Deploy to Netlify (Professional & Free)

## Quick Setup (10 minutes)

### 1. Connect to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with your GitHub account
3. Click "New site from Git"

### 2. Connect Repository
```bash
# Choose GitHub as your Git provider
# Select your medicare-medicaid-plans repository
# Configure build settings:
# Build command: (leave empty - static site)
# Publish directory: . (root)
```

### 3. Deploy Settings
- **Build command**: (leave empty)
- **Publish directory**: `.`
- **Branch**: `main`

### 4. Your App Will Be Available At:
```
https://your-medicare-app.netlify.app
```

## Detailed Steps

### Step 1: Netlify Account Setup
1. Visit [netlify.com](https://netlify.com)
2. Click "Sign up" and connect your GitHub account
3. Authorize Netlify to access your repositories

### Step 2: Site Creation
1. Click "New site from Git"
2. Choose "GitHub" as your Git provider
3. Select your `medicare-medicaid-plans` repository
4. Configure build settings:
   - Build command: (leave empty)
   - Publish directory: `.`
5. Click "Deploy site"

### Step 3: Custom Domain (Optional)
1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `medicare.yourcompany.com`)
4. Follow DNS configuration instructions

### Step 4: Environment Variables (If Needed)
```bash
# Go to Site settings > Environment variables
# Add any required environment variables
# (Not needed for this static app)
```

## Advantages
✅ **Free Tier** - Generous free plan  
✅ **Automatic Deployments** - Deploys on every push  
✅ **Custom Domains** - Easy domain setup  
✅ **HTTPS** - Automatic SSL certificates  
✅ **CDN** - Global content delivery  
✅ **Analytics** - Built-in site analytics  
✅ **Forms** - Handle form submissions  
✅ **Functions** - Serverless functions if needed  

## Advanced Features

### Branch Deployments
- Preview deployments for pull requests
- Branch-specific URLs for testing

### Redirects
Create `_redirects` file in root:
```
# Example redirects
/old-page /new-page 301
/api/* https://api.yourbackend.com/:splat 200
```

### Headers
Create `_headers` file in root:
```
# Security headers
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
```

## Troubleshooting
- **Build fails**: Check build logs in Netlify dashboard
- **404 errors**: Ensure index.html is in root directory
- **CORS issues**: App handles these automatically
