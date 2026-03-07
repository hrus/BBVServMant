import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import { Bell, Check, Clock, X } from 'lucide-react';
import type { Notification } from '../types';

const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: Notification) => !n.read).length);
        } catch (err) {
            console.error('Error fetching notifications', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking as read', err);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 transition-all border border-slate-800 relative group"
            >
                <Bell size={20} className={unreadCount > 0 ? "animate-swing" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-slate-950 shadow-lg animate-in zoom-in">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-3 w-80 max-h-[480px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in slide-in-from-top-2 duration-300">
                        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Notificaciones</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 divide-y divide-slate-800/50">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center space-y-3">
                                    <Bell size={32} className="mx-auto text-slate-800" />
                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Bandeja vacía</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-5 hover:bg-slate-800/30 transition-colors flex gap-4 relative group ${!notif.read ? 'bg-blue-500/[0.02]' : ''}`}
                                    >
                                        {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!notif.read ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-950 text-slate-600'}`}>
                                            <Clock size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-black uppercase tracking-tight truncate ${!notif.read ? 'text-white' : 'text-slate-400'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                {notif.message}
                                            </p>
                                            <p className="text-[9px] text-slate-600 font-bold uppercase mt-2">
                                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {!notif.read && (
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="self-start p-1.5 opacity-0 group-hover:opacity-100 bg-slate-950 border border-slate-800 rounded-lg text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-inner"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-4 bg-slate-800/20 border-t border-slate-800 text-center">
                                <button className="text-[10px] font-black text-slate-500 hover:text-blue-500 uppercase tracking-widest transition-colors">
                                    Ver todo el historial
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
