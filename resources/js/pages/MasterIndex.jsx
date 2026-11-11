import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductManager from '../components/Product/ProductManager';
import StockManager from '../components/Pengadaan/StockManager';
import SaleManager from '../components/Penjualan/SaleManager';
import DiscountManager from '../components/Discount/DiscountManager';
import UsedDiscountManager from '../components/UsedDiscount/UsedDiscountManager';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
    LayoutDashboard, 
    ArrowLeft, 
    Package, 
    Truck, 
    ShoppingCart, 
    Percent, 
    CheckCircle2 
} from 'lucide-react';

export default function MasterIndex() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('products');

    const tabs = [
        { id: 'products', label: 'Master Produk', icon: Package },
        { id: 'pengadaan', label: 'Pengadaan (Restock)', icon: Truck },
        { id: 'penjualan', label: 'Penjualan', icon: ShoppingCart },
        { id: 'diskon', label: 'Daftar Diskon', icon: Percent },
        { id: 'diskon-terpakai', label: 'Diskon Terpakai', icon: CheckCircle2 },
    ];

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Navbar & Navigasi Kembali */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Kelola Master Data POS</h1>
                            <p className="text-sm text-slate-500">Kelola produk, stok, transaksi penjualan, dan konfigurasi diskon</p>
                        </div>

                        {/* Tombol Kembali ke Dashboard */}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition border border-slate-200 shadow-sm"
                        >
                            <ArrowLeft size={16} />
                            <LayoutDashboard size={18} className="text-blue-600" />
                            <span>Kembali ke Dashboard</span>
                        </button>
                    </div>

                    {/* Navigation Tabs 5 Sub-menu */}
                    <div className="flex flex-wrap gap-2 pt-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                                    }`}
                                >
                                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Component Sesuai Tab Active */}
                <div className="transition-all duration-200">
                    {activeTab === 'products' && <ProductManager />}
                    {activeTab === 'pengadaan' && <StockManager />}
                    {activeTab === 'penjualan' && <SaleManager />}
                    {activeTab === 'diskon' && <DiscountManager />}
                    {activeTab === 'diskon-terpakai' && <UsedDiscountManager />}
                </div>

            </div>
        </div>
    );
}