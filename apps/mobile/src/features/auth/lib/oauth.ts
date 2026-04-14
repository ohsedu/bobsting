import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import type { Provider } from '@supabase/supabase-js';

import { supabase } from '../../../../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

function getRedirectUrl() {
  return Linking.createURL('auth/callback');
}

function getQueryParam(url: string, key: string) {
  const match = url.match(new RegExp(`[?&]${key}=([^&]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function openCenteredPopup(url: string) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const width = 480;
  const height = 720;
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
  return window.open(url, 'bobsting-oauth', `popup=yes,width=${width},height=${height},left=${left},top=${top}`);
}

export async function signInWithOAuth(provider: Provider) {
  const redirectTo = getRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('No OAuth URL returned');
  // Web: open popup and wait for callback page to notify opener.

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const popup = openCenteredPopup(data.url);
    if (!popup) return;

    await new Promise<void>((resolve) => {
      const onMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        const payload = event.data as { type?: string } | undefined;
        if (payload?.type !== 'bobsting:oAuthComplete') return;
        window.removeEventListener('message', onMessage);
        resolve();
      };

      window.addEventListener('message', onMessage);

      const timer = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(timer);
          window.removeEventListener('message', onMessage);
          resolve();
        }
      }, 400);
    });

    // Trigger a session refresh in this window.
    await supabase.auth.getSession();
    return;
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !result.url) return;

  const errorDescription = getQueryParam(result.url, 'error_description');
  if (errorDescription) throw new Error(errorDescription);

  const code = getQueryParam(result.url, 'code');
  if (!code) return;

  const exchanged = await supabase.auth.exchangeCodeForSession(code);
  if (exchanged.error) throw exchanged.error;
}
