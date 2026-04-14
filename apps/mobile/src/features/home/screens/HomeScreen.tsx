import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { supabase } from '../../../../lib/supabase';

export function HomeScreen() {
  async function onLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('로그아웃 실패', error.message);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인 성공</Text>
      <Text style={styles.subtitle}>이제 캘린더/피드 화면을 붙이면 돼요.</Text>

      <Pressable onPress={onLogout} style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}>
        <Text style={styles.buttonText}>로그아웃</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  button: {
    marginTop: 18,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
