import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LogIn } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/login', { email, password });
            toast.success(res.data.message);
            // Simpan info user di LocalStorage jika diperlukan
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Login gagal! Cek email dan password.';
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-slate-200">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <LogIn className="text-blue-600" size={28} />
                    <h2 className="text-2xl font-bold text-slate-800">Login POS System</h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        <input
                            type="password"
                            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition duration-200 text-sm shadow-md"
                    >
                        {loading ? 'Memvalidasi...' : 'Masuk'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-slate-500">
                    Belum punya akun?{' '}
                    <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                        Daftar akun baru
                    </Link>
                </p>
            </div>
        </div>
    );
}