const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    try {
        const passwordHash = await bcrypt.hash('Algeria@2026', 10);
        
        await db.query(`
            INSERT INTO users (name, email, role, location, status, password_hash)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (email) DO NOTHING
        `, [
            'Admin National', 
            'admin@sante.dz', 
            'National Admin', 
            'Ministère de la Santé', 
            'active', 
            passwordHash
        ]);
        
        console.log('✅ National Admin created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating National Admin:', err);
        process.exit(1);
    }
}

seedAdmin();
