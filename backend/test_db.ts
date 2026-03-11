import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    console.log('--- Database Connection Test (Prisma 7) ---');
    const connectionString = process.env.DATABASE_URL;
    console.log('DATABASE_URL defined:', !!connectionString);
    
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('✅ Connection successful!');
        
        const count = await prisma.user.count();
        console.log(`✅ Users in database: ${count}`);
        
    } catch (error: any) {
        console.error('❌ Connection failed:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
