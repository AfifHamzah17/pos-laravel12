import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Percent, Pencil, Trash2, Search } from 'lucide-react';
import { FormModal, ConfirmDeleteModal } from '../Common/Modal';

export default function DiscountManager() {
    const [products, setProducts] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ product_id: '', discount: '', start_date: '', end_date: '' });
    
    // Modal states
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const loadData = async () => {
        const [resProd, resDisc] = await Promise.all([
            axios.get('/api/products'),
            axios.get('/api/discounts')
        ]);
        setProducts(resProd.data);
        setDiscounts(resDisc.data);
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/discounts', form);
            toast.success('Diskon berhasil dikonfigurasi!');
            resetForm();
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan diskon');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/discounts/${selectedItem.id}`, form);
            toast.success('Diskon berhasil diperbarui!');
            setIsEditOpen(false);
            resetForm();
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update diskon gagal!');
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/discounts/${selectedItem.id}`);
            toast.success('Diskon berhasil dihapus');
            setIsDeleteOpen(false);
            loadData();
        } catch (err) {
            toast.error('Gagal menghapus diskon');
        }
    };

    const openEditModal = (d) => {
        setSelectedItem(d);
        const sd = d.sales_discounts?.[0];
        setForm({
            product_id: d.product_id,
            discount: d.discount_percentage ?? parseFloat((Number(d.discount) * 100).toFixed(2)),
            start_date: sd?.start_date ? sd.start_date.replace(' ', 'T').slice(0, 16) : '',
            end_date: sd?.end_date ? sd.end_date.replace(' ', 'T').slice(0, 16) : '',
        });
        setIsEditOpen(true);
    };

    const openDeleteModal = (d) => {
        setSelectedItem(d);
        setIsDeleteOpen(true);
    };

    const resetForm = () => {
        setForm({ product_id: '', discount: '', start_date: '', end_date: '' });
        setSelectedItem(null);
    };

    const filteredDiscounts = discounts.filter(d => 
        d.product?.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Percent size={18}/> Buat Diskon Produk (%)</h3>
                    <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari diskon produk..."
                            className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select className="px-3 py-2 border rounded-lg text-sm" value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} required>
                        <option value="">-- Pilih Produk --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" step="0.1" max="100" placeholder="Diskon (%)" className="px-3 py-2 border rounded-lg text-sm" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} required />
                    <input type="datetime-local" className="px-3 py-2 border rounded-lg text-sm" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required />
                    <input type="datetime-local" className="px-3 py-2 border rounded-lg text-sm" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} required />
                    <div className="md:col-span-4 flex justify-end">
                        <button type="submit" className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                            Simpan Diskon
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-700">
                        <tr>
                            <th className="p-4">Produk</th>
                            <th className="p-4">Besar Diskon</th>
                            <th className="p-4 text-center">Jumlah Kali Digunakan</th>
                            <th className="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredDiscounts.length > 0 ? (
                            filteredDiscounts.map(d => (
                                <tr key={d.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-semibold text-slate-800">{d.product?.name}</td>
                                    <td className="p-4 font-bold text-purple-600">{d.discount_percentage ?? parseFloat((Number(d.discount) * 100).toFixed(2))}%</td>
                                    <td className="p-4 text-center font-bold text-slate-700">{d.total_used || 0} kali</td>
                                    <td className="p-4 text-center space-x-2">
                                        <button onClick={() => openEditModal(d)} className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition" title="Edit">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => openDeleteModal(d)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition" title="Hapus">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-6 text-slate-400">Konfigurasi diskon tidak ditemukan.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Reusable Form Modal Edit Diskon */}
            <FormModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Configuration Diskon">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Produk</label>
                        <select className="w-full px-3 py-2 border rounded-xl text-sm" value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} required>
                            <option value="">-- Pilih Produk --</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Besar Diskon (%)</label>
                        <input type="number" step="0.1" max="100" className="w-full px-3 py-2 border rounded-xl text-sm" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Mulai (Start Date)</label>
                        <input type="datetime-local" className="w-full px-3 py-2 border rounded-xl text-sm" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Berakhir (End Date)</label>
                        <input type="datetime-local" className="w-full px-3 py-2 border rounded-xl text-sm" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} required />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 border rounded-xl text-sm font-semibold text-slate-600">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold">Simpan Perubahan</button>
                    </div>
                </form>
            </FormModal>

            {/* Reusable Confirm Delete Modal */}
            <ConfirmDeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Diskon?"
                message={`Apakah Anda yakin ingin menghapus konfigurasi diskon untuk "${selectedItem?.product?.name}"?`}
            />
        </div>
    );
}