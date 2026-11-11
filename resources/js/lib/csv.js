// CSV dengan pemisah ';' + BOM agar langsung rapi saat dibuka di Excel (locale Indonesia)
export function downloadCSV(filename, columns, rows) {
    const escape = (value) => {
        const text = value === null || value === undefined ? '' : String(value);
        return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    const lines = [
        columns.map((c) => escape(c.label)).join(';'),
        ...rows.map((row) => columns.map((c) => escape(row[c.key])).join(';')),
    ];

    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
