const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const Link = require('../models/Link');
const Token = require('../models/Token');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create link
router.post('/',
  authMiddleware,
  [
    body('destinationUrl').isURL(),
    body('title').optional().trim().isLength({ max: 255 }),
    body('shortenerUrl').optional().isURL()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { destinationUrl, title, shortenerUrl } = req.body;
      const result = await Link.create({
        userId: req.userId,
        destinationUrl,
        title,
        shortenerUrl
      });

      res.status(201).json({
        message: 'Link created successfully',
        linkId: result.linkId,
        id: result.id
      });
    } catch (error) {
      console.error('Create link error:', error);
      res.status(500).json({ error: 'Failed to create link' });
    }
  }
);

// Get all user links
router.get('/', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const links = await Link.findByUserId(req.userId, limit, offset);
    const stats = await Link.getStats(req.userId);

    res.json({ links, stats });
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// Get single link
router.get('/:linkId', authMiddleware, async (req, res) => {
  try {
    const link = await Link.findByLinkId(req.params.linkId);
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (link.user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ link });
  } catch (error) {
    console.error('Get link error:', error);
    res.status(500).json({ error: 'Failed to fetch link' });
  }
});

// Update link
router.put('/:linkId',
  authMiddleware,
  [
    body('destinationUrl').optional().isURL(),
    body('title').optional().trim().isLength({ max: 255 }),
    body('shortenerUrl').optional().isURL()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { destinationUrl, title, shortenerUrl } = req.body;
      const updated = await Link.update(req.params.linkId, req.userId, {
        destinationUrl,
        title,
        shortenerUrl
      });

      if (!updated) {
        return res.status(404).json({ error: 'Link not found' });
      }

      res.json({ message: 'Link updated successfully' });
    } catch (error) {
      console.error('Update link error:', error);
      res.status(500).json({ error: 'Failed to update link' });
    }
  }
);

// Delete link
router.delete('/:linkId', authMiddleware, async (req, res) => {
  try {
    const deleted = await Link.delete(req.params.linkId, req.userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

// Generate token for link
router.post('/:linkId/token', authMiddleware, async (req, res) => {
  try {
    const link = await Link.findByLinkId(req.params.linkId);
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (link.user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const expiresInMinutes = parseInt(req.body.expiresInMinutes) || 30;
    const token = await Token.create(req.params.linkId, expiresInMinutes);

    res.json({ token, expiresInMinutes });
  } catch (error) {
    console.error('Generate token error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

module.exports = router;
