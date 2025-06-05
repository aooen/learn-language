import { client } from '$lib/utils/api';

export type User = Omit<
  Awaited<ReturnType<Awaited<ReturnType<(typeof client.user.me)['$get']>>['json']>>['user'],
  'password'
>;
