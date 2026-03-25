import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

let pool: mysql.Pool | null = null;

export const getDb = async () => {
  if (!pool) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is required to connect to the database.');
    }
    
    pool = mysql.createPool({
      uri: dbUrl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Initialize tables if they don't exist
    await initializeDb(pool);
  }
  return pool;
};

const initializeDb = async (db: mysql.Pool) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS groups_table (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        totalAmount DECIMAL(10, 2) DEFAULT 0
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS group_members (
        group_id VARCHAR(255),
        user_id VARCHAR(255),
        name VARCHAR(255),
        PRIMARY KEY (group_id, user_id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(255) PRIMARY KEY,
        group_id VARCHAR(255),
        description VARCHAR(255),
        amount DECIMAL(10, 2),
        paid_by VARCHAR(255),
        category VARCHAR(255)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS expense_splits (
        expense_id VARCHAR(255),
        user_id VARCHAR(255),
        amount DECIMAL(10, 2),
        PRIMARY KEY (expense_id, user_id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS settlements (
        id VARCHAR(255) PRIMARY KEY,
        group_id VARCHAR(255),
        payer_id VARCHAR(255),
        payee_id VARCHAR(255),
        amount DECIMAL(10, 2),
        date DATETIME
      )
    `);
    
    // Create demo user if it doesn't exist
    const [demoUsers] = await db.query<any[]>('SELECT id FROM users WHERE email = ?', ['demo@fairshare.com']);
    if (demoUsers.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db.query(
        'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
        ['demo-user-id', 'Ankush', 'demo@fairshare.com', hashedPassword]
      );
    }
    
    console.log('MySQL database initialized successfully.');
  } catch (error) {
    console.error('Error initializing MySQL database:', error);
    throw error;
  }
};
