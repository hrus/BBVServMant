"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUsers = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const register = async (req, res) => {
    const { email, password, name, role, vendorId } = req.body;
    try {
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
                vendorId,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, vendorId: user.vendorId }, JWT_SECRET, { expiresIn: '8h' });
        res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Error registering user' });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, vendorId: user.vendorId }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
    }
    catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
};
exports.login = login;
const getUsers = async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
};
exports.getUsers = getUsers;
const updateUser = async (req, res) => {
    const id = req.params.id;
    const { name, email, role, vendorId, password } = req.body;
    try {
        const data = { name, email, role, vendorId };
        if (password) {
            data.password = await bcryptjs_1.default.hash(password, 10);
        }
        const user = await prisma_1.default.user.update({
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
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating user' });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        await prisma_1.default.user.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Error deleting user' });
    }
};
exports.deleteUser = deleteUser;
