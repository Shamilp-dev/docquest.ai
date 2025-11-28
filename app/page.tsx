import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import KnowledgeDashboard from './knowledgeDashboard';
import { ActivityTracker } from './components/Activity/ActivityTracker';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Redirect admins to admin dashboard
  if (session.user.role === 'admin') {
    redirect('/admin');
  }

  return (
    <>
      <ActivityTracker />
      <KnowledgeDashboard user={session.user} />
    </>
  );
}
