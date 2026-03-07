import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:admin@localhost:5432/ppe_tracking?schema=public"
        }
    }
});

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('Starting seed...');

    const vendor = await prisma.vendor.upsert({
        where: { name: 'Dräger' },
        update: {},
        create: { name: 'Dräger' },
    });

    const typeERA = await prisma.equipmentType.upsert({
        where: { name: 'ERA' },
        update: {},
        create: { name: 'ERA', vendorId: vendor.id },
    });

    await prisma.user.upsert({
        where: { email: 'logistica@example.com' },
        update: {},
        create: {
            email: 'logistica@example.com',
            password: hashedPassword,
            name: 'Luis Logística',
            role: 'LOGISTICA' as any,
        },
    });

    await prisma.user.upsert({
        where: { email: 'coordinador@example.com' },
        update: {},
        create: {
            email: 'coordinador@example.com',
            password: hashedPassword,
            name: 'Carlos Coordinador',
            role: 'COORDINADOR_INTERVENCION' as any,
        },
    });

    const parkCentral = await prisma.park.upsert({
        where: { name: 'Parque Central' },
        update: {},
        create: { name: 'Parque Central' },
    });

    await prisma.parkEquipmentMin.upsert({
        where: { parkId_typeId: { parkId: parkCentral.id, typeId: typeERA.id } },
        update: {},
        create: { parkId: parkCentral.id, typeId: typeERA.id, minQuantity: 5 },
    });

    console.log('Seed completed successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
