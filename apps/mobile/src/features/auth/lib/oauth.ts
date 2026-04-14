import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

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

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !result.url) return;

  const errorDescription = getQueryParam(result.url, 'error_description');
  if (errorDescription) throw new Error(errorDescription);

  const code = getQueryParam(result.url, 'code');
  if (!code) return;

  const exchanged = await supabase.auth.exchangeCodeForSession(code);
  if (exchanged.error) throw exchanged.error;
}
