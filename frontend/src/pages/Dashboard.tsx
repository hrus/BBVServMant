import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import {
    Package,
    ClipboardList,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Users,
    ShieldCheck,
    Hammer,
    ArrowUpRight,
    TrendingUp,
    FileText,
    Settings,
    Bell,
    Building2,
    BarChart3,
    MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role;

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                setStats(res.data);
            } catch (err) {
                console.error('Error fetching dashboard stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-10 text-slate-500 font-black uppercase tracking-widest text-xs">Cargando centro de mando...</div>;

    const StatCard = ({ icon: Icon, title, value, color, description }: any) => (
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group hover:border-slate-700 transition-all duration-500">
            <div className={`absolute top-0 right-0 w-64 h-64 ${color} opacity-[0.03] blur-3xl -mr-32 -mt-32 rounded-full transition-opacity group-hover:opacity-[0.07]`} />

            <div className="flex items-start justify-between relative z-10 transition-transform group-hover:-translate-y-1">
                <div className={`p-4 rounded-2xl bg-slate-950 border border-slate-800 text-${color.includes('blue') ? 'blue-500' : color.includes('emerald') ? 'emerald-500' : color.includes('orange') ? 'orange-500' : 'red-500'}`}>
                    <Icon size={24} />
                </div>
                <div className="text-slate-600">
                    <TrendingUp size={16} />
                </div>
            </div>

            <div className="mt-8 relative z-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-white italic tracking-tighter uppercase">{value}</p>
                </div>
                <p className="text-xs text-slate-600 mt-2 font-medium">{description}</p>
            </div>
        </div>
    );

    const QuickAction = ({ icon: Icon, title, desc, to }: any) => (
        <Link to={to} className="flex items-center gap-4 p-6 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-3xl transition-all group active:scale-[0.98]">
            <div className="p-3 bg-slate-950 rounded-xl text-blue-500 border border-slate-800">
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <p className="font-black text-white italic uppercase tracking-tight leading-none mb-1">{title}</p>
                <p className="text-xs text-slate-500 font-medium">{desc}</p>
            </div>
            <ArrowUpRight size={18} className="text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
        </Link>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight italic uppercase italic">
                        Misión: {user.name}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 rounded-lg">
                            {role.replace(/_/g, ' ')}
                        </span>
                        <span className="text-slate-500 text-sm font-bold flex items-center gap-1.5">
                            <Clock size={14} /> {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-4 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 text-slate-400 hover:text-white transition-all shadow-xl relative">
                        <Bell size={20} />
                        <span className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900" />
                    </button>
                    <button className="p-4 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 text-slate-400 hover:text-white transition-all shadow-xl">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {/* Role Specific Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {(role === 'ADMIN' || role === 'LOGISTICA') && (
                    <>
                        <StatCard icon={ShieldCheck} title="Equipos Totales" value={stats.totalEquipment} color="bg-blue-600" description="Inventario global activo" />
                        <StatCard icon={ClipboardList} title="Solicitudes" value={stats.totalRequests} color="bg-emerald-600" description="Histórico de mantenimiento" />
                        <StatCard icon={Hammer} title="En Mantenimiento" value={stats.inMaintenance} color="bg-orange-600" description="Fuera de servicio temporal" />
                        <StatCard icon={Users} title="Gestion Usuarios" value={stats.users} color="bg-purple-600" description="Personal con acceso" />
                    </>
                )}

                {role === 'EMPRESA_EXTERNA' && (
                    <>
                        <StatCard icon={ClipboardList} title="Trabajos Asignados" value={stats.assignedRequests} color="bg-blue-600" description="Solicitudes totales del proveedor" />
                        <StatCard icon={Hammer} title="En Tu Taller" value={stats.equipmentInWorkshop} color="bg-orange-600" description="Activos pendientes de revisión" />
                        <StatCard icon={CheckCircle2} title="Historial" value="--" color="bg-emerald-600" description="Próximamente" />
                        <StatCard icon={Clock} title="Tiempos" value="--" color="bg-purple-600" description="Métrica de respuesta" />
                    </>
                )}

                {(role === 'SOLICITANTE' || role === 'COORDINADOR_INTERVENCION') && (
                    <>
                        <StatCard icon={Package} title="Mi Dotación" value={stats.myEquipmentCount} color="bg-blue-600" description="Equipos bajo tu cargo" />
                        <StatCard icon={ClipboardList} title="Tus Solicitudes" value={stats.recentRequests.length} color="bg-emerald-600" description="Intervenciones registradas" />
                        <StatCard icon={Bell} title="Notificaciones" value="0" color="bg-orange-600" description="Mensajes del sistema" />
                        <StatCard icon={ShieldCheck} title="Estado" value="OK" color="bg-purple-600" description="Operatividad de equipos" />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main operational column */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Global Availability for privileged roles */}
                    {(role === 'ADMIN' || role === 'LOGISTICA' || role === 'COORDINADOR_INTERVENCION') && stats.globalStats && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-3">
                                <BarChart3 size={20} className="text-blue-500" /> Disponibilidad Global (Listos)
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                {stats.globalStats.map((stat: any) => (
                                    <div key={stat.typeId} className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 hover:border-blue-500/30 transition-all group">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 truncate">{stat.typeName}</p>
                                        <div className="flex items-end justify-between">
                                            <span className="text-4xl font-black text-white italic tracking-tighter group-hover:text-blue-400 transition-colors uppercase">{stat.count}</span>
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50 mb-2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Park Alerts for privileged roles */}
                    {(role === 'ADMIN' || role === 'LOGISTICA' || role === 'COORDINADOR_INTERVENCION') && stats.parkStats && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-3">
                                <MapPin size={20} className="text-orange-500" /> Alertas por Parque
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                {stats.parkStats.some((p: any) => p.alerts.length > 0) ? (
                                    stats.parkStats.filter((p: any) => p.alerts.length > 0).map((park: any) => (
                                        <div key={park.parkId} className="bg-slate-900 p-6 rounded-[2rem] border border-orange-500/20 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-orange-500/[0.02] pointer-events-none" />
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
                                                        <AlertTriangle size={20} className="animate-pulse" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-white italic uppercase tracking-tight">{park.parkName}</h3>
                                                        <p className="text-xs text-orange-500/70 font-bold uppercase tracking-widest">{park.alerts.length} Tipologías bajo mínimo</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-4">
                                                    {park.alerts.map((alert: any) => (
                                                        <div key={alert.typeId} className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center min-w-[100px]">
                                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{alert.typeName}</span>
                                                            <span className="text-xl font-black text-orange-500 italic uppercase">
                                                                {alert.current} <span className="text-[10px] text-slate-700 font-bold">/ {alert.min}</span>
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 bg-slate-900/30 border border-dashed border-slate-800 rounded-[2rem] text-center">
                                        <CheckCircle2 size={32} className="text-emerald-500/20 mb-3" />
                                        <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">Todos los parques operan por encima del stock mínimo</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recent Activity */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-3">
                            <Clock size={20} className="text-slate-500" /> Historial Operativo
                        </h2>
                        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                            {((role === 'SOLICITANTE' || role === 'COORDINADOR_INTERVENCION') && stats.recentRequests && stats.recentRequests.length > 0) ? (
                                <div className="space-y-4">
                                    {stats.recentRequests.map((req: any) => (
                                        <div key={req.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                                    <Hammer size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white uppercase tracking-tight">{req.serviceType}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(req.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${req.status === 'ENTREGADO' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                                                {req.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="p-6 bg-slate-950 rounded-full border border-slate-800 mb-4">
                                        <Package size={24} className="text-slate-800" />
                                    </div>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Sin registros de actividad reciente</p>
                                    <Link to="/requests" className="mt-4 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors">
                                        Ver historial completo de solicitudes →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions and Shortcuts */}
                <div className="lg:col-span-1 space-y-10">
                    <h2 className="text-xl font-black text-white italic uppercase flex items-center gap-3">
                        <TrendingUp size={20} className="text-blue-500" /> Centro de Operaciones
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        <QuickAction icon={Package} title="Ver Inventario" desc="Explorar catálogo de equipos" to="/equipment" />
                        <QuickAction icon={FileText} title="Nueva Solicitud" desc="Crear orden de mantenimiento" to="/requests/new" />
                        {(role === 'ADMIN' || role === 'LOGISTICA') && (
                            <QuickAction icon={Users} title="Control de Acceso" desc="Gestionar equipos y roles" to="/users" />
                        )}
                        <QuickAction icon={Building2} title="Parques y Sedes" desc="Gestión de ubicaciones" to="/parks" />
                    </div>

                    <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                            <ShieldCheck size={120} />
                        </div>
                        <h3 className="text-lg font-black text-white italic uppercase leading-tight mb-2 relative z-10">Sistema Blindado</h3>
                        <p className="text-xs text-blue-400 font-bold relative z-10 leading-relaxed uppercase tracking-widest">Protocolo de seguridad activo. Trazabilidad garantizada para cada activo.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
