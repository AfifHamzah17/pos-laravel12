import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import ProductPicker from '../components/Report/ProductPicker';
import ReportTables from '../components/Report/ReportTables';
import { TrendChart, CompositionChart, TopProductsChart, METRICS } from '../components/Report/ReportCharts';
import { formatIDR, formatNumber, formatCompactIDR, toISODate } from '../lib/format';

const GROUPS = [
    { id: 'total', label: 'Total' },
    { id: 'brand', label: 'Per merek' },
    { id: 'product', label: 'Per produk' },
];

const INTERVALS = [
    { id: 'month', label: 'Bulanan' },
    { id: 'day', label: 'Harian' },
];

const parseISO = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
};

function Segmented({ label, options, value, onChange }) {
    return (
        <div>
            <span className="field-label">{label}</span>
            <div className="seg" role="group" aria-label={label}>
                {options.map((opt) => (
                    <button key={opt.id} type="button" aria-pressed={value === opt.id} onClick={() => onChange(opt.id)}>
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

function Stat({ label, value, note }) {
    return (
        <div className="px-5 py-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-0.5 text-xl font-semibold text-slate-900">{value}</p>
            {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
        </div>
    );
}

export default function Report() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [bucket, setBucket] = useState('month');
    const [groupBy, setGroupBy] = useState('total');
    const [metric, setMetric] = useState('net');
    const [selected, setSelected] = useState([]);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const skipNext = useRef(false);

    const load = useCallback(async () => {
        if (startDate && endDate && startDate > endDate) {
            toast.warn('Tanggal akhir harus sama atau setelah tanggal mulai');
            return;
        }

        setLoading(true);
        try {
            const params = { interval: bucket, group_by: groupBy };
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            if (selected.length) params.product_ids = selected;

            const res = await axios.get('/api/reports/sales-trend', { params });
            setData(res.data);

            // Pemuatan pertama tanpa tanggal: isi filter dengan rentang data yang tersedia
            if (!startDate && !endDate) {
                skipNext.current = true;
                setStartDate(res.data.filters.start_date);
                setEndDate(res.data.filters.end_date);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal memuat laporan tren penjualan');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, bucket, groupBy, selected]);

    useEffect(() => {
        if (skipNext.current) {
            skipNext.current = false;
            return;
        }
        load();
    }, [load]);

    const bounds = data?.bounds;
    const presets = useMemo(() => {
        if (!bounds?.min || !bounds?.max) return [];
        const last = parseISO(bounds.max);
        const monthStart = (back) => toISODate(new Date(last.getFullYear(), last.getMonth() - back, 1));
        return [
            { id: 'all', label: 'Semua data', start: bounds.min, end: bounds.max },
            { id: 'last3', label: '3 bulan terakhir', start: monthStart(2), end: bounds.max },
            { id: 'last1', label: 'Bulan terakhir', start: monthStart(0), end: bounds.max },
        ];
    }, [bounds]);

    const applyPreset = (preset) => {
        setStartDate(preset.start);
        setEndDate(preset.end);
    };

    const options = data?.product_options || [];
    const selectedNames = options.filter((o) => selected.includes(o.id)).map((o) => o.name);
    const summary = data?.summary;
    const hasSales = (summary?.transactions || 0) > 0;
    const effectiveBucket = data?.filters?.interval || bucket;

    return (
        <AppShell
            title="Laporan tren penjualan"
            subtitle="Bandingkan omset, unit, dan transaksi dari waktu ke waktu untuk semua produk atau beberapa produk pilihan."
        >
            <div className="space-y-6">
                {/* Filter */}
                <section className="panel p-5 space-y-5" aria-label="Filter laporan">
                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label htmlFor="rep-start" className="field-label">Tanggal mulai</label>
                            <input id="rep-start" type="date" className="field" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="rep-end" className="field-label">Tanggal akhir</label>
                            <input id="rep-end" type="date" className="field" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        {presets.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {presets.map((preset) => {
                                    const active = preset.start === startDate && preset.end === endDate;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => applyPreset(preset)}
                                            aria-pressed={active}
                                            className={`btn ${active ? 'btn-primary' : 'btn-quiet'}`}
                                        >
                                            {preset.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
                        <div>
                            <span className="field-label">Produk</span>
                            <ProductPicker options={options} selected={selected} onApply={setSelected} />
                        </div>
                        <Segmented label="Rangkum" options={GROUPS} value={groupBy} onChange={setGroupBy} />
                        <Segmented label="Interval" options={INTERVALS} value={bucket} onChange={setBucket} />
                    </div>

                    {selectedNames.length > 0 && (
                        <p className="text-sm text-slate-600">
                            Menampilkan: {selectedNames.slice(0, 3).join(', ')}
                            {selectedNames.length > 3 && ` dan ${selectedNames.length - 3} produk lain`}
                        </p>
                    )}
                    {data && effectiveBucket !== bucket && (
                        <p className="text-sm text-amber-600">Rentang lebih dari satu tahun, jadi ditampilkan per bulan.</p>
                    )}
                </section>

                {!data && loading && <p className="text-sm text-slate-500 animate-pulse">Memuat laporan...</p>}

                {data && !bounds?.min && (
                    <section className="panel p-8 text-center">
                        <p className="font-semibold text-slate-700">Belum ada data penjualan</p>
                        <p className="mt-1 text-sm text-slate-500">
                            Catat transaksi di Master data, atau isi data contoh dengan{' '}
                            <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">php artisan products:generate-dummy</code>{' '}
                            lalu{' '}
                            <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">php artisan sales:generate-dummy</code>.
                        </p>
                    </section>
                )}

                {data && bounds?.min && (
                    <div className={`space-y-6 transition-opacity ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
                        {/* Ringkasan */}
                        <section className="panel grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] divide-y sm:divide-y-0 lg:divide-x">
                            <div className="px-5 py-4 sm:col-span-2 lg:col-span-1">
                                <p className="text-sm text-slate-500">Omset bersih</p>
                                <p className="mt-0.5 font-display text-4xl font-semibold text-blue-700 leading-none">
                                    {formatCompactIDR(summary.net)}
                                </p>
                                <p className="mt-1.5 text-xs text-slate-500">
                                    {summary.peak ? `Tertinggi di ${summary.peak.label}: ${formatCompactIDR(summary.peak.net)}` : 'Belum ada penjualan'}
                                </p>
                            </div>
                            <Stat label="Omset kotor" value={formatCompactIDR(summary.gross)} note={formatIDR(summary.gross)} />
                            <Stat
                                label="Potongan diskon"
                                value={formatCompactIDR(summary.discount)}
                                note={`${summary.discount_percent.toLocaleString('id-ID', { maximumFractionDigits: 1 })}% dari omset kotor`}
                            />
                            <Stat label="Unit terjual" value={formatNumber(summary.qty)} />
                            <Stat
                                label="Transaksi"
                                value={formatNumber(summary.transactions)}
                                note={`Rata-rata ${formatCompactIDR(summary.avg_per_transaction)}`}
                            />
                        </section>

                        {!hasSales ? (
                            <section className="panel p-8 text-center">
                                <p className="font-semibold text-slate-700">Tidak ada penjualan pada filter ini</p>
                                <p className="mt-1 text-sm text-slate-500">Perlebar rentang tanggal atau pilih produk lain.</p>
                            </section>
                        ) : (
                            <>
                                {/* Tren */}
                                <section className="panel p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                        <h2 className="text-2xl font-semibold text-slate-800">
                                            Tren {effectiveBucket === 'day' ? 'harian' : 'bulanan'}
                                        </h2>
                                        <div className="seg" role="group" aria-label="Ukuran tren">
                                            {METRICS.map((m) => (
                                                <button key={m.id} type="button" aria-pressed={metric === m.id} onClick={() => setMetric(m.id)}>
                                                    {m.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-80">
                                        <TrendChart periods={data.periods} series={data.series} metric={metric} />
                                    </div>
                                </section>

                                <div className="grid lg:grid-cols-2 gap-6">
                                    <section className="panel p-5">
                                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Omset bersih dan diskon</h2>
                                        <div className="h-72">
                                            <CompositionChart periods={data.periods} totals={data.totals} />
                                        </div>
                                    </section>
                                    <section className="panel p-5">
                                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Produk dengan omset tertinggi</h2>
                                        <div className="h-72">
                                            <TopProductsChart products={data.products} />
                                        </div>
                                    </section>
                                </div>

                                <ReportTables data={data} metric={metric} />
                            </>
                        )}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
