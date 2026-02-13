export const runtime = "edge";

import { sql } from '@/lib/db';
import { validateAdminRequest } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCog, Plus, Edit, Ban, Shield, Briefcase, FileText, Headphones, PenTool } from 'lucide-react';



async function getEmployees() {
    try {
        const result = await sql`
      SELECT id, email, name, role, is_active, last_login_at, created_at
      FROM admin_users
      ORDER BY 
        CASE role 
          WHEN 'super_admin' THEN 1 
          WHEN 'admin' THEN 2 
          WHEN 'finance_manager' THEN 3 
          WHEN 'content_manager' THEN 4 
          WHEN 'support_agent' THEN 5 
          WHEN 'editor' THEN 6 
        END,
        created_at DESC
    `;
        return result.rows;
    } catch (error) {
        console.error('Error fetching employees:', error);
        return [];
    }
}

const roleConfig: Record<string, { label: string; color: string; icon: any }> = {
    super_admin: { label: 'Super Admin', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Shield },
    admin: { label: 'Admin', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: UserCog },
    finance_manager: { label: 'Finance Manager', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: Briefcase },
    content_manager: { label: 'Content Manager', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', icon: FileText },
    support_agent: { label: 'Support Agent', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Headphones },
    editor: { label: 'Editor', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', icon: PenTool },
};

export default async function AdminEmployeesPage() {
    const { admin } = await validateAdminRequest();
    const employees = await getEmployees();

    // Only super_admin can access this page
    if (admin?.role !== 'super_admin') {
        return (
            <div className="text-center py-12">
                <Shield className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                <p className="text-slate-400">Only Super Admins can manage employees.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Employees</h1>
                    <p className="text-slate-400 mt-1">Manage admin team members</p>
                </div>
                <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 gap-2">
                    <Plus className="w-4 h-4" />
                    Add Employee
                </Button>
            </div>

            {/* Role Legend */}
            <div className="flex flex-wrap gap-2">
                {Object.entries(roleConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                        <span key={key} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border ${config.color}`}>
                            <Icon className="w-3 h-3" />
                            {config.label}
                        </span>
                    );
                })}
            </div>

            {/* Employees Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((employee: any) => {
                    const role = roleConfig[employee.role] || roleConfig.editor;
                    const RoleIcon = role.icon;
                    return (
                        <Card key={employee.id} className="bg-slate-800 border-slate-700">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-medium text-lg">
                                            {employee.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{employee.name}</div>
                                            <div className="text-sm text-slate-400">{employee.email}</div>
                                        </div>
                                    </div>
                                    {employee.role !== 'super_admin' && (
                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${role.color}`}>
                                        <RoleIcon className="w-3 h-3" />
                                        {role.label}
                                    </span>
                                    {!employee.is_active && (
                                        <span className="text-xs text-red-400">Inactive</span>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
                                    <span>Joined {new Date(employee.created_at).toLocaleDateString()}</span>
                                    {employee.last_login_at && (
                                        <span>Last login: {new Date(employee.last_login_at).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
