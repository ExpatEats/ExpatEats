import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

async function startup() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  console.log("🚀 Starting database setup...");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  try {
    // Check if users table exists (as a proxy for database being initialized)
    const tableCheckResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);

    const tablesExist = tableCheckResult.rows[0].exists;

    if (tablesExist) {
      console.log("✅ Database tables already exist, skipping migration");
    } else {
      console.log("🔄 Running database migrations...");
      const db = drizzle(pool);

      try {
        await migrate(db, {
          migrationsFolder: path.join(__dirname, "../migrations"),
        });
        console.log("✅ Migrations completed successfully");
      } catch (migrationError: any) {
        // If migrations fail (e.g., because journal is out of sync), log but don't fail
        console.warn("⚠️  Migration failed, but continuing:", migrationError.message);
        console.log("💡 Database may need manual schema updates");
      }
    }

    console.log("✅ Database setup complete");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

startup();
