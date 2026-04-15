import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';

import { supabase } from '../../../../lib/supabase';

function getQueryParam(url: string, key: string) {
  const match = url.match(new RegExp(`[?&]${key}=([^&]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function AuthCallbackScreen() {
  const [message, setMessage] = useState('로그인 처리 중…');
  const urlFromLinking = Linking.useURL();
  const navigation = useNavigation();

  useEffect(() => {
    const effectiveUrl =
      urlFromLinking ?? (Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.href : undefined);

    if (!effectiveUrl) {
      setMessage('콜백 URL을 찾지 못했어요.');
      if (Platform.OS !== 'web') navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
      return;
    }

    const errorDescription = getQueryParam(effectiveUrl, 'error_description');
    if (errorDescription) {
      setMessage(errorDescription);
      if (Platform.OS !== 'web') navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
      return;
    }

    const code = getQueryParam(effectiveUrl, 'code');
    if (!code) {
      setMessage('인증 코드가 없어요.');
      if (Platform.OS !== 'web') navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
      return;
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) throw error;
        setMessage('로그인 완료!');

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          try {
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({ type: 'bobsting:oAuthComplete' }, window.location.origin);
              window.close();
            }
          } catch {
            // ignore
          }
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'Home' as never }] });
        }
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : '세션 교환에 실패했어요.';
        setMessage(msg);
        if (Platform.OS !== 'web') navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
      });
  }, [urlFromLinking]);

  return (
    <View style={styles.container}>
      <ActivityIndicator />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  text: {
    color: '#374151',
    fontSize: 14,
  },
});
