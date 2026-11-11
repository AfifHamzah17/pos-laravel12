import React, { useMemo, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

/**
 * Pemilih produk untuk filter laporan. Pilihan disimpan dulu sebagai draft dan baru
 * dikirim ke server saat "Terapkan" ditekan, supaya mencentang banyak produk tidak
 * memicu banyak request.
 */
export default function ProductPicker({ options, selected, onApply }) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(selected);
    const [query, setQuery] = useState('');

    const groups = useMemo(() => {
        const q = query.trim().toLowerCase();
        const visible = options.filter((o) => o.name.toLowerCase().includes(q));
        const brands = [...new Set(visible.map((o) => o.brand))];
        return brands.map((brand) => ({ brand, items: visible.filter((o) => o.brand === brand) }));
    }, [options, query]);

    const toggle = (id) =>
        setDraft((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const toggleGroup = (items) => {
        const ids = items.map((i) => i.id);
        const allChecked = ids.every((id) => draft.includes(id));
        setDraft((prev) =>
            allChecked ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]
        );
    };

    const openPanel = () => {
        setDraft(selected);
        setQuery('');
        setOpen(true);
    };

    const apply = (ids) => {
        onApply(ids);
        setOpen(false);
    };

    const label = selected.length === 0 ? 'Semua produk' : `${selected.length} produk dipilih`;

    return (
        <div>
            <button
                type="button"
                onClick={() => (open ? setOpen(false) : openPanel())}
                aria-expanded={open}
                className="btn btn-quiet w-full sm:w-auto justify-between min-w-[13rem]"
            >
                <span>{label}</span>
                <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="mt-3 panel p-4 shadow-md">
                    <div className="relative max-w-sm">
                        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari produk atau merek..."
                            className="field pl-9"
                            aria-label="Cari produk"
                        />
                    </div>

                    <div className="mt-4 max-h-80 overflow-y-auto pr-1 space-y-5">
                        {groups.length === 0 && (
                            <p className="text-sm text-slate-500">Tidak ada produk yang cocok.</p>
                        )}
                        {groups.map(({ brand, items }) => {
                            const allChecked = items.every((i) => draft.includes(i.id));
                            return (
                                <fieldset key={brand}>
                                    <legend className="w-full flex items-center justify-between mb-2">
                                        <span className="font-display text-xl font-semibold text-slate-800">{brand}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleGroup(items)}
                                            className="text-xs font-semibold text-blue-700 hover:underline"
                                        >
                                            {allChecked ? 'Batal pilih semua' : 'Pilih semua'}
                                        </button>
                                    </legend>
                                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-1">
                                        {items.map((item) => (
                                            <label key={item.id} className="flex items-start gap-2 py-1 text-sm text-slate-700 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={draft.includes(item.id)}
                                                    onChange={() => toggle(item.id)}
                                                    className="mt-0.5 accent-[#0e5a5a]"
                                                />
                                                <span>{item.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-slate-500">
                            {draft.length === 0 ? 'Tidak ada yang dipilih berarti semua produk.' : `${draft.length} produk dipilih`}
                        </p>
                        <div className="flex gap-2">
                            <button type="button" className="btn btn-quiet" onClick={() => apply([])}>
                                Semua produk
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => apply(draft)}>
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
