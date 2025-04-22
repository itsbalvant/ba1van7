# Balvant.eth - Cybersecurity Portfolio & Blog

A minimalist and modern portfolio website focused on cybersecurity topics, built with HTML, CSS, and JavaScript, and .

## Features

- Clean and minimalist design
- Responsive layout that works on all devices
- Blog section with cybersecurity articles
- Hall of Fame section showcasing security contributions
- Contact page with social links
- Dark theme with neon accents
- Mobile-friendly navigation

## Project Structure

```
/
├── index.html                # Homepage with blog and expertise sections
├── contact.html              # Contact information page
├── css/
│   └── style.css             # Main stylesheet
├── js/
│   └── main.js               # JavaScript for interactive elements
├── images/                   # Image assets
│   ├── 1.jpeg                # SQL injection blog image
│   ├── a2.jpeg               # WebView vulnerability blog image
│   ├── blog-header.jpg       # Blog post header image
│   ├── blockchain.jpg        # Blockchain-related image
│   ├── web.jpg               # Web security image
│   └── README.txt            # Image credits
└── blog/
    ├── android-news-app-vulnerability.html  # Blog post about Android app security
    ├── android-webview-vulnerability.html   # Blog post about WebView vulnerability
    └── sql-injection-writeup.html           # Blog post about SQL injection
<!-- ├── smart-contract-vulnerabilities.html  # Blog post about smart contract security - commented out -->
```

## IPFS Hosting

This website is designed to be hosted on IPFS (InterPlanetary File System). To publish this site on IPFS:

1. Install IPFS Desktop or the IPFS command-line tools
2. Add the entire project folder to IPFS:
   ```
   ipfs add -r .
   ```
3. Note the resulting CID (Content Identifier)
4. Access your website through an IPFS gateway:
   ```
   https://ipfs.io/ipfs/YOUR_CID
   ```

## Development

To make changes to this website:

1. Clone the repository
2. Edit the HTML, CSS, and JavaScript files as needed
3. Test locally by opening the HTML files in a browser
4. Re-publish to IPFS after changes

## License

All rights reserved © 2025 Balvant Chavda

# Balvant Chavda - Cybersecurity Researcher Website

A personal portfolio website showcasing blog posts on cybersecurity topics, Hall of Fame recognitions, and projects.

## Features

- **Responsive Design**: Works seamlessly on all devices (mobile, tablet, desktop)
- **Blog Section**: Organized by security categories (Android, iOS, Web, Web3, Philosophy)
- **Hall of Fame**: Showcase of recognition from various organizations
- **Progressive Web App (PWA)**: Installable on devices with offline capabilities
- **Optimized Performance**: Fast loading times with lazy-loaded images and optimized scripts
- **IPFS Ready**: Designed to work efficiently when deployed to IPFS

## Deployment to IPFS

### Requirements

- IPFS Desktop or command-line tools installed
- Node.js (optional, for additional optimization tools)

### Steps to Deploy

1. **Prepare for Deployment**
   ```bash
   # Optional: Install optimization tools
   npm install -g html-minifier csso-cli terser
   
   # Optimize files (optional but recommended)
   html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true index.html -o index.min.html
   csso css/style.css -o css/style.min.css
   terser js/main.js -c -m -o js/main.min.js
   ```

2. **Add to IPFS**
   ```bash
   # Using IPFS command line
   ipfs add -r . --pin=true
   
   # Or use IPFS Desktop by dragging the folder
   ```

3. **Pin the Content**
   - Copy the root CID (Content Identifier) shown after adding the files
   - Use a pinning service like Pinata, Infura, or Web3.Storage to ensure persistence
   - Pin locally: `ipfs pin add <your-root-cid>`

4. **Access Your Website**
   - Via Local Gateway: `http://localhost:8080/ipfs/<your-root-cid>/`
   - Via Public Gateway: `https://ipfs.io/ipfs/<your-root-cid>/`
   - Via Dedicated Gateway (recommended): `https://<your-root-cid>.ipfs.dweb.link/`

5. **Consider Using IPNS**
   ```bash
   # Create an IPNS record pointing to your IPFS content
   ipfs name publish <your-root-cid>
   ```

## Performance Optimizations

This website includes several optimizations to ensure it loads quickly and works efficiently on IPFS:

1. **Image Optimization**
   - Lazy loading of images
   - Proper sizing and compression

2. **JavaScript Enhancements**
   - Debounced scroll events
   - Passive event listeners
   - Deferred script loading

3. **PWA Capabilities**
   - Service worker for offline access
   - Manifest for installability
   - Cached resources

4. **CSS Improvements**
   - Critical CSS inlined
   - Non-blocking font loading
   - Optimized animations

## Adding New Content

### Blog Posts

1. Create a new HTML file in the `/blog` directory
2. Use the existing blog post templates as a guide
3. Add an entry to the blog grid in `index.html`
4. Add appropriate images to the `/images` directory

## License

Copyright © 2025 Balvant Chavda. All rights reserved.