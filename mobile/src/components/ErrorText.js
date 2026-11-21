import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ErrorText({ message }) {
  const { colors } = useTheme();
  if (!message) return null;
  return <Text style={[styles.text, { color: colors.danger }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  text: { fontSize: 14, marginBottom: 12, textAlign: 'center' },
});
