# Goal Tracker - Server Setup Guide

This guide explains how to run the Goal Tracker website on a server with security features.

## Quick Start

### Option 1: Using the Shell Script (Recommended)

```bash
chmod +x start-server.sh
./start-server.sh
```

The server will start on `http://localhost:8000`

### Option 2: Manual Start

```bash
python3 server.py
```

## Security Features

### 1. HTTP Basic Authentication
- Username and password required to access the site
- Default credentials:
  - Username: `admin`
  - Password: `secure123`
- **IMPORTANT**: Change these in `server.py` before deploying!

### 2. IP Whitelisting
- Restrict access to specific IP addresses
- Edit `ALLOWED_IPS` in `server.py`
- Empty list `[]` = allow all IPs
- Example: `ALLOWED_IPS = ['127.0.0.1', '192.168.1.100']`

### 3. Rate Limiting
- Prevents abuse by limiting requests per IP
- Default: 100 requests per minute
- Configurable in `server.py`

### 4. Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: enabled
- Strict-Transport-Security: HSTS enabled
- Content-Security-Policy: configured

## Configuration

### Change Authentication Credentials

Edit `server.py` and modify:
```python
AUTH_USERNAME = "your_username"
AUTH_PASSWORD = "your_secure_password"
```

### Configure IP Whitelist

Edit `server.py`:
```python
ALLOWED_IPS = ['127.0.0.1', '192.168.1.100']  # Add allowed IPs
# Or leave empty to allow all: ALLOWED_IPS = []
```

### Change Port

Edit `server.py`:
```python
PORT = 8000  # Change to your desired port
```

Or edit `start-server.sh`:
```bash
PORT=8080  # Change port number
```

## Deployment Options

### Local Network Access

To allow access from other devices on your network:

1. Find your local IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Update `server.py` to bind to all interfaces:
   ```python
   # Already configured to bind to "" which means all interfaces
   ```

3. Access from other devices:
   ```
   http://YOUR_IP_ADDRESS:8000
   ```

### Production Deployment

For production, consider:

1. **Use HTTPS**: Set up SSL/TLS certificate (Let's Encrypt)
2. **Reverse Proxy**: Use Nginx or Apache as reverse proxy
3. **Firewall**: Configure firewall rules
4. **Strong Passwords**: Use complex passwords
5. **Regular Updates**: Keep Python and dependencies updated

### Using Nginx as Reverse Proxy

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Using Apache

1. Copy `.htaccess` to your web root
2. Create `.htpasswd` file:
   ```bash
   htpasswd -c .htpasswd admin
   ```
3. Update `.htaccess` with correct path to `.htpasswd`

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Permission Denied

```bash
chmod +x start-server.sh
chmod +x server.py
```

### Python Not Found

Install Python 3:
```bash
# macOS
brew install python3

# Ubuntu/Debian
sudo apt-get install python3

# CentOS/RHEL
sudo yum install python3
```

## Security Best Practices

1. ✅ Change default username and password
2. ✅ Use strong, unique passwords
3. ✅ Enable IP whitelisting for production
4. ✅ Use HTTPS in production
5. ✅ Keep server and Python updated
6. ✅ Monitor access logs
7. ✅ Regular backups of user data
8. ✅ Firewall configuration

## Accessing the Site

Once the server is running:

1. Open your browser
2. Navigate to `http://localhost:8000`
3. Enter your credentials when prompted
4. You'll see the Goal Tracker login/register page

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Notes

- All user data is stored in browser localStorage
- Server-side authentication is separate from app-level login
- The server provides an additional layer of security
- For maximum security, combine with HTTPS and firewall rules
