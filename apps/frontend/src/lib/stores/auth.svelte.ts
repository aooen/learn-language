import { client } from '$lib/utils/api';

const LOCAL_STORAGE_JWT_KEY = 'jwt';

export const authStore = $state({
  jwt: localStorage.getItem(LOCAL_STORAGE_JWT_KEY),
});

export async function login(username: string, password: string) {
  const res = await client.user.login.$post({ json: { username, password } });
  if (!res.ok) {
    throw new Error('Not found user');
  }
  const json = await res.json();
  authStore.jwt = json.token;
  localStorage.setItem(LOCAL_STORAGE_JWT_KEY, json.token);
}
