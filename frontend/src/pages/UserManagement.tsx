import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import { Shield, UserPlus, Trash2, Building2, Mail } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import type { User as UserType, Role } from '../types';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'SOLICITANTE' as Role,
        vendorId: ''
    });
    const { showToast } = useToast();

    const fetchUsersAndVendors = async () => {
        try {
            const [usersRes, vendorsRes] = await Promise.all([
                api.get('/auth/users'),
                api.get('/vendors')
            ]);
            setUsers(usersRes.data);
            setVendors(vendorsRes.data);
        } catch (err) {
            console.error('Error fetching data', err);
            showToast('Error al cargar datos de usuarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersAndVendors();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            showToast('Usuario creado correctamente', 'success');
            setFormData({ name: '', email: '', password: '', role: 'SOLICITANTE', vendorId: '' });
            fetchUsersAndVendors();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Error al crear usuario', 'error');
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
        try {
            await api.delete(`/auth/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
            showToast('Usuario eliminado', 'info');
        } catch (err) {
            showToast('Error al eliminar usuario', 'error');
        }
    };


    if (loading) return <div className="p-10 text-slate-400">Sincronizando base de usuarios...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Gestión de Personal</h1>
                <p className="text-slate-400 text-lg">Control de acceso, roles y asignación de proveedores</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Create User Form */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl sticky top-24 overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.03] blur-3xl -mr-32 -mt-32 rounded-full" />

                        <div className="flex items-center gap-4 mb-8 relative z-10">
                            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-900/40">
                                <UserPlus size={24} />
                            </div>
                            <h2 className="text-xl font-black text-white italic uppercase">Nueva Cuenta</h2>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-5 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-inter"
                                    placeholder="Nombre del operario..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Correo Corporativo</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-inter"
                                    placeholder="email@ejemplo.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Contraseña Temporal</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-inter"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Rol Asignado</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none uppercase text-xs"
                                >
                                    <option value="SOLICITANTE">BOMBERO / SOLICITANTE</option>
                                    <option value="LOGISTICA">LOGÍSTICA</option>
                                    <option value="COORDINADOR_INTERVENCION">COORDINADOR INTERVENCIÓN</option>
                                    <option value="EMPRESA_EXTERNA">EMPRESA EXTERNA</option>
                                    <option value="ADMIN">ADMINISTRADOR TOTAL</option>
                                </select>
                            </div>

                            {formData.role === 'EMPRESA_EXTERNA' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2">
                                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] ml-2">Asociar Empresa</label>
                                    <select
                                        value={formData.vendorId}
                                        onChange={e => setFormData({ ...formData, vendorId: e.target.value })}
                                        className="w-full bg-slate-950 border border-emerald-500/30 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none uppercase text-xs"
                                        required
                                    >
                                        <option value="">-- Seleccionar Empresa --</option>
                                        {vendors.map(v => (
                                            <option key={v.id} value={v.id}>{v.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/40 active:scale-[0.98] uppercase tracking-widest text-xs mt-4"
                            >
                                Registrar Usuario
                            </button>
                        </form>
                    </div>
                </div>

                {/* User List */}
                <div className="lg:col-span-2 space-y-4">
                    {users.map(u => (
                        <div key={u.id} className="group bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 hover:border-blue-500/30 transition-all shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/10 blur-3xl -mr-32 -mt-32 rounded-full" />

                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105 ${u.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                        u.role === 'LOGISTICA' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            u.role === 'EMPRESA_EXTERNA' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                'bg-slate-950 text-slate-500 border-slate-800'
                                        }`}>
                                        <Shield size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">{u.name}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                                <Mail size={12} /> {u.email}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${u.role === 'ADMIN' ? 'bg-red-500/20 text-red-500' :
                                                u.role === 'LOGISTICA' ? 'bg-blue-500/20 text-blue-500' :
                                                    'bg-slate-800 text-slate-400'
                                                }`}>
                                                {u.role.replace('_', ' ')}
                                            </span>
                                        </div>
                                        {u.role === 'EMPRESA_EXTERNA' && u.vendor && (
                                            <div className="flex items-center gap-2 mt-2 text-emerald-500">
                                                <Building2 size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{u.vendor.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="p-3 bg-slate-950 text-slate-700 hover:text-red-500 rounded-xl border border-slate-800 hover:border-red-500/30 transition-all shadow-inner"
                                        title="Eliminar usuario"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
