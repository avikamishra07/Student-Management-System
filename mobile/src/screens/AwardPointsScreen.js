import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ErrorText from '../components/ErrorText';
import { awardPoints, clearAwardError } from '../store/leaderboardSlice';
import { useTheme } from '../theme/ThemeContext';

const QUICK_POINTS = [5, 10, 25, 50, -5, -10];

/** TEACHER only (this screen is not registered for students). */
export default function AwardPointsScreen({ route, navigation }) {
  const { studentId } = route.params;
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const student = useSelector((s) => s.leaderboard.items.find((i) => i.studentId === studentId));
  const { awardStatus, awardError } = useSelector((s) => s.leaderboard);

  const [points, setPoints] = useState('10');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    dispatch(clearAwardError());
  }, [dispatch]);

  const onSubmit = async () => {
    const value = Number(points);
    if (!/^-?\d+$/.test(points.trim()) || value === 0) {
      setFormError('Enter a whole number that is not 0 (use minus to deduct).');
      return;
    }
    if (value < -1000 || value > 1000) {
      setFormError('Points must be between -1000 and 1000.');
      return;
    }
    setFormError(null);
    try {
      await dispatch(awardPoints({ studentId, points: value, reason: reason.trim() || null })).unwrap();
      navigation.goBack();
    } catch {
      // error message is already in Redux state (awardError)
    }
  };

  if (!student) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted }}>Student not found in the loaded list.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.name, { color: colors.text }]}>{student.name}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            Rank #{student.rank}  ·  {student.totalPoints} points
          </Text>
        </View>

        <Text style={[styles.label, { color: colors.textMuted }]}>Quick pick</Text>
        <View style={styles.quickRow}>
          {QUICK_POINTS.map((p) => {
            const active = points === String(p);
            return (
              <Pressable
                key={p}
                onPress={() => setPoints(String(p))}
                style={[
                  styles.chip,
                  { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.highlight : colors.card },
                ]}
              >
                <Text style={{ color: p > 0 ? colors.success : colors.danger, fontWeight: '700' }}>
                  {p > 0 ? `+${p}` : p}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <AppInput
          label="Points (negative to deduct)"
          value={points}
          onChangeText={setPoints}
          keyboardType="numbers-and-punctuation"
          placeholder="e.g. 10 or -5"
        />
        <AppInput label="Reason (optional)" value={reason} onChangeText={setReason} placeholder="e.g. Quiz winner" />

        <ErrorText message={formError || awardError} />
        <AppButton title="Submit points" onPress={onSubmit} loading={awardStatus === 'loading'} />
        <AppButton title="Cancel" variant="secondary" onPress={() => navigation.goBack()} style={styles.cancel} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: 14, padding: 18, marginBottom: 22 },
  name: { fontSize: 22, fontWeight: '700' },
  meta: { fontSize: 15, marginTop: 6 },
  label: { fontSize: 13, marginBottom: 8, fontWeight: '500' },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  chip: { borderWidth: 1.5, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  cancel: { marginTop: 12 },
});
