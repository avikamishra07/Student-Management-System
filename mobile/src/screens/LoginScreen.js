import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ErrorText from '../components/ErrorText';
import { API_URL } from '../config';
import { clearAuthError, login } from '../store/authSlice';
import { useTheme } from '../theme/ThemeContext';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { status, error } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);

  // clear old errors when this screen opens
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const onSubmit = () => {
    if (!email.trim() || !password) {
      setFormError('Please enter your email and password.');
      return;
    }
    setFormError(null);
    dispatch(login({ email: email.trim(), password }));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Log in to see the leaderboard</Text>

        <AppInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@school.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <AppInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry
        />

        <ErrorText message={formError || error} />
        <AppButton title="Log in" onPress={onSubmit} loading={status === 'loading'} />

        <Pressable onPress={() => navigation.navigate('Register')} style={styles.link}>
          <Text style={{ color: colors.primary, fontSize: 15 }}>New here? Create an account</Text>
        </Pressable>

        <Text style={[styles.server, { color: colors.textMuted }]}>Server: {API_URL}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 28 },
  link: { alignItems: 'center', marginTop: 20 },
  server: { textAlign: 'center', fontSize: 11, marginTop: 32 },
});
