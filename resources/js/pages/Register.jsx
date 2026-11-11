import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserPlus, Check, X } from 'lucide-react';

export default function Register() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Validasi Kriteria Password menggunakan Regex
    const pwdCriteria = {
        length: form.password.length >= 8,
        uppercase: /[A-Z]/.test(form.password),
        lowercase: /[a-z]/.test(form.password),
        number: /[0-9]/.test(form.password),
        special: /[@$!%*?&]/.test(form.password),
    };

    const isPasswordValid = Object.values(pwdCriteria).every(Boolean);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!isPasswordValid) {
            toast.error('Password belum memenuhi semua kriteria keamanan!');
            return;
        }

        if (form.password !== form.password_confirmation) {
            toast.error('Konfirmasi password tidak cocok!');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('/api/register', form);
            toast.success(res.data.message);
            navigate('/login');
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Registrasi gagal! Periksa kembali data Anda.';
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-slate-200">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <UserPlus className="text-blue-600" size={28} />
                    <h2 className="text-2xl font-bold text-slate-800">Daftar Akun Baru</h2>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                        <input
                            type="text"
                            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="admin@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        <input
                            type="password"
                            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Minimal 8 Karakter"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>

                    {/* Live Password Indicator */}
                    {form.password.length > 0 && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                            <p className="font-semibold text-slate-600 mb-1">Syarat Keamanan Password:</p>
                            <div className="grid grid-cols-2 gap-1">
                                <div className={`flex items-center gap-1 ${pwdCriteria.length ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                                    {pwdCriteria.length ? <Check size={12}/> : <X size={12}/>} Min. 8 Karakter
                                </div>
                                <div className={`flex items-center gap-1 ${pwdCriteria.uppercase ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                                    {pwdCriteria.uppercase ? <Check size={12}/> : <X size={12}/>} Huruf Besar (A-Z)
                                </div>
                                <div className={`flex items-center gap-1 ${pwdCriteria.lowercase ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                                    {pwdCriteria.lowercase ? <Check size={12}/> : <X size={12}/>} Huruf Kecil (a-z)
                                </div>
                                <div className={`flex items-center gap-1 ${pwdCriteria.number ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                                    {pwdCriteria.number ? <Check size={12}/> : <X size={12}/>} Angka (0-9)
                                </div>
                                <div className={`flex items-center gap-1 col-span-2 ${pwdCriteria.special ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                                    {pwdCriteria.special ? <Check size={12}/> : <X size={12}/>} Karakter Spesial (@$!%*?&)
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Konfirmasi Password</label>
                        <input
                            type="password"
                            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Ulangi password"
                            value={form.password_confirmation}
                            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading || !isPasswordValid}
                        className={`w-full font-semibold py-2.5 rounded-xl transition duration-200 text-sm shadow-md ${
                            isPasswordValid 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        {loading ? 'Memproses...' : 'Daftar Sekarang'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-slate-500">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                        Login di sini
                    </Link>
                </p>
            </div>
        </div>
    );
}