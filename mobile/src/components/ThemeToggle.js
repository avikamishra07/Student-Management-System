import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/** Day / Night switch shown in the header of every screen. */
export default function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{isDark ? 'Night' : 'Day'}</Text>
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
        accessibilityLabel="Toggle dark mode"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 13, marginRight: 4 },
});
