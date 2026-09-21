import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signInWithEmail } from '../../src/lib/auth';
import { useThemeColors } from '../../src/theme/colors';

export default function SignIn() {
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && status !== 'sending';

  async function handleSubmit() {
    setStatus('sending');
    setErrorMessage(null);
    try {
      await signInWithEmail(email.trim());
      setStatus('sent');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.');
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Warranty & Receipt Vault</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Sign in with your email — we&apos;ll send you a magic link.
        </Text>

        {status === 'sent' ? (
          <Text style={[styles.confirmation, { color: colors.safe }]}>
            Check your email for a sign-in link.
          </Text>
        ) : (
          <>
            <TextInput
              accessibilityLabel="Email address"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
              ]}
              value={email}
              onChangeText={setEmail}
            />

            {errorMessage ? (
              <Text style={[styles.error, { color: colors.danger }]}>{errorMessage}</Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              style={[
                styles.button,
                { backgroundColor: colors.accent, opacity: canSubmit ? 1 : 0.5 },
              ]}
              onPress={handleSubmit}
            >
              {status === 'sending' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send magic link</Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  confirmation: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  error: {
    fontSize: 14,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
