import { PrismaClient, Role, AssignmentType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {},
        create: {
            email: 'admin@test.com',
            password: hashedPassword,
            name: 'Admin User',
            role: Role.ADMIN,
        },
    });

    const logistics = await prisma.user.upsert({
        where: { email: 'logistica@test.com' },
        update: {},
        create: {
            email: 'logistica@test.com',
            password: hashedPassword,
            name: 'Jorge Logística',
            role: Role.LOGISTICA,
        },
    });

    const firefighter = await prisma.user.upsert({
        where: { email: 'bombero@test.com' },
        update: {},
        create: {
            email: 'bombero@test.com',
            password: hashedPassword,
            name: 'Pablo Bombero',
            role: Role.SOLICITANTE,
        },
    });

    // Create Vendor first for external user
    const vendor = await prisma.vendor.upsert({
        where: { name: 'Empresa Mantenimiento A' },
        update: {},
        create: {
            name: 'Empresa Mantenimiento A',
        },
    });

    const externalUser = await prisma.user.upsert({
        where: { email: 'empresa@test.com' },
        update: {},
        create: {
            email: 'empresa@test.com',
            password: hashedPassword,
            name: 'Servicio Técnico Externo',
            role: Role.EMPRESA_EXTERNA,
            vendorId: vendor.id,
        },
    });

    const coordinator = await prisma.user.upsert({
        where: { email: 'coordinador@test.com' },
        update: {},
        create: {
            email: 'coordinador@test.com',
            password: hashedPassword,
            name: 'Ana Coordinadora',
            role: Role.COORDINADOR_INTERVENCION,
        },
    });

    // Create Equipment Type
    const maskType = await prisma.equipmentType.upsert({
        where: { name: 'Máscara de Protección' },
        update: {},
        create: {
            name: 'Máscara de Protección',
            vendorId: vendor.id,
        },
    });

    const eraType = await prisma.equipmentType.upsert({
        where: { name: 'Equipo de Respiración Autónoma' },
        update: {},
        create: {
            name: 'Equipo de Respiración Autónoma',
            vendorId: vendor.id,
        },
    });

    // Create Equipment
    await prisma.equipment.upsert({
        where: { visualId: 'M-001' },
        update: {},
        create: {
            visualId: 'M-001',
            qrCode: 'QR-M-001',
            typeId: maskType.id,
            assignmentType: AssignmentType.PARQUE,
            status: 'EN_PARQUE',
            location: 'Parque Central - Estante 1',
        },
    });

    await prisma.equipment.upsert({
        where: { visualId: 'ERA-001' },
        update: {},
        create: {
            visualId: 'ERA-001',
            qrCode: 'QR-ERA-001',
            typeId: eraType.id,
            assignmentType: AssignmentType.PERSONAL,
            ownerId: firefighter.id,
            status: 'EN_PARQUE',
            location: 'Parque Norte - Taquilla 42',
        },
    });

    console.log('Seed data created successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
