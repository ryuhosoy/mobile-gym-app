import { View, StyleSheet } from 'react-native';
import React from 'react';
import { LogoutButton } from '../auth/LogoutButton';
import ProfileInput from '../components/ProfileInput';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      {/* 他のプロフィール関連のコンポーネント */}
      <ProfileInput />
      <LogoutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
