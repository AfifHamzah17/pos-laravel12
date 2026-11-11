import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Package, LogOut, Wrench } from 'lucide-react';
import { toast } from 'react-toastify';

const NAV = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/report', label: 'Laporan tren', icon: TrendingUp },
    { to: '/master', label: 'Master data', icon: Package },
];

function readUser() {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
        return null;
    }
}

export default function AppShell({ title, subtitle, actions, children }) {
    const navigate = useNavigate();
    const user = readUser();

    const handleLogout = () => {
        localStorage.removeItem('user');
        toast.info('Anda berhasil logout');
        navigate('/login');
    };

    return (
        <div className="min-h-screen">
            <aside className="bg-ink text-white flex flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-60">
                <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 lg:pb-6">
                    <div className="flex items-center gap-3">
                        <span className="grid place-items-center w-9 h-9 rounded-xl bg-signal text-ink">
                            <Wrench size={18} strokeWidth={2.5} />
                        </span>
                        <div className="leading-none">
                            <p className="font-display text-xl font-semibold tracking-wide">POS Sparepart</p>
                            <p className="text-xs text-white/60 mt-1">Motor &amp; mobil</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="lg:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
                        aria-label="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

                <nav className="flex lg:flex-col gap-1 px-3 pb-3 overflow-x-auto" aria-label="Menu utama">
                    {NAV.map(({ to, label, icon: Icon }) => (
                        <NavLink key={to} to={to} className="nav-link">
                            <Icon size={18} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden lg:block mt-auto border-t border-white/10 p-4">
                    <p className="text-sm font-semibold truncate">{user?.name || 'Pengguna'}</p>
                    <p className="text-xs text-white/60 truncate">{user?.email}</p>
                    <button
                        onClick={handleLogout}
                        className="mt-3 flex items-center gap-2 text-sm text-white/70 hover:text-white"
                    >
                        <LogOut size={16} /> Keluar
                    </button>
                </div>
            </aside>

            <div className="lg:pl-60">
                <header className="px-5 sm:px-8 pt-7 pb-5 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-semibold text-slate-900 leading-none">{title}</h1>
                        {subtitle && <p className="mt-2 text-sm text-slate-500 max-w-2xl">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </header>
                <main className="px-5 sm:px-8 pb-12 max-w-[88rem]">{children}</main>
            </div>
        </div>
    );
}
