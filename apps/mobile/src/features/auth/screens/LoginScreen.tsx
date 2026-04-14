import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Provider } from '@supabase/supabase-js';

import { signInWithOAuth } from '../lib/oauth';

type LoginProvider = Extract<Provider, 'google' | 'kakao'>;

export function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const buttons = useMemo(
    () =>
      [
        { provider: 'google' as const, label: 'Google로 로그인', variant: 'light' as const },
        { provider: 'kakao' as const, label: '카카오로 로그인', variant: 'kakao' as const },
      ] satisfies Array<{ provider: LoginProvider; label: string; variant: 'light' | 'kakao' }>,
    [],
  );
  

  async function onPress(provider: LoginProvider) {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await signInWithOAuth(provider);
    } catch (e) {
      const message = e instanceof Error ? e.message : '로그인에 실패했어요.';
      Alert.alert('로그인 실패', message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require('../../../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="bobsting logo"
          />
          <Text style={styles.title}>bobsting</Text>
          <Text style={styles.subtitle}>지인들과 식사 기록을 캘린더로 공유해요</Text>
        </View>

        <View style={styles.buttons}>
          {buttons.map((b) => (
            <Pressable
              key={b.provider}
              onPress={() => onPress(b.provider)}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.buttonBase,
                b.variant === 'kakao' ? styles.buttonKakao : styles.buttonLight,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
            >
              <View style={styles.buttonContent}>
                <Image
                  source={
                    b.provider === 'google'
                      ? require('../../../../assets/sns_login_logo/icon_login_Google.png')
                      : require('../../../../assets/sns_login_logo/icon_login_kokoa.png')
                  }
                  style={styles.buttonIcon}
                  resizeMode="contain"
                />
                <Text style={styles.buttonTextBase}>{isLoading ? '로그인 중…' : b.label}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.footnote}>
          계속 진행하면 {"\n"}서비스 이용약관 및 개인정보처리방침에 동의한 것으로 간주돼요.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    justifyContent: 'center',
    transform: [{ translateY: -24 }],
  },
  header: {
    gap: 10,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
  },
  buttons: {
    marginTop: 32,
    gap: 12,
  },
  buttonBase: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonIcon: {
    width: 20,
    height: 20,
  },
  buttonLight: {
    backgroundColor: '#F3F4F6',
  },
  buttonKakao: {
    backgroundColor: '#FEE500',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonTextBase: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  footnote: {
    marginTop: 18,
    fontSize: 12,
    lineHeight: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
