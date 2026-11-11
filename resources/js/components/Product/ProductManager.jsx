import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { FormModal, ConfirmDeleteModal } from '../Common/Modal';

export default function ProductManager() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', description: '', price: '', stock: 0 });
    const [displayPrice, setDisplayPrice] = useState('');
    
    // Modal states
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/products');
            setProducts(res.data);
        } catch (err) {
            toast.error('Gagal memuat data produk');
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const formatThousand = (val) => {
        if (!val) return '';
        const rawNum = val.toString().replace(/\D/g, '');
        return new Intl.NumberFormat('id-ID').format(rawNum);
    };

    const handlePriceChange = (e) => {
        const value = e.target.value;
        const rawNumber = value.replace(/\D/g, '');
        if (rawNumber === '') {
            setDisplayPrice('');
            setForm({ ...form, price: '' });
        } else {
            setDisplayPrice(formatThousand(rawNumber));
            setForm({ ...form, price: rawNumber });
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/products', form);
            toast.success('Produk berhasil ditambahkan!');
            resetForm();
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Validasi gagal!');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/products/${selectedItem.id}`, form);
            toast.success('Produk berhasil diperbarui!');
            setIsEditOpen(false);
            resetForm();
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update gagal!');
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/products/${selectedItem.id}`);
            toast.success('Produk berhasil dihapus');
            setIsDeleteOpen(false);
            fetchProducts();
        } catch (err) {
            toast.error('Gagal menghapus produk');
        }
    };

    const openEditModal = (p) => {
        setSelectedItem(p);
        setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock });
        setDisplayPrice(formatThousand(p.price));
        setIsEditOpen(true);
    };

    const openDeleteModal = (p) => {
        setSelectedItem(p);
        setIsDeleteOpen(true);
    };

    const resetForm = () => {
        setForm({ name: '', description: '', price: '', stock: 0 });
        setDisplayPrice('');
        setSelectedItem(null);
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Form Tambah & Search Bar */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Plus size={18}/> Tambah Produk Baru</h3>
                    <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                    <input type="text" placeholder="Nama Produk" className="px-3 py-2 border rounded-lg text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    <input type="text" placeholder="Deskripsi" className="px-3 py-2 border rounded-lg text-sm" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-sm text-slate-400 font-medium">Rp</span>
                        <input type="text" placeholder="0" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" value={displayPrice} onChange={handlePriceChange} required />
                    </div>
                    <input type="number" min="0" placeholder="Stok Awal" className="px-3 py-2 border rounded-lg text-sm" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
                    <div className="md:col-span-4 flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                            Simpan Produk
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabel Master Produk */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-700">
                        <tr>
                            <th className="p-4">Nama Produk</th>
                            <th className="p-4">Deskripsi</th>
                            <th className="p-4">Harga</th>
                            <th className="p-4 text-center">Stok Available</th>
                            <th className="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-semibold text-slate-800">{p.name}</td>
                                    <td className="p-4 text-slate-500">{p.description || '-'}</td>
                                    <td className="p-4 font-medium text-slate-800">Rp {Number(p.price).toLocaleString('id-ID')}</td>
                                    <td className="p-4 text-center font-bold text-blue-600">{p.stock}</td>
                                    <td className="p-4 text-center space-x-2">
                                        <button onClick={() => openEditModal(p)} className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition" title="Edit">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => openDeleteModal(p)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition" title="Hapus">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-6 text-slate-400">Tidak ada produk ditemukan.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Reusable Form Modal Edit Produk */}
            <FormModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Data Produk">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Produk</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-xl text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-xl text-sm" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Harga (Rp)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-sm text-slate-400 font-medium">Rp</span>
                            <input type="text" className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm" value={displayPrice} onChange={handlePriceChange} required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Stok Available</label>
                        <input type="number" min="0" className="w-full px-3 py-2 border rounded-xl text-sm" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
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
                title="Hapus Produk?"
                message={`Apakah Anda yakin ingin menghapus produk "${selectedItem?.name}"?`}
            />
        </div>
    );
}