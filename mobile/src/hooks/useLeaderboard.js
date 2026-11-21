import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaderboard } from '../store/leaderboardSlice';

/** Shared loading / refresh / "load more" / sort logic for the rank list. */
export default function useLeaderboard({ onRefreshExtra } = {}) {
  const dispatch = useDispatch();
  const board = useSelector((s) => s.leaderboard);

  useEffect(() => {
    dispatch(fetchLeaderboard({ page: 0 }));
  }, [dispatch]);

  const refresh = useCallback(() => {
    dispatch(fetchLeaderboard({ page: 0 }));
    if (onRefreshExtra) onRefreshExtra();
  }, [dispatch, onRefreshExtra]);

  const loadMore = useCallback(() => {
    if (board.status === 'idle' && !board.last && board.items.length > 0) {
      dispatch(fetchLeaderboard({ page: board.page + 1 }));
    }
  }, [dispatch, board.status, board.last, board.page, board.items.length]);

  const changeDirection = useCallback(
    (direction) => dispatch(fetchLeaderboard({ page: 0, direction })),
    [dispatch]
  );

  return { board, refresh, loadMore, changeDirection };
}
