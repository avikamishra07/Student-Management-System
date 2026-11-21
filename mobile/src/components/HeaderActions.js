import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useTheme } from '../theme/ThemeContext';
import ThemeToggle from './ThemeToggle';

/** Theme switch + Logout, shown in the header of the logged-in screens. */
export default function HeaderActions() {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <ThemeToggle />
      <Pressable onPress={() => dispatch(logout())} hitSlop={8} style={styles.logout}>
        <Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  logout: { marginLeft: 12 },
  logoutText: { fontSize: 15, fontWeight: '600' },
});
