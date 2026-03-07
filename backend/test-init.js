const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$connect()
    .then(() => {
        console.log('Connected!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Failed!', err);
        process.exit(1);
    });
