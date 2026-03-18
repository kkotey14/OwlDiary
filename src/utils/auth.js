import { jwtDecode } from 'jwt-decode';

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
  const token = localStorage.getItem('token');
  if (!token || isExpired(token)) {
    localStorage.removeItem('token');
    return null;
  }
  return token;
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
    localStorage.removeItem('token');
    if (navigate) {
      navigate('/login');
    }
    return true;
  }
  return false;
};
