import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Check, X } from 'lucide-react';
import AuthLayout from '../components/Layout/AuthLayout';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Kriteria password (sama dengan aturan regex di AuthController)
    const criteria = [
        { ok: form.password.length >= 8, label: 'Minimal 8 karakter' },
        { ok: /[A-Z]/.test(form.password), label: 'Huruf besar (A-Z)' },
        { ok: /[a-z]/.test(form.password), label: 'Huruf kecil (a-z)' },
        { ok: /[0-9]/.test(form.password), label: 'Angka (0-9)' },
        { ok: /[@$!%*?&]/.test(form.password), label: 'Karakter spesial (@$!%*?&)' },
    ];
    const isPasswordValid = criteria.every((c) => c.ok);

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
            toast.error(err.response?.data?.message || 'Registrasi gagal! Periksa kembali data Anda.');
        } finally {
            setLoading(false);
        }
    };

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    return (
        <AuthLayout
            title="Buat akun"
            subtitle="Akun baru langsung bisa dipakai untuk login."
            footer={
                <>
                    Sudah punya akun?{' '}
                    <Link to="/login" className="font-semibold text-blue-700 hover:underline">
                        Masuk di sini
                    </Link>
                </>
            }
        >
            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                    <label htmlFor="name" className="field-label">Nama lengkap</label>
                    <input id="name" type="text" className="field" value={form.name} onChange={set('name')} required />
                </div>
                <div>
                    <label htmlFor="email" className="field-label">Email</label>
                    <input id="email" type="email" className="field" value={form.email} onChange={set('email')} required />
                </div>
                <div>
                    <label htmlFor="password" className="field-label">Password</label>
                    <input id="password" type="password" className="field" value={form.password} onChange={set('password')} required />
                </div>

                {form.password.length > 0 && (
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs" aria-label="Syarat password">
                        {criteria.map((c) => (
                            <li
                                key={c.label}
                                className={`flex items-center gap-1.5 ${c.ok ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}
                            >
                                {c.ok ? <Check size={12} /> : <X size={12} />} {c.label}
                            </li>
                        ))}
                    </ul>
                )}

                <div>
                    <label htmlFor="password_confirmation" className="field-label">Konfirmasi password</label>
                    <input
                        id="password_confirmation"
                        type="password"
                        className="field"
                        value={form.password_confirmation}
                        onChange={set('password_confirmation')}
                        required
                    />
                </div>

                <button type="submit" disabled={loading || !isPasswordValid} className="btn btn-primary w-full py-2.5">
                    {loading ? 'Memproses...' : 'Daftar'}
                </button>
            </form>
        </AuthLayout>
    );
}
