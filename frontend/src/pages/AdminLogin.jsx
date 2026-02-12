import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Shield, User, Lock, ArrowLeft, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password
            });

            if (response.data.token) {
                localStorage.setItem('adminToken', response.data.token);
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
            {/* Background Map Placeholder or Texture */}
            <div className="absolute inset-0 bg-[url('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/6/30/30.png')] bg-cover opacity-50"></div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19] via-slate-900 to-indigo-950 opacity-95"></div>



            <div className="relative w-full max-w-md p-4 z-10">
                <GlassCard className="p-8 w-full max-w-md relative z-10 bg-white/80 backdrop-blur-2xl border-white/50 shadow-2xl">
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                        <div className="bg-white p-4 rounded-2xl shadow-xl border border-white/50">
                            <Shield size={40} className="text-indigo-600" />
                        </div>
                    </div>

                    {/* Header text removed as logo contains title */}
                    <div className="mt-8 mb-4"></div>

                    {error && (
                        <div className="bg-red-50/80 border border-red-200 text-red-700 p-3 rounded-xl mb-6 text-sm flex items-center gap-2 font-medium">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <Input
                            id="username"
                            label="Check ID"
                            icon={User}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Authorized ID"
                            required
                        />
                        <Input
                            id="password"
                            type="password"
                            label="Secure Key"
                            icon={Lock}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        <Button type="submit" className="w-full h-12 text-lg shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
                            Authenticate Access
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                        <Button variant="ghost" className="text-slate-600 hover:text-indigo-700 font-medium" onClick={() => navigate('/')}>
                            <ArrowLeft size={16} className="mr-2" />
                            Return to Live Map
                        </Button>
                    </div>
                </GlassCard>

                <p className="text-slate-300 text-xs mt-8 font-medium tracking-wide opacity-80 backdrop-blur-sm py-1 px-3 rounded-full bg-black/20">
                    Restricted Access • Authorized Personnel Only
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
