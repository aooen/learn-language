import type { JwtVariables } from 'hono/jwt';

export type Variables = {
  locale: string;
  userId: number;
};

export type Env = {
  Variables: Variables & JwtVariables;
};
