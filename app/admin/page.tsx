import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Check if user is admin - redirect non-admins to main dashboard
  if (session.user.role !== 'admin') {
    redirect('/');
  }
  
  return <AdminDashboard />;
}