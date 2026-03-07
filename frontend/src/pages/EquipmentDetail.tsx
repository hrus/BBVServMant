import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/apiClient';
import {
    ArrowLeft,
    History,
    User,
    MapPin,
    Clock,
    Building2,
    QrCode,
    Cpu,
    Eye,
    FileText,
    Database,
    Download,
    Hammer,
    Shield
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const EquipmentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/equipment/${id}`);
                setEquipment(res.data);
            } catch (err) {
                showToast('Error al cargar el detalle del equipo', 'error');
                navigate('/equipment');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div className="p-10 text-slate-400">Consultando historial del activo...</div>;
    if (!equipment) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'EN_PARQUE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'EN_MANTENIMIENTO': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'RETIRADO': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <header className="flex items-center gap-6">
                <button
                    onClick={() => navigate('/equipment')}
                    className="p-4 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 text-slate-400 hover:text-white transition-all shadow-xl group"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <div className="flex items-center gap-3">
                        <Eye size={20} className="text-blue-500" />
                        <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">{equipment.visualId}</h1>
                    </div>
                    <p className="text-slate-400 text-lg">{equipment.type.name}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Info Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.03] blur-3xl -mr-32 -mt-32 rounded-full" />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(equipment.status)}`}>
                                {equipment.status.replace(/_/g, ' ')}
                            </span>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-start gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800/50">
                                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ubicación Actual</p>
                                    <p className="text-white font-bold">{equipment.location || (equipment.park?.name) || 'No asignada'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800/50">
                                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Responsable / Dueño</p>
                                    <p className="text-white font-bold">{equipment.owner?.name || 'Asignación de Parque'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800/50">
                                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mantenido por</p>
                                    <p className="text-white font-bold">{equipment.type.vendor.name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-800/50 grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-slate-950 rounded-2xl border border-slate-800/30">
                                <QrCode size={20} className="mx-auto text-slate-600 mb-2" />
                                <p className="text-[9px] font-black text-slate-500 uppercase">QR Code</p>
                                <p className="text-[10px] text-white font-mono mt-1">{equipment.qrCode || 'N/A'}</p>
                            </div>
                            <div className="text-center p-4 bg-slate-950 rounded-2xl border border-slate-800/30">
                                <Cpu size={20} className="mx-auto text-slate-600 mb-2" />
                                <p className="text-[9px] font-black text-slate-500 uppercase">RFID Tag</p>
                                <p className="text-[10px] text-white font-mono mt-1">{equipment.rfidTag || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Technical Specs */}
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-6">
                        <h3 className="text-lg font-black text-white italic uppercase flex items-center gap-3">
                            <Database size={20} className="text-blue-500" /> Especificaciones
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categoría</span>
                                <span className="text-xs font-black text-white uppercase">{equipment.type.category}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Modelo</span>
                                <span className="text-xs font-black text-white uppercase">S-2025-PX</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Peso / Talla</span>
                                <span className="text-xs font-black text-white uppercase">Std. L</span>
                            </div>
                            <div className="pt-2">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Descripción del tipo</p>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                    {equipment.type.description || 'Sin descripción técnica adicional.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Documentation */}
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-6">
                        <h3 className="text-lg font-black text-white italic uppercase flex items-center gap-3">
                            <FileText size={20} className="text-emerald-500" /> Documentación
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-4 bg-slate-950 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-all group">
                                <div className="flex items-center gap-3">
                                    <FileText size={16} className="text-slate-600 group-hover:text-emerald-500" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Manual Usuario.pdf</span>
                                </div>
                                <Download size={14} className="text-slate-700 group-hover:text-white" />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 bg-slate-950 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Shield size={16} className="text-slate-600 group-hover:text-emerald-500" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Certificado CE.pdf</span>
                                </div>
                                <Download size={14} className="text-slate-700 group-hover:text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Quick Action */}
                    <button
                        onClick={() => navigate(`/requests/new?equipmentId=${equipment.id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-4 uppercase tracking-[0.2em] italic text-sm"
                    >
                        <Hammer size={20} />
                        Nueva Solicitud de Servicio
                    </button>
                </div>

                {/* Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-slate-800 rounded-2xl text-white">
                            <History size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-white italic uppercase italic">Cronología del Activo</h2>
                    </div>

                    <div className="relative space-y-6 before:absolute before:left-8 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                        {equipment.logs && equipment.logs.length > 0 ? (
                            equipment.logs.map((log: any, idx: number) => (
                                <div key={log.id} className="relative pl-20 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className={`absolute left-5 top-1 w-6 h-6 rounded-full border-4 border-slate-950 z-10 ${idx === 0 ? 'bg-blue-500 scale-125 shadow-lg shadow-blue-500/50' : 'bg-slate-700'}`} />

                                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl hover:border-slate-700 transition-all group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-2 py-1 rounded">
                                                        {new Date(log.timestamp).toLocaleDateString()} - {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-xs text-blue-400 font-bold flex items-center gap-1.5">
                                                        <User size={12} /> {log.user.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-slate-500 text-sm font-medium">{log.fromStatus.replace(/_/g, ' ')}</span>
                                                    <span className="text-slate-700">→</span>
                                                    <span className="text-white font-black italic uppercase tracking-tight">{log.toStatus.replace(/_/g, ' ')}</span>
                                                </div>
                                                {log.notes && (
                                                    <p className="text-slate-400 text-sm mt-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/30 italic">
                                                        "{log.notes}"
                                                    </p>
                                                )}
                                            </div>

                                            {idx === 0 && (
                                                <div className="bg-blue-500/10 text-blue-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                                    Estado Actual
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="ml-20 p-10 bg-slate-900/50 border border-dashed border-slate-800 rounded-[2rem] text-center">
                                <Clock size={32} className="mx-auto text-slate-800 mb-4" />
                                <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Sin registros históricos detectados</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentDetail;
