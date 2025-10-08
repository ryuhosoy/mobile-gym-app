import { router } from 'expo-router';
import { useEffect } from 'react';

export default function NavigateToHome() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('../(tabs)/home');
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
