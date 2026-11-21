import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { apiRequest } from '../api/client';

const SESSION_KEY = 'sms_session';

async function saveSession(session) {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

async function clearSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

/** On app start: load the saved token from secure storage and check it with the backend. */
export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;

  let saved;
  try {
    saved = JSON.parse(raw);
  } catch {
    await clearSession();
    return null;
  }
  if (!saved?.token) {
    await clearSession();
    return null;
  }

  try {
    const user = await apiRequest('/auth/me', { token: saved.token });
    const session = { token: saved.token, user };
    await saveSession(session);
    return session;
  } catch (e) {
    if (e.status === 401 || e.status === 404) {
      // Token expired or user deleted -> back to login
      await clearSession();
      return null;
    }
    // Server not reachable right now: keep the user logged in with the saved data
    return saved;
  }
});

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
    const session = { token: data.token, user: data.user };
    await saveSession(session);
    return session;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password, role },
      });
      const session = { token: data.token, user: data.user };
      await saveSession(session);
      return session;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await clearSession();
});

const initialState = {
  token: null,
  user: null, // { id, name, email, role: 'STUDENT' | 'TEACHER', studentId }
  restoring: true, // true until the saved session has been checked
  status: 'idle', // 'idle' | 'loading'
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.restoring = false;
        state.token = action.payload?.token ?? null;
        state.user = action.payload?.user ?? null;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.restoring = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.status = 'idle';
        state.error = null;
      });

    // login and register behave the same way
    [login, register].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = 'idle';
          state.token = action.payload.token;
          state.user = action.payload.user;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'idle';
          state.error = action.payload || action.error.message;
        });
    });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
