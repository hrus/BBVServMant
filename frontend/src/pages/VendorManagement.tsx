import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import { Building2, Plus, Info, ChevronRight, Save, Phone, MessageSquare, Trash2 } from 'lucide-react';

import { useToast } from '../context/ToastContext';

const VendorManagement: React.FC = () => {
    const [vendors, setVendors] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        services: '',
        contactInfo: ''
    });
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const [editingId, setEditingId] = useState<string | null>(null);
    const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;

    if (userRole !== 'ADMIN' && userRole !== 'LOGISTICA') {
        return (
            <div className="p-10 text-center">
                <h1 className="text-2xl font-black text-red-500 uppercase italic">Acceso Denegado</h1>
                <p className="text-slate-400 mt-2">No tienes permisos para esta sección.</p>
            </div>
        );
    }

    const fetchVendors = async () => {
        try {
            const res = await api.get('/vendors');
            setVendors(res.data);
        } catch (err) {
            console.error('Error fetching vendors', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/vendors/${editingId}`, formData);
                showToast('Empresa actualizada correctamente', 'success');
            } else {
                await api.post('/vendors', formData);
                showToast('Empresa externa registrada correctamente', 'success');
            }
            setFormData({ name: '', services: '', contactInfo: '' });
            setEditingId(null);
            fetchVendors();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Error al procesar la solicitud', 'error');
        }
    };

    const handleEdit = (vendor: any) => {
        setEditingId(vendor.id);
        setFormData({
            name: vendor.name,
            services: vendor.services || '',
            contactInfo: vendor.contactInfo || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', services: '', contactInfo: '' });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta empresa?')) return;
        try {
            await api.delete(`/vendors/${id}`);
            showToast('Empresa eliminada correctamente', 'success');
            fetchVendors();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Error al eliminar empresa', 'error');
        }
    };



    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Empresas Externas</h1>
                <p className="text-slate-400 text-lg">Gestión de proveedores de mantenimiento y limpieza</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Add Vendor Form */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl sticky top-24 overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.03] blur-3xl -mr-32 -mt-32 rounded-full group-hover:bg-blue-600/[0.05] transition-colors" />

                        <div className="flex items-center gap-4 mb-8 relative z-10">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40 text-white">
                                {editingId ? <Save size={24} /> : <Plus size={24} />}
                            </div>
                            <h2 className="text-xl font-black text-white italic uppercase">
                                {editingId ? 'Editar Empresa' : 'Nueva Empresa'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Nombre de la Entidad</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Mantenimientos Industriales S.A."
                                    className="w-full input-premium bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Contacto Básico</label>
                                <div className="relative">
                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                    <input
                                        type="text"
                                        value={formData.contactInfo}
                                        onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                                        placeholder="Email o Teléfono..."
                                        className="w-full input-premium bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-6 py-4 text-white font-bold placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Servicios y Observaciones</label>
                                <textarea
                                    value={formData.services}
                                    onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                                    placeholder="Detalla los servicios ofrecidos..."
                                    rows={3}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] px-6 py-4 text-white font-medium placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner resize-none leading-relaxed text-sm"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/40 active:scale-[0.98] flex justify-center items-center gap-3 uppercase tracking-widest text-xs"
                                >
                                    <Save size={18} /> {editingId ? 'Guardar Cambios' : 'Registrar Empresa'}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-2xl transition-all uppercase text-[10px] tracking-widest"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="mt-8 p-5 bg-blue-600/[0.03] border border-blue-500/10 rounded-2xl flex gap-3 italic relative z-10">
                            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-blue-400/80 leading-relaxed uppercase font-bold tracking-wider">
                                Una vez creada, podrás asociar esta empresa a diferentes tipos de equipos para automatizar la asignación de tareas.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Vendor List */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="bg-slate-900 p-20 rounded-[2.5rem] border border-slate-800 text-center">
                            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                            <span className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Sincronizando proveedores...</span>
                        </div>
                    ) : vendors.length === 0 ? (
                        <div className="bg-slate-900 p-20 rounded-[2.5rem] border border-slate-800 text-center italic text-slate-600 font-bold uppercase tracking-widest text-sm">
                            No hay empresas externas registradas en el sistema
                        </div>
                    ) : (
                        vendors.map((vendor: any) => (
                            <div key={vendor.id} className="group bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 hover:border-blue-500/30 transition-all flex flex-col gap-6 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 blur-3xl -mr-32 -mt-32 rounded-full" />

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-blue-500 border border-slate-800 shadow-inner group-hover:scale-105 transition-transform">
                                            <Building2 size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">{vendor.name}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-[10px] text-blue-500 uppercase tracking-widest font-black">Proveedor Autorizado</span>
                                                {vendor.contactInfo && (
                                                    <span className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                                                        <Phone size={12} className="text-slate-700" /> {vendor.contactInfo}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 relative z-10">
                                        <button 
                                            onClick={() => handleEdit(vendor)}
                                            className="p-4 bg-slate-950 text-slate-700 hover:text-blue-500 hover:border-blue-500/50 rounded-2xl border border-slate-800 transition-all group/btn"
                                        >
                                            <ChevronRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(vendor.id)}
                                            className="p-4 bg-slate-950 text-slate-700 hover:text-red-500 hover:border-red-500/50 rounded-2xl border border-slate-800 transition-all"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    </div>

                                </div>

                                {vendor.services && (
                                    <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50 relative z-10">
                                        <div className="flex items-start gap-4">
                                            <MessageSquare size={16} className="text-blue-500 shrink-0 mt-1" />
                                            <p className="text-slate-400 text-sm leading-relaxed italic">{vendor.services}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorManagement;
