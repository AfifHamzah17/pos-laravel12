import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShoppingCart, Trash2, Search, Tag } from 'lucide-react';
import { ConfirmDeleteModal } from '../Common/Modal';

export default function SaleManager() {
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [search, setSearch] = useState('');

    // Function pendukung format datetime-local (YYYY-MM-DDTHH:mm)
    const getNowFormatted = () => {
        const now = new Date();
        return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
    };

    // State form: transaction_date diinisialisasi langsung dengan tanggal & jam saat ini
    const [form, setForm] = useState({ 
        product_id: '', 
        qty: 1, 
        transaction_date: getNowFormatted() 
    });
    
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const loadData = async () => {
        try {
            const [resProd, resSales] = await Promise.all([
                axios.get('/api/products'),
                axios.get('/api/sales')
            ]);
            setProducts(resProd.data);
            setSales(resSales.data);
        } catch (err) {
            toast.error('Gagal memuat data penjualan');
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/sales', form);
            toast.success(`${res.data.message} (${res.data.trx_code})`);
            
            // Reset form dan set kembali tanggal default ke waktu saat ini
            setForm({ 
                product_id: '', 
                qty: 1, 
                transaction_date: getNowFormatted() 
            });
            loadData();
        } catch (err) {
            const msg = err.response?.data?.message || 'Transaksi Penjualan Gagal!';
            toast.error(msg);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/sales/${selectedItem.id}`);
            toast.success('Transaksi penjualan berhasil dibatalkan & stok dikembalikan');
            setIsDeleteOpen(false);
            loadData();
        } catch (err) {
            toast.error('Gagal menghapus transaksi penjualan');
        }
    };

    const filteredSales = sales.filter(s => 
        (s.trx_code && s.trx_code.toLowerCase().includes(search.toLowerCase())) ||
        (s.product?.name && s.product.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <ShoppingCart size={18}/> Transaksi Penjualan Baru
                    </h3>
                    <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari ID Kode / Produk..."
                            className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Produk</label>
                        <select className="w-full px-3 py-2 border rounded-lg text-sm" value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} required>
                            <option value="">-- Pilih Produk --</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Jumlah (Qty)</label>
                        <input type="number" min="1" placeholder="Qty Penjualan" className="w-full px-3 py-2 border rounded-lg text-sm" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} required />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal & Waktu Transaksi</label>
                        <input 
                            type="datetime-local" 
                            max={getNowFormatted()} 
                            className="w-full px-3 py-2 border rounded-lg text-sm" 
                            value={form.transaction_date} 
                            onChange={e => setForm({...form, transaction_date: e.target.value})} 
                            required
                        />
                    </div>

                    <div className="flex items-end">
                        <button type="submit" className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                            Simpan Transaksi
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-700">
                        <tr>
                            <th className="p-4">Kode Transaksi (Unique ID)</th>
                            <th className="p-4">Tanggal Pembelian</th>
                            <th className="p-4">Produk</th>
                            <th className="p-4 text-center">Qty</th>
                            <th className="p-4 text-center">Diskon Otomatis</th>
                            <th className="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredSales.length > 0 ? (
                            filteredSales.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-mono font-bold text-xs text-blue-600">
                                        <span className="flex items-center gap-1">
                                            <Tag size={12} /> {s.trx_code || `TRX-${String(s.id).padStart(4, '0')}`}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-slate-700">
                                        {new Date(s.created_at).toLocaleString('id-ID', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </td>
                                    <td className="p-4 font-semibold text-slate-800">{s.product?.name}</td>
                                    <td className="p-4 text-center font-bold text-slate-800">{s.qty}</td>
                                    <td className="p-4 text-center">
                                        {s.discounts && s.discounts.length > 0 ? (
                                            <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold">
                                                {parseFloat((Number(s.discounts[0].discount) * 100).toFixed(2))}% OFF
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => { setSelectedItem(s); setIsDeleteOpen(true); }} 
                                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition" 
                                            title="Batalkan/Hapus"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-6 text-slate-400">Transaksi penjualan tidak ditemukan.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmDeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Transaksi Penjualan?"
                message={`Yakin ingin menghapus transaksi "${selectedItem?.trx_code}" (${selectedItem?.product?.name})? Stok produk akan otomatis dikembalikan.`}
            />
        </div>
    );
}