/**
 * Link Generator Module
 * Creates protected links with embedded security tokens
 */

class LinkGenerator {
    constructor() {
        this.storageKey = 'protectedLinks';
    }

    /**
     * Generate a unique ID for the protected link
     */
    generateId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 15);
        return `${timestamp}-${random}`;
    }

    /**
     * Create a security token with embedded metadata
     * This token will be validated on the redirect page
     */
    createSecurityToken(linkId, destinationUrl) {
        const tokenData = {
            id: linkId,
            dest: this.obfuscateUrl(destinationUrl),
            created: Date.now(),
            // Add checksum to prevent tampering
            checksum: this.generateChecksum(linkId + destinationUrl)
        };
        
        return btoa(JSON.stringify(tokenData));
    }

    /**
     * Basic URL obfuscation (Base64 + simple XOR)
     * Note: This is NOT encryption, just obfuscation
     */
    obfuscateUrl(url) {
        const key = 42; // Simple XOR key
        const encoded = btoa(url);
        let obfuscated = '';
        
        for (let i = 0; i < encoded.length; i++) {
            obfuscated += String.fromCharCode(encoded.charCodeAt(i) ^ key);
        }
        
        return btoa(obfuscated);
    }

    /**
     * Simple checksum generation
     */
    generateChecksum(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Create a protected link
     */
    createProtectedLink(destinationUrl, shortenerService = 'shrinkme') {
        // Validate destination URL
        if (!this.isValidUrl(destinationUrl)) {
            throw new Error('Invalid destination URL');
        }

        const linkId = this.generateId();
        const token = this.createSecurityToken(linkId, destinationUrl);

        // Store link data in localStorage (for demo purposes)
        // In production, this would be on a server
        this.storeLinkData(linkId, {
            destination: destinationUrl,
            created: Date.now(),
            shortener: shortenerService,
            clicks: 0
        });

        // Generate the protected link
        const baseUrl = window.location.origin;
        const protectedLink = `${baseUrl}/go.html?id=${linkId}&token=${encodeURIComponent(token)}&src=${shortenerService}`;

        return {
            linkId,
            protectedLink,
            shortenerService
        };
    }

    /**
     * Validate URL format
     */
    isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }

    /**
     * Store link data in localStorage
     */
    storeLinkData(linkId, data) {
        const links = this.getAllLinks();
        links[linkId] = data;
        localStorage.setItem(this.storageKey, JSON.stringify(links));
    }

    /**
     * Retrieve link data
     */
    getLinkData(linkId) {
        const links = this.getAllLinks();
        return links[linkId] || null;
    }

    /**
     * Get all stored links
     */
    getAllLinks() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
    }

    /**
     * Increment click counter
     */
    incrementClicks(linkId) {
        const data = this.getLinkData(linkId);
        if (data) {
            data.clicks = (data.clicks || 0) + 1;
            this.storeLinkData(linkId, data);
        }
    }

    /**
     * Check if link has expired (24 hour default)
     */
    isLinkExpired(linkId, maxAgeHours = 24) {
        const data = this.getLinkData(linkId);
        if (!data) return true;

        const ageMs = Date.now() - data.created;
        const ageHours = ageMs / (1000 * 60 * 60);
        
        return ageHours > maxAgeHours;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinkGenerator;
}
