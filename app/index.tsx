import { Redirect } from 'expo-router';

export default function Index() {
  // ログインなしでホーム画面にリダイレクト
  return <Redirect href="/(tabs)/home" />;
}
