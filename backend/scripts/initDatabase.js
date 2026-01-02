const pool = require('../config/database');

const initDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    const connection = await pool.getConnection();
    console.log('Database connected successfully!');
    
    // Test query
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log('Test query result:', rows[0].result);
    
    connection.release();
    console.log('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
};

initDatabase();
