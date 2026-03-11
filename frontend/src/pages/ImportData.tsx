import React, { useState } from 'react';
import api from '../api/apiClient';
import { Upload, FileDown, CheckCircle, AlertCircle, Users, Package, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ImportData: React.FC = () => {
    const [userFile, setUserFile] = useState<File | null>(null);
    const [equipFile, setEquipFile] = useState<File | null>(null);
    const [loading, setLoading] = useState({ users: false, equipment: false });
    const [results, setResults] = useState<{ users: any, equipment: any }>({ users: null, equipment: null });
    const { showToast } = useToast();

    const handleFileUpload = async (type: 'users' | 'equipment') => {
        const file = type === 'users' ? userFile : equipFile;
        if (!file) return;

        setLoading(prev => ({ ...prev, [type]: true }));
        const formData = new FormData();
        formData.append('file', file);

        try {
            const endpoint = type === 'users' ? '/import/users' : '/import/equipment';
            const res = await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResults(prev => ({ ...prev, [type]: res.data }));
            showToast(`Carga de ${type === 'users' ? 'usuarios' : 'equipos'} completada`, 'success');
        } catch (err: any) {
            console.error(err);
            showToast('Error al importar datos', 'error');
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const downloadTemplate = (type: 'users' | 'equipment') => {
        let content = '';
        let filename = '';
        if (type === 'users') {
            content = 'name,email,password,role,vendorName\nJuan Perez,juan@example.com,secret123,SOLICITANTE,\nAdmin Tech,tech@vendor.com,pass123,EMPRESA_EXTERNA,Empresa Mantenimiento A';
            filename = 'template_usuarios.csv';
        } else {
            content = 'visualId,qrCode,typeName,assignmentType,ownerEmail,parkName,status,location\nM-002,QR-M-002,Máscara de Protección,PARQUE,,Central,EN_PARQUE,Estante 2\nERA-005,,Equipo de Respiración Autónoma,PERSONAL,juan@example.com,,EN_PARQUE,Taquilla 10';
            filename = 'template_equipos.csv';
        }

        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Importación Masiva</h1>
                <p className="text-slate-400 text-lg">Carga de datos críticos mediante archivos CSV</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Users Import */}
                <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-blue-600/20 transition-all duration-500" />
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-900/40">
                            <Users size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white italic uppercase leading-none">Cargar Usuarios</h2>
                            <button 
                                onClick={() => downloadTemplate('users')}
                                className="text-[10px] text-blue-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-1 hover:text-blue-400 transition-colors"
                            >
                                <FileDown size={10} /> Descargar Plantilla .csv
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-all bg-slate-950/50">
                            <input 
                                type="file" 
                                id="user-upload" 
                                className="hidden" 
                                accept=".csv" 
                                onChange={(e) => setUserFile(e.target.files ? e.target.files[0] : null)}
                            />
                            <label htmlFor="user-upload" className="cursor-pointer">
                                <Upload className="mx-auto text-slate-700 mb-4 group-hover:text-blue-500 group-hover:scale-110 transition-all" size={32} />
                                <p className="text-sm font-bold text-slate-400">
                                    {userFile ? userFile.name : 'Seleccionar archivo CSV de usuarios'}
                                </p>
                            </label>
                        </div>

                        <button
                            onClick={() => handleFileUpload('users')}
                            disabled={!userFile || loading.users}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/40 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                            {loading.users ? 'Procesando...' : (
                                <>Comenzar Importación <ArrowRight size={16} /></>
                            )}
                        </button>

                        {results.users && (
                            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
                                <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm uppercase">
                                    <CheckCircle size={14} /> {results.users.message}
                                </div>
                                {results.users.errors.length > 0 && (
                                    <div className="text-[10px] text-red-500 space-y-1 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                                        <div className="flex items-center gap-1 font-black mb-1">
                                            <AlertCircle size={10} /> ADVERTENCIAS:
                                        </div>
                                        {results.users.errors.map((err: string, i: number) => (
                                            <div key={i}>{err}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Equipment Import */}
                <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-emerald-600/20 transition-all duration-500" />
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-900/40">
                            <Package size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white italic uppercase leading-none">Cargar Equipamiento</h2>
                            <button 
                                onClick={() => downloadTemplate('equipment')}
                                className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-1 hover:text-emerald-400 transition-colors"
                            >
                                <FileDown size={10} /> Descargar Plantilla .csv
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center hover:border-emerald-500/50 transition-all bg-slate-950/50">
                            <input 
                                type="file" 
                                id="equip-upload" 
                                className="hidden" 
                                accept=".csv" 
                                onChange={(e) => setEquipFile(e.target.files ? e.target.files[0] : null)}
                            />
                            <label htmlFor="equip-upload" className="cursor-pointer">
                                <Upload className="mx-auto text-slate-700 mb-4 group-hover:text-emerald-500 group-hover:scale-110 transition-all" size={32} />
                                <p className="text-sm font-bold text-slate-400">
                                    {equipFile ? equipFile.name : 'Seleccionar archivo CSV de equipos'}
                                </p>
                            </label>
                        </div>

                        <button
                            onClick={() => handleFileUpload('equipment')}
                            disabled={!equipFile || loading.equipment}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                            {loading.equipment ? 'Procesando...' : (
                                <>Comenzar Importación <ArrowRight size={16} /></>
                            )}
                        </button>

                        {results.equipment && (
                            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
                                <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm uppercase">
                                    <CheckCircle size={14} /> {results.equipment.message}
                                </div>
                                {results.equipment.errors.length > 0 && (
                                    <div className="text-[10px] text-red-500 space-y-1 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                                        <div className="flex items-center gap-1 font-black mb-1">
                                            <AlertCircle size={10} /> ADVERTENCIAS:
                                        </div>
                                        {results.equipment.errors.map((err: string, i: number) => (
                                            <div key={i}>{err}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 rounded-[2rem] border border-slate-800 p-8">
                <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-4">Notas Técnicas para la Carga</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-400">
                    <li className="flex gap-2">
                        <span className="text-blue-500 font-bold">●</span>
                        Los archivos deben estar en formato UTF-8, separados por comas (,).
                    </li>
                    <li className="flex gap-2">
                        <span className="text-blue-500 font-bold">●</span>
                        La carga utiliza <span className="text-white font-bold italic">UPSERT</span>: si el correo o la referencia visual ya existen, el registro se actualizará.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-blue-500 font-bold">●</span>
                        Los nombres de Roles, Parques y Tipos de Equipo deben coincidir exactamente con los existentes en el sistema.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-blue-500 font-bold">●</span>
                        Si un equipo es de tipo PERSONAL, el sistema buscará el correo electrónico indicado para asignárselo.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ImportData;
