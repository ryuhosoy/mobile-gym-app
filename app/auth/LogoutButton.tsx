import { useRouter } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export const LogoutButton = () => {
  const router = useRouter();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/auth/login'); // ログイン画面へリダイレクト
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleLogout}>
      <Text style={styles.buttonText}>ログアウト</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
