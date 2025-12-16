// Secure password authentication with multiple obfuscation layers
(function() {
    'use strict';
    
    // Multi-layer obfuscation - hash is split, encoded, and stored in multiple ways
    const _a = [54, 101, 57, 49, 54, 54, 102, 98, 99, 100, 52, 97, 49, 48, 57, 55, 50, 100, 51, 52, 50, 52, 54, 97, 54, 101, 49, 98, 99, 48, 54, 50];
    const _b = [99, 99, 50, 54, 53, 57, 99, 50, 53, 98, 100, 51, 55, 101, 52, 51, 49, 57, 102, 97, 55, 56, 55, 53, 54, 100, 98, 48, 52, 56, 98, 54];
    
    // Reconstruct hash from obfuscated arrays
    function _reconstruct() {
        return _a.map(x => String.fromCharCode(x)).join('') + 
               _b.map(x => String.fromCharCode(x)).join('');
    }
    
    // Additional validation - check environment
    function _validate() {
        // Check if running in expected context
        if (typeof window === 'undefined') return false;
        if (typeof document === 'undefined') return false;
        // Additional checks can be added here
        return true;
    }
    
    // Hash function with additional security
    async function _hash(pwd) {
        if (!_validate()) return null;
        try {
            const enc = new TextEncoder();
            const data = enc.encode(pwd);
            const hash = await crypto.subtle.digest('SHA-256', data);
            const arr = Array.from(new Uint8Array(hash));
            return arr.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            return null;
        }
    }
    
    const _storedHash = _reconstruct();
    const _authKey = btoa('auth').substring(0, 4) + btoa('key').substring(0, 4);
    const _sessionKey = '_' + _authKey + '_';
    
    // Check session
    if (sessionStorage.getItem(_sessionKey) === '1') {
        _showContent();
        return;
    }
    
    // Initialize UI
    const loginScreen = document.getElementById('loginScreen');
    const mainContent = document.getElementById('mainContent');
    
    if (loginScreen) loginScreen.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'none';
    
    // Handle login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const pwdInput = document.getElementById('passwordInput');
            const errorMsg = document.getElementById('errorMessage');
            
            if (!pwdInput || !_validate()) return;
            
            const enteredPwd = pwdInput.value;
            if (!enteredPwd) {
                if (errorMsg) errorMsg.textContent = 'Please enter a password.';
                return;
            }
            
            // Add small delay to prevent timing attacks (minimal but helps)
            const hash = await _hash(enteredPwd);
            await new Promise(r => setTimeout(r, 100 + Math.random() * 50));
            
            if (hash && hash === _storedHash) {
                sessionStorage.setItem(_sessionKey, '1');
                _showContent();
                if (errorMsg) errorMsg.textContent = '';
                pwdInput.value = '';
            } else {
                if (errorMsg) errorMsg.textContent = 'Incorrect password. Please try again.';
                pwdInput.value = '';
                pwdInput.focus();
                if (pwdInput.style) {
                    pwdInput.style.animation = 'shake 0.5s';
                    setTimeout(() => {
                        pwdInput.style.animation = '';
                    }, 500);
                }
            }
        });
    }
    
    function _showContent() {
        const loginScreen = document.getElementById('loginScreen');
        const mainContent = document.getElementById('mainContent');
        if (loginScreen) loginScreen.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
    }
    
    // Additional protection - detect common exploitation attempts
    let _attempts = 0;
    const _maxAttempts = 10;
    
    if (loginForm) {
        loginForm.addEventListener('submit', function() {
            _attempts++;
            if (_attempts > _maxAttempts) {
                const errorMsg = document.getElementById('errorMessage');
                if (errorMsg) {
                    errorMsg.textContent = 'Too many failed attempts. Please refresh the page.';
                }
                setTimeout(() => {
                    location.reload();
                }, 2000);
            }
        });
    }
})();
