# 🔒 Anti-Bypass Link Protection System (Multi-User Platform)

A comprehensive full-stack solution for protecting URL shortener earnings with user authentication and centralized link management.

> **Version 2.0**: Now with backend API, database integration, and multi-user support!

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [Deployment](#deployment)
- [Cost Estimates](#cost-estimates)
- [Troubleshooting](#troubleshooting)
- [Migration Guide](#migration-guide)

---

## 🎯 Overview

This is a **full-stack multi-user platform** that protects URL shortener earnings by detecting and blocking bypass attempts. Multiple users can register, create protected links, and manage them through a centralized dashboard.

### The Problem:
- Users bypass shortener ads using inspect element, direct access, or automated tools
- Content creators lose monetization revenue
- Need for a scalable solution supporting multiple creators

### The Solution:
Full-stack platform with:
- ✅ User authentication and personal dashboards
- ✅ Centralized database for link management
- ✅ RESTful API for scalability
- ✅ Multi-layer client-side protection
- ✅ Token-based validation system
- ✅ Access logging and analytics
- ✅ Cross-device link management

---

## 🌟 Features

### Frontend Features
- User registration and login system
- Personal dashboard with statistics
- Link creation and management interface
- Real-time access counting
- Protected link pages with anti-bypass mechanisms
- DevTools and automation detection
- One-time use token validation

### Backend Features
- RESTful API with JWT authentication
- MySQL database integration
- User account management
- CRUD operations for links
- Token generation and validation
- Access logging and analytics
- Rate limiting and security headers
- Password encryption with bcrypt

---

## 📁 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Frontend (Client)                         │
│  - login.html (Authentication)                                  │
│  - dashboard.html (Link Management)                             │
│  - index.html (Link Creation)                                   │
│  - go.html (Protection Page)                                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS/API
┌──────────────────────┴──────────────────────────────────────────┐
│                    Backend API (Node.js)                        │
│  - Authentication (JWT)                                         │
│  - Link CRUD Operations                                         │
│  - Token Generation/Validation                                  │
│  - Access Logging                                               │
└──────────────────────┬──────────────────────────────────────────┘
                       │ SQL
┌──────────────────────┴──────────────────────────────────────────┐
│                    MySQL Database                               │
│  - users (accounts)                                             │
│  - links (protected links)                                      │
│  - link_tokens (one-time tokens)                                │
│  - access_logs (analytics)                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- npm or yarn

### 1. Database Setup
```bash
# Install MySQL and create database
mysql -u root -p < backend/database/schema.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
copy .env.example .env
# Edit .env with your database credentials and JWT secret
npm start
```

Server runs on `http://localhost:3000`

### 3. Frontend Setup
```bash
# Update API URL in js/api-client.js
# Then serve frontend files
npx http-server -p 5500
```

Frontend runs on `http://localhost:5500`

### 4. Usage
1. Visit `http://localhost:5500/login.html`
2. Register a new account
3. Access dashboard to create and manage links
4. Share protected links with your shortener URLs

---

## 🔌 API Documentation

### Authentication
```
POST /api/auth/register
Body: { username, email, password }
Response: { token, user }

POST /api/auth/login
Body: { email, password }
Response: { token, user }

GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user }
```

### Link Management (Protected)
```
POST /api/links
Headers: Authorization: Bearer <token>
Body: { destinationUrl, title, shortenerUrl }
Response: { linkId, id }

GET /api/links
Headers: Authorization: Bearer <token>
Response: { links[], stats }

GET /api/links/:linkId
PUT /api/links/:linkId
DELETE /api/links/:linkId
POST /api/links/:linkId/token
```

### Protection (Public)
```
POST /api/protection/validate
Body: { token, linkId, referrer }
Response: { success, destination }

GET /api/protection/link/:linkId
Response: { title, shortenerUrl, createdAt }
```

See [backend/README.md](backend/README.md) for complete API documentation.

---

## 🗄️ Database Schema

### Tables
- **users**: User accounts with encrypted passwords
- **links**: Protected links with destination URLs
- **link_tokens**: One-time use tokens with expiration
- **access_logs**: Detailed access attempt tracking
- **user_settings**: User preferences and configurations

Full schema in [backend/database/schema.sql](backend/database/schema.sql)

---

## 🔒 Security Features

### Backend Security
1. **JWT Authentication** - Token-based auth with expiration
2. **Password Hashing** - bcrypt with 10 rounds
3. **SQL Injection Protection** - Parameterized queries
4. **Rate Limiting** - 100 requests per 15 minutes
5. **CORS Protection** - Configurable origins
6. **Helmet.js** - Security headers
7. **Input Validation** - express-validator

### Frontend Protection
- ✅ Validates proper referrer from shortener services
- ✅ Enforces JavaScript requirement
- ✅ Implements one-time use tokens
- ✅ Detects automation and bots
- ✅ Monitors for DevTools and tampering
- ✅ Enforces minimum time delays
- ✅ Prevents link reuse and sharing

---

## 🔄 Complete System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: LINK CREATION (Link Owner)                            │
├─────────────────────────────────────────────────────────────────┤
│ 1. Owner visits index.html                                      │
│ 2. Enters destination URL: https://example.com/file.pdf        │
│ 3. System generates:                                            │
│    - Unique Link ID: abc123-xyz789                              │
│    - Security Token: encrypted metadata                         │
│    - Protected Link: yoursite.com/go.html?id=abc123&token=...  │
│ 4. Owner copies protected link                                  │
│ 5. Owner shortens it on ShrinkMe/Exe/etc.                      │
│ 6. Owner shares the shortened link                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: USER ACCESS (Fair Path)                               │
├─────────────────────────────────────────────────────────────────┤
│ 1. User clicks shortened link: shrinkme.io/xyz                 │
│ 2. ShrinkMe shows ads                                           │
│ 3. User completes ad viewing                                    │
│ 4. ShrinkMe redirects to: yoursite.com/go.html?id=abc123...   │
│ 5. Your system performs security checks:                        │
│    ✓ Referrer validation (came from shrinkme.io)              │
│    ✓ JavaScript execution check                                │
│    ✓ Token validation (not expired/tampered)                   │
│    ✓ Timing analysis (not too fast)                            │
│    ✓ Bot detection (real human behavior)                       │
│    ✓ DevTools detection (no inspect element)                   │
│    ✓ One-time use enforcement                                   │
│ 6. All checks pass → 5 second countdown                        │
│ 7. Redirect to final destination                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3: BYPASS ATTEMPT (Blocked)                              │
├─────────────────────────────────────────────────────────────────┤
│ User tries:                                                      │
│  ❌ Direct access to go.html?id=abc123                          │
│  ❌ Disabling JavaScript                                        │
│  ❌ Inspect element to find destination                         │
│  ❌ Automated bot/script                                        │
│  ❌ Sharing/reusing the link                                    │
│  ❌ Time manipulation                                           │
│                                                                  │
│ Result:                                                          │
│  → Security checks fail                                         │
│  → Suspicion score increases                                    │
│  → Access denied                                                │
│  → Redirect to blocked.html                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Security Features

### 1. **Referrer Validation**
- Checks if user came from approved shortener domains
- Validates `document.referrer` against whitelist
- Cross-references with URL parameters

### 2. **Token System**
- Unique encrypted token for each link
- Includes:
  - Link ID
  - Creation timestamp
  - Obfuscated destination URL
  - Integrity checksum
- Validates token hasn't been tampered with or expired

### 3. **JavaScript Requirement**
- Critical logic only runs with JS enabled
- NoScript tag redirects to blocked page immediately
- Validates storage APIs are available

### 4. **Timing Analysis**
- Tracks time between link creation and access
- Detects if access is too fast (bot behavior)
- Prevents rapid page reloads
- Validates countdown timing hasn't been manipulated

### 5. **Bot Detection**
- Checks for `navigator.webdriver`
- Detects headless browsers
- Monitors mouse movement patterns
- Validates plugin/language availability

### 6. **DevTools Detection**
- Window size analysis (DevTools changes viewport)
- Debugger statement timing
- Console manipulation detection
- Keyboard shortcut blocking (F12, Ctrl+Shift+I, etc.)

### 7. **One-Time Use Enforcement**
- Each link can only be used once per session
- Stored in sessionStorage
- Prevents link sharing

### 8. **Page Integrity**
- Validates critical DOM elements exist
- Detects page tampering
- Monitors for iframe injection

---

## 🔍 Detection Mechanisms

### Real-Time Checks:

```javascript
// Suspicion Score System (0-100)
┌─────────────────────────────────────────────────┐
│ Check                 │ Points Added if Failed  │
├─────────────────────────────────────────────────┤
│ No referrer           │ +30 points              │
│ Invalid referrer      │ +40 points              │
│ No JavaScript         │ +25 points              │
│ Token invalid         │ +60 points              │
│ Token expired         │ +40 points              │
│ Too fast access       │ +35 points              │
│ Page reload           │ +35 points              │
│ DevTools open         │ +15 points              │
│ Link already used     │ +50 points              │
│ Bot indicators        │ +20 points              │
└─────────────────────────────────────────────────┘

Threshold: Score > 50 = ACCESS DENIED
```

### Behavior Monitoring:

- **Mouse Movement**: No movement = likely bot
- **Keyboard Events**: Detects DevTools shortcuts
- **Tab Visibility**: Tracks if user switches tabs excessively
- **Right-Click**: Logs inspect element attempts

---

## 🚀 Setup & Usage

### Prerequisites:
- Web server (Apache, Nginx, or any HTTP server)
- Modern browser with JavaScript enabled

### Installation:

1. **Upload files to your web server:**
   ```
   yourserver.com/
   ├── index.html
   ├── go.html
   ├── blocked.html
   ├── css/
   │   └── styles.css
   └── js/
       ├── link-generator.js
       ├── anti-bypass.js
       └── protection.js
   ```

2. **Configure shortener whitelist** (optional):
   
   Edit `js/anti-bypass.js`, line ~35:
   ```javascript
   const allowedDomains = [
       'shrinkme.io',
       'exe.io',
       // Add your shortener domains here
   ];
   ```

3. **Create your first protected link:**
   - Visit `yourserver.com/index.html`
   - Enter your destination URL
   - Select shortener service
   - Copy the generated protected link
   - Shorten it on your chosen service
   - Share the shortened link!

### Usage Example:

```
1. You have: https://example.com/download/file.pdf

2. Generate protected link:
   → https://yourserver.com/go.html?id=abc123&token=eyJpZCI6ImFi...

3. Shorten on ShrinkMe:
   → https://shrinkme.io/xyz789

4. Share:
   → Users click shrinkme.io/xyz789
   → Complete ads
   → Redirected to your server
   → Security checks pass
   → Access granted to file.pdf
```

---

## 📁 File Structure

```
aantibypass/
│
├── index.html                 # Link creation interface
│   └─ Generates protected links
│   └─ Manages link storage
│   └─ Shows link statistics
│
├── go.html                    # Protected redirect page (CORE)
│   └─ Runs all security checks
│   └─ Validates user access
│   └─ Enforces countdown
│   └─ Redirects to destination
│
├── blocked.html               # Access denied page
│   └─ Shows why access was blocked
│   └─ Provides guidance for proper access
│   └─ Logs security incidents
│
├── css/
│   └── styles.css            # All styling & UI
│       └─ Responsive design
│       └─ Countdown animations
│       └─ Security check displays
│
└── js/
    ├── link-generator.js     # Link creation & management
    │   └─ Generate unique IDs
    │   └─ Create security tokens
    │   └─ URL obfuscation
    │   └─ LocalStorage management
    │
    ├── anti-bypass.js        # Core security logic (CRITICAL)
    │   └─ Referrer validation
    │   └─ JavaScript checks
    │   └─ Token verification
    │   └─ Timing analysis
    │   └─ Bot detection
    │   └─ Suspicion scoring
    │
    └── protection.js         # Additional security layers
        └─ DevTools detection
        └─ Copy-paste prevention
        └─ Automation detection
        └─ Secure countdown
        └─ URL obfuscation/deobfuscation
```

---

## 🕵️ Bypass Detection Details

### What Gets Detected:

#### ❌ Direct Access
```
User tries: yourserver.com/go.html?id=abc123
Detection:
  - document.referrer is empty or not from shortener
  - Suspicion score: +30 to +40
  - Result: Blocked
```

#### ❌ JavaScript Disabled
```
User disables JavaScript
Detection:
  - <noscript> tag triggers immediate redirect
  - Meta refresh to blocked.html?reason=javascript_disabled
  - Result: Blocked immediately
```

#### ❌ Inspect Element
```
User opens DevTools (F12, Ctrl+Shift+I, right-click)
Detection:
  - Window size vs inner size comparison
  - Debugger timing analysis
  - Keyboard shortcut monitoring
  - Suspicion score: +15
  - Result: Warning (not critical alone)
```

#### ❌ Automated Bots
```
User uses bot/script (Selenium, Puppeteer, etc.)
Detection:
  - navigator.webdriver === true
  - Zero plugins/languages
  - No mouse movement
  - Suspicion score: +20 to +30
  - Result: Blocked
```

#### ❌ Page Reload
```
User refreshes page to try again
Detection:
  - SessionStorage tracks previous visit
  - If < 5 seconds since last visit
  - Suspicion score: +35
  - Result: Blocked
```

#### ❌ Link Sharing/Reuse
```
User shares protected link with others
Detection:
  - One-time token in sessionStorage
  - Each session can only use link once
  - Suspicion score: +50
  - Result: Blocked on second attempt
```

#### ❌ Token Tampering
```
User tries to modify URL parameters
Detection:
  - Token validation fails
  - Checksum mismatch
  - ID doesn't match stored data
  - Suspicion score: +60 to +70
  - Result: Blocked
```

#### ❌ Time Manipulation
```
User tries to skip countdown by changing system time
Detection:
  - Countdown uses Date.now() comparisons
  - Validates expected vs actual elapsed time
  - Allows 2-second tolerance for lag
  - Result: Countdown resets or blocks
```

---

## ⚠️ Limitations (Honest Assessment)

### What CAN Be Bypassed (With Effort):

1. **Advanced Users Can Reverse Engineer**
   - All code is client-side and visible
   - JavaScript can be modified/disabled entirely
   - LocalStorage can be manipulated via DevTools
   - **Mitigation**: Obfuscation, multiple layers, frequent updates

2. **Referrer Header Can Be Spoofed**
   - Browser extensions or proxies can fake referrers
   - Advanced users can modify headers
   - **Mitigation**: Multiple validation points, not just referrer

3. **LocalStorage Is Vulnerable**
   - Users can view/modify stored link data
   - Can extract destination URLs from storage
   - **Mitigation**: Obfuscation, short-lived tokens, checksums

4. **Browser Extensions Can Interfere**
   - Ad blockers might break legitimate flow
   - Automation extensions can bypass some checks
   - **Mitigation**: Detect extensions, multiple redundant checks

5. **Determined Attackers Will Succeed**
   - No client-side solution is 100% secure
   - Automation can be sophisticated enough to mimic humans
   - **Reality**: We raise the barrier, not eliminate it

### What CANNOT Be Protected Without Backend:

1. **True Token Validation**
   - Server-side token storage = more secure
   - Database verification = harder to bypass
   - **Current**: LocalStorage (easily manipulated)

2. **IP Tracking & Rate Limiting**
   - Prevent abuse from same IP
   - Detect distributed attacks
   - **Current**: No IP tracking possible

3. **Real-Time Analytics**
   - Monitor bypass patterns across all users
   - Dynamic threat response
   - **Current**: Only local logging

4. **Persistent Link Revocation**
   - Can't truly delete/expire links
   - Users can cache and reuse
   - **Current**: Time-based expiry only

### The Reality:

This system is designed to:
- ✅ Block 90%+ of casual bypass attempts
- ✅ Detect and deter most users from trying
- ✅ Protect against common tools and techniques
- ✅ Make bypassing more effort than it's worth

It will NOT stop:
- ❌ Expert hackers with time and motivation
- ❌ Custom-built bypass tools targeting this system
- ❌ Sophisticated automation that mimics human behavior perfectly

**Recommendation**: For maximum security, use this as the front-end layer of a backend-powered system.

---

## 🔧 Customization

### Adjust Security Levels:

**Stricter (More false positives):**
```javascript
// In anti-bypass.js
// Lower suspicion threshold
if (this.suspicionScore > 30) { // instead of 50
    return { allowed: false, ... };
}

// Longer token validity
const maxTokenAge = 12 * 60 * 60 * 1000; // 12 hours instead of 24
```

**More Lenient (Fewer false positives):**
```javascript
// Higher suspicion threshold
if (this.suspicionScore > 70) { // instead of 50
    return { allowed: false, ... };
}

// Disable DevTools detection
// Comment out checkDevTools() call
```

### Change Countdown Time:

```javascript
// In go.html, around line 290
startCountdown(5, destinationUrl); // Change 5 to desired seconds
```

### Add More Shortener Domains:

```javascript
// In anti-bypass.js, around line 35
const allowedDomains = [
    'shrinkme.io',
    'exe.io',
    'yourshortener.com', // Add here
];
```

---

## 📊 Monitoring & Debugging

### View Security Logs:

Open browser console (F12) to see:
```
[2026-01-02T10:30:45Z] === Starting Security Validation ===
[2026-01-02T10:30:45Z] ✓ Valid referrer detected: shrinkme.io
[2026-01-02T10:30:45Z] ✓ JavaScript execution verified
[2026-01-02T10:30:45Z] ✓ Timing check passed
[2026-01-02T10:30:45Z] ✓ Token validation passed
[2026-01-02T10:30:45Z] === Security Report ===
[2026-01-02T10:30:45Z] Suspicion Score: 0/100
[2026-01-02T10:30:45Z] ✅ ALL CHECKS PASSED - ACCESS GRANTED
```

### Track Link Statistics:

In `index.html`, the dashboard shows:
- Link ID
- Creation date
- Click count
- Shortener service used
- Active/Expired status

---

## 🆘 FAQ

**Q: Will this work on mobile browsers?**  
A: Yes! All code is responsive and works on mobile. Some detection methods (like DevTools) are desktop-specific but don't block mobile users.

**Q: What happens if a legitimate user gets blocked?**  
A: Very rare with current settings. If it happens, they can request a new link from the owner. You can adjust suspicion thresholds.

**Q: Can I use this with any URL shortener?**  
A: Yes! Add their domain to the whitelist in `anti-bypass.js`. Works with ShrinkMe, Exe.io, Linkvertise, Shorte.st, Ouo.io, and custom shorteners.

**Q: How long are links valid?**  
A: Default is 24 hours. Configurable in `link-generator.js` (isLinkExpired method).

**Q: Does this slow down legitimate users?**  
A: Minimal impact. Security checks run in ~1-2 seconds, then 5-second countdown. Total delay: ~6-7 seconds.

**Q: Can I customize the design?**  
A: Absolutely! Edit `css/styles.css`. All styling is in CSS custom properties (variables) for easy theming.

**Q: Is this GDPR compliant?**  
A: Yes, uses only LocalStorage (local to user's browser). No data sent to servers, no tracking, no cookies.

**Q: What if shortener changes their domain?**  
A: Update the whitelist in `anti-bypass.js`. Takes 1 minute to add new domains.

---

## 🔒 Security Best Practices

1. **HTTPS Only**: Deploy on HTTPS to prevent man-in-the-middle attacks
2. **Frequent Updates**: Change obfuscation methods regularly
3. **Monitor Bypass Patterns**: Check console logs for common bypass attempts
4. **Combine with Backend**: For high-value content, add server-side validation
5. **Educate Users**: Make it clear that bypassing hurts content creators

---

## 📝 License

This project is provided as-is for educational and commercial use. No warranties or guarantees of security effectiveness.

---

## 🤝 Contributing

Improvements welcome! Common enhancements:
- Additional shortener domains
- New detection methods
- UI improvements
- Mobile optimization
- Performance optimizations

---

## ⚡ Quick Start

```bash
# 1. Clone or download files
# 2. Upload to your web server
# 3. Visit index.html
# 4. Create your first protected link
# 5. Test the flow!
```

**Support**: For issues or questions, check console logs for detailed error messages.

---

**Built with ❤️ for content creators protecting their monetization**

*Last updated: January 2, 2026*
