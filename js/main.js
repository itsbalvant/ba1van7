// Mobile Menu Toggle and Smooth Scrolling
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle with enhanced functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');
    const body = document.body;
    
    // Initialize menu state
    let isMenuOpen = false;
    
    // Toggle menu function
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            // Open menu
            nav.style.display = 'flex';
            body.classList.add('menu-open');
            
            // Force reflow to enable transition
            void nav.offsetHeight;
            
            nav.classList.add('active');
            menuToggle.classList.add('active');
            
            // Prevent body scroll when menu is open
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        } else {
            // Close menu
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            body.classList.remove('menu-open');
            
            // Re-enable body scroll when menu is closed
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            
            // Reset menu state after transition
            setTimeout(() => {
                if (!menuToggle.classList.contains('active')) {
                    nav.style.display = 'none';
                }
            }, 300);
        }
    }
    
    // Initialize menu
    function initMenu() {
        if (menuToggle && nav) {
            // Set initial state
            nav.style.display = 'none';
            
            // Toggle menu on button click
            menuToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleMenu();
            });
            
            // Close menu when clicking on nav links
            document.querySelectorAll('nav a').forEach(link => {
                link.addEventListener('click', () => {
                    if (isMenuOpen) {
                        toggleMenu();
                    }
                });
            });
            
            // Handle window resize
            function handleResize() {
                if (window.innerWidth > 768) {
                    // Reset mobile menu on desktop
                    nav.style.display = '';
                    nav.classList.remove('active');
                    menuToggle.classList.remove('active');
                    body.classList.remove('menu-open');
                    document.documentElement.style.overflow = '';
                    document.body.style.overflow = '';
                    isMenuOpen = false;
                } else if (!isMenuOpen) {
                    // Ensure menu is hidden on mobile if not open
                    nav.style.display = 'none';
                }
            }
            
            window.addEventListener('resize', handleResize);
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (isMenuOpen && !nav.contains(e.target) && e.target !== menuToggle) {
                    toggleMenu();
                }
            });
            
            // Initialize
            handleResize();
        }
    }
    
    // Initialize smooth scrolling
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Close mobile menu if open
                    if (isMenuOpen) {
                        toggleMenu();
                    }
                    
                    // Calculate the target position with header offset
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    // Smooth scroll to target
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Initialize all functions
    initMenu();
    initSmoothScrolling();
    
    // Add loading class to body for initial page load animation
    document.body.classList.add('page-loaded');
    
    // Hero section animations
    
    // Typing animation for subtitle
    const typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        const words = ['Android Applications', 'iOS Systems', 'Web Applications', 'Smart Contracts', 'DeFi Protocols'];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let isEnd = false;
        let typingSpeed = 100;

        function type() {
            const currentWord = words[wordIndex];
            const typeSpeed = isDeleting ? 30 : 100;
            
            if (!isDeleting && charIndex < currentWord.length) {
                typingElement.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            } else if (isDeleting && charIndex > 0) {
                typingElement.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else if (charIndex === 0 && isDeleting) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
            } else if (charIndex === currentWord.length && !isDeleting) {
                isEnd = true;
                isDeleting = true;
                setTimeout(function() {
                    type();
                }, 1500);
                return;
            }
            
            const speedAdjust = isEnd ? 500 : typeSpeed;
            setTimeout(type, speedAdjust);
        }
        
        // Start the typing animation
        setTimeout(type, 1000);
    }
    
    // Matrix effect
    const matrixElement = document.querySelector('.matrix-effect');
    if (matrixElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Make canvas fill the matrix-effect div
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        matrixElement.appendChild(canvas);
        
        // Set canvas dimensions
        function resizeCanvas() {
            canvas.width = matrixElement.offsetWidth;
            canvas.height = matrixElement.offsetHeight;
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Matrix animation setup
        const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEF";
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = [];
        
        // Initialize drops
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * -100); // Start above the canvas
        }
        
        // Set dark greenish color
        ctx.fillStyle = 'rgba(15, 15, 15, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        function drawMatrix() {
            // Add a semi-transparent black rectangle to fade out previous characters
            ctx.fillStyle = 'rgba(15, 15, 15, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Green text
            ctx.fillStyle = '#00ffa370';
            ctx.font = fontSize + 'px monospace';
            
            // Loop through drops
            for (let i = 0; i < drops.length; i++) {
                // Select a random character
                const charIndex = Math.floor(Math.random() * chars.length);
                const text = chars[charIndex];
                
                // Draw the character
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                // Move drop down
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
                    drops[i] = 0; // Reset to top of canvas
                }
                
                drops[i]++;
            }
            
            requestAnimationFrame(drawMatrix);
        }
        
        // Start matrix animation
        drawMatrix();
    }
    
    // Debounced scroll function for better performance
    function debounce(func, wait = 20, immediate = true) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    
    // Header scroll effect with enhanced animation and debounce
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    
    const handleScroll = debounce(function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        if (scrollTop > lastScrollTop && scrollTop > 150) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, 10);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple form validation
            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const message = contactForm.querySelector('textarea').value;
            
            if (name && email && message) {
                // Here you would typically send the form data to a server
                // For now, just show a success message
                alert('Thank you for your message! As this is hosted on IPFS, this form is for demonstration purposes only.');
                contactForm.reset();
            } else {
                alert('Please fill out all fields.');
            }
        });
    }
    
    // Lazy load blog images
    const loadBlogImages = () => {
        const blogCards = document.querySelectorAll('.blog-card');
        
        blogCards.forEach(card => {
            const image = card.querySelector('.blog-image');
            const dataImage = card.getAttribute('data-image');
            
            if (image && dataImage && !image.style.backgroundImage) {
                image.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${dataImage}')`;
            }
        });
    };
    
    // Run on page load
    loadBlogImages();
    
    // Add animation to cards when they come into view
    const observeElements = document.querySelectorAll('.expertise-card, .blog-card');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    setTimeout(() => {
                        entry.target.classList.add('animate');
                    }, 100);
                    observer.unobserve(entry.target);
                    
                    // If it's a blog card, ensure the image is loaded
                    if (entry.target.classList.contains('blog-card')) {
                        const image = entry.target.querySelector('.blog-image');
                        const dataImage = entry.target.getAttribute('data-image');
                        
                        if (image && dataImage && !image.style.backgroundImage) {
                            image.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${dataImage}')`;
                        }
                    }
                }
            });
        }, { threshold: 0.1 });
        
        observeElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        observeElements.forEach(element => {
            element.classList.add('visible');
            element.classList.add('animate');
        });
        
        // Also ensure images are loaded in the fallback
        loadBlogImages();
    }
    
    // Add smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add animated cursor effect on hover for buttons and links
    const buttons = document.querySelectorAll('.btn, .filter-btn, .read-more, nav a');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.classList.add('pulse');
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('pulse');
        });
    });
    
    // Blog filtering with animation
    const filterButtons = document.querySelectorAll('.filter-btn');
    const blogCards = document.querySelectorAll('.blog-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cards with animation
            blogCards.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                if (filter === 'all' || categories.includes(filter)) {
                    // Show card with a fade-in effect
                    card.style.opacity = '0';
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                    }, 10);
                } else {
                    // Hide card
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300); // Match transition duration in CSS
                }
            });
        });
    });
    
    // Hall of Fame Carousel Functionality
    const carousel = document.querySelector('.hof-carousel');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const cards = document.querySelectorAll('.hof-card');
    
    if (carousel && prevBtn && nextBtn && cards.length > 0) {
        let cardIndex = 0;
        const cardWidth = 200; // Same as flex-basis in CSS
        const cardMargin = 24; // Same as gap in CSS (1.5rem = 24px)
        const cardFullWidth = cardWidth + cardMargin;
        
        // Number of cards to show depends on screen width
        const getVisibleCards = () => {
            if (window.innerWidth < 576) return 2;
            if (window.innerWidth < 768) return 3;
            if (window.innerWidth < 992) return 4;
            return 5;
        };
        
        // Initialize carousel
        const updateCarousel = () => {
            const shift = -(cardIndex * cardFullWidth);
            carousel.style.transform = `translateX(${shift}px)`;
        };
        
        // Navigate to previous card
        prevBtn.addEventListener('click', () => {
            cardIndex = Math.max(0, cardIndex - 1);
            updateCarousel();
            resetAutoScroll();
        });
        
        // Navigate to next card
        nextBtn.addEventListener('click', () => {
            const maxIndex = cards.length - getVisibleCards();
            cardIndex = Math.min(maxIndex, cardIndex + 1);
            updateCarousel();
            resetAutoScroll();
        });
        
        // Auto scroll functionality
        let autoScrollInterval;
        
        const startAutoScroll = () => {
            autoScrollInterval = setInterval(() => {
                const maxIndex = cards.length - getVisibleCards();
                cardIndex = (cardIndex >= maxIndex) ? 0 : cardIndex + 1;
                updateCarousel();
            }, 5000); // Scroll every 5 seconds
        };
        
        const resetAutoScroll = () => {
            clearInterval(autoScrollInterval);
            startAutoScroll();
        };
        
        // Start auto-scrolling
        startAutoScroll();
        
        // Use debounced resize handler for better performance
        const debouncedResize = debounce(() => {
            const maxIndex = cards.length - getVisibleCards();
            cardIndex = Math.min(maxIndex, cardIndex);
            updateCarousel();
        }, 250);
        
        // Reset on window resize
        window.addEventListener('resize', debouncedResize, { passive: true });
        
        // Pause auto-scroll when hovering over the carousel
        const carouselContainer = document.querySelector('.hof-carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => {
                clearInterval(autoScrollInterval);
            });
            
            carouselContainer.addEventListener('mouseleave', () => {
                startAutoScroll();
            });
            
            // Touch events for mobile
            let touchStartX = 0;
            let touchEndX = 0;
            
            carouselContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                clearInterval(autoScrollInterval);
            }, { passive: true });
            
            carouselContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
                startAutoScroll();
            }, { passive: true });
            
            function handleSwipe() {
                const swipeThreshold = 50;
                if (touchStartX - touchEndX > swipeThreshold) {
                    // Swipe left, go to next
                    const maxIndex = cards.length - getVisibleCards();
                    cardIndex = Math.min(maxIndex, cardIndex + 1);
                    updateCarousel();
                } else if (touchEndX - touchStartX > swipeThreshold) {
                    // Swipe right, go to previous
                    cardIndex = Math.max(0, cardIndex - 1);
                    updateCarousel();
                }
            }
        }
    }
    
    // Create and animate threat radar blips
    function initThreatRadar() {
        const radar = document.querySelector('.threat-radar');
        if (!radar) return;
        
        // Create random threat blips
        for (let i = 0; i < 5; i++) {
            createBlip(radar);
        }
        
        // Create new blips periodically
        setInterval(() => {
            if (document.querySelectorAll('.blip').length < 8) {
                createBlip(radar);
            }
        }, 3000);
    }

    function createBlip(radar) {
        const blip = document.createElement('div');
        blip.classList.add('blip');
        
        // Random position within the radar
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 0.8; // Keep within 80% of the radius
        
        const x = 50 + Math.cos(angle) * distance * 50;
        const y = 50 + Math.sin(angle) * distance * 50;
        
        blip.style.left = x + '%';
        blip.style.top = y + '%';
        
        radar.appendChild(blip);
        
        // Remove the blip after some time
        setTimeout(() => {
            blip.remove();
        }, 4000 + Math.random() * 3000);
    }

    // Binary cube animation
    function initBinaryCube() {
        const cubeContainer = document.querySelector('.binary-cube-container');
        if (!cubeContainer) return;
        
        const faces = document.querySelectorAll('.cube-face');
        
        // Generate binary numbers for each face
        faces.forEach(face => {
            setInterval(() => {
                face.textContent = generateRandomBinary();
            }, 1000 + Math.random() * 2000);
        });
    }

    function generateRandomBinary() {
        return Math.floor(Math.random() * 2) === 0 ? '0' : '1';
    }

    // Animated counter for statistics
    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        
        function animateCounter(counter) {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000; // 2 seconds duration
            const start = 0;
            const startTime = performance.now();
            
            function updateCounter(currentTime) {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                
                // Easing function for smoother animation
                const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                
                const currentValue = Math.floor(easedProgress * (target - start) + start);
                counter.textContent = currentValue;
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            }
            
            requestAnimationFrame(updateCounter);
        }
        
        // Create an Intersection Observer to start animations when elements come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    // Initialize cyber grid effect
    function initCyberGrid() {
        const grid = document.querySelector('.cyber-grid');
        if (!grid) return;
        
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;
            
            grid.style.transform = `perspective(500px) rotateX(${30 - y * 10}deg) rotateY(${x * 10}deg)`;
        });
    }

    // Enhance hero title with data attribute for shadow effect
    function enhanceHeroTitle() {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.setAttribute('data-text', heroTitle.textContent);
        }
    }

    // Scan line effect
    function initScanlineEffect() {
        const scanLine = document.querySelector('.scan-line');
        if (!scanLine) return;
        
        // Random speed variations
        setInterval(() => {
            const speed = 8 + Math.random() * 4; // 8-12s
            scanLine.style.animationDuration = `${speed}s`;
        }, 8000);
    }
    
    // Code cursor effect
    function initCodeCursor() {
        const cursor = document.querySelector('.code-cursor');
        if (!cursor) return;
        
        const codeSnippet = document.querySelector('.enhanced-snippet pre code');
        if (!codeSnippet) return;
        
        // Make cursor "type" to random positions
        setInterval(() => {
            const lines = codeSnippet.querySelectorAll('span');
            if (lines.length > 0) {
                const randomLine = Math.floor(Math.random() * lines.length);
                const randomPos = Math.random();
                
                // Position cursor at random spot
                cursor.style.bottom = `${22 + randomLine * 20}px`;
                cursor.style.left = `${30 + randomPos * 40}%`;
            }
        }, 3000);
    }
    
    // Button glitch effects
    function initButtonGlitchEffects() {
        const buttons = document.querySelectorAll('.cyber-btn');
        
        buttons.forEach(button => {
            // Randomly trigger glitch effect
            setInterval(() => {
                if (Math.random() > 0.7) { // 30% chance
                    const glitch = button.querySelector('.btn-glitch');
                    if (glitch) {
                        glitch.style.animation = 'none';
                        setTimeout(() => {
                            glitch.style.animation = 'btn-glitch 0.3s steps(2) forwards';
                        }, 10);
                    }
                }
            }, 5000);
        });
    }

    // Initialize shield animation for the avatar
    function initShieldAnimation() {
        const shield = document.querySelector('.shield-container');
        if (!shield) return;
        
        const shieldIcon = document.querySelector('.shield-icon');
        if (shieldIcon) {
            // Change the icon periodically
            const securityIcons = ['fa-lock', 'fa-shield-alt', 'fa-fingerprint', 'fa-key'];
            let currentIcon = 0;
            
            setInterval(() => {
                shieldIcon.innerHTML = `<i class="fas ${securityIcons[currentIcon]}"></i>`;
                currentIcon = (currentIcon + 1) % securityIcons.length;
            }, 3000);
        }
        
        // Make shield react to mouse movement
        const avatarContainer = document.querySelector('.avatar-container');
        if (avatarContainer) {
            avatarContainer.addEventListener('mouseover', () => {
                shield.classList.add('shield-active');
                
                // Create extra particles on hover
                for (let i = 0; i < 3; i++) {
                    const particle = document.createElement('div');
                    particle.classList.add('shield-particle', `p-extra-${i}`);
                    particle.style.top = `${Math.random() * 100}%`;
                    particle.style.left = `${Math.random() * 100}%`;
                    particle.style.animationDelay = `${Math.random() * 2}s`;
                    shield.querySelector('.shield-particles').appendChild(particle);
                    
                    // Remove extra particles after animation
                    setTimeout(() => {
                        if (particle.parentNode) {
                            particle.parentNode.removeChild(particle);
                        }
                    }, 3000);
                }
            });
            
            avatarContainer.addEventListener('mouseout', () => {
                shield.classList.remove('shield-active');
            });
        }
    }

    // Initialize all hero section animations
    function initHeroAnimations() {
        initTypingEffect();
        initCyberGrid();
        enhanceHeroTitle();
        initScanlineEffect();
        initCodeCursor();
        initButtonGlitchEffects();
        initShieldAnimation();
    }

    initHeroAnimations();
    
    // Blog category filtering
    function initBlogFiltering() {
        // Get all filter links
        const filterLinks = document.querySelectorAll('.filter-link');
        
        // Add click event listeners to filter links
        filterLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get the filter value from data-filter attribute
                const filterValue = this.getAttribute('data-filter');
                
                // If already on blog page, filter the posts
                if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                    // Get all blog cards
                    const blogCards = document.querySelectorAll('.blog-card');
                    
                    // Show/hide cards based on filter
                    blogCards.forEach(card => {
                        const categories = card.getAttribute('data-category') || '';
                        if (filterValue === 'all' || categories.includes(filterValue)) {
                            card.style.display = 'block';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                    
                    // Update active filter button
                    document.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    // Scroll to blog section
                    const blogSection = document.getElementById('blog');
                    if (blogSection) {
                        blogSection.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    // If not on home page, redirect to home page with filter parameter
                    window.location.href = `index.html?filter=${filterValue}#blog`;
                }
            });
        });
        
        // Check for filter in URL on page load
        const urlParams = new URLSearchParams(window.location.search);
        const filterParam = urlParams.get('filter');
        if (filterParam) {
            const filterLink = document.querySelector(`.filter-link[data-filter="${filterParam}"]`);
            if (filterLink) {
                filterLink.click();
            }
        }
    }
    
    // Initialize blog filtering
    initBlogFiltering();
}); 