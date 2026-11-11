import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag } from 'lucide-react';

export default function UsedDiscountManager() {
    const [usedList, setUsedList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/discounts-used')
            .then(res => {
                setUsedList(Array.isArray(res.data) ? res.data : []);
            })
            .catch(err => {
                console.error("Gagal memuat riwayat diskon:", err);
                setUsedList([]);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Tag size={18} className="text-blue-600" /> Riwayat Diskon Terpakai pada Penjualan
            </h3>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-700">
                        <tr>
                            <th className="p-4">Tanggal Pembelian</th>
                            <th className="p-4">Kode / ID Transaksi</th>
                            <th className="p-4">Produk</th>
                            <th className="p-4 text-center">Diskon (%)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-6 text-slate-400 animate-pulse">
                                    Memuat riwayat penggunaan diskon...
                                </td>
                            </tr>
                        ) : usedList.length > 0 ? (
                            usedList.map(item => {
                                // 1. Konversi float desimal (0.21) ke Persentase (21%)
                                const discountValue = item.discount?.discount ? Number(item.discount.discount) : 0;
                                const discountPercentage = discountValue <= 1 ? (discountValue * 100).toFixed(0) : discountValue;

                                // 2. Tampilkan Kode Transaksi Unik (trx_code) atau ID (sales_id)
                                const transactionCode = item.sale?.trx_code || (item.sales_id ? `TRX-#${item.sales_id}` : '-');

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4 text-xs text-slate-500">
                                            {item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'}
                                        </td>
                                        <td className="p-4 font-mono font-bold text-xs text-blue-600">
                                            {transactionCode}
                                        </td>
                                        <td className="p-4 font-medium text-slate-800">
                                            {item.sale?.product?.name || '-'}
                                        </td>
                                        <td className="p-4 text-center font-bold text-emerald-600">
                                            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs">
                                                {discountPercentage}% OFF
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-slate-400">
                                    Belum ada diskon yang terpakai pada transaksi penjualan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}