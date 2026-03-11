import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/apiClient';
import { Send, AlertCircle, MapPin, Wrench, Box, ChevronLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const CreateRequest: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [equipmentList, setEquipmentList] = useState<any[]>([]);
    const [parkList, setParkList] = useState<any[]>([]);
    const [mappings, setMappings] = useState<any[]>([]);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        equipmentId: searchParams.get('equipmentId') || '',
        serviceTypeId: '',
        notes: '',
        pickupLocation: ''
    });
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eqRes, parkRes, mapRes] = await Promise.all([
                    api.get('/equipment'),
                    api.get('/parks'),
                    api.get('/service-mappings')
                ]);
                setEquipmentList(eqRes.data);
                setParkList(parkRes.data);
                setMappings(mapRes.data);

                // If equipmentId is provided via URL, pre-fill the location if possible
                const eqId = searchParams.get('equipmentId');
                if (eqId) {
                    const eq = eqRes.data.find((e: any) => e.id === eqId);
                    if (eq) {
                        if (eq.park) {
                            setFormData(prev => ({ ...prev, pickupLocation: eq.park.name }));
                        }
                        // Update available services for this equipment
                        const filtered = mapRes.data
                            .filter((m: any) => m.vendorId === eq.type.vendorId && m.equipmentTypeId === eq.typeId)
                            .map((m: any) => m.serviceType);
                        setAvailableServices(filtered);
                    }
                }
            } catch (err) {
                console.error('Error fetching data', err);
            }
        };
        fetchData();
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/requests', formData);
            showToast('Solicitud creada correctamente', 'success');
            navigate('/requests');
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Error al crear la solicitud', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEquipmentChange = (val: string) => {
        const eq: any = equipmentList.find((e: any) => e.id === val);
        
        // Filter services
        const filtered = mappings
            .filter((m: any) => m.vendorId === eq?.type?.vendorId && m.equipmentTypeId === eq?.typeId)
            .map((m: any) => m.serviceType);
        
        setAvailableServices(filtered);
        
        setFormData({
            ...formData,
            equipmentId: val,
            serviceTypeId: filtered.length > 0 ? filtered[0].id : '',
            pickupLocation: eq?.park?.name || ''
        });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all">
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Nueva Solicitud</h1>
                    <p className="text-slate-400 text-lg">Registro técnico de mantenimiento o higiene</p>
                </div>
            </header>

            <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/[0.03] blur-3xl -mr-48 -mt-48 rounded-full group-hover:bg-blue-600/[0.05] transition-colors" />

                <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Equipment selection */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Equipo a intervenir</label>
                            <div className="relative">
                                <Box className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                                <select
                                    value={formData.equipmentId}
                                    onChange={(e) => handleEquipmentChange(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-6 py-5 text-white font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner uppercase text-sm"
                                    required
                                >
                                    <option value="" className="bg-slate-900">-- Seleccionar Referencia --</option>
                                    {equipmentList.map((e: any) => (
                                        <option key={e.id} value={e.id} className="bg-slate-900">
                                            {e.type.name} (Ref: {e.visualId})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Service selection */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Tipo de Servicio</label>
                            <div className="relative">
                                <Wrench className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                                <select
                                    value={formData.serviceTypeId}
                                    onChange={(e) => setFormData({ ...formData, serviceTypeId: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-6 py-5 text-white font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner uppercase text-sm disabled:opacity-50"
                                    required
                                    disabled={!formData.equipmentId}
                                >
                                    <option value="" className="bg-slate-900">-- Seleccionar Servicio --</option>
                                    {availableServices.map((s: any) => (
                                        <option key={s.id} value={s.id} className="bg-slate-900">
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {!formData.equipmentId && (
                                <p className="text-[10px] text-slate-500 italic ml-2 mt-2">Selecciona un equipo para ver los servicios disponibles</p>
                            )}
                            {formData.equipmentId && availableServices.length === 0 && (
                                <p className="text-[10px] text-red-400 italic ml-2 mt-2">No hay servicios configurados para este equipo</p>
                            )}
                        </div>
                    </div>

                    {/* Location Selection */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Parque de Depósito (Recogida)</label>
                        <div className="relative">
                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                            <select
                                value={formData.pickupLocation}
                                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-6 py-4 text-white font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner uppercase text-sm"
                                required
                            >
                                <option value="" className="bg-slate-900">-- Seleccionar Parque --</option>
                                {parkList.map((p: any) => (
                                    <option key={p.id} value={p.name} className="bg-slate-900">
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Informe de Estado / Detalles</label>
                        <textarea
                            rows={4}
                            placeholder="Describe el motivo de la intervención o avería detectada..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] px-8 py-6 text-white font-medium placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner resize-none leading-relaxed"
                        ></textarea>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black py-6 rounded-[2rem] transition-all shadow-2xl shadow-blue-900/40 active:scale-[0.98] flex justify-center items-center gap-4 text-sm tracking-widest uppercase italic group"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    EMITIR ORDEN DE TRABAJO
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="flex items-start gap-5 p-8 bg-blue-600/[0.03] border border-blue-500/10 rounded-[2.5rem] text-blue-400/80 text-xs italic shadow-xl">
                <AlertCircle size={22} className="shrink-0 text-blue-500" />
                <p className="leading-relaxed">
                    Al emitir una orden de trabajo, el equipo quedará bloqueado para su uso operativo y se notificará automáticamente al equipo de logística para proceder con la recogida en la ubicación indicada.
                </p>
            </div>
        </div>
    );
};

export default CreateRequest;
