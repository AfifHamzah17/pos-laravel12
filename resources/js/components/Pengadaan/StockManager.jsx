import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Truck, Trash2, Search } from 'lucide-react';
import { ConfirmDeleteModal } from '../Common/Modal';

export default function StockManager() {
    const [products, setProducts] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ product_id: '', qty: 1 });
    
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const loadData = async () => {
        const [resProd, resStock] = await Promise.all([
            axios.get('/api/products'),
            axios.get('/api/stocks')
        ]);
        setProducts(resProd.data);
        setStocks(resStock.data);
    };

    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/stocks', form);
            toast.success('Pengadaan stok berhasil dicatat!');
            setForm({ product_id: '', qty: 1 });
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menambah pengadaan');
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/stocks/${selectedItem.id}`);
            toast.success('Pengadaan berhasil dihapus');
            setIsDeleteOpen(false);
            loadData();
        } catch (err) {
            toast.error('Gagal menghapus pengadaan');
        }
    };

    const filteredStocks = stocks.filter(s => 
        s.product?.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Truck size={18}/> Form Restock / Pengadaan Barang</h3>
                    <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari pengadaan produk..."
                            className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select className="px-3 py-2 border rounded-lg text-sm" value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} required>
                        <option value="">-- Pilih Produk --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>)}
                    </select>
                    <input type="number" min="1" placeholder="Jumlah Restock" className="px-3 py-2 border rounded-lg text-sm" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} required />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Tambah Pengadaan</button>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-700">
                        <tr>
                            <th className="p-4">Tanggal Restock</th>
                            <th className="p-4">Produk</th>
                            <th className="p-4 text-center">Jumlah Masuk (Qty)</th>
                            <th className="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredStocks.length > 0 ? (
                            filteredStocks.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50">
                                    <td className="p-4">{new Date(s.created_at).toLocaleString('id-ID')}</td>
                                    <td className="p-4 font-semibold text-slate-800">{s.product?.name}</td>
                                    <td className="p-4 text-center font-bold text-emerald-600">+{s.qty}</td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => { setSelectedItem(s); setIsDeleteOpen(true); }} 
                                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition" 
                                            title="Hapus"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-6 text-slate-400">Riwayat pengadaan tidak ditemukan.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmDeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Riwayat Pengadaan?"
                message={`Yakin ingin menghapus catatan pengadaan stok "${selectedItem?.product?.name}"?`}
            />
        </div>
    );
}