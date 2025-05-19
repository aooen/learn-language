import { client } from '$lib/utils/api';

const LOCAL_STORAGE_JWT_KEY = 'jwt';

export const authStore = $state({
  jwt: localStorage.getItem(LOCAL_STORAGE_JWT_KEY),
});

type LoginRequestJson = Parameters<typeof client.user.login.$post>[0]['json'];
export async function login(reqJson: LoginRequestJson) {
  const res = await client.user.login.$post({ json: reqJson });
  if (!res.ok) {
    throw new Error('Not found user');
  }
  const json = await res.json();
  authStore.jwt = json.token;
  localStorage.setItem(LOCAL_STORAGE_JWT_KEY, json.token);
}

type SignupRequestJson = Parameters<typeof client.user.signup.$post>[0]['json'];
export async function signup(reqJson: SignupRequestJson) {
  const res = await client.user.signup.$post({ json: reqJson });
  if (!res.ok) {
    throw new Error("Can't create user");
  }
  const json = await res.json();
  authStore.jwt = json.token;
  localStorage.setItem(LOCAL_STORAGE_JWT_KEY, json.token);
}
