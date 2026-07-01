"use client";

import { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor, AppDispatch, RootState } from "@/store/store";
import { fetchApplications } from "@/store/applicationsSlice";

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const { hasFetched } = useSelector((state: RootState) => state.applications);

  useEffect(() => {
    if (isAuthenticated && token && !hasFetched) {
      dispatch(fetchApplications(token));
    }
  }, [isAuthenticated, token, hasFetched, dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppInitializer>
          {children}
        </AppInitializer>
      </PersistGate>
    </Provider>
  );
}

