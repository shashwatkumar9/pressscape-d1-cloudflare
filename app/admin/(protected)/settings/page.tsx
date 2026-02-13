export const runtime = "edge";

import { validateAdminRequest } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Save } from 'lucide-react';



export default async function AdminSettingsPage() {
    const { admin } = await validateAdminRequest();

    // Only super_admin and admin can access settings
    if (admin?.role !== 'super_admin' && admin?.role !== 'admin') {
        return (
            <div className="text-center py-12">
                <Settings className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                <p className="text-slate-400">You don't have permission to access settings.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-slate-400 mt-1">Configure platform settings</p>
            </div>

            {/* Commission Settings */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Commission Rates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Platform Commission (%)
                            </label>
                            <input
                                type="number"
                                defaultValue={25}
                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                            />
                            <p className="text-xs text-slate-400 mt-1">Deducted from publisher earnings</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Affiliate Commission (%)
                            </label>
                            <input
                                type="number"
                                defaultValue={7.5}
                                step={0.1}
                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                            />
                            <p className="text-xs text-slate-400 mt-1">Paid to affiliates from order total</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Maintenance Mode */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Maintenance Mode</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-300">Enable maintenance mode</p>
                            <p className="text-sm text-slate-400">Users will see a maintenance page when enabled</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Payout Settings */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Payout Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Minimum Payout ($)
                            </label>
                            <input
                                type="number"
                                defaultValue={50}
                                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Payout Frequency
                            </label>
                            <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                                <option>Weekly</option>
                                <option>Bi-Weekly</option>
                                <option>Monthly</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 gap-2">
                    <Save className="w-4 h-4" />
                    Save Settings
                </Button>
            </div>
        </div>
    );
}
