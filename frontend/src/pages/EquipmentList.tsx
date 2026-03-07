import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/apiClient';
import { Search, QrCode, User as UserIcon, AlertCircle, ChevronRight, MapPin, Plus, Save, X, Box, Eye, Smartphone, Download, Edit2, Trash2 } from 'lucide-react';

import { useToast } from '../context/ToastContext';
import QRScannerModal from '../components/QRScannerModal';
import type { Role } from '../types';

const EquipmentList: React.FC = () => {
    const [equipment, setEquipment] = useState([]);
    const [types, setTypes] = useState([]);
    const [parks, setParks] = useState([]);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [formData, setFormData] = useState({
        visualId: '',
        qrCode: '',
        rfidTag: '',
        typeId: '',
        assignmentType: 'PARQUE' as 'PARQUE' | 'PERSONAL',
        parkId: '',
        ownerId: '',
        location: ''
    });

    const { showToast } = useToast();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole: Role = user.role || 'SOLICITANTE';
    const canManage = userRole === 'SOLICITANTE' || userRole === 'LOGISTICA' || userRole === 'ADMIN';

    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eqRes, typeRes, parkRes, userRes] = await Promise.all([
                api.get('/equipment'),
                api.get('/types'),
                api.get('/parks'),
                api.get('/auth/users')
            ]);
            setEquipment(eqRes.data);
            setTypes(typeRes.data);
            setParks(parkRes.data);
            setUsers(userRes.data);
        } catch (err) {
            console.error('Error fetching data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...formData };
            if (payload.assignmentType === 'PARQUE') {
                payload.ownerId = '';
            } else {
                payload.parkId = '';
            }

            if (editingId) {
                await api.put(`/equipment/${editingId}`, payload);
                showToast('Equipo actualizado correctamente', 'success');
            } else {
                await api.post('/equipment', payload);
                showToast('Equipo registrado correctamente', 'success');
            }
            setShowAddForm(false);
            setEditingId(null);
            setFormData({
                visualId: '',
                qrCode: '',
                rfidTag: '',
                typeId: '',
                assignmentType: 'PARQUE',
                parkId: '',
                ownerId: '',
                location: ''
            });
            fetchData();
        } catch (err: any) {
            const errMsg = err.response?.data?.error || 'Error al procesar la solicitud';
            showToast(errMsg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (eq: any) => {
        setEditingId(eq.id);
        setFormData({
            visualId: eq.visualId,
            qrCode: eq.qrCode || '',
            rfidTag: eq.rfidTag || '',
            typeId: eq.typeId,
            assignmentType: eq.assignmentType,
            parkId: eq.parkId || '',
            ownerId: eq.ownerId || '',
            location: eq.location || ''
        });
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar este equipo?')) return;
        try {
            await api.delete(`/equipment/${id}`);
            showToast('Equipo eliminado', 'info');
            fetchData();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Error al eliminar equipo', 'error');
        }
    };


    const handleScan = (data: string) => {
        const found: any = equipment.find((e: any) =>
            e.visualId.toLowerCase() === data.toLowerCase() ||
            e.qrCode === data ||
            e.rfidTag === data
        );

        if (found) {
            window.location.href = `/equipment/${found.id}`;
        } else {
            showToast(`No se encontró ningún equipo con ID: ${data}`, 'error');
        }
    };

    const filtered = equipment.filter((e: any) =>
        e.visualId.toLowerCase().includes(search.toLowerCase()) ||
        e.type.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleExport = () => {
        const token = localStorage.getItem('token');
        // We use window.open for now, or fetch with blob if auth causes issues
        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/equipment/export?token=${token}`, '_blank');
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Inventario de Activos</h1>
                    <p className="text-slate-400 text-lg">Consulta técnica y asignación de equipos de protección personal</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <button
                        onClick={handleExport}
                        className="p-4 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 text-slate-400 hover:text-white transition-all shadow-xl group flex items-center justify-center gap-3"
                        title="Exportar inventario a CSV"
                    >
                        <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Exportar CSV</span>
                    </button>
                    <button
                        onClick={() => setIsScannerOpen(true)}
                        className="p-4 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 text-slate-400 hover:text-white transition-all shadow-xl group flex items-center justify-center gap-3"
                        title="Simular escaneo de QR/RFID"
                    >
                        <Smartphone size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Simular Scanner</span>
                    </button>
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar activos..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-white font-bold placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {canManage && (
                        <button
                            onClick={() => {
                                if (showAddForm) {
                                    setEditingId(null);
                                    setFormData({ visualId: '', qrCode: '', rfidTag: '', typeId: '', assignmentType: 'PARQUE', parkId: '', ownerId: '', location: '' });
                                }
                                setShowAddForm(!showAddForm);
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-xl shadow-blue-900/40 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                        >
                            {showAddForm ? <X size={18} /> : <Plus size={18} />}
                            {showAddForm ? 'Cancelar' : 'Nuevo Equipo'}
                        </button>
                    )}
                </div>
            </header>

            {showAddForm && (
                <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/[0.03] blur-3xl -mr-48 -mt-48 rounded-full" />

                    <h2 className="text-2xl font-black text-white italic uppercase mb-8 relative z-10">
                        {editingId ? 'Modificación de Activo' : 'Registro de Alta de Activo'}
                    </h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">ID Visual / Referencia</label>
                            <input
                                type="text"
                                value={formData.visualId}
                                onChange={(e) => setFormData({ ...formData, visualId: e.target.value })}
                                placeholder="Ej: ERA-502"
                                className="w-full input-premium bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Tipología de Equipo</label>
                            <select
                                value={formData.typeId}
                                onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold appearance-none uppercase text-xs"
                                required
                            >
                                <option value="">-- Seleccionar --</option>
                                {types.map((t: any) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Tipo de Asignación</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, assignmentType: 'PARQUE' as any })}
                                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.assignmentType === 'PARQUE' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}
                                >
                                    Parque
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, assignmentType: 'PERSONAL' as any })}
                                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.assignmentType === 'PERSONAL' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}
                                >
                                    Personal
                                </button>
                            </div>
                        </div>

                        {formData.assignmentType === 'PARQUE' ? (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Parque de Bomberos</label>
                                <select
                                    value={formData.parkId}
                                    onChange={(e) => setFormData({ ...formData, parkId: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold appearance-none uppercase text-xs"
                                    required
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {parks.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Bombero Asignado</label>
                                <select
                                    value={formData.ownerId}
                                    onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold appearance-none uppercase text-xs"
                                    required
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {users.filter((u: any) => u.role === 'SOLICITANTE' || u.role === 'LOGISTICA').map((u: any) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Código QR (Opcional)</label>
                            <input
                                type="text"
                                value={formData.qrCode}
                                onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                                placeholder="Escanear o introducir..."
                                className="w-full input-premium bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">TAG RFID (Opcional)</label>
                            <input
                                type="text"
                                value={formData.rfidTag}
                                onChange={(e) => setFormData({ ...formData, rfidTag: e.target.value })}
                                placeholder="ID de etiqueta RFID..."
                                className="w-full input-premium bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/40 active:scale-[0.98] flex justify-center items-center gap-3 uppercase tracking-widest text-xs"
                            >
                                {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                                {saving ? 'Procesando...' : editingId ? 'Guardar Cambios' : 'Registrar Activo'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/30 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="px-10 py-8">Equipo / Tipología</th>
                                <th className="px-10 py-8">Identificadores</th>
                                <th className="px-10 py-8">Estado</th>
                                <th className="px-10 py-8">Ubicación / Asignación</th>
                                <th className="px-10 py-8 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-20 text-center">
                                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                                        <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando base de datos...</span>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs italic">
                                        No hay activos registrados
                                    </td>
                                </tr>
                            ) : filtered.map((e: any) => (
                                <tr key={e.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="px-10 py-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner group-hover:border-blue-500/30 transition-all">
                                                <Box size={24} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xl font-black text-white italic tracking-tighter uppercase">{e.type.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] bg-slate-950 text-slate-500 px-2.5 py-1 rounded-md font-black tracking-widest border border-slate-800 uppercase">SYS_REF: {e.visualId}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <div className="flex flex-col gap-2">
                                            {e.qrCode && (
                                                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 bg-slate-950 w-fit px-3 py-1.5 rounded-xl border border-slate-800">
                                                    <QrCode size={12} className="text-blue-500" />
                                                    {e.qrCode}
                                                </div>
                                            )}
                                            {e.rfidTag && (
                                                <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-slate-500 pl-3">
                                                    <AlertCircle size={10} className="text-slate-700" />
                                                    RFID: {e.rfidTag}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-widest shadow-inner ${e.status === 'EN_PARQUE'
                                            ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10'
                                            : 'bg-orange-500/5 text-orange-500 border-orange-500/10'
                                            }`}>
                                            <div className={`w-2 h-2 rounded-full ${e.status === 'EN_PARQUE' ? 'bg-emerald-500' : 'bg-orange-500'} animate-pulse shadow-lg`} />
                                            {e.status.replace(/_/g, ' ')}
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-[10px]">
                                                {e.assignmentType === 'PARQUE' ? (
                                                    <>
                                                        <MapPin size={14} className="text-blue-500" />
                                                        <span>{e.park?.name || 'PARQUE DESCONOCIDO'}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserIcon size={14} className="text-blue-500" />
                                                        <span>{e.owner?.name || 'SIN ASIGNAR'}</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 w-fit">
                                                <span className="text-blue-500/50">•</span>
                                                {e.assignmentType === 'PARQUE' ? 'DOTACIÓN PARQUE' : 'ASIGNACIÓN PERSONAL'}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-10 py-10 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link
                                                to={`/equipment/${e.id}`}
                                                className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 hover:text-white hover:border-slate-700 transition-all group/eye"
                                                title="Ver detalle y cronología"
                                            >
                                                <Eye size={18} className="group-hover/eye:scale-110 transition-transform" />
                                            </Link>
                                            {canManage && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(e)}
                                                        className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 hover:text-blue-500 hover:border-blue-500/30 transition-all"
                                                        title="Editar equipo"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(e.id)}
                                                        className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-700 hover:text-red-500 hover:border-red-500/30 transition-all"
                                                        title="Eliminar equipo"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => window.location.href = `/requests/new?equipmentId=${e.id}`}
                                                className="inline-flex items-center gap-2 text-xs font-black text-blue-500 hover:text-white bg-blue-500/5 hover:bg-blue-600 px-6 py-3 rounded-2xl border border-blue-500/10 hover:border-blue-500 transition-all shadow-inner uppercase tracking-widest active:scale-95 group/btn"
                                            >
                                                SOLICITAR <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <QRScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
            />
        </div>
    );
};

export default EquipmentList;
