const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function seed() {
    const client = new Client({ connectionString });
    await client.connect();

    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log('Seeding using pg...');

    try {
        // IDs for foreign keys (Random UUIDs since it's text/uuid)
        const vendorId = '00000000-0000-0000-0000-000000000001';
        const maskTypeId = '00000000-0000-0000-0000-000000000002';
        const eraTypeId = '00000000-0000-0000-0000-000000000003';
        const adminId = '00000000-0000-0000-0000-000000000004';
        const logisticsId = '00000000-0000-0000-0000-000000000005';
        const firefighterId = '00000000-0000-0000-0000-000000000006';

        // Clear existing data (optional, but good for idempotency)
        await client.query('TRUNCATE TABLE users, vendors, equipment_types, equipment, logs, service_requests RESTART IDENTITY CASCADE');

        // Insert Vendor
        await client.query(`
            INSERT INTO vendors (id, name, created_at) 
            VALUES ($1, $2, NOW()) 
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        `, [vendorId, 'Empresa Mantenimiento A']);

        // Insert Users
        await client.query(`
            INSERT INTO users (id, email, password, name, role, updated_at) 
            VALUES ($1, $2, $3, $4, $5, NOW()) 
            ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
        `, [adminId, 'admin@test.com', hashedPassword, 'Admin User', 'ADMIN']);

        await client.query(`
            INSERT INTO users (id, email, password, name, role, updated_at) 
            VALUES ($1, $2, $3, $4, $5, NOW()) 
            ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
        `, [logisticsId, 'logistica@test.com', hashedPassword, 'Jorge Logística', 'LOGISTICA']);

        await client.query(`
            INSERT INTO users (id, email, password, name, role, updated_at) 
            VALUES ($1, $2, $3, $4, $5, NOW()) 
            ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
        `, [firefighterId, 'bombero@test.com', hashedPassword, 'Pablo Bombero', 'SOLICITANTE']);

        // Insert Equipment Types
        await client.query(`
            INSERT INTO equipment_types (id, name, vendor_id, created_at) 
            VALUES ($1, $2, $3, NOW()) 
            ON CONFLICT (name) DO UPDATE SET vendor_id = EXCLUDED.vendor_id
        `, [maskTypeId, 'Máscara de Protección', vendorId]);

        await client.query(`
            INSERT INTO equipment_types (id, name, vendor_id, created_at) 
            VALUES ($1, $2, $3, NOW()) 
            ON CONFLICT (name) DO UPDATE SET vendor_id = EXCLUDED.vendor_id
        `, [eraTypeId, 'Equipo de Respiración Autónoma', vendorId]);

        // Insert Equipment
        await client.query(`
            INSERT INTO equipment (id, visual_id, qr_code, type_id, assignment_type, status, location, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
            ON CONFLICT (visual_id) DO UPDATE SET status = EXCLUDED.status
        `, ['00000000-0000-0000-0000-000000000007', 'M-001', 'QR-M-001', maskTypeId, 'PARQUE', 'EN_PARQUE', 'Parque Central - Estante 1']);

        await client.query(`
            INSERT INTO equipment (id, visual_id, qr_code, type_id, assignment_type, owner_id, status, location, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
            ON CONFLICT (visual_id) DO UPDATE SET status = EXCLUDED.status
        `, ['00000000-0000-0000-0000-000000000008', 'ERA-001', 'QR-ERA-001', eraTypeId, 'PERSONAL', firefighterId, 'EN_PARQUE', 'Parque Norte - Taquilla 42']);

        console.log('Seed completed successfully via pg!');
    } catch (err) {
        console.error('Seed failed!', err);
    } finally {
        await client.end();
    }
}

seed();
