import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppDataSnapshot } from '../../types/models';

const LOCAL_SNAPSHOT_KEY = 'gymxp.local.snapshot.v1';
const LOCAL_AUTH_KEY = 'gymxp.local.auth.v1';

interface LocalAuthCache {
  isAuthenticated: boolean;
}

export async function loadLocalSnapshot() {
  const [snapshotValue, authValue] = await Promise.all([
    AsyncStorage.getItem(LOCAL_SNAPSHOT_KEY),
    AsyncStorage.getItem(LOCAL_AUTH_KEY),
  ]);

  return {
    snapshot: snapshotValue ? (JSON.parse(snapshotValue) as AppDataSnapshot) : null,
    auth: authValue ? (JSON.parse(authValue) as LocalAuthCache) : null,
  };
}

export async function saveLocalSnapshot(snapshot: AppDataSnapshot, isAuthenticated: boolean) {
  await Promise.all([
    AsyncStorage.setItem(LOCAL_SNAPSHOT_KEY, JSON.stringify(snapshot)),
    AsyncStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ isAuthenticated })),
  ]);
}

export async function clearLocalAuthFlag() {
  await AsyncStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ isAuthenticated: false }));
}
