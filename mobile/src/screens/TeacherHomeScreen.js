import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import ErrorText from '../components/ErrorText';
import LeaderboardList from '../components/LeaderboardList';
import SortToggle from '../components/SortToggle';
import useLeaderboard from '../hooks/useLeaderboard';
import { useTheme } from '../theme/ThemeContext';

/** TEACHER view: rank list where every row can be tapped to award points. */
export default function TeacherHomeScreen({ navigation }) {
  const { colors } = useTheme();
  const user = useSelector((s) => s.auth.user);
  const { board, refresh, loadMore, changeDirection } = useLeaderboard();

  const header = (
    <View>
      <Text style={[styles.hello, { color: colors.text }]}>Hi, {user?.name}</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {board.totalElements} students. Tap a student to award or adjust points.
      </Text>
      <SortToggle direction={board.direction} onChange={changeDirection} />
      <ErrorText message={board.error} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LeaderboardList
        items={board.items}
        onPressItem={(student) => navigation.navigate('AwardPoints', { studentId: student.studentId })}
        refreshing={board.status === 'loading'}
        onRefresh={refresh}
        onEndReached={loadMore}
        loadingMore={board.status === 'loadingMore'}
        ListHeaderComponent={header}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hello: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  hint: { fontSize: 14, marginBottom: 16 },
});
