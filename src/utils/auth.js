import { jwtDecode } from 'jwt-decode';
import { clearDemoSession, getDemoToken, isDemoModeEnabled, setDemoToken } from '../demo/mockApi';

const isExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    if (!decoded || !decoded.exp) {
      return false;
    }
    return decoded.exp <= Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
};

export const getStoredAuthToken = () => {
  const token = isDemoModeEnabled() ? getDemoToken() : localStorage.getItem('token');
  if (!token || isExpired(token)) {
    if (isDemoModeEnabled()) {
      clearDemoSession();
    } else {
      localStorage.removeItem('token');
    }
    return null;
  }
  return token;
};

export const setStoredAuthToken = (token) => {
  if (isDemoModeEnabled()) {
    setDemoToken(token);
    return;
  }
  localStorage.setItem('token', token);
};

export const clearStoredAuthToken = () => {
  if (isDemoModeEnabled()) {
    clearDemoSession();
    return;
  }
  localStorage.removeItem('token');
};

export const getAuthTokenOrLogout = (navigate) => {
  const token = getStoredAuthToken();
  if (!token) {
    if (navigate) {
      navigate('/login');
    }
    return null;
  }
  return token;
};

export const handleAuthFailure = (status, navigate) => {
  if (status === 401 || status === 403) {
    clearStoredAuthToken();
    if (navigate) {
      navigate('/login');
    }
    return true;
  }
  return false;
};
