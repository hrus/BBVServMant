import React, { useState } from 'react';
import { QrCode, X, Search, Smartphone, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScan }) => {
    const [manualId, setManualId] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualId.trim()) {
            onScan(manualId.trim());
            setManualId('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/40">
                            <QrCode className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight uppercase">Simulador de Escaneo</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8 text-center">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-10 rounded-full animate-pulse" />
                        <div className="relative bg-slate-950 p-10 rounded-3xl border border-slate-800 border-dashed group">
                            <Smartphone size={80} className="text-slate-600 group-hover:text-blue-500 transition-colors duration-500" />
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-slate-400 font-medium">En un dispositivo móvil, esto activaría la cámara. Aquí puedes simularlo introduciendo el ID visual o código QR.</p>

                        <form onSubmit={handleSubmit} className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input
                                    autoFocus
                                    type="text"
                                    value={manualId}
                                    onChange={(e) => setManualId(e.target.value)}
                                    placeholder="ID del Equipo..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white font-bold placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 rounded-2xl shadow-lg transition-all active:scale-95">
                                OK
                            </button>
                        </form>
                    </div>

                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3 text-left">
                        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest leading-relaxed">
                            El sistema identificará automáticamente si el código corresponde con el identificador visual o el tag RFID.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRScannerModal;
