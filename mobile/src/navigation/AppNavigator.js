import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import HeaderActions from '../components/HeaderActions';
import ThemeToggle from '../components/ThemeToggle';
import AwardPointsScreen from '../screens/AwardPointsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import StudentHomeScreen from '../screens/StudentHomeScreen';
import TeacherHomeScreen from '../screens/TeacherHomeScreen';
import { useTheme } from '../theme/ThemeContext';

const Stack = createNativeStackNavigator();

/**
 * Route protection:
 * - not logged in -> only Login / Register exist
 * - STUDENT       -> only the read-only StudentHome exists
 * - TEACHER       -> TeacherHome + AwardPoints
 * A screen that is not registered for a role simply cannot be opened.
 */
export default function AppNavigator() {
  const { token, user, restoring } = useSelector((s) => s.auth);
  const { colors, isDark } = useTheme();

  if (restoring) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  const screenOptions = {
    headerStyle: { backgroundColor: colors.card },
    headerTintColor: colors.text,
    contentStyle: { backgroundColor: colors.background },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={screenOptions}>
        {!token || !user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Log in', headerRight: () => <ThemeToggle /> }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Sign up', headerRight: () => <ThemeToggle /> }}
            />
          </>
        ) : user.role === 'TEACHER' ? (
          <>
            <Stack.Screen
              name="TeacherHome"
              component={TeacherHomeScreen}
              options={{ title: 'Leaderboard', headerRight: () => <HeaderActions /> }}
            />
            <Stack.Screen
              name="AwardPoints"
              component={AwardPointsScreen}
              options={{ title: 'Award points', headerRight: () => <ThemeToggle /> }}
            />
          </>
        ) : (
          <Stack.Screen
            name="StudentHome"
            component={StudentHomeScreen}
            options={{ title: 'My standing', headerRight: () => <HeaderActions /> }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
