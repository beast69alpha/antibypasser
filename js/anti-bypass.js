/**
 * Anti-Bypass Detection System
 * Core security logic to detect and prevent bypass attempts
 */

class AntiBypass {
    constructor() {
        this.checks = {
            referrer: false,
            javascript: false,
            timing: false,
            token: false,
            devtools: false,
            integrity: false
        };
        
        this.detectionLog = [];
        this.startTime = Date.now();
        this.sessionId = this.generateSessionId();
        this.suspicionScore = 0; // 0-100, higher = more suspicious
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    /**
     * DETECTION #1: Referrer Validation
     * Check if user came from a legitimate shortener
     */
    checkReferrer() {
        const referrer = document.referrer.toLowerCase();
        const allowedDomains = [
            'shrinkme.io',
            'shrinkme.us',
            'exe.io',
            'exey.io',
            'linkvertise.com',
            'link-to.net',
            'shorte.st',
            'ouo.io',
            'ouo.press'
        ];

        // Check if referrer contains any allowed domain
        const isValidReferrer = allowedDomains.some(domain => referrer.includes(domain));

        // Also check URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const srcParam = urlParams.get('src');

        if (!referrer || referrer === '') {
            this.log('SUSPICIOUS: No referrer detected (direct access or referrer stripped)');
            this.suspicionScore += 30;
            this.checks.referrer = false;
            return false;
        }

        if (!isValidReferrer) {
            this.log(`SUSPICIOUS: Invalid referrer - ${referrer}`);
            this.suspicionScore += 40;
            this.checks.referrer = false;
            return false;
        }

        this.log(`✓ Valid referrer detected: ${referrer}`);
        this.checks.referrer = true;
        return true;
    }

    /**
     * DETECTION #2: JavaScript Execution
     * Verify JavaScript is enabled and executing properly
     */
    checkJavaScript() {
        // If this code runs, JavaScript is enabled
        const hasLocalStorage = typeof localStorage !== 'undefined';
        const hasSessionStorage = typeof sessionStorage !== 'undefined';
        const hasConsole = typeof console !== 'undefined';

        if (!hasLocalStorage || !hasSessionStorage) {
            this.log('SUSPICIOUS: Storage APIs unavailable');
            this.suspicionScore += 20;
            this.checks.javascript = false;
            return false;
        }

        // Test if we can write to storage
        try {
            const testKey = '__test_' + Date.now();
            localStorage.setItem(testKey, '1');
            localStorage.removeItem(testKey);
        } catch (e) {
            this.log('SUSPICIOUS: Cannot write to localStorage');
            this.suspicionScore += 25;
            this.checks.javascript = false;
            return false;
        }

        this.log('✓ JavaScript execution verified');
        this.checks.javascript = true;
        return true;
    }

    /**
     * DETECTION #3: Timing Validation
     * Check if user arrived too quickly (bot/automated bypass)
     */
    checkTiming() {
        const urlParams = new URLSearchParams(window.location.search);
        const linkId = urlParams.get('id');

        if (!linkId) {
            this.log('SUSPICIOUS: No link ID provided');
            this.suspicionScore += 50;
            return false;
        }

        // Check if this is a reload/revisit
        const lastVisitKey = `visit_${linkId}`;
        const lastVisit = localStorage.getItem(lastVisitKey);

        if (lastVisit) {
            const timeSinceLastVisit = Date.now() - parseInt(lastVisit);
            if (timeSinceLastVisit < 5000) { // Less than 5 seconds
                this.log('SUSPICIOUS: Page reloaded/revisited too quickly');
                this.suspicionScore += 35;
                this.checks.timing = false;
                return false;
            }
        }

        // Mark this visit
        localStorage.setItem(lastVisitKey, Date.now().toString());

        this.log('✓ Timing check passed');
        this.checks.timing = true;
        return true;
    }

    /**
     * DETECTION #4: Token Validation
     * Verify the security token is valid and hasn't been tampered with
     */
    checkToken() {
        const urlParams = new URLSearchParams(window.location.search);
        const linkId = urlParams.get('id');
        const token = urlParams.get('token');

        if (!linkId || !token) {
            this.log('SUSPICIOUS: Missing link ID or token');
            this.suspicionScore += 50;
            this.checks.token = false;
            return false;
        }

        try {
            // Decode token
            const tokenData = JSON.parse(atob(decodeURIComponent(token)));

            // Verify token matches link ID
            if (tokenData.id !== linkId) {
                this.log('SUSPICIOUS: Token ID mismatch');
                this.suspicionScore += 60;
                this.checks.token = false;
                return false;
            }

            // Check token age (prevent old token reuse)
            const tokenAge = Date.now() - tokenData.created;
            const maxTokenAge = 24 * 60 * 60 * 1000; // 24 hours

            if (tokenAge > maxTokenAge) {
                this.log('SUSPICIOUS: Token expired');
                this.suspicionScore += 40;
                this.checks.token = false;
                return false;
            }

            // Token is valid
            this.log('✓ Token validation passed');
            this.checks.token = true;
            return tokenData;

        } catch (e) {
            this.log('SUSPICIOUS: Token decoding failed - ' + e.message);
            this.suspicionScore += 70;
            this.checks.token = false;
            return false;
        }
    }

    /**
     * DETECTION #5: DevTools Detection
     * Check if browser DevTools are open (inspect element attempts)
     */
    checkDevTools() {
        let devtoolsOpen = false;

        // Method 1: Check window size vs inner size
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;

        if (widthThreshold || heightThreshold) {
            devtoolsOpen = true;
        }

        // Method 2: Debugger detection
        const devCheck = /./;
        devCheck.toString = function() {
            devtoolsOpen = true;
            return 'DevTools detected';
        };

        // Method 3: Performance check
        const start = performance.now();
        debugger; // This will pause if DevTools are open
        const end = performance.now();
        
        if (end - start > 100) {
            devtoolsOpen = true;
        }

        if (devtoolsOpen) {
            this.log('⚠️ WARNING: DevTools may be open');
            this.suspicionScore += 15; // Lower score since DevTools might be open innocently
            this.checks.devtools = false;
        } else {
            this.log('✓ No DevTools detected');
            this.checks.devtools = true;
        }

        return !devtoolsOpen;
    }

    /**
     * DETECTION #6: Page Integrity Check
     * Detect if page has been modified or DOM manipulation
     */
    checkPageIntegrity() {
        // Check if critical elements exist
        const criticalElements = [
            'countdown-display',
            'security-checks',
            'protection-script'
        ];

        let allPresent = true;
        criticalElements.forEach(id => {
            if (!document.getElementById(id)) {
                this.log(`SUSPICIOUS: Critical element missing - ${id}`);
                allPresent = false;
            }
        });

        if (!allPresent) {
            this.suspicionScore += 25;
            this.checks.integrity = false;
            return false;
        }

        this.log('✓ Page integrity verified');
        this.checks.integrity = true;
        return true;
    }

    /**
     * DETECTION #7: Behavior Analysis
     * Monitor user behavior for suspicious patterns
     */
    monitorBehavior() {
        // Track mouse movement (bots often don't move mouse)
        let mouseMoveCount = 0;
        document.addEventListener('mousemove', () => {
            mouseMoveCount++;
        });

        // Check after 3 seconds
        setTimeout(() => {
            if (mouseMoveCount === 0) {
                this.log('SUSPICIOUS: No mouse movement detected (possible bot)');
                this.suspicionScore += 10;
            }
        }, 3000);

        // Track keyboard events
        let keyPressCount = 0;
        document.addEventListener('keydown', (e) => {
            keyPressCount++;
            
            // Detect common bypass attempts
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.key === 'U')) {
                this.log('⚠️ WARNING: DevTools shortcut detected');
                this.suspicionScore += 5;
            }
        });

        // Track right-click (inspect element attempts)
        document.addEventListener('contextmenu', (e) => {
            this.log('⚠️ WARNING: Right-click detected');
            // Optionally prevent right-click
            // e.preventDefault();
        });
    }

    /**
     * DETECTION #8: One-Time Use Enforcement
     * Ensure each link can only be used once per session
     */
    enforceOneTimeUse(linkId) {
        const usedKey = `used_${linkId}`;
        const wasUsed = sessionStorage.getItem(usedKey);

        if (wasUsed) {
            this.log('SUSPICIOUS: Link already used in this session');
            this.suspicionScore += 50;
            return false;
        }

        // Mark as used
        sessionStorage.setItem(usedKey, Date.now().toString());
        this.log('✓ One-time use check passed');
        return true;
    }

    /**
     * Run all security checks
     */
    async runAllChecks() {
        this.log('=== Starting Security Validation ===');

        // Run checks in sequence
        const results = {
            referrer: this.checkReferrer(),
            javascript: this.checkJavaScript(),
            timing: this.checkTiming(),
            token: this.checkToken(),
            devtools: this.checkDevTools(),
            integrity: this.checkPageIntegrity()
        };

        // Get link ID for one-time use check
        const urlParams = new URLSearchParams(window.location.search);
        const linkId = urlParams.get('id');
        results.oneTimeUse = this.enforceOneTimeUse(linkId);

        // Start behavior monitoring
        this.monitorBehavior();

        // Calculate overall result
        const criticalChecks = ['referrer', 'javascript', 'token'];
        const criticalFailed = criticalChecks.some(check => !results[check]);

        this.log(`\n=== Security Report ===`);
        this.log(`Suspicion Score: ${this.suspicionScore}/100`);
        this.log(`Checks Passed: ${Object.values(results).filter(r => r).length}/${Object.keys(results).length}`);

        // Determine if access should be granted
        if (criticalFailed) {
            this.log('❌ CRITICAL CHECK FAILED - ACCESS DENIED');
            return { allowed: false, reason: 'Critical security check failed' };
        }

        if (this.suspicionScore > 50) {
            this.log('❌ SUSPICION SCORE TOO HIGH - ACCESS DENIED');
            return { allowed: false, reason: 'Too many suspicious indicators detected' };
        }

        this.log('✅ ALL CHECKS PASSED - ACCESS GRANTED');
        return { allowed: true, tokenData: results.token };
    }

    /**
     * Log detection events
     */
    log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}`;
        this.detectionLog.push(logEntry);
        console.log(logEntry);
    }

    /**
     * Get all checks status
     */
    getChecksStatus() {
        return this.checks;
    }

    /**
     * Get detection log
     */
    getLog() {
        return this.detectionLog;
    }

    /**
     * Get suspicion score
     */
    getSuspicionScore() {
        return this.suspicionScore;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AntiBypass;
}
