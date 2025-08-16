# Deploy to Internal Server (Self-Hosted)

## Quick Setup (15 minutes)

### 1. Server Requirements
- **Web Server**: Apache, Nginx, or IIS
- **Storage**: 50MB for the app files
- **Network**: Internal network access
- **SSL**: Recommended for security

### 2. File Deployment
```bash
# Copy these files to your web server:
# - index.html
# - script.js
# - styles.css
# - README.md
```

### 3. Your App Will Be Available At:
```
https://internal.your-company.com/medicare-app/
```

## Detailed Steps

### Step 1: Prepare Files
```bash
# Create deployment directory
mkdir /var/www/medicare-app
cd /var/www/medicare-app

# Copy app files
cp index.html script.js styles.css README.md ./
```

### Step 2: Apache Configuration
Create `/etc/apache2/sites-available/medicare-app.conf`:
```apache
<VirtualHost *:80>
    ServerName internal.your-company.com
    DocumentRoot /var/www/medicare-app
    
    <Directory /var/www/medicare-app>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Enable CORS for internal use
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type"
</VirtualHost>
```

### Step 3: Enable Site
```bash
# Enable the site
sudo a2ensite medicare-app

# Enable required modules
sudo a2enmod headers
sudo a2enmod rewrite

# Restart Apache
sudo systemctl restart apache2
```

### Step 4: Nginx Configuration (Alternative)
Create `/etc/nginx/sites-available/medicare-app`:
```nginx
server {
    listen 80;
    server_name internal.your-company.com;
    root /var/www/medicare-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable CORS
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type";
}
```

Enable Nginx site:
```bash
sudo ln -s /etc/nginx/sites-available/medicare-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Configuration (Recommended)

### Step 1: Install Certbot
```bash
sudo apt update
sudo apt install certbot python3-certbot-apache
```

### Step 2: Get SSL Certificate
```bash
sudo certbot --apache -d internal.your-company.com
```

### Step 3: Auto-renewal
```bash
# Certbot creates a cron job automatically
# Check with:
sudo crontab -l
```

## Windows IIS Deployment

### Step 1: Install IIS
1. Open "Turn Windows features on or off"
2. Check "Internet Information Services"
3. Install

### Step 2: Create Website
1. Open IIS Manager
2. Right-click "Sites" → "Add Website"
3. Site name: `medicare-app`
4. Physical path: `C:\inetpub\wwwroot\medicare-app`
5. Port: `80`

### Step 3: Copy Files
```cmd
# Create directory
mkdir C:\inetpub\wwwroot\medicare-app

# Copy files
copy index.html C:\inetpub\wwwroot\medicare-app\
copy script.js C:\inetpub\wwwroot\medicare-app\
copy styles.css C:\inetpub\wwwroot\medicare-app\
```

## Docker Deployment

### Step 1: Create Dockerfile
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Build and Run
```bash
# Build image
docker build -t medicare-app .

# Run container
docker run -d -p 8080:80 --name medicare-app medicare-app
```

## Advantages
✅ **Full Control** - Complete server control  
✅ **Internal Network** - No external dependencies  
✅ **Custom Domain** - Use your company domain  
✅ **Security** - Behind your firewall  
✅ **Compliance** - Meets internal security policies  
✅ **No External Costs** - Uses existing infrastructure  

## Maintenance

### Updates
```bash
# Update files
cp new-index.html /var/www/medicare-app/index.html
cp new-script.js /var/www/medicare-app/script.js
cp new-styles.css /var/www/medicare-app/styles.css

# Restart web server if needed
sudo systemctl restart apache2
```

### Monitoring
```bash
# Check server status
sudo systemctl status apache2

# Check logs
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/apache2/error.log
```

## Troubleshooting
- **403 Forbidden**: Check file permissions
- **404 Not Found**: Verify file paths
- **CORS errors**: Check CORS headers in web server config
- **SSL issues**: Verify certificate installation
