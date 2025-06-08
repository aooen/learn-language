import { client } from '$lib/utils/api';

export type Collecting = Awaited<
  ReturnType<Awaited<ReturnType<typeof client.collect.$get>>['json']>
>['collecting'][number];
