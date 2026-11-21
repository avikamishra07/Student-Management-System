import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import AppNavigator from './src/navigation/AppNavigator';
import { store } from './src/store';
import { restoreSession } from './src/store/authSlice';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function Root() {
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  // Load the saved login (if any) when the app starts
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SafeAreaProvider>
          <Root />
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}
