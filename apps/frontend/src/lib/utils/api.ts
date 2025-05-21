import { hcWithType } from 'backend/hc';

// Redefining here to avoid circular dependency
const LOCAL_STORAGE_JWT_KEY = 'jwt';

export const client = hcWithType(import.meta.env.VITE_API_URL, {
  headers: () => {
    const jwt = localStorage.getItem(LOCAL_STORAGE_JWT_KEY);
    return {
      Authorization: jwt ? `Bearer ${jwt}` : '',
    };
  },
});
