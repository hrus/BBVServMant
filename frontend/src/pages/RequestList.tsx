import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import { Clock, Package, ChevronRight, CheckCircle2, Factory, Truck, MapPin, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const RequestList: React.FC = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchRequests = async () => {
        try {
            const res = await api.get('/requests');
            setRequests(res.data);
        } catch (err) {
            console.error('Error fetching requests', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const updateStatus = async (requestId: string, newStatus: string) => {
        try {
            await api.patch(`/requests/${requestId}/status`, { status: newStatus });
            showToast('Estado actualizado con éxito', 'success');
            fetchRequests();
        } catch (err) {
            showToast('Error al actualizar el estado', 'error');
        }
    };

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'SOLICITUD_CREADA': return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: AlertCircle };
            case 'RECOGIDO_POR_LOGISTICA': return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: Truck };
            case 'ENTREGADO_A_EMPRESA': return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Factory };
            case 'RETIRADO_POR_EMPRESA': return { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Truck };
            case 'EN_TALLER': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: Factory };
            case 'MANTENIMIENTO_FINALIZADO': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 };
            case 'ENTREGADO': return { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Package };
            default: return { color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: Clock };
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Flujo de Trabajo</h1>
                    <p className="text-slate-400 text-lg">Trazabilidad en tiempo real de mantenimientos y limpiezas</p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="bg-slate-900 border border-slate-800 p-20 text-center text-slate-500 rounded-[2.5rem] shadow-2xl">
                        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                        <span className="font-bold uppercase tracking-widest text-xs">Sincronizando estados...</span>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 p-20 text-center text-slate-500 rounded-[2.5rem] shadow-2xl">
                        <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                        <span className="font-bold uppercase tracking-widest text-xs">No hay trabajos activos en el sistema</span>
                    </div>
                ) : requests.map((req: any) => {
                    const theme = getStatusTheme(req.status);
                    const StatusIcon = theme.icon;

                    return (
                        <div key={req.id} className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-8 hover:border-slate-700 transition-all shadow-xl group">
                            <div className="flex items-start md:items-center gap-6">
                                <div className="hidden sm:flex w-20 h-20 bg-slate-950 rounded-3xl items-center justify-center text-slate-600 border border-slate-800 group-hover:border-blue-500/30 transition-all shadow-inner shrink-0 leading-none">
                                    <Package size={32} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-2xl font-black text-white italic tracking-tighter uppercase">{req.equipment.type.name}</span>
                                        <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-black text-slate-500 tracking-widest uppercase">ID: {req.equipment.visualId}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${req.serviceType === 'LIMPIEZA' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                                            <span className="font-bold uppercase tracking-wider text-[11px]">{req.serviceType}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-slate-600" />
                                            <span className="font-medium">{new Date(req.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-slate-600" />
                                            <span className="font-medium">{req.pickupLocation}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-8 xl:justify-end">
                                <div className="flex flex-col items-start md:items-end gap-2">
                                    <div className={`flex items-center gap-3 ${theme.bg} ${theme.color} px-5 py-2.5 rounded-2xl border ${theme.border} shadow-inner`}>
                                        <StatusIcon size={18} />
                                        <span className="font-black text-xs uppercase tracking-[0.15em]">{req.status.replace(/_/g, ' ')}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest pl-1">Solicita: {req.requester.name}</span>
                                </div>

                                {/* Dynamic Actions based on Role and Status */}
                                <div className="flex gap-2">
                                    {user.role === 'LOGISTICA' && req.status === 'SOLICITUD_CREADA' && (
                                        <button onClick={() => updateStatus(req.id, 'RECOGIDO_POR_LOGISTICA')} className="btn-primary py-2.5 text-xs">Marcar Recogido</button>
                                    )}
                                    {user.role === 'LOGISTICA' && req.status === 'RECOGIDO_POR_LOGISTICA' && (
                                        <button onClick={() => updateStatus(req.id, 'ENTREGADO_A_EMPRESA')} className="btn-primary py-2.5 text-xs">Entregado a Taller</button>
                                    )}
                                    {user.role === 'EMPRESA_EXTERNA' && req.status === 'SOLICITUD_CREADA' && (
                                        <button onClick={() => updateStatus(req.id, 'RETIRADO_POR_EMPRESA')} className="btn-primary py-2.5 text-xs">Retirar Equipo</button>
                                    )}
                                    {user.role === 'EMPRESA_EXTERNA' && (req.status === 'RETIRADO_POR_EMPRESA' || req.status === 'ENTREGADO_A_EMPRESA') && (
                                        <button onClick={() => updateStatus(req.id, 'EN_TALLER')} className="btn-primary py-2.5 text-xs bg-amber-600 hover:bg-amber-500">Recibido en Taller</button>
                                    )}
                                    {user.role === 'EMPRESA_EXTERNA' && req.status === 'EN_TALLER' && (
                                        <button onClick={() => updateStatus(req.id, 'MANTENIMIENTO_FINALIZADO')} className="btn-primary py-2.5 text-xs bg-emerald-600 hover:bg-emerald-500">Finalizar Trabajo</button>
                                    )}
                                    {user.role === 'LOGISTICA' && req.status === 'MANTENIMIENTO_FINALIZADO' && (
                                        <button onClick={() => updateStatus(req.id, 'ENTREGADO')} className="btn-primary py-2.5 text-xs bg-slate-700 hover:bg-slate-600">Marcar Entregado</button>
                                    )}

                                    <button className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all shadow-inner">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RequestList;
