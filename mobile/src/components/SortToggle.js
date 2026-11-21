import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/** Switch between highest-first (desc) and lowest-first (asc). Sorting happens on the server. */
export default function SortToggle({ direction, onChange }) {
  const { colors } = useTheme();
  const options = [
    { value: 'desc', label: 'Highest first' },
    { value: 'asc', label: 'Lowest first' },
  ];
  return (
    <View style={[styles.wrapper, { borderColor: colors.border, backgroundColor: colors.card }]}>
      {options.map((opt) => {
        const active = opt.value === direction;
        return (
          <Pressable
            key={opt.value}
            onPress={() => !active && onChange(opt.value)}
            style={[styles.option, active && { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.text, { color: active ? colors.primaryText : colors.text }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', borderWidth: 1, borderRadius: 10, padding: 3, marginBottom: 14 },
  option: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  text: { fontSize: 14, fontWeight: '600' },
});
