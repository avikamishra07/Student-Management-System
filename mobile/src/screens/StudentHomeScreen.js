import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ErrorText from '../components/ErrorText';
import LeaderboardList from '../components/LeaderboardList';
import SortToggle from '../components/SortToggle';
import useLeaderboard from '../hooks/useLeaderboard';
import { fetchMyStanding } from '../store/leaderboardSlice';
import { useTheme } from '../theme/ThemeContext';

/** STUDENT view: read-only. Own rank + points at the top, then the full rank list. */
export default function StudentHomeScreen() {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const user = useSelector((s) => s.auth.user);
  const me = useSelector((s) => s.leaderboard.me);

  const loadMe = useCallback(() => {
    dispatch(fetchMyStanding());
  }, [dispatch]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const { board, refresh, loadMore, changeDirection } = useLeaderboard({ onRefreshExtra: loadMe });

  const header = (
    <View>
      <View style={[styles.card, { backgroundColor: colors.primary }]}>
        <Text style={[styles.hello, { color: colors.primaryText }]}>Hi, {user?.name}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.primaryText }]}>{me ? `#${me.rank}` : '-'}</Text>
            <Text style={[styles.statLabel, { color: colors.primaryText }]}>
              {me ? `Rank of ${me.totalStudents}` : 'Rank'}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.primaryText }]}>{me ? me.totalPoints : '-'}</Text>
            <Text style={[styles.statLabel, { color: colors.primaryText }]}>Total points</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Class leaderboard</Text>
      <SortToggle direction={board.direction} onChange={changeDirection} />
      <ErrorText message={board.error} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LeaderboardList
        items={board.items}
        highlightStudentId={user?.studentId}
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
  card: { borderRadius: 16, padding: 20, marginBottom: 20 },
  hello: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  statsRow: { flexDirection: 'row' },
  stat: { flex: 1 },
  statValue: { fontSize: 32, fontWeight: '800' },
  statLabel: { fontSize: 13, opacity: 0.85, marginTop: 2 },
  section: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
});
