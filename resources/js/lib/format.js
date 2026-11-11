const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('id-ID');

export const formatIDR = (value) => idr.format(Number(value) || 0);
export const formatNumber = (value) => num.format(Number(value) || 0);

const trim = (n) => n.toLocaleString('id-ID', { maximumFractionDigits: 1 });

/** 1.250.000 -> "Rp 1,3 jt" (untuk sumbu chart & angka ringkas) */
export function formatCompactIDR(value) {
    const v = Number(value) || 0;
    const abs = Math.abs(v);
    if (abs >= 1e9) return `Rp ${trim(v / 1e9)} M`;
    if (abs >= 1e6) return `Rp ${trim(v / 1e6)} jt`;
    if (abs >= 1e3) return `Rp ${trim(v / 1e3)} rb`;
    return `Rp ${trim(v)}`;
}

/** Date -> "YYYY-MM-DD" menurut zona waktu lokal */
export function toISODate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function formatDateID(iso) {
    if (!iso) return '-';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
