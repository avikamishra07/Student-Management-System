import React from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/**
 * Rank list used by both roles.
 * - highlightStudentId: row to highlight (the logged-in student)
 * - onPressItem: only passed for teachers, makes rows tappable
 */
export default function LeaderboardList({
  items,
  highlightStudentId,
  onPressItem,
  refreshing,
  onRefresh,
  onEndReached,
  loadingMore,
  ListHeaderComponent,
  emptyText = 'No students yet.',
}) {
  const { colors } = useTheme();

  const renderItem = ({ item }) => {
    const isMe = item.studentId === highlightStudentId;
    const content = (
      <View
        style={[
          styles.row,
          { backgroundColor: isMe ? colors.highlight : colors.card, borderColor: isMe ? colors.primary : colors.border },
        ]}
      >
        <View style={[styles.rankBadge, { backgroundColor: item.rank <= 3 ? colors.primary : colors.border }]}>
          <Text style={[styles.rankText, { color: item.rank <= 3 ? colors.primaryText : colors.text }]}>
            #{item.rank}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {item.name}
            {isMe ? ' (You)' : ''}
          </Text>
          <Text style={[styles.email, { color: colors.textMuted }]} numberOfLines={1}>
            {item.email}
          </Text>
        </View>
        <View style={styles.pointsBox}>
          <Text style={[styles.points, { color: colors.text }]}>{item.totalPoints}</Text>
          <Text style={[styles.pointsLabel, { color: colors.textMuted }]}>pts</Text>
        </View>
      </View>
    );

    if (!onPressItem) return content;
    return (
      <Pressable onPress={() => onPressItem(item)} style={({ pressed }) => pressed && { opacity: 0.7 }}>
        {content}
      </Pressable>
    );
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.studentId)}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        !refreshing ? <Text style={[styles.empty, { color: colors.textMuted }]}>{emptyText}</Text> : null
      }
      ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : null}
      refreshControl={
        <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  rankBadge: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  rankText: { fontWeight: '700', fontSize: 15 },
  info: { flex: 1, marginHorizontal: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  email: { fontSize: 12, marginTop: 2 },
  pointsBox: { alignItems: 'flex-end' },
  points: { fontSize: 20, fontWeight: '700' },
  pointsLabel: { fontSize: 11 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 15 },
  footer: { marginVertical: 16 },
});
