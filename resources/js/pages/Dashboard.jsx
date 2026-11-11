import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingBag, Calendar, LogOut, RefreshCw, Layers } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Dashboard() {
    const navigate = useNavigate();
    
    // Default Filter Tanggal: 30 Hari Yang Lalu s/d Hari Ini (Agar transaksi di hari-hari sebelumnya langsung terbaca)
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(thirtyDaysAgo);
    const [endDate, setEndDate] = useState(today);

    // State Data Real dari Database
    const [chartData, setChartData] = useState([]);
    const [totalOmset, setTotalOmset] = useState(0);
    const [lastSales, setLastSales] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch Data dari Backend Laravel
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/dashboard', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                }
            });
            setChartData(Array.isArray(res.data?.chart_data) ? res.data.chart_data : []);
            setTotalOmset(res.data?.total_omset || 0);
            setLastSales(Array.isArray(res.data?.last_5_sales) ? res.data.last_5_sales : []);
        } catch (err) {
            toast.error('Gagal mengambil data dashboard dari server');
            setChartData([]);
            setLastSales([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [startDate, endDate]);

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        toast.info('Anda berhasil logout');
        navigate('/login');
    };

    const handleResetFilter = () => {
        setStartDate(thirtyDaysAgo);
        setEndDate(today);
        toast.info('Filter tanggal berhasil di-reset (30 Hari Terakhir)');
    };

    const safeChartLength = Array.isArray(chartData) ? chartData.length : 0;
    const safeLastSales = Array.isArray(lastSales) ? lastSales : [];

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Navbar Header */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Dashboard Penjualan</h1>
                        <p className="text-sm text-slate-500">Data real-time transaksi & omset dari database</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                toast.success('Membuka Master Management Data');
                                navigate('/master');
                            }}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm"
                        >
                            <Layers size={18} /> Kelola Master Data
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold transition"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>

                {/* Card Summary & Date Filter */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Omset (Database Real)</p>
                                <h2 className="text-3xl font-extrabold mt-1">{formatIDR(totalOmset)}</h2>
                            </div>
                            <div className="bg-white/20 p-3 rounded-xl">
                                <TrendingUp className="text-white" size={24} />
                            </div>
                        </div>
                        <p className="text-xs text-blue-200 mt-4">
                            Terdapat <span className="font-semibold">{safeChartLength} hari aktif</span> transaksi pada periode terpilih
                        </p>
                    </div>

                    <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-slate-700 font-semibold">
                                <Calendar size={18} className="text-blue-600" /> Filter Rentang Tanggal Omset
                            </div>
                            {loading && <span className="text-xs text-blue-600 font-medium animate-pulse">Memuat data...</span>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Tanggal Mulai</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Tanggal Akhir</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleResetFilter}
                                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
                            >
                                <RefreshCw size={14} /> Reset (30 Hari Terakhir)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grafik Omset Penjualan (Real Recharts) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Grafik Tren Omset Penjualan</h3>
                    <div className="h-72 w-full flex items-center justify-center">
                        {loading ? (
                            <div className="text-slate-400 text-sm animate-pulse">Memuat grafik penjualan...</div>
                        ) : safeChartLength > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `Rp${val / 1000}k`} />
                                    <Tooltip
                                        formatter={(value) => [formatIDR(value), 'Total Omset']}
                                        labelFormatter={(label) => `Tanggal: ${label}`}
                                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                                    />
                                    <Area type="monotone" dataKey="total_omset" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorOmset)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-slate-500 font-medium">Belum ada data omset penjualan</p>
                                <p className="text-xs text-slate-400 mt-1">Silakan sesuaikan tanggal filter atau catat transaksi penjualan di menu Master Data.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabel 5 Transaksi Terakhir */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                        <ShoppingBag size={20} className="text-blue-600" />
                        <h3 className="text-lg font-bold text-slate-800">5 Transaksi Penjualan Terakhir</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-4">Kode Transaksi (Unique ID)</th>
                                    <th className="py-3 px-4">Produk</th>
                                    <th className="py-3 px-4 text-center">Qty</th>
                                    <th className="py-3 px-4">Total</th>
                                    <th className="py-3 px-4">Waktu Transaksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-6 text-slate-400 text-sm animate-pulse">
                                            Memuat transaksi terakhir...
                                        </td>
                                    </tr>
                                ) : safeLastSales.length > 0 ? (
                                    safeLastSales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-slate-50 transition">
                                            <td className="py-3 px-4 font-mono font-bold text-xs text-blue-600">{sale.id}</td>
                                            <td className="py-3 px-4 font-medium text-slate-800">{sale.product}</td>
                                            <td className="py-3 px-4 text-center font-bold text-slate-700">{sale.qty}</td>
                                            <td className="py-3 px-4 font-semibold text-slate-800">{formatIDR(sale.total)}</td>
                                            <td className="py-3 px-4 text-xs text-slate-500">{sale.time}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-slate-400 text-sm">
                                            Belum ada transaksi penjualan yang dicatat di database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}