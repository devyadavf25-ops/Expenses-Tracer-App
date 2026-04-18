const { User } = require('./server/models/User');
const { connectDB } = require('./server/config/db');

async function promoteAdmin() {
  await connectDB();
  const email = process.argv[2];
  
  if (!email) {
    console.log("Usage: node promote_admin.js <email>");
    process.exit(1);
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
