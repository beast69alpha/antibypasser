const pool = require('../config/database');
const crypto = require('crypto');

class Link {
  static async create({ userId, destinationUrl, title, shortenerUrl }) {
    const linkId = crypto.randomBytes(16).toString('hex');
    const [result] = await pool.query(
      'INSERT INTO links (user_id, link_id, destination_url, title, shortener_url) VALUES (?, ?, ?, ?, ?)',
      [userId, linkId, destinationUrl, title, shortenerUrl]
    );
    return { id: result.insertId, linkId };
  }

  static async findByLinkId(linkId) {
    const [rows] = await pool.query(
      'SELECT * FROM links WHERE link_id = ? AND is_active = TRUE',
      [linkId]
    );
    return rows[0];
  }

  static async findByUserId(userId, limit = 50, offset = 0) {
    const [rows] = await pool.query(
      'SELECT * FROM links WHERE user_id = ? AND is_active = TRUE ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );
    return rows;
  }

  static async update(linkId, userId, { destinationUrl, title, shortenerUrl }) {
    const [result] = await pool.query(
      'UPDATE links SET destination_url = ?, title = ?, shortener_url = ? WHERE link_id = ? AND user_id = ?',
      [destinationUrl, title, shortenerUrl, linkId, userId]
    );
    return result.affectedRows > 0;
  }

  static async delete(linkId, userId) {
    const [result] = await pool.query(
      'UPDATE links SET is_active = FALSE WHERE link_id = ? AND user_id = ?',
      [linkId, userId]
    );
    return result.affectedRows > 0;
  }

  static async incrementAccessCount(linkId) {
    await pool.query(
      'UPDATE links SET access_count = access_count + 1 WHERE link_id = ?',
      [linkId]
    );
  }

  static async getStats(userId) {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_links,
        SUM(access_count) as total_accesses,
        MAX(created_at) as last_created
       FROM links 
       WHERE user_id = ? AND is_active = TRUE`,
      [userId]
    );
    return stats[0];
  }
}

module.exports = Link;
