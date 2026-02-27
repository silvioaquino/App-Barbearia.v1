import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface LoadingProps {
  text?: string;
}

export default function Loading({ text }: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
