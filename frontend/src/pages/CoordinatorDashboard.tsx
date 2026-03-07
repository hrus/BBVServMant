import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import type { CoordinatorStats } from '../types';
import { Package, MapPin, AlertTriangle, CheckCircle2, QrCode } from 'lucide-react';
import QRScannerModal from '../components/QRScannerModal';

const CoordinatorDashboard: React.FC = () => {
    const [stats, setStats] = useState<CoordinatorStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/coordinator');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleScan = (data: string) => {
        // Logic to handle scanned equipment (e.g., redirect to equipment details or request)
        window.location.href = `/equipment?search=${data}`;
    };

    if (loading) return <div className="flex justify-center p-10 text-slate-400">Cargando dashboard operativo...</div>;
    if (!stats) return <div className="p-10 text-red-500">Error al cargar datos operativos.</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">Operaciones de Intervención</h1>
                    <p className="text-slate-400 text-lg">Resumen de disponibilidad global y alertas críticas por parque</p>
                </div>
                <button
                    onClick={() => setIsScannerOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40 transition-all active:scale-95 group"
                >
                    <QrCode size={20} className="group-hover:rotate-12 transition-transform" />
                    ESCANEAR EQUIPO
                </button>
            </header>

            {/* Global Stats */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Package className="text-blue-500" size={24} />
                    </div>
                    <h2 className="text-xl font-black text-slate-100 uppercase tracking-widest">Vista Global Operativa</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.globalStats.map(stat => (
                        <div key={stat.typeId} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-blue-500/50 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10" />
                            <span className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-8">{stat.typeName}</span>
                            <div className="flex items-end justify-between relative z-10">
                                <span className="text-6xl font-black text-white group-hover:text-blue-400 transition-colors drop-shadow-2xl">{stat.count}</span>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-tighter">Listos</span>
                                    <span className="text-[9px] text-slate-600 mt-1 uppercase font-bold tracking-widest">En Parque</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Park Details */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <MapPin className="text-blue-500" size={24} />
                    </div>
                    <h2 className="text-xl font-black text-slate-100 uppercase tracking-widest">Disponibilidad por Parque</h2>
                </div>
                <div className="grid grid-cols-1 gap-8">
                    {stats.parkStats.map((park: any) => (
                        <div key={park.parkId} className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden hover:border-slate-700 transition-all shadow-2xl">
                            <div className="bg-slate-800/20 px-10 py-6 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">{park.parkName}</h3>
                                {park.alerts.length > 0 ? (
                                    <div className="flex items-center gap-3 text-amber-500 bg-amber-500/5 px-6 py-3 rounded-2xl border border-amber-500/20 shadow-inner">
                                        <AlertTriangle size={18} className="animate-pulse" />
                                        <span className="font-black text-xs tracking-widest">{park.alerts.length} ALERTA(S)</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-emerald-500 bg-emerald-500/5 px-6 py-3 rounded-2xl border border-emerald-500/20 shadow-inner">
                                        <CheckCircle2 size={18} />
                                        <span className="font-black text-xs tracking-widest uppercase">Operativo</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-10">
                                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-10">
                                    {Object.entries(park.counts).map(([typeId, count]: [string, any]) => {
                                        const typeName = stats.globalStats.find(t => t.typeId === typeId)?.typeName || 'Equipo';
                                        return (
                                            <div key={typeId} className="flex flex-col gap-2 group cursor-pointer">
                                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors truncate">{typeName}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-5xl font-black text-white tabular-nums drop-shadow-lg">{count}</span>
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:scale-150 transition-transform" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {park.alerts.length > 0 && (
                                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {park.alerts.map((alert: any) => (
                                            <div key={alert.typeId} className="flex items-center justify-between p-6 bg-amber-500/[0.03] border border-amber-500/10 rounded-3xl relative group overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/30 group-hover:bg-amber-500 transition-all" />
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-amber-500/60 font-black uppercase tracking-[0.2em] mb-1">{alert.typeName}</span>
                                                    <span className="text-slate-300 font-bold uppercase tabular-nums">Stock Crítico</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-3xl font-black text-amber-500 drop-shadow-md">{alert.current} <span className="text-xs text-slate-600 font-medium">/ {alert.min}</span></div>
                                                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Mínimo OK</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <QRScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
            />
        </div>
    );
};

export default CoordinatorDashboard;
