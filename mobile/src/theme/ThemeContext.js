import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const THEME_KEY = 'sms_theme';

export const lightColors = {
  background: '#F4F6FA',
  card: '#FFFFFF',
  text: '#1A1D23',
  textMuted: '#667085',
  border: '#E2E6EE',
  primary: '#3B5BDB',
  primaryText: '#FFFFFF',
  highlight: '#E7ECFF',
  danger: '#D92D20',
  success: '#12805C',
  inputBackground: '#FFFFFF',
};

export const darkColors = {
  background: '#0F1115',
  card: '#1A1D24',
  text: '#F2F4F7',
  textMuted: '#98A2B3',
  border: '#2C313C',
  primary: '#7C94FF',
  primaryText: '#0F1115',
  highlight: '#232B45',
  danger: '#F97066',
  success: '#47CD89',
  inputBackground: '#14171D',
};

const ThemeContext = createContext({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

/** Global Day / Night mode. The choice is saved on the device. */
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(THEME_KEY)
      .then((saved) => {
        if (saved === 'dark') setIsDark(true);
      })
      .catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      SecureStore.setItemAsync(THEME_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ isDark, colors: isDark ? darkColors : lightColors, toggleTheme }),
    [isDark, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
