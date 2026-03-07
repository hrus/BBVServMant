import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import { Tag, Plus, Info, Save, Building2, Wrench } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const TypeManagement: React.FC = () => {
    const [types, setTypes] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', vendorId: '' });
    const { showToast } = useToast();

    const fetchData = async () => {
        try {
            const [typesRes, vendorsRes] = await Promise.all([
                api.get('/types'),
                api.get('/vendors')
            ]);
            setTypes(typesRes.data);
            setVendors(vendorsRes.data);
        } catch (err) {
            console.error('Error fetching data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddType = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/types', formData);
            showToast('Tipo de equipo registrado correctamente', 'success');
            setFormData({ name: '', vendorId: '' });
            fetchData();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Error al registrar tipo', 'error');
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Tipologías de Equipo</h1>
                <p className="text-slate-400 text-lg">Definición de categorías de EPIs y centros de servicio asociados</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Add Type Form */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl sticky top-24 overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.03] blur-3xl -mr-32 -mt-32 rounded-full group-hover:bg-blue-600/[0.05] transition-colors" />

                        <div className="flex items-center gap-4 mb-8 relative z-10">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40 text-white">
                                <Plus size={24} />
                            </div>
                            <h2 className="text-xl font-black text-white italic uppercase">Nueva Tipología</h2>
                        </div>

                        <form onSubmit={handleAddType} className="space-y-6 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Nombre del Modelo / Tipo</label>
                                <div className="relative">
                                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Máscara ERP-200"
                                        className="w-full input-premium bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-6 py-4 text-white font-bold placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Servicio Técnico Asociado</label>
                                <div className="relative">
                                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                    <select
                                        value={formData.vendorId}
                                        onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-6 py-4 text-white font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner uppercase text-xs"
                                        required
                                    >
                                        <option value="" className="bg-slate-900">-- Seleccionar Empresa --</option>
                                        {vendors.map((vendor: any) => (
                                            <option key={vendor.id} value={vendor.id} className="bg-slate-900">
                                                {vendor.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/40 active:scale-[0.98] flex justify-center items-center gap-3 uppercase tracking-widest text-xs"
                            >
                                <Save size={18} /> Guardar Tipología
                            </button>
                        </form>

                        <div className="mt-8 p-5 bg-blue-600/[0.03] border border-blue-500/10 rounded-2xl flex gap-3 italic relative z-10">
                            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-blue-400/80 leading-relaxed uppercase font-bold tracking-wider">
                                La asociación con una empresa externa permite que las solicitudes de mantenimiento se dirijan automáticamente al proveedor adecuado.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Types List */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-800/30 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <th className="px-10 py-6">Tipo / Modelo</th>
                                    <th className="px-10 py-6">Empresa de Servicio</th>
                                    <th className="px-10 py-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-10 py-20 text-center">
                                            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accediendo al catálogo...</span>
                                        </td>
                                    </tr>
                                ) : types.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-10 py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-sm italic">
                                            No hay tipologías definidas
                                        </td>
                                    </tr>
                                ) : types.map((type: any) => (
                                    <tr key={type.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-blue-500 border border-slate-800 shadow-inner group-hover:border-blue-500/30 transition-all">
                                                    <Wrench size={20} />
                                                </div>
                                                <span className="text-lg font-black text-white italic uppercase italic">{type.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-wider text-xs">
                                                <Building2 size={16} className="text-blue-500" />
                                                {type.vendor?.name || 'SIN EMPRESA ASOCIADA'}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button className="p-3 bg-slate-950 text-slate-700 hover:text-white rounded-xl border border-slate-800 transition-all">
                                                <Plus size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TypeManagement;
