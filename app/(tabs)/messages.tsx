import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function Messages() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>メッセージ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
}); 