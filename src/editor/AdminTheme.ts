import { createContext, useContext } from 'react';

export type AdminMode = 'dark' | 'light';
export const adminThemeKey = 'lean:admin-theme';

export function readAdminMode(): AdminMode {
  try {
    return localStorage.getItem(adminThemeKey) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export const AdminThemeContext = createContext<{
  mode: AdminMode;
  setMode(mode: AdminMode): void;
}>({ mode: 'dark', setMode() {} });

export const useAdminTheme = () => useContext(AdminThemeContext);
