'use client';

export const runtime = "edge";



import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileSpreadsheet, Loader2, CheckCircle, XCircle, Download } from 'lucide-react';
import Link from 'next/link';

interface BulkResult {
    success: number;
    failed: number;
    errors: string[];
}

export default function BulkImportPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [csvData, setCsvData] = useState('');
    const [result, setResult] = useState<BulkResult | null>(null);

    const sampleCsv = `domain,name,owner_email,da,dr,traffic,price_guest_post,price_link_insertion,category,turnaround_days
techblog.com,Tech Blog,publisher@example.com,45,50,15000,150,75,tech,7
marketingsite.com,Marketing Insights,publisher@example.com,55,60,25000,200,100,marketing,5
healthnews.com,Health News Daily,publisher@example.com,40,45,10000,100,50,health,10`;

    const handleImport = async () => {
        if (!csvData.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/admin/websites/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csv: csvData }),
            });

            const data = await response.json() as any;

            if (!response.ok) {
                throw new Error(data.error || 'Import failed');
            }

            setResult(data);
        } catch (err) {
            setResult({
                success: 0,
                failed: 0,
                errors: [err instanceof Error ? err.message : 'An error occurred'],
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setCsvData(event.target?.result as string);
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/websites" className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Bulk Import</h1>
                    <p className="text-slate-400 mt-1">Import multiple websites from CSV</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Instructions */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-orange-400" />
                            CSV Format
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Use the following column format for your CSV file
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm text-slate-300">
                            <p className="mb-2">Required columns:</p>
                            <ul className="list-disc list-inside text-slate-400 space-y-1">
                                <li><code className="text-orange-400">domain</code> - Website domain (e.g., example.com)</li>
                                <li><code className="text-orange-400">name</code> - Website name</li>
                                <li><code className="text-orange-400">owner_email</code> - Owner's email (must exist)</li>
                                <li><code className="text-orange-400">price_guest_post</code> - Price in USD</li>
                            </ul>
                        </div>

                        <div className="text-sm text-slate-300">
                            <p className="mb-2">Optional columns:</p>
                            <ul className="list-disc list-inside text-slate-400 space-y-1">
                                <li><code className="text-slate-500">da</code> - Domain Authority (0-100)</li>
                                <li><code className="text-slate-500">dr</code> - Domain Rating (0-100)</li>
                                <li><code className="text-slate-500">traffic</code> - Monthly organic traffic</li>
                                <li><code className="text-slate-500">price_link_insertion</code> - Price in USD</li>
                                <li><code className="text-slate-500">category</code> - Category slug</li>
                                <li><code className="text-slate-500">turnaround_days</code> - Days to complete</li>
                            </ul>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 gap-2"
                            onClick={() => setCsvData(sampleCsv)}
                        >
                            <Download className="w-4 h-4" />
                            Load Sample CSV
                        </Button>
                    </CardContent>
                </Card>

                {/* Import Form */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Upload className="w-5 h-5 text-orange-400" />
                            Import Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* File Upload */}
                        <div>
                            <label className="block w-full p-4 border-2 border-dashed border-slate-600 rounded-lg text-center cursor-pointer hover:border-orange-500 transition-colors">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                                <p className="text-slate-300">Click to upload CSV file</p>
                                <p className="text-xs text-slate-500 mt-1">or paste data below</p>
                            </label>
                        </div>

                        {/* Text Area */}
                        <textarea
                            value={csvData}
                            onChange={(e) => setCsvData(e.target.value)}
                            placeholder="Paste CSV data here..."
                            rows={10}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 font-mono text-sm"
                        />

                        {/* Result */}
                        {result && (
                            <div className={`p-4 rounded-lg ${result.errors.length > 0 && result.success === 0 ? 'bg-red-900/30 border border-red-700' : 'bg-green-900/30 border border-green-700'}`}>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="flex items-center gap-2 text-green-400">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">{result.success} imported</span>
                                    </div>
                                    {result.failed > 0 && (
                                        <div className="flex items-center gap-2 text-red-400">
                                            <XCircle className="w-5 h-5" />
                                            <span className="font-medium">{result.failed} failed</span>
                                        </div>
                                    )}
                                </div>
                                {result.errors.length > 0 && (
                                    <div className="text-sm text-red-300 mt-2">
                                        {result.errors.slice(0, 5).map((err, i) => (
                                            <p key={i}>• {err}</p>
                                        ))}
                                        {result.errors.length > 5 && (
                                            <p className="text-slate-400">...and {result.errors.length - 5} more errors</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 gap-2"
                            onClick={handleImport}
                            disabled={loading || !csvData.trim()}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Import Websites
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
