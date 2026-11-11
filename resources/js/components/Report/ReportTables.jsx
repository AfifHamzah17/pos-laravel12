import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { formatIDR, formatNumber } from '../../lib/format';
import { downloadCSV } from '../../lib/csv';
import { metricFormatter } from './ReportCharts';

function DataTable({ columns, rows, footer }) {
    const align = (col) => (col.numeric ? 'text-right' : 'text-left');

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600">
                <thead className="border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className={`py-3 px-4 whitespace-nowrap ${align(col)}`}>
                                <span className="inline-block max-w-[11rem] truncate align-bottom" title={col.label}>{col.label}</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {rows.map((row, i) => (
                        <tr key={row.id ?? i} className="hover:bg-slate-50">
                            {columns.map((col) => (
                                <td key={col.key} className={`py-3 px-4 ${align(col)} ${col.strong ? 'font-semibold text-slate-800' : ''}`}>
                                    {col.render ? col.render(row) : col.format ? col.format(row[col.key]) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                {footer && (
                    <tfoot className="border-t-2 border-slate-300 font-semibold text-slate-800">
                        <tr>
                            {columns.map((col) => (
                                <td key={col.key} className={`py-3 px-4 ${align(col)}`}>
                                    {col.format && footer[col.key] !== undefined ? col.format(footer[col.key]) : footer[col.key] ?? ''}
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}

const sum = (list) => list.reduce((a, b) => a + b, 0);

export default function ReportTables({ data, metric }) {
    const [tab, setTab] = useState('period');
    const { periods, series, totals, products, filters } = data;
    const fmt = metricFormatter(metric);

    // Tabel per periode: 1 seri -> semua metrik; >1 seri -> satu kolom per seri + total
    const periodTable = useMemo(() => {
        const t = totals.metrics;

        if (series.length <= 1) {
            const columns = [
                { key: 'label', label: 'Periode', strong: true },
                { key: 'transactions', label: 'Transaksi', numeric: true, format: formatNumber },
                { key: 'qty', label: 'Unit', numeric: true, format: formatNumber },
                { key: 'gross', label: 'Omset kotor', numeric: true, format: formatIDR },
                { key: 'discount', label: 'Diskon', numeric: true, format: formatIDR },
                { key: 'net', label: 'Omset bersih', numeric: true, format: formatIDR, strong: true },
            ];
            const rows = periods.map((p, i) => ({
                id: p.key,
                label: p.label,
                transactions: t.transactions[i],
                qty: t.qty[i],
                gross: t.gross[i],
                discount: t.discount[i],
                net: t.net[i],
            }));
            const footer = { label: 'Total' };
            ['transactions', 'qty', 'gross', 'discount', 'net'].forEach((k) => {
                footer[k] = sum(t[k]);
            });
            return { columns, rows, footer };
        }

        const columns = [
            { key: 'label', label: 'Periode', strong: true },
            ...series.map((s, si) => ({ key: `s${si}`, label: s.label, numeric: true, format: fmt })),
            { key: 'total', label: 'Total', numeric: true, format: fmt, strong: true },
        ];
        const rows = periods.map((p, i) => {
            const row = { id: p.key, label: p.label, total: t[metric][i] };
            series.forEach((s, si) => {
                row[`s${si}`] = s.metrics[metric][i];
            });
            return row;
        });
        const footer = { label: 'Total', total: sum(t[metric]) };
        series.forEach((s, si) => {
            footer[`s${si}`] = sum(s.metrics[metric]);
        });
        return { columns, rows, footer };
    }, [periods, series, totals, metric, fmt]);

    const productTable = useMemo(() => {
        const columns = [
            { key: 'name', label: 'Produk', strong: true },
            { key: 'brand', label: 'Merek' },
            { key: 'transactions', label: 'Transaksi', numeric: true, format: formatNumber },
            { key: 'qty', label: 'Unit', numeric: true, format: formatNumber },
            { key: 'gross', label: 'Omset kotor', numeric: true, format: formatIDR },
            { key: 'discount', label: 'Diskon', numeric: true, format: formatIDR },
            { key: 'net', label: 'Omset bersih', numeric: true, format: formatIDR, strong: true },
            {
                key: 'share',
                label: 'Kontribusi',
                numeric: true,
                render: (row) => (
                    <span className="inline-flex items-center gap-2 justify-end">
                        <span className="hidden sm:block w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <span className="block h-full bg-blue-600" style={{ width: `${Math.min(100, row.share)}%` }} />
                        </span>
                        {row.share.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%
                    </span>
                ),
            },
        ];
        const footer = { name: 'Total' };
        ['transactions', 'qty', 'gross', 'discount', 'net'].forEach((k) => {
            footer[k] = sum(products.map((p) => p[k]));
        });
        return { columns, rows: products, footer };
    }, [products]);

    const active = tab === 'period' ? periodTable : productTable;

    const exportCsv = () => {
        const name = tab === 'period' ? 'per-periode' : 'per-produk';
        downloadCSV(`laporan-tren-${name}-${filters.start_date}_${filters.end_date}.csv`, active.columns, active.rows);
    };

    return (
        <section className="panel">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
                <div className="seg" role="group" aria-label="Jenis tabel">
                    <button type="button" aria-pressed={tab === 'period'} onClick={() => setTab('period')}>Per periode</button>
                    <button type="button" aria-pressed={tab === 'product'} onClick={() => setTab('product')}>Per produk</button>
                </div>
                <button type="button" onClick={exportCsv} className="btn btn-quiet">
                    <Download size={16} /> Unduh CSV
                </button>
            </div>
            <DataTable columns={active.columns} rows={active.rows} footer={active.rows.length ? active.footer : null} />
            {active.rows.length === 0 && (
                <p className="px-5 pb-6 text-sm text-slate-500">Tidak ada data pada filter ini.</p>
            )}
        </section>
    );
}
