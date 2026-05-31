// migrations/seed.js
require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../src/config/db");

const SALT_ROUNDS = 10;

const users = [
  { email: "alice@example.com", pin: "1234", balance: 1000.0 },
  { email: "bob@example.com",   pin: "5678", balance: 500.0  },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Seeding database...");

    for (const user of users) {
      // Skip if user already exists (idempotent seed)
      const existing = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [user.email]
      );
      if (existing.rows.length > 0) {
        console.log(`  Skipping ${user.email} — already exists.`);
        continue;
      }

      const pinHash = await bcrypt.hash(user.pin, SALT_ROUNDS);

      const result = await client.query(
        "INSERT INTO users (email, pin_hash) VALUES ($1, $2) RETURNING id",
        [user.email, pinHash]
      );
      const userId = result.rows[0].id;

      await client.query(
        "INSERT INTO accounts (user_id, balance) VALUES ($1, $2)",
        [userId, user.balance]
      );

      console.log(`  Seeded ${user.email} with balance ${user.balance}`);
    }

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

seed();
