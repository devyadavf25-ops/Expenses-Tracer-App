const User = require('./server/models/User');
const { connectDB } = require('./server/config/db');

async function promoteAdmin() {
  await connectDB();
  const email = process.argv[2];
  
  if (!email) {
    console.log("Usage: node promote_admin.js <email>");
    process.exit(1);
  }

  try {
    // Manually add the column if it doesn't exist
    await User.sequelize.query("ALTER TABLE Users ADD COLUMN role VARCHAR(255) DEFAULT 'user'");
    console.log("➕ Added 'role' column to database.");
  } catch (e) {
    // Column might already exist
    console.log("ℹ️ Role column already exists or skipping.");
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    console.log("User not found!");
    process.exit(1);
  }

  user.role = 'admin';
  await user.save();
  console.log(`✅ User ${user.name} (${user.email}) has been promoted to ADMIN!`);
  process.exit(0);
}

promoteAdmin();
