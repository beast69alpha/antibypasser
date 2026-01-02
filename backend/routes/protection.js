const express = require('express');
const Link = require('../models/Link');
const Token = require('../models/Token');
const AccessLog = require('../models/AccessLog');

const router = express.Router();

// Public endpoint: Validate token and get destination
router.post('/validate', async (req, res) => {
  try {
    const { token, linkId, referrer } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    // Validate token
    const tokenData = await Token.validate(token);
    if (!tokenData || tokenData.link_id !== linkId) {
      await AccessLog.create({
        linkId,
        token,
        accessType: 'blocked',
        reason: 'Invalid or expired token',
        referrer,
        userAgent,
        ipAddress
      });
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Get link
    const link = await Link.findByLinkId(linkId);
    if (!link) {
      await AccessLog.create({
        linkId,
        token,
        accessType: 'blocked',
        reason: 'Link not found',
        referrer,
        userAgent,
        ipAddress
      });
      return res.status(404).json({ error: 'Link not found' });
    }

    // Mark token as used
    await Token.markAsUsed(token, userAgent, ipAddress);
    
    // Increment access count
    await Link.incrementAccessCount(linkId);

    // Log success
    await AccessLog.create({
      linkId,
      token,
      accessType: 'success',
      referrer,
      userAgent,
      ipAddress
    });

    res.json({
      success: true,
      destination: link.destination_url
    });
  } catch (error) {
    console.error('Validate error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

// Public endpoint: Get link metadata (for go.html page)
router.get('/link/:linkId', async (req, res) => {
  try {
    const link = await Link.findByLinkId(req.params.linkId);
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json({
      title: link.title,
      shortenerUrl: link.shortener_url,
      createdAt: link.created_at
    });
  } catch (error) {
    console.error('Get link metadata error:', error);
    res.status(500).json({ error: 'Failed to fetch link metadata' });
  }
});

// Protected endpoint: Get access logs
router.get('/logs/:linkId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const limit = parseInt(req.query.limit) || 100;
    const logs = await AccessLog.getByLinkId(req.params.linkId, limit);

    res.json({ logs });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
