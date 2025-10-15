import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { app } from '../config/firebase';

const auth = getAuth(app);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'ログインに失敗しました。';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'メールアドレスまたはパスワードが正しくありません。';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'メールアドレスの形式が正しくありません。';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'このアカウントは無効化されています。';
      }
      
      Alert.alert('エラー', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('エラー', 'すべての項目を入力してください');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      Alert.alert('エラー', 'パスワードは6文字以上で入力してください');
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('成功', 'アカウントが作成されました！');
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('SignUp error:', error);
      let errorMessage = 'アカウント作成に失敗しました。';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'このメールアドレスは既に使用されています。';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'メールアドレスの形式が正しくありません。';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'パスワードが弱すぎます。より強力なパスワードを使用してください。';
      }
      
      Alert.alert('エラー', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSignUp ? '新規アカウント作成' : 'ログイン'}
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="メールアドレス"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="パスワード"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="パスワード（確認）"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      )}

      <TouchableOpacity 
        style={styles.button}
        onPress={isSignUp ? handleSignUp : handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading 
            ? (isSignUp ? '作成中...' : 'ログイン中...') 
            : (isSignUp ? 'アカウント作成' : 'ログイン')
          }
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={toggleMode}
        disabled={isLoading}
      >
        <Text style={styles.toggleButtonText}>
          {isSignUp 
            ? 'すでにアカウントをお持ちの方はこちら' 
            : '新規アカウントを作成する'
          }
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6B4DE6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  signUpButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: 'transparent',
    padding: 10,
    marginTop: 10,
  },
  toggleButtonText: {
    color: '#6B4DE6',
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
}); 