"use client";
/**
 * HAZARDLINK — Root page (redirects to login or dashboard)
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '../lib/auth';

export default function RootPage() {
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!checked) {
      setChecked(true);
      if (token) router.replace('/dashboard');
      else router.replace('/login');
    }
  }, [checked, router]);

  return null;
}
