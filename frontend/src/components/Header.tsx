import React from 'react';
import { LogOut, Search } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const Header: React.FC = () => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <header className="h-20 border-b border-slate-900 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between">
            {/* Search Bar or Context Title */}
            <div className="hidden md:flex relative w-96 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar equipo, solicitud o referencia..." 
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-6 py-3 text-sm font-medium text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                />
            </div>

            <div className="flex items-center gap-4 ml-auto">
                <div className="flex items-center gap-2 mr-4 border-r border-slate-800 pr-6">
                    <NotificationCenter />
                </div>
                
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 active:scale-95 text-xs font-black uppercase tracking-widest"
                >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
