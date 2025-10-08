import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'ページが見つかりません' }} />
      <View style={styles.container}>
        <Text style={styles.title}>お探しのページは存在しません。</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>ホーム画面に戻る</Text>
        </Link>
      </View>
    </>
  );  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    color: '#1976D2',
    fontSize: 16,
  }
});
