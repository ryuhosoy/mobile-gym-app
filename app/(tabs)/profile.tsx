import { useRouter } from 'expo-router';
import { deleteUser, getAuth } from 'firebase/auth';
import { getDatabase, ref, remove } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LogoutButton } from '../auth/LogoutButton';
import ProfileInput from '../components/ProfileInput';
import { app } from '../config/firebase';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const auth = getAuth(app);
  const db = getDatabase(app);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteAccount = () => {
    Alert.alert(
      'アカウント削除の確認',
      'アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。本当に削除しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!auth.currentUser) return;

              const userId = auth.currentUser.uid;

              // Realtime Databaseからユーザーデータを削除
              const userRef = ref(db, `users/${userId}`);
              await remove(userRef);

              // レビューデータなども削除（必要に応じて）
              // 他のユーザーデータがあれば、ここで削除

              // Firebase Authenticationからユーザーを削除
              await deleteUser(auth.currentUser);

              Alert.alert(
                '削除完了',
                'アカウントが正常に削除されました。',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/auth/login'),
                  },
                ]
              );
            } catch (error: any) {
              console.error('アカウント削除エラー:', error);
              
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  'エラー',
                  'セキュリティのため、アカウント削除には再ログインが必要です。一度ログアウトして再度ログインしてから削除してください。'
                );
              } else {
                Alert.alert(
                  'エラー',
                  'アカウントの削除に失敗しました。もう一度お試しください。'
                );
              }
            }
          },
        },
      ]
    );
  };

  if (!user) {
    // 未ログイン時の表示
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <Text style={styles.notLoggedInTitle}>プロフィール</Text>
          <Text style={styles.notLoggedInText}>
            プロフィール機能を利用するにはログインが必要です
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>ログイン / 新規登録</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ログイン済みの表示
  return (
    <ScrollView style={styles.container}>
      <ProfileInput />
      <LogoutButton />
      
      {/* アカウント削除ボタン */}
      <View style={styles.dangerZone}>
        <Text style={styles.dangerZoneTitle}>危険な操作</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>アカウントを削除</Text>
        </TouchableOpacity>
        <Text style={styles.deleteWarning}>
          ※ アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  notLoggedInText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#6B4DE6',
    padding: 15,
    borderRadius: 10,
    width: '80%',
  },
  loginButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerZone: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#fff5f5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#cc0000',
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteWarning: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
