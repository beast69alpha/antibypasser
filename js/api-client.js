// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

class APIClient {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth methods
    async register(username, email, password) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        this.setToken(data.token);
        return data;
    }

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        this.setToken(data.token);
        return data;
    }

    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    logout() {
        this.clearToken();
    }

    // Link methods
    async createLink(destinationUrl, title, shortenerUrl) {
        return await this.request('/links', {
            method: 'POST',
            body: JSON.stringify({ destinationUrl, title, shortenerUrl })
        });
    }

    async getLinks(limit = 50, offset = 0) {
        return await this.request(`/links?limit=${limit}&offset=${offset}`);
    }

    async getLink(linkId) {
        return await this.request(`/links/${linkId}`);
    }

    async updateLink(linkId, destinationUrl, title, shortenerUrl) {
        return await this.request(`/links/${linkId}`, {
            method: 'PUT',
            body: JSON.stringify({ destinationUrl, title, shortenerUrl })
        });
    }

    async deleteLink(linkId) {
        return await this.request(`/links/${linkId}`, {
            method: 'DELETE'
        });
    }

    async generateToken(linkId, expiresInMinutes = 30) {
        return await this.request(`/links/${linkId}/token`, {
            method: 'POST',
            body: JSON.stringify({ expiresInMinutes })
        });
    }

    // Protection methods
    async validateToken(token, linkId, referrer) {
        return await this.request('/protection/validate', {
            method: 'POST',
            body: JSON.stringify({ token, linkId, referrer })
        });
    }

    async getLinkMetadata(linkId) {
        return await this.request(`/protection/link/${linkId}`);
    }

    async getAccessLogs(linkId, limit = 100) {
        return await this.request(`/protection/logs/${linkId}?limit=${limit}`);
    }
}

// Create global instance
const api = new APIClient();
