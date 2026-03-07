import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Package, LogOut, MapPin, BarChart3, Building2, Tag, User } from 'lucide-react';
import type { Role } from '../types';
import NotificationCenter from './NotificationCenter';

const Navbar: React.FC = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole: Role = user.role || 'SOLICITANTE';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <nav className="bg-slate-950 text-white shadow-2xl border-b border-slate-800 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-12">
                        <Link to="/" className="text-xl font-black tracking-tighter text-blue-500 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/40" />
                            <span>PPE TRACKER</span>
                        </Link>

                        <div className="hidden lg:flex space-x-6">
                            {(userRole === 'COORDINADOR_INTERVENCION' || userRole === 'ADMIN') && (
                                <Link to="/coordinator" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-all font-medium py-1 px-3 rounded-lg hover:bg-slate-800">
                                    <BarChart3 size={18} className="text-blue-500" />
                                    <span>Operativa</span>
                                </Link>
                            )}

                            {userRole === 'ADMIN' && (
                                <Link to="/parks" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-all font-medium py-1 px-3 rounded-lg hover:bg-slate-800">
                                    <MapPin size={18} className="text-blue-500" />
                                    <span>Parques</span>
                                </Link>
                            )}

                            {(userRole === 'LOGISTICA' || userRole === 'ADMIN') && (
                                <>
                                    <Link to="/types" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-all font-medium py-1 px-3 rounded-lg hover:bg-slate-800">
                                        <Tag size={18} className="text-blue-500" />
                                        <span>Tipos</span>
                                    </Link>
                                    <Link to="/vendors" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-all font-medium py-1 px-3 rounded-lg hover:bg-slate-800">
                                        <Building2 size={18} className="text-blue-500" />
                                        <span>Empresas</span>
                                    </Link>
                                </>
                            )}

                            {userRole === 'ADMIN' && (
                                <Link to="/users" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-all font-medium py-1 px-3 rounded-lg hover:bg-slate-800">
                                    <User size={18} className="text-blue-500" />
                                    <span>Usuarios</span>
                                </Link>
                            )}


                            <Link to="/equipment" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-all font-medium py-1 px-3 rounded-lg hover:bg-slate-800">
                                <Package size={18} className="text-blue-500" />
                                <span>Equipos</span>
                            </Link>

                            <Link to="/requests" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-all font-medium py-1 px-3 rounded-lg hover:bg-slate-800">
                                <ClipboardList size={18} className="text-blue-500" />
                                <span>Solicitudes</span>
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">{userRole.replace('_', ' ')}</span>
                            <span className="text-[10px] text-slate-500">Sesión Activa</span>
                        </div>
                        <NotificationCenter />
                        <button
                            onClick={handleLogout}
                            className="p-2.5 bg-slate-900 hover:bg-red-500/10 hover:text-red-500 rounded-xl text-slate-400 transition-all border border-slate-800 active:scale-95"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
