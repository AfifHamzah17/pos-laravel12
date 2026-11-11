import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag } from 'lucide-react';

export default function UsedDiscountManager() {
    const [usedList, setUsedList] = useState([]);

    useEffect(() => {
        axios.get('/api/discounts-used').then(res => setUsedList(res.data));
    }, []);

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Tag size={18}/> Riwayat Diskon Terpakai pada Penjualan</h3>
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-700">
                    <tr>
                        <th className="p-4">Tanggal Pembelian</th>
                        <th className="p-4">ID Transaksi</th>
                        <th className="p-4">Produk</th>
                        <th className="p-4 text-center">Diskon (%)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {usedList.map(item => (
                        <tr key={item.id}>
                            <td className="p-4">{new Date(item.created_at).toLocaleString('id-ID')}</td>
                            <td className="p-4 font-mono text-blue-600">TRX-{item.sale_id}</td>
                            <td className="p-4 font-semibold text-slate-800">{item.sale?.product?.name}</td>
                            <td className="p-4 text-center font-bold text-emerald-600">{item.discount?.discount}% OFF</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}