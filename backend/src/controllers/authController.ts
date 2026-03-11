import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const register = async (req: Request, res: Response) => {
    const { email, password, name, role, vendorId } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
                vendorId,
            },
        });

        const token = jwt.sign(
            { id: user.id, role: user.role, vendorId: user.vendorId },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Error registering user' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, vendorId: user.vendorId },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
    } catch (error: any) {
        console.error('Login error detail:', error);
        res.status(500).json({ error: 'Error logging in', details: error.message });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                vendorId: true,
                createdAt: true,
                vendor: {
                    select: {
                        name: true
                    }
                }
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { name, email, role, vendorId, password } = req.body;

    try {
        const data: any = { name, email, role, vendorId };
        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                vendorId: true
            }
        });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: 'Error updating user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.user.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'Error deleting user' });
    }
};
