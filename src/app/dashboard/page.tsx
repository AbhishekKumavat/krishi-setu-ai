'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function DashboardRedirect() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userRole = (session.user as any)?.role || 'user';

      // Redirect based on user role
      switch (userRole) {
        case 'farmer':
          router.push('/marketplace');
          break;
        case 'customer':
          router.push('/customer-marketplace');
          break;
        case 'retailer':
          router.push('/retailer/dashboard');
          break;
        default:
          router.push('/marketplace');
          break;
      }
    } else if (status === 'unauthenticated') {
      // If not authenticated, redirect to login
      router.push('/login');
    }
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-lg text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}