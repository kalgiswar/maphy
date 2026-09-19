require('dotenv').config();
const sequelize = require('./db/conn');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Add onboarding_dismissed column if it does not exist
    const [results] = await sequelize.query(`
      SHOW COLUMNS FROM users LIKE 'onboarding_dismissed'
    `);
    
    if (results.length === 0) {
      await sequelize.query(`
        ALTER TABLE users ADD COLUMN onboarding_dismissed BOOLEAN DEFAULT FALSE
      `);
      console.log('Added onboarding_dismissed column to users table.');
    } else {
      console.log('onboarding_dismissed column already exists.');
    }

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();
