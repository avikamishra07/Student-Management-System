import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '../api/client';
import { PAGE_SIZE } from '../config';
import { logout } from './authSlice';

/** Same tie-breaking as the backend: points high->low, then name A->Z, then id. */
function compareDesc(a, b) {
  if (a.totalPoints !== b.totalPoints) return b.totalPoints - a.totalPoints;
  if (a.name !== b.name) return a.name < b.name ? -1 : 1;
  return a.studentId - b.studentId;
}

/** Runs an API call; if the token has expired (401) the user is logged out. */
async function callApi(path, options, { getState, dispatch, rejectWithValue }) {
  try {
    return await apiRequest(path, { ...options, token: getState().auth.token });
  } catch (e) {
    if (e.status === 401) dispatch(logout());
    return rejectWithValue(e.message);
  }
}

/** Loads one page of the rank list (server-side pagination + sorting). page 0 replaces the list. */
export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetch',
  async ({ page = 0, direction } = {}, thunkApi) => {
    const dir = direction || thunkApi.getState().leaderboard.direction;
    const query = `?page=${page}&size=${PAGE_SIZE}&sortBy=points&direction=${dir}`;
    return callApi(`/leaderboard${query}`, {}, thunkApi);
  }
);

/** Student only: own rank and points. */
export const fetchMyStanding = createAsyncThunk('leaderboard/fetchMe', async (_, thunkApi) =>
  callApi('/students/me', {}, thunkApi)
);

/** Teacher only: award (+) or deduct (-) points. Returns the updated student row. */
export const awardPoints = createAsyncThunk(
  'leaderboard/award',
  async ({ studentId, points, reason }, thunkApi) =>
    callApi(`/students/${studentId}/points`, { method: 'POST', body: { points, reason } }, thunkApi)
);

const initialState = {
  items: [],
  page: 0,
  totalPages: 0,
  totalElements: 0,
  last: true,
  direction: 'desc', // 'desc' = highest first, 'asc' = lowest first
  status: 'idle', // 'idle' | 'loading' | 'loadingMore' | 'failed'
  error: null,
  me: null, // student's own standing
  awardStatus: 'idle', // 'idle' | 'loading'
  awardError: null,
};

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    clearAwardError(state) {
      state.awardError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state, action) => {
        const page = action.meta.arg?.page ?? 0;
        state.status = page === 0 ? 'loading' : 'loadingMore';
        state.error = null;
        if (action.meta.arg?.direction) state.direction = action.meta.arg.direction;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        const data = action.payload;
        if (data.page === 0) {
          state.items = data.content;
        } else {
          // append, skipping anyone already in the list
          const seen = new Set(state.items.map((i) => i.studentId));
          state.items.push(...data.content.filter((i) => !seen.has(i.studentId)));
        }
        state.page = data.page;
        state.totalPages = data.totalPages;
        state.totalElements = data.totalElements;
        state.last = data.last;
        state.direction = data.direction;
        state.status = 'idle';
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchMyStanding.fulfilled, (state, action) => {
        state.me = action.payload;
      })

      .addCase(awardPoints.pending, (state) => {
        state.awardStatus = 'loading';
        state.awardError = null;
      })
      .addCase(awardPoints.fulfilled, (state, action) => {
        state.awardStatus = 'idle';
        const updated = action.payload;

        // 1. put the new points into the list
        const existing = state.items.find((i) => i.studentId === updated.studentId);
        if (existing) {
          existing.totalPoints = updated.totalPoints;
        } else {
          state.items.push(updated);
        }

        // 2. re-sort immediately so the rank list reorders
        state.items.sort(compareDesc);
        if (state.direction === 'asc') state.items.reverse();

        // 3. recalculate ranks (list is loaded from the top, so position = rank)
        const total = state.totalElements || state.items.length;
        state.items.forEach((item, index) => {
          item.rank = state.direction === 'desc' ? index + 1 : total - index;
        });
      })
      .addCase(awardPoints.rejected, (state, action) => {
        state.awardStatus = 'idle';
        state.awardError = action.payload || action.error.message;
      })

      // clear everything when the user logs out
      .addCase(logout.fulfilled, () => initialState);
  },
});

export const { clearAwardError } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
