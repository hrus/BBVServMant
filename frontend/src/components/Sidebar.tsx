import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    ClipboardList, Package, MapPin, BarChart3, Building2, 
    Tag, User, Wrench, LayoutDashboard, Menu, X, ChevronRight 
} from 'lucide-react';
import type { Role } from '../types';

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};
    const userRole: Role = user.role || 'SOLICITANTE';

    const menuGroups = [
        {
            label: 'Operativa',
            items: [
                { label: 'Dashboard', to: '/', icon: LayoutDashboard },
                { label: 'Solicitudes', to: '/requests', icon: ClipboardList },
                ...(userRole === 'COORDINADOR_INTERVENCION' || userRole === 'ADMIN' ? [
                    { label: 'Control Operativo', to: '/coordinator', icon: BarChart3 }
                ] : []),
            ]
        },
        {
            label: 'Inventario',
            items: [
                { label: 'Equipos', to: '/equipment', icon: Package },
                ...(userRole === 'ADMIN' ? [
                    { label: 'Parques', to: '/parks', icon: MapPin }
                ] : []),
            ]
        },
        ...(userRole === 'LOGISTICA' || userRole === 'ADMIN' ? [
            {
                label: 'Configuración',
                items: [
                    { label: 'Empresas', to: '/vendors', icon: Building2 },
                    { label: 'Tipos de Equipo', to: '/types', icon: Tag },
                    { label: 'Servicios', to: '/services', icon: Wrench },
                    ...(userRole === 'ADMIN' ? [
                        { label: 'Gestión Usuarios', to: '/users', icon: User }
                    ] : []),
                ]
            }
        ] : [])
    ];

    const isActive = (path: string) => location.pathname === path;

    const SidebarContent = () => (
        <div className="flex flex-col h-full py-8 px-4">
            <div className="mb-12 px-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/40 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white rounded-md" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tighter leading-none">PPE TRACKER</h1>
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Bomberos BBV</span>
                </div>
            </div>

            <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
                {menuGroups.map((group, idx) => (
                    <div key={idx} className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                            {group.label}
                        </label>
                        <ul className="space-y-1">
                            {group.items.map((item, i) => (
                                <li key={i}>
                                    <Link
                                        to={item.to}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl group transition-all duration-300 ${
                                            isActive(item.to) 
                                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' 
                                            : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={20} className={isActive(item.to) ? 'text-white' : 'text-blue-500 group-hover:scale-110 transition-transform'} />
                                            <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                        </div>
                                        {isActive(item.to) && <ChevronRight size={14} className="animate-pulse" />}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="mt-auto pt-8 border-t border-slate-900">
                <div className="bg-slate-900/50 rounded-[1.5rem] p-4 border border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center text-blue-500">
                            <User size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{user.email || 'Usuario'}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter truncate">{userRole.replace('_', ' ')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Toggle */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-[60] p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-900/40"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Desktop */}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-950 border-r border-slate-900 z-50 transition-transform duration-500 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;
