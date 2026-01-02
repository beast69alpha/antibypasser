const pool = require('../config/database');
const crypto = require('crypto');

class Token {
  static async create(linkId, expiresInMinutes = 30) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    
    await pool.query(
      'INSERT INTO link_tokens (link_id, token, expires_at) VALUES (?, ?, ?)',
      [linkId, token, expiresAt]
    );
    return token;
  }

  static async validate(token) {
    const [rows] = await pool.query(
      'SELECT * FROM link_tokens WHERE token = ? AND is_used = FALSE AND expires_at > NOW()',
      [token]
    );
    return rows[0];
  }

  static async markAsUsed(token, userAgent, ipAddress) {
    const [result] = await pool.query(
      'UPDATE link_tokens SET is_used = TRUE, used_at = NOW(), user_agent = ?, ip_address = ? WHERE token = ?',
      [userAgent, ipAddress, token]
    );
    return result.affectedRows > 0;
  }

  static async cleanup() {
    // Delete expired tokens older than 24 hours
    await pool.query(
      'DELETE FROM link_tokens WHERE expires_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)'
    );
  }
}

module.exports = Token;
