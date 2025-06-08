import type { User } from '$lib/types/user';

export const userStore = $state<{
  user: User | null;
}>({
  user: null,
});
