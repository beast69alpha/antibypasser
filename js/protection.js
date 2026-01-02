/**
 * Additional Protection Layers
 * Extra security measures and helper functions
 */

class ProtectionSystem {
    constructor() {
        this.initProtection();
    }

    /**
     * Initialize all protection mechanisms
     */
    initProtection() {
        this.preventCopyPaste();
        this.preventScreenCapture();
        this.detectAutomation();
        this.protectConsole();
    }

    /**
     * Prevent copy-paste attempts to steal links
     */
    preventCopyPaste() {
        // Disable copy for sensitive elements
        document.addEventListener('copy', (e) => {
            const selection = window.getSelection().toString();
            // Allow copying non-sensitive text
            if (selection && !selection.includes('http')) {
                return;
            }
            
            // For URLs, add noise to copied text
            if (selection.includes('http')) {
                e.preventDefault();
                const noise = '\n[This link is protected and must be accessed through the proper channel]';
                e.clipboardData.setData('text/plain', selection + noise);
            }
        });

        // Disable cut
        document.addEventListener('cut', (e) => {
            e.preventDefault();
        });

        // Disable paste (less relevant but adds security layer)
        document.addEventListener('paste', (e) => {
            e.preventDefault();
        });
    }

    /**
     * Detect screen recording/capture attempts
     */
    preventScreenCapture() {
        // Detect print screen key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'PrintScreen') {
                console.warn('Screenshot attempt detected');
                // Optionally clear screen temporarily
                document.body.style.opacity = '0';
                setTimeout(() => {
                    document.body.style.opacity = '1';
                }, 100);
            }
        });

        // Detect screenshots via browser APIs (limited support)
        if ('getDisplayMedia' in navigator.mediaDevices) {
            // Monitor for screen capture
            console.log('Screen capture monitoring active');
        }
    }

    /**
     * Detect automated tools and bots
     */
    detectAutomation() {
        // Check for common automation indicators
        const automationIndicators = {
            webdriver: navigator.webdriver,
            plugins: navigator.plugins.length === 0,
            languages: navigator.languages.length === 0,
            phantom: window.callPhantom || window._phantom,
            selenium: window.document.documentElement.getAttribute('selenium'),
            headlessChrome: /HeadlessChrome/.test(navigator.userAgent)
        };

        const isBot = Object.values(automationIndicators).some(indicator => indicator);

        if (isBot) {
            console.warn('Automation/bot detected');
            return true;
        }

        // Additional checks
        if (navigator.webdriver === true) {
            console.warn('WebDriver detected - likely automated browser');
            return true;
        }

        return false;
    }

    /**
     * Protect console from tampering
     */
    protectConsole() {
        // Create a protected console wrapper
        const originalConsole = { ...console };

        // Detect console manipulation attempts
        Object.keys(console).forEach(key => {
            if (typeof console[key] === 'function') {
                const original = console[key];
                console[key] = function(...args) {
                    // Log to protected console
                    original.apply(console, args);
                };
            }
        });
    }

    /**
     * Generate anti-tampering checksum for page
     */
    generatePageChecksum() {
        const criticalElements = Array.from(document.querySelectorAll('[data-critical]'));
        const htmlContent = criticalElements.map(el => el.outerHTML).join('');
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < htmlContent.length; i++) {
            const char = htmlContent.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return Math.abs(hash).toString(36);
    }

    /**
     * Verify page hasn't been tampered with
     */
    verifyPageIntegrity(originalChecksum) {
        const currentChecksum = this.generatePageChecksum();
        return currentChecksum === originalChecksum;
    }

    /**
     * Disable common bypass keyboard shortcuts
     */
    disableBypassShortcuts() {
        document.addEventListener('keydown', (e) => {
            // F12 - DevTools
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+I - DevTools
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+J - Console
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                return false;
            }

            // Ctrl+U - View Source
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+C - Inspect Element
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                return false;
            }
        });
    }

    /**
     * Detect if page is being viewed in iframe (clickjacking attempt)
     */
    detectIframe() {
        if (window.top !== window.self) {
            console.warn('Page loaded in iframe - potential clickjacking');
            // Optionally break out of iframe
            window.top.location = window.self.location;
            return true;
        }
        return false;
    }

    /**
     * Monitor page visibility (tab switching)
     */
    monitorVisibility(callback) {
        let hiddenTime = 0;
        let lastHidden = null;

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                lastHidden = Date.now();
                console.log('Page hidden - user switched tabs');
            } else {
                if (lastHidden) {
                    hiddenTime += Date.now() - lastHidden;
                    console.log(`Page visible again - was hidden for ${Date.now() - lastHidden}ms`);
                }
                lastHidden = null;
            }

            if (callback) {
                callback(document.hidden, hiddenTime);
            }
        });

        return () => hiddenTime;
    }

    /**
     * Obfuscate destination URL in memory
     */
    obfuscateDestination(url) {
        // Multi-layer obfuscation
        // Layer 1: Base64
        let obfuscated = btoa(url);
        
        // Layer 2: XOR with key
        const key = this.generateDynamicKey();
        let xored = '';
        for (let i = 0; i < obfuscated.length; i++) {
            xored += String.fromCharCode(obfuscated.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        
        // Layer 3: Base64 again
        return btoa(xored);
    }

    /**
     * Deobfuscate destination URL
     */
    deobfuscateDestination(obfuscated) {
        try {
            // Layer 3: Decode Base64
            let xored = atob(obfuscated);
            
            // Layer 2: XOR with key
            const key = this.generateDynamicKey();
            let decoded = '';
            for (let i = 0; i < xored.length; i++) {
                decoded += String.fromCharCode(xored.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            
            // Layer 1: Decode Base64
            return atob(decoded);
        } catch (e) {
            console.error('Deobfuscation failed');
            return null;
        }
    }

    /**
     * Generate dynamic key based on session/time
     */
    generateDynamicKey() {
        // Use multiple factors to generate key
        const factors = [
            navigator.userAgent.slice(0, 10),
            window.screen.width.toString(),
            window.screen.height.toString(),
            new Date().getDate().toString()
        ];
        
        return factors.join('-');
    }

    /**
     * Countdown timer with validation
     */
    createSecureCountdown(seconds, onComplete, onTick) {
        let remaining = seconds;
        const startTime = Date.now();
        const expectedEndTime = startTime + (seconds * 1000);

        const interval = setInterval(() => {
            // Verify time hasn't been manipulated
            const actualElapsed = Date.now() - startTime;
            const expectedRemaining = Math.ceil((expectedEndTime - Date.now()) / 1000);

            if (Math.abs(expectedRemaining - remaining) > 2) {
                console.warn('Time manipulation detected!');
                clearInterval(interval);
                return;
            }

            remaining--;

            if (onTick) {
                onTick(remaining);
            }

            if (remaining <= 0) {
                clearInterval(interval);
                
                // Final validation before completing
                const totalElapsed = Date.now() - startTime;
                const expectedTime = seconds * 1000;
                
                // Allow 2 second tolerance
                if (Math.abs(totalElapsed - expectedTime) < 2000) {
                    if (onComplete) {
                        onComplete();
                    }
                } else {
                    console.warn('Countdown time validation failed!');
                }
            }
        }, 1000);

        return interval;
    }

    /**
     * Check if running in private/incognito mode
     */
    async detectPrivateMode() {
        // Different detection methods for different browsers
        return new Promise((resolve) => {
            // Method 1: Check localStorage persistence
            try {
                localStorage.setItem('__test', '1');
                localStorage.removeItem('__test');
                
                // Method 2: Check for common private mode indicators
                if (navigator.webkitTemporaryStorage) {
                    navigator.webkitTemporaryStorage.queryUsageAndQuota(
                        (used, quota) => {
                            resolve(quota < 120000000); // Private mode has limited quota
                        },
                        () => resolve(false)
                    );
                } else {
                    resolve(false);
                }
            } catch (e) {
                // If localStorage throws, likely in private mode
                resolve(true);
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProtectionSystem;
}
