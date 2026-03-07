import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import type { Park, EquipmentType } from '../types';
import { Plus, Settings, AlertCircle, Trash2, Save, MapPin } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ParkManagement: React.FC = () => {
    const [parks, setParks] = useState<Park[]>([]);
    const [types, setTypes] = useState<EquipmentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [newParkName, setNewParkName] = useState('');
    const [saving, setSaving] = useState<string | null>(null);
    const { showToast } = useToast();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user.role;

    if (userRole !== 'ADMIN') {
        return (
            <div className="p-10 text-center">
                <h1 className="text-2xl font-black text-red-500 uppercase italic">Acceso Denegado</h1>
                <p className="text-slate-400 mt-2">No tienes permisos para gestionar parques.</p>
            </div>
        );
    }


    const fetchData = async () => {
        try {
            const [parksRes, typesRes] = await Promise.all([
                api.get('/parks'),
                api.get('/types')
            ]);
            setParks(parksRes.data);
            setTypes(typesRes.data);
        } catch (error) {
            console.error('Error fetching parks data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreatePark = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/parks', { name: newParkName });
            setParks([...parks, res.data]);
            setNewParkName('');
            showToast('Instalación registrada con éxito', 'success');
        } catch (error) {
            showToast('Error al crear el parque', 'error');
        }
    };

    const handleUpdateMin = async (parkId: string, typeId: string, min: string) => {
        const minQuantity = parseInt(min);
        if (isNaN(minQuantity)) return;
        setSaving(`${parkId}-${typeId}`);
        try {
            await api.put(`/parks/${parkId}/minimums`, { typeId, minQuantity });
        } catch (error) {
            console.error('Error updating minimum', error);
        } finally {
            setTimeout(() => setSaving(null), 1000);
        }
    };

    const handleDeletePark = async (id: string) => {
        console.log('Attempting to delete park:', id);
        if (!window.confirm('¿Seguro que deseas eliminar este recinto? Se perderán las configuraciones de mínimos.')) return;
        try {
            await api.delete(`/parks/${id}`);
            setParks(prev => prev.filter(p => p.id !== id));
            showToast('Recinto eliminado', 'info');
        } catch (error: any) {
            console.error('Error deleting park:', error);
            const errMsg = error.response?.data?.error || 'Error al eliminar el recinto';
            showToast(errMsg, 'error');
        }
    };

    if (loading) return <div className="p-10 text-slate-400">Cargando gestión de parques...</div>;

    return (
        <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Infraestructura Operativa</h1>
                    <p className="text-slate-400 text-lg">Configuración técnica de instalaciones y umbrales de seguridad (Mínimos)</p>
                </div>
            </header>

            {/* New Park Form */}
            <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 blur-3xl -mr-40 -mt-40 rounded-full group-hover:bg-blue-600/10 transition-colors" />
                <div className="relative z-10">
                    <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-6">Dar de alta Nueva Instalación</h2>
                    <form onSubmit={handleCreatePark} className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                            <input
                                type="text"
                                value={newParkName}
                                onChange={(e) => setNewParkName(e.target.value)}
                                placeholder="Nombre del Parque de Bomberos..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-6 py-5 text-white font-bold placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl flex items-center justify-center gap-3 font-black transition-all shadow-xl shadow-blue-900/40 active:scale-95 whitespace-nowrap">
                            <Plus size={20} strokeWidth={3} /> REGISTRAR
                        </button>
                    </form>
                </div>
            </div>

            {/* Parks Grid/Table */}
            <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/30 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                                <th className="px-10 py-8">Recinto Operativo</th>
                                <th className="px-10 py-8">Activos en Parque</th>
                                <th className="px-10 py-8">Umbrales Críticos por Tipología</th>
                                <th className="px-10 py-8 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {parks.map(park => (
                                <tr key={park.id} className="group hover:bg-slate-800/20 transition-colors">
                                    <td className="px-10 py-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-blue-500 border border-slate-800 group-hover:border-blue-500/30 group-hover:bg-blue-500/5 transition-all shadow-inner">
                                                <Settings size={24} />
                                            </div>
                                            <span className="text-2xl font-black text-white italic truncate max-w-xs">{park.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10 text-slate-300">
                                        <div className="inline-flex items-center gap-3 bg-slate-950 px-5 py-2.5 rounded-2xl border border-slate-800 text-xs font-black uppercase tracking-widest text-blue-400 shadow-inner">
                                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
                                            {park._count?.equipment || 0} Unidades
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <div className="flex flex-wrap gap-4 max-w-2xl">
                                            {types.map(type => (
                                                <div key={type.id} className="flex flex-col gap-2 bg-slate-950 p-4 rounded-3xl border border-slate-800 min-w-[140px] group/item hover:border-slate-700 transition-all shadow-inner">
                                                    <label className="text-[9px] text-slate-600 font-bold uppercase tracking-wider truncate mb-1">{type.name}</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            defaultValue={park.minStocks?.find((m: any) => m.typeId === type.id)?.minQuantity || 0}
                                                            onBlur={(e) => handleUpdateMin(park.id, type.id, e.target.value)}
                                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-lg text-white font-black focus:outline-none focus:border-blue-500 transition-all tabular-nums"
                                                        />
                                                        {saving === `${park.id}-${type.id}` && (
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-bounce">
                                                                <Save size={14} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-10 py-10 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePark(park.id)}
                                                className="p-3 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-2xl transition-all"
                                                title="Eliminar Recinto"
                                            >
                                                <Trash2 size={20} />
                                            </button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-start gap-5 p-8 bg-blue-600/[0.03] border border-blue-500/10 rounded-[2.5rem] text-blue-400/80 text-sm italic shadow-2xl">
                <AlertCircle size={22} className="shrink-0 text-blue-500 shadow-md" />
                <p className="leading-relaxed">
                    <span className="font-black uppercase tracking-widest text-blue-500 not-italic mr-2">Aviso Técnico:</span>
                    La configuración de mínimos es crítica para el sistema de alertas tempranas. Valores elevados pueden causar alertas persistentes en periodos de alto mantenimiento. Los cambios se guardan automáticamente al perder el foco del campo.
                </p>
            </div>
        </div>
    );
};

export default ParkManagement;
