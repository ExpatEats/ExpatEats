#!/usr/bin/env tsx

/**
 * Generate bcrypt hashes for admin users
 *
 * This script generates the bcrypt password hashes used in production_seed.sql
 *
 * Usage:
 *   tsx scripts/generate-admin-hashes.ts
 */

import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 12;

async function generateHashes() {
    console.log("🔐 Generating bcrypt password hashes...\n");

    const users = [
        {
            username: "admin",
            email: "admin@expateats.com",
            password: "ExpAt2024!SecureAdmin"
        },
        {
            username: "aaronrous",
            email: "aaron145165@gmail.com",
            password: "Cool!123129"
        }
    ];

    for (const user of users) {
        const hash = await bcrypt.hash(user.password, BCRYPT_ROUNDS);

        console.log(`User: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`Password: ${user.password}`);
        console.log(`Hash: ${hash}`);
        console.log(`\nSQL INSERT:`);
        console.log(`INSERT INTO users (username, password, email, name, role, email_verified, auth_provider)`);
        console.log(`VALUES ('${user.username}', '${hash}', '${user.email}', '${user.username === 'admin' ? 'Admin User' : 'Aaron Roussel'}', 'admin', true, 'local');\n`);
        console.log("---\n");
    }

    console.log("✅ Hashes generated successfully!");
    console.log("\n📋 Copy the hashes above into production_seed.sql if needed");
}

generateHashes();
