import React from 'react';
import { Wrench } from 'lucide-react';

const BRANDS = [
    ['GS Astra', 'Aki'],
    ['Denso', 'Busi'],
    ['Aspira', 'Wiper'],
    ['Kayaba', 'Shock absorber'],
    ['Evalube', 'Oli mesin'],
];

export default function AuthLayout({ title, subtitle, children, footer }) {
    return (
        <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <section className="hidden lg:flex flex-col justify-between bg-ink text-white p-12">
                <div className="flex items-center gap-3">
                    <span className="grid place-items-center w-10 h-10 rounded-xl bg-signal text-ink">
                        <Wrench size={20} strokeWidth={2.5} />
                    </span>
                    <span className="font-display text-2xl font-semibold tracking-wide">POS Sparepart</span>
                </div>

                <div>
                    <h2 className="font-display text-6xl font-semibold leading-[0.95]">
                        Stok, kasir, dan tren penjualan dalam satu layar.
                    </h2>
                    <dl className="mt-12 max-w-md divide-y divide-white/15 border-y border-white/15">
                        {BRANDS.map(([brand, part]) => (
                            <div key={brand} className="flex items-baseline justify-between py-3">
                                <dt className="font-display text-2xl font-semibold">{brand}</dt>
                                <dd className="text-sm text-white/65">{part}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <p className="text-sm text-white/55">Sparepart motor dan mobil, dicatat per transaksi.</p>
            </section>

            <section className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <span className="grid place-items-center w-9 h-9 rounded-xl bg-ink text-signal">
                            <Wrench size={18} strokeWidth={2.5} />
                        </span>
                        <span className="font-display text-2xl font-semibold text-slate-900">POS Sparepart</span>
                    </div>

                    <h1 className="text-4xl font-semibold text-slate-900">{title}</h1>
                    {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}

                    <div className="mt-8">{children}</div>
                    {footer && <p className="mt-6 text-sm text-slate-500">{footer}</p>}
                </div>
            </section>
        </div>
    );
}
