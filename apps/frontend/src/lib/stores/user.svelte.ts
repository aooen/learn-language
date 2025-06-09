import type { User } from '$lib/types/user';
import { client } from '$lib/utils/api';
import { updateJwt } from './auth.svelte';

export const userStore = $state<{
  user: User | null;
  quizCount: number;
}>({
  user: null,
  quizCount: 0,
});

export async function getUserInfo() {
  const res = await client.user.me.$get();
  if (!res.ok) {
    updateJwt(null);
    throw new Error();
  }
  const json = await res.json();
  userStore.user = json.user;
  userStore.quizCount = json.quizCount;
  updateJwt(json.token);
}
