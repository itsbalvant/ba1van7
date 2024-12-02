// Sample data
const hackedCompanies = [
    { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png', year: '2023' },
    { name: 'Microsoft', logo: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31', year: '2023' },
    { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/512px-Meta_Platforms_Inc._logo.svg.png', year: '2023' },
    { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png', year: '2023' },
    { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png', year: '2024' },
    { name: 'Lenskart', logo: '', year: '2023' },
    { name: 'Philips', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Philips_logo_new.svg/2560px-Philips_logo_new.svg.png', year: '2023' },
    { name: 'Visma', logo: '', year: '2024' },
    { name: 'Intel', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Intel_logo_2023.svg/2560px-Intel_logo_2023.svg.png', year: '2023' },
    { name: 'Mercedes Benz', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/2048px-Mercedes-Logo.svg.png', year: '2023' },
    { name: 'H&M', logo: '', year: '2024' },
    { name: 'Dutch Gov', logo: '', year: '2023' },
    { name: 'Dutch Judiciary', logo: '', year: '2023' },
    { name: 'Dutch Healthcare', logo: '', year: '2023' },
    { name: 'NCIIPC', logo: '', year: '2024' },
    { name: 'Robeco', logo: '', year: '2023' },
    { name: 'WUR', logo: '', year: '2024' },
    { name: 'Zion', logo: '', year: '2023' },
    { name: 'Reckitt', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Reckitt_logo.svg/2560px-Reckitt_logo.svg.png', year: '2024' }
];

const blogPosts = [
    {
        id: 1,
        title: "Exploiting SQL Injection on a Search Page : 2500$ Reward",
        image: "https://balvant.in/assets/images/blog-3.jpg",
        category: "Web Security",
        date: "Nov 2024",
        icon: "globe-lock",
        url: "blog/web-security-sql-injection.html"
    },
    {
        id: 2,
        title: "Uncovering PII Data Leaks: Lenskart",
        image: "https://balvant.in/assets/images/blog-5.jpg",
        category: "Web Security",
        date: "Dec 2023",
        icon: "shield-alert",
        url: "blog/lenskart-pii-leak.html"
    }
];

// Initialize Lucide icons
lucide.createIcons();

// Populate companies
function populateCompanies() {
    const container = document.getElementById('companyScroll');
    
    const companiesHTML = [...hackedCompanies, ...hackedCompanies, ...hackedCompanies].map(company => `
        <div class="company-card ultra-glass-morphic-item">
            <div class="company-logo">
                ${!company.logo || company.logo === '' ? 
                    `<div class="company-name-fallback ${company.name.toLowerCase().replace(/[&\s]/g, '')}">
                        ${company.name}
                    </div>` :
                    `<img src="${company.logo}" alt="${company.name} logo">`
                }
            </div>
            <h3>${company.name}</h3>
            <div class="company-info">
                <span class="year">${company.year}</span>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = companiesHTML;
}

// Automatic scrolling
function initializeScroll() {
    const scrollContainer = document.getElementById('companyScroll');
    const scrollSpeed = 1;
    let isPaused = false;

    function scroll() {
        if (!isPaused) {
            scrollContainer.scrollLeft += scrollSpeed;
        
            if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth - scrollContainer.clientWidth)) {
                scrollContainer.scrollLeft = 0;
            }
        }
        
        requestAnimationFrame(scroll);
    }

    // Pause scrolling on hover
    scrollContainer.addEventListener('mouseenter', () => isPaused = true);
    scrollContainer.addEventListener('mouseleave', () => isPaused = false);

    // Start the continuous scroll animation
    requestAnimationFrame(scroll);
}

// Populate blog posts
function populateBlogPosts(category = 'All') {
    const container = document.getElementById('blogPostsGrid');
    const filteredPosts = category === 'All' 
        ? blogPosts 
        : blogPosts.filter(post => post.category === category);

    const postsHTML = filteredPosts.map(post => `
        <div class="blog-post ultra-glass-morphic-bg">
            <div class="post-image">
                <img src="${post.image}" alt="${post.title}">
            </div>
            <div class="post-content">
                <div class="post-header">
                    <div class="post-category">
                        <i data-lucide="${post.icon}" class="icon-cyan"></i>
                        <span>${post.category}</span>
                    </div>
                    <span class="post-date">${post.date}</span>
                </div>
                <h2 class="post-title">${post.title}</h2>
                <a href="${post.url}" class="read-more-btn">Read More</a>
            </div>
        </div>
    `).join('');

    container.innerHTML = postsHTML;
    lucide.createIcons();
}

// Category filter functionality
function initializeCategoryFilter() {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            populateBlogPosts(button.dataset.category);
        });
    });
}

// Add this to your existing script
function initializeCompanyScroll() {
    const container = document.getElementById('companyScroll');
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.style.cursor = 'grabbing';
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
    });
}

// Typing effect
function initTypewriter() {
    const texts = [
        "initializing security protocols...",
        "scanning for vulnerabilities...",
        "deploying ethical hacks...",
        "brewing another coffee..."
    ];
    let textIndex = 0;
    let charIndex = 0;
    const typingText = document.querySelector('.typing-text');
    
    function type() {
        if (charIndex < texts[textIndex].length) {
            typingText.textContent += texts[textIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, 50);
        } else {
            setTimeout(erase, 2000);
        }
    }
    
    function erase() {
        if (charIndex > 0) {
            typingText.textContent = texts[textIndex].substring(0, charIndex-1);
            charIndex--;
            setTimeout(erase, 30);
        } else {
            textIndex = (textIndex + 1) % texts.length;
            setTimeout(type, 500);
        }
    }
    
    type();
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    populateCompanies();
    initializeScroll();
    populateBlogPosts();
    initializeCategoryFilter();
    initializeCompanyScroll();
    initTypewriter();
}); 