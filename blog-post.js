// Share functionality - Move these functions outside
function shareOnTwitter() {
    const title = document.title;
    const url = window.location.href;
    const text = encodeURIComponent(`${title}\n\n${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

function shareOnLinkedIn() {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
}

function copyShareLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        // Show success message
        const btn = document.querySelector('.share-btn:last-child');
        const icon = btn.querySelector('i');
        const originalIcon = icon.getAttribute('data-lucide');
        
        // Change to check icon temporarily
        icon.setAttribute('data-lucide', 'check');
        lucide.createIcons();
        
        setTimeout(() => {
            // Revert back to original icon
            icon.setAttribute('data-lucide', originalIcon);
            lucide.createIcons();
        }, 2000);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Handle code copy functionality
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const codeId = button.dataset.code;
            const codeElement = document.getElementById(codeId);
            const codeText = codeElement.textContent;

            // Copy to clipboard
            navigator.clipboard.writeText(codeText).then(() => {
                // Update button text temporarily
                const copyText = button.querySelector('.copy-text');
                const originalText = copyText.textContent;
                copyText.textContent = 'Copied!';
                
                // Reset button text after 2 seconds
                setTimeout(() => {
                    copyText.textContent = originalText;
                }, 2000);
            });
        });
    });

    // Highlight code blocks using Prism.js
    Prism.highlightAll();
}); 