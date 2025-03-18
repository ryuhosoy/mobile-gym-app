import { View, StyleSheet } from 'react-native';
import React from 'react';
import { LogoutButton } from '../auth/LogoutButton';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      {/* 他のプロフィール関連のコンポーネント */}
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
