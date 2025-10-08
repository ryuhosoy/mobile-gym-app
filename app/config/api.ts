// API設定ファイル
export const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

if (!GOOGLE_PLACES_API_KEY) {
  throw new Error('EXPO_PUBLIC_GOOGLE_PLACES_API_KEY is not defined');
}
