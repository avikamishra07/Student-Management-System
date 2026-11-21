import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ErrorText from '../components/ErrorText';
import { clearAuthError, register } from '../store/authSlice';
import { useTheme } from '../theme/ThemeContext';

const ROLES = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'TEACHER', label: 'Teacher' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { status, error } = useSelector((s) => s.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const onSubmit = () => {
    if (!name.trim()) return setFormError('Please enter your name.');
    if (!EMAIL_PATTERN.test(email.trim())) return setFormError('Please enter a valid email.');
    if (password.length < 6) return setFormError('Password must be at least 6 characters.');
    setFormError(null);
    dispatch(register({ name: name.trim(), email: email.trim(), password, role }));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>Create account</Text>

        <AppInput label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
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
          placeholder="At least 6 characters"
          secureTextEntry
        />

        <Text style={[styles.label, { color: colors.textMuted }]}>I am a</Text>
        <View style={styles.roleRow}>
          {ROLES.map((r) => {
            const active = r.value === role;
            return (
              <Pressable
                key={r.value}
                onPress={() => setRole(r.value)}
                style={[
                  styles.roleOption,
                  { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.highlight : colors.card },
                ]}
              >
                <Text style={[styles.roleText, { color: active ? colors.primary : colors.text }]}>{r.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <ErrorText message={formError || error} />
        <AppButton title="Sign up" onPress={onSubmit} loading={status === 'loading'} />

        <Pressable onPress={() => navigation.goBack()} style={styles.link}>
          <Text style={{ color: colors.primary, fontSize: 15 }}>Already have an account? Log in</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: '500' },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleOption: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  roleText: { fontSize: 16, fontWeight: '600' },
  link: { alignItems: 'center', marginTop: 20 },
});
