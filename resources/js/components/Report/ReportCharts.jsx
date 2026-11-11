import React from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatIDR, formatNumber, formatCompactIDR } from '../../lib/format';
import { seriesColor } from '../../lib/palette';

export const METRICS = [
    { id: 'net', label: 'Omset bersih' },
    { id: 'qty', label: 'Unit terjual' },
    { id: 'transactions', label: 'Transaksi' },
];

export const metricFormatter = (metric) => (metric === 'net' || metric === 'gross' || metric === 'discount' ? formatIDR : formatNumber);

const AXIS = { stroke: '#7a8783', fontSize: 12, tickLine: false, axisLine: false };
const TOOLTIP_STYLE = { borderRadius: 6, borderColor: '#dde1df', fontSize: 13 };

function Empty({ children }) {
    return <div className="h-full grid place-items-center text-sm text-slate-500 text-center px-6">{children}</div>;
}

/** Tren per periode: satu garis per seri (total / brand / produk). */
export function TrendChart({ periods, series, metric }) {
    if (!periods.length || !series.length) return <Empty>Belum ada data untuk ditampilkan.</Empty>;

    const rows = periods.map((period, i) => {
        const row = { label: period.label };
        series.forEach((s, si) => {
            row[`s${si}`] = s.metrics[metric][i];
        });
        return row;
    });
    const fmt = metricFormatter(metric);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#dde1df" />
                <XAxis dataKey="label" {...AXIS} minTickGap={16} />
                <YAxis {...AXIS} width={metric === 'net' ? 76 : 48} tickFormatter={metric === 'net' ? formatCompactIDR : formatNumber} />
                <Tooltip formatter={(value, name) => [fmt(value), name]} contentStyle={TOOLTIP_STYLE} />
                {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />}
                {series.map((s, si) => (
                    <Line
                        key={s.key}
                        type="monotone"
                        dataKey={`s${si}`}
                        name={s.label}
                        stroke={seriesColor(si)}
                        strokeWidth={2.5}
                        dot={rows.length <= 31 ? { r: 3 } : false}
                        activeDot={{ r: 5 }}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}

/** Omset kotor terbagi menjadi omset bersih + potongan diskon per periode. */
export function CompositionChart({ periods, totals }) {
    if (!periods.length) return <Empty>Belum ada data untuk ditampilkan.</Empty>;

    const rows = periods.map((period, i) => ({
        label: period.label,
        net: totals.metrics.net[i],
        discount: totals.metrics.discount[i],
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#dde1df" />
                <XAxis dataKey="label" {...AXIS} minTickGap={16} />
                <YAxis {...AXIS} width={76} tickFormatter={formatCompactIDR} />
                <Tooltip formatter={(value, name) => [formatIDR(value), name]} contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#eef0ef' }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="net" name="Omset bersih" stackId="omset" fill="#0e5a5a" />
                <Bar dataKey="discount" name="Potongan diskon" stackId="omset" fill="#f2b705" />
            </BarChart>
        </ResponsiveContainer>
    );
}

/** Peringkat produk berdasarkan omset bersih (maks. 8). */
export function TopProductsChart({ products }) {
    const rows = products.filter((p) => p.net > 0).slice(0, 8);
    if (!rows.length) return <Empty>Belum ada penjualan pada filter ini.</Empty>;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="#dde1df" />
                <XAxis type="number" {...AXIS} tickFormatter={formatCompactIDR} />
                <YAxis
                    type="category"
                    dataKey="name"
                    {...AXIS}
                    width={168}
                    tickFormatter={(value) => (value.length > 26 ? `${value.slice(0, 25)}…` : value)}
                />
                <Tooltip formatter={(value) => [formatIDR(value), 'Omset bersih']} contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#eef0ef' }} />
                <Bar dataKey="net" fill="#0e5a5a" radius={[0, 3, 3, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
