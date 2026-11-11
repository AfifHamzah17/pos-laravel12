import React, { useState } from 'react';
import { Package, Truck, ShoppingCart, Percent, CheckCircle2 } from 'lucide-react';
import AppShell from '../components/Layout/AppShell';
import ProductManager from '../components/Product/ProductManager';
import StockManager from '../components/Pengadaan/StockManager';
import SaleManager from '../components/Penjualan/SaleManager';
import DiscountManager from '../components/Discount/DiscountManager';
import UsedDiscountManager from '../components/UsedDiscount/UsedDiscountManager';

const TABS = [
    { id: 'products', label: 'Produk', icon: Package, Component: ProductManager },
    { id: 'pengadaan', label: 'Pengadaan stok', icon: Truck, Component: StockManager },
    { id: 'penjualan', label: 'Penjualan', icon: ShoppingCart, Component: SaleManager },
    { id: 'diskon', label: 'Diskon', icon: Percent, Component: DiscountManager },
    { id: 'diskon-terpakai', label: 'Diskon terpakai', icon: CheckCircle2, Component: UsedDiscountManager },
];

export default function MasterIndex() {
    const [activeTab, setActiveTab] = useState('products');
    const Active = TABS.find((tab) => tab.id === activeTab).Component;

    return (
        <AppShell
            title="Master data"
            subtitle="Kelola produk, stok masuk, transaksi penjualan, dan promo diskon."
        >
            <div className="space-y-5">
                <div role="tablist" aria-label="Master data" className="flex flex-wrap gap-1 border-b border-slate-200">
                    {TABS.map(({ id, label, icon: Icon }) => {
                        const isActive = activeTab === id;
                        return (
                            <button
                                key={id}
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setActiveTab(id)}
                                className={`-mb-px flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                                    isActive
                                        ? 'border-blue-600 text-blue-700'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Icon size={16} /> {label}
                            </button>
                        );
                    })}
                </div>

                <Active key={activeTab} />
            </div>
        </AppShell>
    );
}
