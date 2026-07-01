"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Application, ApplicationsState } from "@/types";
import { logout } from "./authSlice";

const USER_API_BASE = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:5002";

// Async thunk to fetch applications
export const fetchApplications = createAsyncThunk(
  "applications/fetchApplications",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${USER_API_BASE}/api/user/applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || "Failed to fetch applications");
      }
      return data.applications as Application[];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to connect to user service");
    }
  }
);

const initialState: ApplicationsState = {
  applications: [],
  loading: false,
  error: null,
  hasFetched: false,
};

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    addApplication: (state, action: PayloadAction<Application>) => {
      // Avoid duplicate entries
      const exists = state.applications.some(
        (app) => app.application_id === action.payload.application_id
      );
      if (!exists) {
        state.applications.push(action.payload);
      }
    },
    clearApplications: (state) => {
      state.applications = [];
      state.loading = false;
      state.error = null;
      state.hasFetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action: PayloadAction<Application[]>) => {
        state.loading = false;
        state.applications = action.payload;
        state.hasFetched = true;
        state.error = null;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Failed to fetch applications";
        state.hasFetched = false;
      })
      .addCase(logout, (state) => {
        state.applications = [];
        state.loading = false;
        state.error = null;
        state.hasFetched = false;
      });
  },
});

export const { addApplication, clearApplications } = applicationsSlice.actions;
export default applicationsSlice.reducer;
