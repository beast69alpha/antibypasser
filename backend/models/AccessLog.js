const pool = require('../config/database');

class AccessLog {
  static async create({ linkId, token, accessType, reason, referrer, userAgent, ipAddress }) {
    await pool.query(
      'INSERT INTO access_logs (link_id, token, access_type, reason, referrer, user_agent, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [linkId, token, accessType, reason, referrer, userAgent, ipAddress]
    );
  }

  static async getByLinkId(linkId, limit = 100) {
    const [rows] = await pool.query(
      'SELECT * FROM access_logs WHERE link_id = ? ORDER BY accessed_at DESC LIMIT ?',
      [linkId, limit]
    );
    return rows;
  }

  static async getByUserId(userId, limit = 100) {
    const [rows] = await pool.query(
      `SELECT al.* FROM access_logs al
       INNER JOIN links l ON al.link_id = l.link_id
       WHERE l.user_id = ?
       ORDER BY al.accessed_at DESC
       LIMIT ?`,
      [userId, limit]
    );
    return rows;
  }
}

module.exports = AccessLog;
