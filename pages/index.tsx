import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check for token in URL parameters
    const { token } = router.query;
    if (token && typeof token === 'string') {
      // Store token in localStorage
      localStorage.setItem('auth_token', token);
      // Remove token from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [router.query]);

  // ... rest of your component code ...
} 