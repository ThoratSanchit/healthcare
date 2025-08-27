const User = require('../models/User');

async function ensureDefaultAdmin() {
  try {
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@demo.com';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'password123';

    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      return;
    }

    const admin = await User.create({
      name: 'Demo Admin',
      email,
      password,
      role: 'admin',
      phone: '+10000000000',
      isActive: true,
    });

    console.log(`✅ Seeded default admin: ${admin.email}`);
  } catch (err) {
    console.error('Admin seeding failed:', err.message);
  }
}

module.exports = ensureDefaultAdmin;


