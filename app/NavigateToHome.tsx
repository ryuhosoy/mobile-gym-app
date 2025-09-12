import { useEffect } from 'react';
import { router } from 'expo-router';

export default function NavigateToHome() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('../(tabs)/home');
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
