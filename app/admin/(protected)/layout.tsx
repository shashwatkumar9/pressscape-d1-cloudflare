import { redirect } from 'next/navigation';
import { validateAdminRequest, AdminRole } from '@/lib/admin-auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { admin, session } = await validateAdminRequest();

    if (!admin || !session) {
        redirect('/admin/login');
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <AdminSidebar role={admin.role as AdminRole} />
            <div className="pl-64">
                <AdminHeader admin={{
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                }} />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
