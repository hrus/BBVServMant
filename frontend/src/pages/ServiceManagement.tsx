import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import { 
    getServiceTypes, 
    createServiceType, 
    updateServiceType, 
    deleteServiceType,
} from '../api/serviceTypeService';
import type { ServiceType } from '../api/serviceTypeService';
import { 
    getServiceMappings, 
    setServicesForVendorType,
} from '../api/vendorServiceMapping';
import type { VendorServiceMapping } from '../api/vendorServiceMapping';
import { 
    Plus, Save, Settings, Wrench, ChevronRight, Trash2, 
    Building2, Layers, CheckSquare, Square
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ServiceManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'types' | 'mappings'>('types');
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [mappings, setMappings] = useState<VendorServiceMapping[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [equipmentTypes, setEquipmentTypes] = useState<any[]>([]);
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [typeForm, setTypeForm] = useState({ name: '', description: '' });
    
    // Mapping state
    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedEquipType, setSelectedEquipType] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const { showToast } = useToast();
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};
    const userRole = user.role;

    if (userRole !== 'ADMIN' && userRole !== 'LOGISTICA') {
        return (
            <div className="p-10 text-center">
                <h1 className="text-2xl font-black text-red-500 uppercase italic">Acceso Denegado</h1>
                <p className="text-slate-400 mt-2">No tienes permisos para esta sección.</p>
            </div>
        );
    }

    const fetchData = async () => {
        try {
            const [stRes, mapRes, venRes, eqRes] = await Promise.all([
                getServiceTypes(),
                getServiceMappings(),
                api.get('/vendors'),
                api.get('/types')
            ]);
            setServiceTypes(stRes);
            setMappings(mapRes);
            setVendors(venRes.data);
            setEquipmentTypes(eqRes.data);
        } catch (err) {
            console.error('Error fetching data', err);
            showToast('Error al cargar datos', 'error');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTypeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateServiceType(editingId, typeForm);
                showToast('Tipo de servicio actualizado', 'success');
            } else {
                await createServiceType(typeForm);
                showToast('Tipo de servicio creado', 'success');
            }
            setTypeForm({ name: '', description: '' });
            setEditingId(null);
            fetchData();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Error al guardar', 'error');
        }
    };

    const handleTypeEdit = (st: ServiceType) => {
        setEditingId(st.id);
        setTypeForm({ name: st.name, description: st.description || '' });
    };

    const handleTypeDelete = async (id: string) => {
        if (!window.confirm('¿Eliminar este tipo de servicio?')) return;
        try {
            await deleteServiceType(id);
            showToast('Tipo de servicio eliminado', 'success');
            fetchData();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Error al eliminar', 'error');
        }
    };

    const toggleService = (id: string) => {
        setSelectedServices(prev => 
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleMappingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVendor || !selectedEquipType) {
            showToast('Selecciona empresa y tipo de equipo', 'error');
            return;
        }
        try {
            await setServicesForVendorType(selectedVendor, selectedEquipType, selectedServices);
            showToast('Asignación actualizada correctamente', 'success');
            fetchData();
        } catch (err) {
            showToast('Error al actualizar asignación', 'error');
        }
    };

    // Filter mappings to show grouped view
    const groupedMappings = vendors.flatMap(v => 
        equipmentTypes
            .filter(et => et.vendorId === v.id)
            .map(et => {
                const activeServices = mappings
                    .filter(m => m.vendorId === v.id && m.equipmentTypeId === et.id)
                    .map(m => m.serviceType?.name)
                    .filter(Boolean);
                return { 
                    vendorName: v.name, 
                    vendorId: v.id,
                    typeName: et.name, 
                    typeId: et.id,
                    services: activeServices 
                };
            })
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Configuración de Servicios</h1>
                    <p className="text-slate-400 text-lg">Administra tipos de mantenimiento y su asignación por proveedor</p>
                </div>
                
                <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-xl">
                    <button 
                        onClick={() => setActiveTab('types')}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'types' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-white'}`}
                    >
                        Tipologías
                    </button>
                    <button 
                        onClick={() => setActiveTab('mappings')}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'mappings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-white'}`}
                    >
                        Asignaciones
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* FORM SIDE */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl sticky top-24 overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.03] blur-3xl -mr-32 -mt-32 rounded-full" />
                        
                        {activeTab === 'types' ? (
                            <>
                                <div className="flex items-center gap-4 mb-8 relative z-10">
                                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40 text-white">
                                        {editingId ? <Settings size={24} /> : <Plus size={24} />}
                                    </div>
                                    <h2 className="text-xl font-black text-white italic uppercase">
                                        {editingId ? 'Editar Tipo' : 'Nuevo Tipo'}
                                    </h2>
                                </div>

                                <form onSubmit={handleTypeSubmit} className="space-y-6 relative z-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Nombre del Servicio</label>
                                        <div className="relative">
                                            <Wrench className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                            <input
                                                type="text"
                                                value={typeForm.name}
                                                onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                                                placeholder="Ej: Mantenimiento Anual"
                                                className="w-full input-premium bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-6 py-4 text-white font-bold"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Descripción</label>
                                        <textarea
                                            value={typeForm.description}
                                            onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                                            placeholder="Detalles sobre el alcance del servicio..."
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px]"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/40 uppercase tracking-widest text-xs">
                                            <Save size={18} className="inline mr-2 mb-1" /> {editingId ? 'Actualizar' : 'Guardar'}
                                        </button>
                                        {editingId && (
                                            <button type="button" onClick={() => {setEditingId(null); setTypeForm({name:'', description:''});}} className="px-6 bg-slate-800 text-slate-400 font-bold rounded-2xl uppercase text-[10px]">
                                                X
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-4 mb-8 relative z-10">
                                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40 text-white">
                                        <Layers size={24} />
                                    </div>
                                    <h2 className="text-xl font-black text-white italic uppercase">Configurar Asignación</h2>
                                </div>

                                <form onSubmit={handleMappingSubmit} className="space-y-6 relative z-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Proveedor</label>
                                        <select 
                                            value={selectedVendor} 
                                            onChange={(e) => setSelectedVendor(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold"
                                            required
                                        >
                                            <option value="">-- Seleccionar --</option>
                                            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Tipo de Equipo</label>
                                        <select 
                                            value={selectedEquipType} 
                                            onChange={(e) => setSelectedEquipType(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold disabled:opacity-50"
                                            required
                                            disabled={!selectedVendor}
                                        >
                                            <option value="">-- Seleccionar --</option>
                                            {equipmentTypes.filter(et => et.vendorId === selectedVendor).map(et => (
                                                <option key={et.id} value={et.id}>{et.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Servicios Aplicables</label>
                                        <div className="space-y-2 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                            {serviceTypes.map(st => (
                                                <div 
                                                    key={st.id} 
                                                    onClick={() => toggleService(st.id)}
                                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                                                >
                                                    <span className="text-xs font-bold text-slate-300">{st.name}</span>
                                                    {selectedServices.includes(st.id) ? 
                                                        <CheckSquare className="text-blue-500" size={18} /> : 
                                                        <Square className="text-slate-700" size={18} />
                                                    }
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/40 uppercase tracking-widest text-xs">
                                        Actualizar Servicios
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>

                {/* LIST SIDE */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
                        {activeTab === 'types' ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-800/30 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <th className="px-10 py-6">Servicio</th>
                                        <th className="px-10 py-6">Descripción</th>
                                        <th className="px-10 py-6 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {serviceTypes.map(st => (
                                        <tr key={st.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-blue-500 border border-slate-800 tracking-widest font-black italic">
                                                        {st.name.charAt(0)}
                                                    </div>
                                                    <span className="font-black text-white italic uppercase">{st.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-slate-400 text-xs italic">{st.description || 'Sin descripción'}</td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button onClick={() => handleTypeEdit(st)} className="p-3 bg-slate-950 text-slate-700 hover:text-blue-500 rounded-xl border border-slate-800"><ChevronRight size={18} /></button>
                                                    <button onClick={() => handleTypeDelete(st.id)} className="p-3 bg-slate-950 text-slate-700 hover:text-red-500 rounded-xl border border-slate-800"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-800/30 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <th className="px-10 py-6">Proveedor / Tipo</th>
                                        <th className="px-10 py-6">Servicios Asociados</th>
                                        <th className="px-10 py-6 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {groupedMappings.map((gm, idx) => (
                                        <tr key={`${gm.vendorId}-${gm.typeId}`} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-10 py-8">
                                                <div className="text-white font-black italic uppercase text-sm mb-1">{gm.typeName}</div>
                                                <div className="text-[10px] text-blue-500 font-black tracking-widest flex items-center gap-2">
                                                    <Building2 size={12} /> {gm.vendorName}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-wrap gap-2">
                                                    {gm.services.length > 0 ? gm.services.map((s, i) => (
                                                        <span key={i} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[9px] font-black text-slate-400 uppercase italic">
                                                            {s}
                                                        </span>
                                                    )) : <span className="text-slate-600 italic text-[10px]">Sin servicios</span>}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedVendor(gm.vendorId);
                                                        setSelectedEquipType(gm.typeId);
                                                        // Pre-fill selected services
                                                        const activeMappings = mappings
                                                            .filter(m => m.vendorId === gm.vendorId && m.equipmentTypeId === gm.typeId)
                                                            .map(m => m.serviceTypeId);
                                                        setSelectedServices(activeMappings);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    className="p-3 bg-slate-950 text-slate-700 hover:text-blue-500 rounded-xl border border-slate-800"
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceManagement;
