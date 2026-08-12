#!/usr/bin/env python3
"""
Secure HTTP Server for Goal Tracker
Includes basic authentication and IP whitelisting
"""

import http.server
import socketserver
import base64
import hashlib
import json
import os
from urllib.parse import urlparse
import time
from collections import defaultdict

# Configuration
PORT = 8000
ALLOWED_IPS = []  # Empty list = allow all, or add IPs like ['127.0.0.1', '192.168.1.100']
RATE_LIMIT_REQUESTS = 100  # Max requests per minute per IP
RATE_LIMIT_WINDOW = 60  # Time window in seconds

# Basic Auth Credentials (username:password)
# Change these to your desired credentials
AUTH_USERNAME = "admin"
AUTH_PASSWORD = "secure123"  # Change this!

# Rate limiting storage
request_counts = defaultdict(list)

class SecureHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        """Custom logging"""
        print(f"[{self.address_string()}] {format % args}")

    def check_rate_limit(self):
        """Check if IP has exceeded rate limit"""
        if RATE_LIMIT_REQUESTS == 0:
            return True
        
        client_ip = self.client_address[0]
        current_time = time.time()
        
        # Clean old requests outside the window
        request_counts[client_ip] = [
            req_time for req_time in request_counts[client_ip]
            if current_time - req_time < RATE_LIMIT_WINDOW
        ]
        
        # Check if limit exceeded
        if len(request_counts[client_ip]) >= RATE_LIMIT_REQUESTS:
            return False
        
        # Record this request
        request_counts[client_ip].append(current_time)
        return True

    def check_ip_whitelist(self):
        """Check if IP is in whitelist"""
        if not ALLOWED_IPS:
            return True
        
        client_ip = self.client_address[0]
        return client_ip in ALLOWED_IPS

    def check_auth(self):
        """Check HTTP Basic Authentication"""
        auth_header = self.headers.get('Authorization')
        
        if not auth_header:
            return False
        
        try:
            auth_type, auth_string = auth_header.split(' ', 1)
            if auth_type.lower() != 'basic':
                return False
            
            decoded = base64.b64decode(auth_string).decode('utf-8')
            username, password = decoded.split(':', 1)
            
            return username == AUTH_USERNAME and password == AUTH_PASSWORD
        except:
            return False

    def send_auth_required(self):
        """Send 401 Unauthorized with WWW-Authenticate header"""
        self.send_response(401)
        self.send_header('WWW-Authenticate', 'Basic realm="Goal Tracker - Authentication Required"')
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b'''
        <!DOCTYPE html>
        <html>
        <head><title>Authentication Required</title></head>
        <body>
            <h1>401 Unauthorized</h1>
            <p>Authentication required to access this resource.</p>
        </body>
        </html>
        ''')

    def send_forbidden(self, reason="Access Forbidden"):
        """Send 403 Forbidden"""
        self.send_response(403)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(f'''
        <!DOCTYPE html>
        <html>
        <head><title>Access Forbidden</title></head>
        <body>
            <h1>403 Forbidden</h1>
            <p>{reason}</p>
            <p>Your IP: {self.client_address[0]}</p>
        </body>
        </html>
        '''.encode())

    def do_GET(self):
        """Handle GET requests with security checks"""
        # Check IP whitelist
        if not self.check_ip_whitelist():
            self.send_forbidden("Your IP address is not authorized to access this server.")
            return
        
        # Check rate limiting
        if not self.check_rate_limit():
            self.send_response(429)
            self.send_header('Content-type', 'text/html')
            self.send_header('Retry-After', str(RATE_LIMIT_WINDOW))
            self.end_headers()
            self.wfile.write(b'''
            <!DOCTYPE html>
            <html>
            <head><title>Too Many Requests</title></head>
            <body>
                <h1>429 Too Many Requests</h1>
                <p>You have exceeded the rate limit. Please try again later.</p>
            </body>
            </html>
            ''')
            return
        
        # Check authentication
        if not self.check_auth():
            self.send_auth_required()
            return
        
        # Security headers
        self.send_response(200)
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;")
        
        # Serve the file
        super().do_GET()

    def do_POST(self):
        """Handle POST requests (same security checks)"""
        if not self.check_ip_whitelist():
            self.send_forbidden("Your IP address is not authorized.")
            return
        
        if not self.check_rate_limit():
            self.send_response(429)
            self.end_headers()
            return
        
        if not self.check_auth():
            self.send_auth_required()
            return
        
        super().do_POST()

def main():
    """Start the secure server"""
    print("=" * 60)
    print("Goal Tracker - Secure HTTP Server")
    print("=" * 60)
    print(f"Server starting on port {PORT}")
    print(f"Authentication: {AUTH_USERNAME} / {'*' * len(AUTH_PASSWORD)}")
    print(f"IP Whitelist: {'Enabled' if ALLOWED_IPS else 'Disabled (All IPs allowed)'}")
    print(f"Rate Limit: {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW} seconds")
    print("=" * 60)
    print(f"\nAccess the site at: http://localhost:{PORT}")
    print("Press Ctrl+C to stop the server\n")
    
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), SecureHTTPRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped.")

if __name__ == "__main__":
    main()
