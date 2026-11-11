import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthLayout from '../components/Layout/AuthLayout';

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
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login gagal! Cek email dan password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Masuk"
            subtitle="Gunakan akun kasir atau admin Anda."
            footer={
                <>
                    Belum punya akun?{' '}
                    <Link to="/register" className="font-semibold text-blue-700 hover:underline">
                        Daftar akun baru
                    </Link>
                </>
            }
        >
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label htmlFor="email" className="field-label">Email</label>
                    <input
                        id="email"
                        type="email"
                        className="field"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="field-label">Password</label>
                    <input
                        id="password"
                        type="password"
                        className="field"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5">
                    {loading ? 'Memeriksa akun...' : 'Masuk'}
                </button>
            </form>
        </AuthLayout>
    );
}
