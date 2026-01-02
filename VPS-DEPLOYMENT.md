# 🚀 VPS Deployment Guide

Complete step-by-step guide to deploy Anti-Bypass Platform on your VPS.

---

## 📋 Prerequisites

- VPS with Ubuntu 20.04/22.04 (or Debian)
- Root/sudo access
- Domain name (optional but recommended)
- SSH access to your VPS

---

## Step 1: Initial Server Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system packages
apt update && apt upgrade -y

# Create a new user (recommended for security)
adduser antibypasser
usermod -aG sudo antibypasser

# Switch to new user
su - antibypasser
```

---

## Step 2: Install Node.js

```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x

# Install PM2 globally for process management
sudo npm install -g pm2
```

---

## Step 3: Install MySQL

```bash
# Install MySQL Server
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation
```

Answer the prompts:
- Set root password: **YES** (choose a strong password)
- Remove anonymous users: **YES**
- Disallow root login remotely: **YES**
- Remove test database: **YES**
- Reload privilege tables: **YES**

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE antibypasser_db;
CREATE USER 'antibypasser'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON antibypasser_db.* TO 'antibypasser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Step 4: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx

# Allow Nginx through firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

Visit `http://your-vps-ip` - you should see Nginx welcome page.

---

## Step 5: Clone and Setup Project

```bash
# Install Git if not already installed
sudo apt install -y git

# Create directory for projects
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www

# Clone your repository
cd /var/www
git clone https://github.com/beast69alpha/antibypasser.git
cd antibypasser
```

---

## Step 6: Setup Backend

```bash
cd backend

# Install dependencies
npm install --production

# Create .env file
nano .env
```

Add this configuration:
```env
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_USER=antibypasser
DB_PASSWORD=YOUR_STRONG_PASSWORD
DB_NAME=antibypasser_db
DB_PORT=3306

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_use_random_32_chars

# Frontend URL (update with your domain)
FRONTEND_URL=http://your-domain.com

# Token settings
JWT_EXPIRES_IN=7d
LINK_TOKEN_EXPIRES_MINUTES=30
```

**Generate JWT Secret:**
```bash
# Generate a random 32-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as JWT_SECRET in .env

```bash
# Save and exit (Ctrl+X, then Y, then Enter)

# Import database schema
mysql -u antibypasser -p antibypasser_db < database/schema.sql

# Test the backend
npm start
```

Open another terminal and test:
```bash
curl http://localhost:3000/health
# Should return: {"status":"OK","timestamp":"..."}
```

If it works, press `Ctrl+C` to stop.

---

## Step 7: Setup PM2 (Process Manager)

```bash
# Start backend with PM2
pm2 start server.js --name antibypasser-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it gives you (will have sudo)

# Check status
pm2 list
pm2 logs antibypasser-api

# Useful PM2 commands
pm2 restart antibypasser-api  # Restart app
pm2 stop antibypasser-api     # Stop app
pm2 delete antibypasser-api   # Remove app
```

---

## Step 8: Configure Nginx as Reverse Proxy

### Option A: Without Domain (Using IP)

```bash
sudo nano /etc/nginx/sites-available/antibypasser
```

Add this configuration:
```nginx
# API Server
server {
    listen 80;
    server_name your-vps-ip;

    # API endpoint
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
    }

    # Frontend files
    location / {
        root /var/www/antibypasser;
        index index.html;
        try_files $uri $uri/ =404;
    }
}
```

### Option B: With Domain (Recommended)

```bash
sudo nano /etc/nginx/sites-available/antibypasser
```

Add this configuration:
```nginx
# Main site
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/antibypasser;
    index index.html;

    # Frontend files
    location / {
        try_files $uri $uri/ =404;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
```

Enable the site:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/antibypasser /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Step 9: Update Frontend API URL

```bash
cd /var/www/antibypasser

# Edit API client
nano js/api-client.js
```

Update the API URL:
```javascript
// If using domain
const API_BASE_URL = 'http://yourdomain.com/api';

// OR if using IP only
const API_BASE_URL = 'http://your-vps-ip/api';
```

Save and exit.

---

## Step 10: Setup SSL Certificate (If Using Domain)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

Update frontend API URL with HTTPS:
```bash
nano js/api-client.js
```

Change to:
```javascript
const API_BASE_URL = 'https://yourdomain.com/api';
```

Update backend .env:
```bash
cd /var/www/antibypasser/backend
nano .env
```

Update FRONTEND_URL:
```env
FRONTEND_URL=https://yourdomain.com
```

Restart backend:
```bash
pm2 restart antibypasser-api
```

---

## Step 11: Testing Your Deployment

```bash
# Test health endpoint
curl http://yourdomain.com/health
# OR
curl http://your-vps-ip/health

# Test API registration (should get an error about missing fields)
curl -X POST http://yourdomain.com/api/auth/register

# Check PM2 status
pm2 status

# Check logs
pm2 logs antibypasser-api
```

Visit in browser:
- `http://yourdomain.com/login.html` (or `http://your-vps-ip/login.html`)
- Register a new account
- Test creating a link

---

## Step 12: Setup Automatic Backups

```bash
# Create backup directory
sudo mkdir -p /backups
sudo chown $USER:$USER /backups

# Create backup script
nano ~/backup-database.sh
```

Add this script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="antibypasser_db"
DB_USER="antibypasser"
DB_PASS="YOUR_STRONG_PASSWORD"

# Create backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -name "db_backup_*.sql" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_backup_$DATE.sql"
```

Make executable and test:
```bash
chmod +x ~/backup-database.sh
~/backup-database.sh

# Check if backup was created
ls -lh /backups
```

Setup cron job:
```bash
crontab -e
```

Add this line (runs daily at 2 AM):
```
0 2 * * * /home/antibypasser/backup-database.sh
```

---

## 🔒 Security Hardening

```bash
# 1. Install fail2ban (prevents brute force attacks)
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 2. Configure firewall
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# 3. Disable root SSH login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd

# 4. Install log rotation for PM2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 📊 Monitoring Commands

```bash
# Check application status
pm2 status
pm2 logs antibypasser-api

# Check Nginx status
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check MySQL status
sudo systemctl status mysql

# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

---

## 🔄 Updating Your Application

```bash
cd /var/www/antibypasser

# Pull latest changes
git pull origin main

# Update backend dependencies
cd backend
npm install

# Restart application
pm2 restart antibypasser-api

# Check logs
pm2 logs antibypasser-api
```

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check logs
pm2 logs antibypasser-api

# Check if port 3000 is available
sudo netstat -tulpn | grep 3000

# Check .env file
cat /var/www/antibypasser/backend/.env
```

### Database Connection Error
```bash
# Test MySQL connection
mysql -u antibypasser -p antibypasser_db

# Check MySQL is running
sudo systemctl status mysql

# Check database exists
mysql -u antibypasser -p -e "SHOW DATABASES;"
```

### Nginx 502 Bad Gateway
```bash
# Check backend is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart antibypasser-api
sudo systemctl restart nginx
```

### Permission Errors
```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/antibypasser

# Fix permissions
chmod 755 /var/www/antibypasser
```

---

## 📝 Quick Reference Commands

```bash
# Application Management
pm2 restart antibypasser-api     # Restart app
pm2 logs antibypasser-api         # View logs
pm2 status                        # Check status

# Nginx Management
sudo systemctl restart nginx      # Restart Nginx
sudo nginx -t                     # Test config
sudo systemctl status nginx       # Check status

# Database Backup
~/backup-database.sh              # Manual backup

# View Logs
pm2 logs                          # Application logs
sudo tail -f /var/log/nginx/access.log  # Nginx access
sudo tail -f /var/log/nginx/error.log   # Nginx errors

# System Monitoring
df -h                             # Disk space
free -h                           # Memory usage
top                               # CPU usage
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend API responding at `/health`
- [ ] Can register new user at `/login.html`
- [ ] Can create links in dashboard
- [ ] Links work with protection
- [ ] SSL certificate installed (if using domain)
- [ ] Firewall configured
- [ ] Automatic backups scheduled
- [ ] PM2 starts on boot
- [ ] Logs rotating properly

---

## 🎯 Your Application URLs

- **Frontend**: `http://your-vps-ip` or `https://yourdomain.com`
- **Login Page**: `http://your-vps-ip/login.html`
- **Dashboard**: `http://your-vps-ip/dashboard.html`
- **API Health**: `http://your-vps-ip/health`

---

## 💡 Performance Tips

```bash
# Enable Nginx caching for static files
sudo nano /etc/nginx/sites-available/antibypasser
```

Add inside server block:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Enable gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
```

Reload Nginx:
```bash
sudo systemctl reload nginx
```

---

## 🆘 Need Help?

Common issues:
1. **Can't connect to MySQL**: Check password in .env matches
2. **API returns 502**: Backend not running, check `pm2 logs`
3. **CORS errors**: Update FRONTEND_URL in backend .env
4. **Can't register user**: Check database schema imported correctly

---

**Congratulations! 🎉**

Your Anti-Bypass Platform is now live on your VPS!
