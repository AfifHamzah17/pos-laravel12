import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import { formatIDR, formatCompactIDR, toISODate } from '../lib/format';

// Rentang bulan berjalan (tanggal 1 s/d hari terakhir)
const getCurrentMonthRange = () => {
    const now = new Date();
    return {
        start: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
        end: toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
};

export default function Dashboard() {
    const initial = getCurrentMonthRange();
    const [startDate, setStartDate] = useState(initial.start);
    const [endDate, setEndDate] = useState(initial.end);

    const [chartData, setChartData] = useState([]);
    const [totalOmset, setTotalOmset] = useState(0);
    const [lastSales, setLastSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });

    useEffect(() => {
        let cancelled = false;

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const res = await axios.get('/api/dashboard', {
                    params: { start_date: startDate, end_date: endDate },
                });
                if (cancelled) return;
                setChartData(Array.isArray(res.data?.chart_data) ? res.data.chart_data : []);
                setTotalOmset(res.data?.total_omset || 0);
                setLastSales(Array.isArray(res.data?.last_5_sales) ? res.data.last_5_sales : []);
            } catch (err) {
                if (cancelled) return;
                toast.error('Gagal mengambil data dashboard dari server');
                setChartData([]);
                setLastSales([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchDashboardData();
        return () => {
            cancelled = true;
        };
    }, [startDate, endDate]);

    const handleResetFilter = () => {
        const range = getCurrentMonthRange();
        setStartDate(range.start);
        setEndDate(range.end);
        toast.info('Filter tanggal dikembalikan ke bulan ini');
    };

    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
    };

    const sortedLastSales = useMemo(() => {
        if (!Array.isArray(lastSales) || lastSales.length === 0) return [];

        return [...lastSales].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            if (sortConfig.key === 'qty' || sortConfig.key === 'total') {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
            } else if (sortConfig.key === 'time') {
                aVal = new Date(aVal).getTime() || 0;
                bVal = new Date(bVal).getTime() || 0;
            } else {
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [lastSales, sortConfig]);

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <ArrowUpDown size={14} className="text-slate-400" />;
        return sortConfig.direction === 'asc' ? (
            <ArrowUp size={14} className="text-blue-600" />
        ) : (
            <ArrowDown size={14} className="text-blue-600" />
        );
    };

    const columns = [
        { key: 'id', label: 'Kode transaksi' },
        { key: 'product', label: 'Produk' },
        { key: 'qty', label: 'Qty', align: 'center' },
        { key: 'total', label: 'Total' },
        { key: 'time', label: 'Waktu' },
    ];

    return (
        <AppShell
            title="Dashboard penjualan"
            subtitle="Omset harian dan transaksi terbaru pada rentang tanggal yang dipilih."
            actions={
                <Link to="/report" className="btn btn-primary">
                    <TrendingUp size={16} /> Laporan tren
                </Link>
            }
        >
            <div className="space-y-6">
                {/* Ringkasan + filter tanggal */}
                <section className="panel grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] divide-y lg:divide-y-0 lg:divide-x">
                    <div className="p-6">
                        <p className="text-sm text-slate-500">Total omset pada rentang ini</p>
                        <p className="mt-1 font-display text-5xl font-semibold text-blue-700 leading-none">
                            {formatIDR(totalOmset)}
                        </p>
                        <p className="mt-3 text-sm text-slate-500">
                            {chartData.length} hari dengan transaksi
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xl font-semibold text-slate-800">Rentang tanggal</h2>
                            {loading && <span className="text-xs text-slate-500 animate-pulse">Memuat data...</span>}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="dash-start" className="field-label">Tanggal mulai</label>
                                <input id="dash-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="field" />
                            </div>
                            <div>
                                <label htmlFor="dash-end" className="field-label">Tanggal akhir</label>
                                <input id="dash-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="field" />
                            </div>
                        </div>
                        <button onClick={handleResetFilter} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
                            <RefreshCw size={14} /> Kembali ke bulan ini
                        </button>
                    </div>
                </section>

                {/* Grafik omset harian */}
                <section className="panel p-6">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">Omset harian</h2>
                    <div className="h-72 w-full flex items-center justify-center">
                        {loading ? (
                            <p className="text-sm text-slate-500 animate-pulse">Memuat grafik...</p>
                        ) : chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="omsetFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#0e5a5a" stopOpacity={0.25} />
                                            <stop offset="100%" stopColor="#0e5a5a" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#dde1df" />
                                    <XAxis dataKey="date" stroke="#7a8783" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#7a8783" fontSize={12} tickLine={false} axisLine={false} width={72} tickFormatter={formatCompactIDR} />
                                    <Tooltip
                                        formatter={(value) => [formatIDR(value), 'Omset']}
                                        labelFormatter={(label) => `Tanggal ${label}`}
                                        contentStyle={{ borderRadius: 6, borderColor: '#dde1df', fontSize: 13 }}
                                    />
                                    <Area type="monotone" dataKey="total_omset" stroke="#0e5a5a" strokeWidth={2.5} fill="url(#omsetFill)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center">
                                <p className="font-medium text-slate-600">Belum ada penjualan pada rentang ini</p>
                                <p className="text-sm text-slate-500 mt-1">Ubah tanggal di atas atau catat transaksi baru di Master data.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 5 transaksi terakhir */}
                <section className="panel p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                        <h2 className="text-2xl font-semibold text-slate-800">5 transaksi terakhir</h2>
                        <p className="text-sm text-slate-500">Klik judul kolom untuk mengurutkan</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="border-b border-slate-200 text-slate-700 font-semibold">
                                <tr>
                                    {columns.map((col) => (
                                        <th key={col.key} className={`py-3 px-4 ${col.align === 'center' ? 'text-center' : ''}`} aria-sort={sortConfig.key === col.key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                                            <button onClick={() => handleSort(col.key)} className={`inline-flex items-center gap-1.5 font-semibold hover:text-slate-900 ${col.align === 'center' ? 'mx-auto' : ''}`}>
                                                {col.label} <SortIcon column={col.key} />
                                            </button>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-6 text-slate-500 animate-pulse">Memuat transaksi...</td></tr>
                                ) : sortedLastSales.length > 0 ? (
                                    sortedLastSales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-slate-50">
                                            <td className="py-3 px-4 font-mono text-xs font-semibold text-blue-700">{sale.id}</td>
                                            <td className="py-3 px-4 font-medium text-slate-800">{sale.product}</td>
                                            <td className="py-3 px-4 text-center font-semibold text-slate-700">{sale.qty}</td>
                                            <td className="py-3 px-4 font-semibold text-slate-800">{formatIDR(sale.total)}</td>
                                            <td className="py-3 px-4 text-slate-500">{sale.time}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={5} className="text-center py-8 text-slate-500">Belum ada transaksi pada rentang ini.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}
