import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import csv from 'csv-parser';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { Role, AssignmentType } from '@prisma/client';

export const importUsers = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const results: any[] = [];
    const errors: string[] = [];
    let successCount = 0;

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                for (const row of results) {
                    try {
                        const { email, name, password, role, vendorName } = row;
                        
                        if (!email || !password || !name) {
                            errors.push(`Fila omitida: Faltan datos obligatorios para ${email || 'usuario desconocido'}`);
                            continue;
                        }

                        let vendorId = null;
                        if (vendorName) {
                            const vendor = await prisma.vendor.findUnique({ where: { name: vendorName } });
                            if (vendor) vendorId = vendor.id;
                        }

                        const hashedPassword = await bcrypt.hash(password, 10);

                        await prisma.user.upsert({
                            where: { email },
                            update: {
                                name,
                                role: (role as Role) || Role.SOLICITANTE,
                                vendorId
                            },
                            create: {
                                email,
                                name,
                                password: hashedPassword,
                                role: (role as Role) || Role.SOLICITANTE,
                                vendorId
                            }
                        });
                        successCount++;
                    } catch (e: any) {
                        errors.push(`Error en ${row.email}: ${e.message}`);
                    }
                }
                
                // Cleanup file
                if (req.file) fs.unlinkSync(req.file.path);

                res.json({ 
                    message: `Carga finalizada: ${successCount} usuarios procesados`,
                    successCount,
                    errors 
                });
            } catch (err: any) {
                res.status(500).json({ error: 'Error procesando el archivo CSV', details: err.message });
            }
        });
};

export const importEquipment = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const results: any[] = [];
    const errors: string[] = [];
    let successCount = 0;

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                for (const row of results) {
                    try {
                        const { visualId, qrCode, typeName, assignmentType, ownerEmail, parkName, status, location } = row;

                        if (!visualId || !typeName) {
                            errors.push(`Fila omitida: Faltan datos obligatorios para ${visualId || 'equipo desconocido'}`);
                            continue;
                        }

                        // Get Type
                        const type = await prisma.equipmentType.findUnique({ where: { name: typeName } });
                        if (!type) {
                            errors.push(`Error en ${visualId}: El tipo '${typeName}' no existe`);
                            continue;
                        }

                        // Handle Owner
                        let ownerId = null;
                        if (ownerEmail) {
                            const user = await prisma.user.findUnique({ where: { email: ownerEmail } });
                            if (user) ownerId = user.id;
                        }

                        // Handle Park
                        let parkId = null;
                        if (parkName) {
                            const park = await prisma.park.findUnique({ where: { name: parkName } });
                            if (park) parkId = park.id;
                        }

                        await prisma.equipment.upsert({
                            where: { visualId },
                            update: {
                                qrCode,
                                typeId: type.id,
                                assignmentType: (assignmentType as AssignmentType) || AssignmentType.PARQUE,
                                ownerId,
                                parkId,
                                status: status || 'EN_PARQUE',
                                location
                            },
                            create: {
                                visualId,
                                qrCode,
                                typeId: type.id,
                                assignmentType: (assignmentType as AssignmentType) || AssignmentType.PARQUE,
                                ownerId,
                                parkId,
                                status: status || 'EN_PARQUE',
                                location
                            }
                        });
                        successCount++;
                    } catch (e: any) {
                        errors.push(`Error en ${row.visualId}: ${e.message}`);
                    }
                }

                // Cleanup file
                if (req.file) fs.unlinkSync(req.file.path);

                res.json({ 
                    message: `Carga finalizada: ${successCount} equipos procesados`,
                    successCount,
                    errors 
                });
            } catch (err: any) {
                res.status(500).json({ error: 'Error procesando el archivo CSV', details: err.message });
            }
        });
};
