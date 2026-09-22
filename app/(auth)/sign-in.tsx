import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { sendSignInCode, verifySignInCode } from '../../src/lib/auth';
import { useThemeColors } from '../../src/theme/colors';

type Step = 'email' | 'code';
type Status = 'idle' | 'submitting' | 'error';

export default function SignIn() {
  const colors = useThemeColors();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputStyle = [
    styles.input,
    { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
  ];

  async function handleSendCode() {
    setStatus('submitting');
    setErrorMessage(null);
    try {
      await sendSignInCode(email.trim());
      setStep('code');
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.');
    }
  }

  async function handleVerifyCode() {
    setStatus('submitting');
    setErrorMessage(null);
    try {
      await verifySignInCode(email.trim(), code.trim());
      // On success, the session updates and the root layout routes into (app).
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.');
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Warranty & Receipt Vault</Text>

        {step === 'email' ? (
          <>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Sign in with your email — we&apos;ll send you a code.
            </Text>
            <TextInput
              accessibilityLabel="Email address"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              style={inputStyle}
              value={email}
              onChangeText={setEmail}
            />

            {errorMessage ? (
              <Text style={[styles.error, { color: colors.danger }]}>{errorMessage}</Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={email.trim().length === 0 || status === 'submitting'}
              style={[
                styles.button,
                {
                  backgroundColor: colors.accent,
                  opacity: email.trim().length === 0 || status === 'submitting' ? 0.5 : 1,
                },
              ]}
              onPress={handleSendCode}
            >
              {status === 'submitting' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send code</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Enter the code we sent to {email.trim()}.
            </Text>
            <TextInput
              accessibilityLabel="Sign-in code"
              autoCapitalize="none"
              autoComplete="one-time-code"
              keyboardType="number-pad"
              placeholder="12345678"
              placeholderTextColor={colors.textMuted}
              style={inputStyle}
              value={code}
              onChangeText={setCode}
            />

            {errorMessage ? (
              <Text style={[styles.error, { color: colors.danger }]}>{errorMessage}</Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={code.trim().length === 0 || status === 'submitting'}
              style={[
                styles.button,
                {
                  backgroundColor: colors.accent,
                  opacity: code.trim().length === 0 || status === 'submitting' ? 0.5 : 1,
                },
              ]}
              onPress={handleVerifyCode}
            >
              {status === 'submitting' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setStep('email');
                setCode('');
                setErrorMessage(null);
                setStatus('idle');
              }}
            >
              <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
                Use a different email
              </Text>
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
