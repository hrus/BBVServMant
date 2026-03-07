import React, { useState } from 'react';
import api from '../api/apiClient';
import { LogIn, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.location.href = '/';
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
            <div className="w-full max-w-md card-premium p-10 bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.05] blur-3xl -mr-32 -mt-32 rounded-full group-hover:bg-blue-600/[0.08] transition-colors" />

                <div className="flex flex-col items-center mb-10 relative z-10">
                    <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/40 mb-6 text-white rotate-3 group-hover:rotate-0 transition-transform">
                        <ShieldCheck size={36} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">Bienvenido de nuevo</h1>
                    <p className="text-slate-500 text-sm mt-2 uppercase tracking-widest font-bold">Acceso a Gestión de EPIs</p>
                </div>

                {error && (
                    <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="shrink-0 mt-0.5">⚠️</div>
                        <p className="font-medium leading-relaxed">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-8 relative z-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Email Corporativo</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full input-premium bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner font-bold"
                            placeholder="usuario@tuempresa.com"
                            required
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full input-premium bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner font-bold pr-14"
                                placeholder="••••••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-400 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/40 active:scale-[0.98] flex justify-center items-center space-x-3 uppercase tracking-widest text-sm hover:translate-y-[-2px]"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <LogIn size={20} />
                                <span>Iniciar Sesión</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
