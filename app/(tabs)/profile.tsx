import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { LogoutButton } from '../auth/LogoutButton';
import ProfileInput from '../components/ProfileInput';
import { getAuth } from 'firebase/auth';
import { app } from '../config/firebase';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const auth = getAuth(app);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
});
