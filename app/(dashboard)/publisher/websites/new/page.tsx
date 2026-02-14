'use client';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileSpreadsheet, Plus, Loader2, Check, AlertCircle, Download } from 'lucide-react';

export default function AddWebsitePage() {
    const router = useRouter();
    const [mode, setMode] = useState<'select' | 'single' | 'bulk'>('select');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Single website form
    const [formData, setFormData] = useState({
        domain: '',
        da: '',
        dr: '',
        traffic: '',
        niche: '',
        linkType: 'dofollow',
        turnaround: '3',
        price: '',
        samplePost: '',
    });

    // Bulk upload
    const [csvData, setCsvData] = useState('');
    const [parsedRows, setParsedRows] = useState<Array<Record<string, string>>>([]);

    const handleSingleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/publisher/websites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: formData.domain,
                    da: parseInt(formData.da),
                    dr: parseInt(formData.dr),
                    traffic: formData.traffic,
                    niche: formData.niche,
                    linkType: formData.linkType,
                    turnaround: parseInt(formData.turnaround),
                    price: Math.round(parseFloat(formData.price) * 100),
                    samplePost: formData.samplePost,
                }),
            });

            if (res.ok) {
                setSuccess('Website added successfully!');
                setTimeout(() => router.push('/publisher/websites'), 1500);
            } else {
                const data = await res.json() as any;
                setError(data.error || 'Failed to add website');
            }
        } catch {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setCsvData(text);
            parseCSV(text);
        };
        reader.readAsText(file);
    };

    const parseCSV = (text: string) => {
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
            setError('CSV must have header row and at least one data row');
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row: Record<string, string> = {};
            headers.forEach((h, i) => {
                row[h] = values[i] || '';
            });
            return row;
        });

        setParsedRows(rows);
        setError('');
    };

    const handleBulkSubmit = async () => {
        if (parsedRows.length === 0) {
            setError('No websites to upload');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/publisher/websites/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ websites: parsedRows }),
            });

            if (res.ok) {
                const data = await res.json() as any;
                setSuccess(`Successfully added ${data.count} websites!`);
                setTimeout(() => router.push('/publisher/websites'), 2000);
            } else {
                const data = await res.json() as any;
                setError(data.error || 'Failed to upload websites');
            }
        } catch {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/publisher/websites" className="p-2 rounded-lg hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Add Website</h1>
                    <p className="text-gray-600">Add websites to your portfolio</p>
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}
            {success && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <p className="text-green-800">{success}</p>
                </div>
            )}

            {/* Mode Selection */}
            {mode === 'select' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card
                        className="cursor-pointer hover:border-violet-300 hover:shadow-lg transition-all"
                        onClick={() => setMode('single')}
                    >
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                                <Plus className="w-8 h-8 text-violet-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Single Website</h3>
                            <p className="text-gray-600">Add one website with a form</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:border-violet-300 hover:shadow-lg transition-all"
                        onClick={() => setMode('bulk')}
                    >
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                                <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Bulk Upload (CSV)</h3>
                            <p className="text-gray-600">Import multiple websites from CSV</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Single Website Form */}
            {mode === 'single' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Add Single Website
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSingleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Domain *</label>
                                    <input
                                        type="url"
                                        required
                                        value={formData.domain}
                                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                        placeholder="https://yourwebsite.com"
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Niche/Category *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.niche}
                                        onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                                        placeholder="Technology, Marketing, etc."
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">DA (Domain Authority) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="100"
                                        value={formData.da}
                                        onChange={(e) => setFormData({ ...formData, da: e.target.value })}
                                        placeholder="55"
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">DR (Domain Rating)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.dr}
                                        onChange={(e) => setFormData({ ...formData, dr: e.target.value })}
                                        placeholder="50"
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Traffic</label>
                                    <input
                                        type="text"
                                        value={formData.traffic}
                                        onChange={(e) => setFormData({ ...formData, traffic: e.target.value })}
                                        placeholder="50K, 1M, etc."
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Type *</label>
                                    <select
                                        value={formData.linkType}
                                        onChange={(e) => setFormData({ ...formData, linkType: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                    >
                                        <option value="dofollow">Dofollow</option>
                                        <option value="nofollow">Nofollow</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Turnaround (days) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="30"
                                        value={formData.turnaround}
                                        onChange={(e) => setFormData({ ...formData, turnaround: e.target.value })}
                                        placeholder="3"
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest Post Price (USD) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="100.00"
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sample Post URL</label>
                                <input
                                    type="url"
                                    value={formData.samplePost}
                                    onChange={(e) => setFormData({ ...formData, samplePost: e.target.value })}
                                    placeholder="https://yourwebsite.com/sample-guest-post"
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => setMode('select')}>
                                    Back
                                </Button>
                                <Button type="submit" disabled={loading} className="gap-2">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Add Website
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Bulk Upload */}
            {mode === 'bulk' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5" />
                            Bulk Upload from CSV
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Download Template */}
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-blue-800">Download CSV Template</p>
                                    <p className="text-sm text-blue-600">Use this template format for bulk upload</p>
                                </div>
                                <a href="/website-template.csv" download>
                                    <Button variant="outline" className="gap-2">
                                        <Download className="w-4 h-4" />
                                        Download Template
                                    </Button>
                                </a>
                            </div>
                        </div>

                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleCSVUpload}
                                className="hidden"
                                id="csv-upload"
                            />
                            <label htmlFor="csv-upload" className="cursor-pointer">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-700">Upload CSV File</p>
                                <p className="text-sm text-gray-500 mt-1">Click to browse or drag and drop</p>
                            </label>
                        </div>

                        {/* Preview */}
                        {parsedRows.length > 0 && (
                            <div>
                                <p className="font-medium text-gray-900 mb-2">
                                    Preview ({parsedRows.length} websites found)
                                </p>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Domain</th>
                                                <th className="px-4 py-2 text-left">DA</th>
                                                <th className="px-4 py-2 text-left">Niche</th>
                                                <th className="px-4 py-2 text-left">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedRows.slice(0, 5).map((row, i) => (
                                                <tr key={i} className="border-t">
                                                    <td className="px-4 py-2">{row['Domains'] || row['Domain']}</td>
                                                    <td className="px-4 py-2">{row['DA']}</td>
                                                    <td className="px-4 py-2">{row['Niche']}</td>
                                                    <td className="px-4 py-2">{row['Price in USD'] || row['Price']}</td>
                                                </tr>
                                            ))}
                                            {parsedRows.length > 5 && (
                                                <tr className="border-t bg-gray-50">
                                                    <td colSpan={4} className="px-4 py-2 text-center text-gray-500">
                                                        And {parsedRows.length - 5} more...
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => setMode('select')}>
                                Back
                            </Button>
                            <Button
                                onClick={handleBulkSubmit}
                                disabled={loading || parsedRows.length === 0}
                                className="gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                Upload {parsedRows.length} Websites
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
