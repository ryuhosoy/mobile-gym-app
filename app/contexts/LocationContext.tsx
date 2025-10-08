import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationContextType {
  userLocation: Location.LocationObject | null;
  loading: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextType>({
  userLocation: null,
  loading: true,
  error: null,
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('位置情報の許可が必要です');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      } catch (err) {
        setError('位置情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <LocationContext.Provider value={{ userLocation, loading, error }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext); 