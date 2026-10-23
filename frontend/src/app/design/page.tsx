import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { isValidAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default function DesignSystemPage() {
  const cookieStore = cookies();
  const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  // Unfinished/internal design page restricted to verified administrators
  if (!isValidAdminToken(adminToken)) {
    notFound();
  }

  return (
    <div className="p-8 text-center font-sans">
      <h1 className="text-2xl font-bold">Design System (Admin View)</h1>
      <p className="text-gray-600 mt-2">Internal brand token reference.</p>
    </div>
  );
}
