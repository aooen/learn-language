import type { JwtVariables } from 'hono/jwt';

export type Variables = {
  locale: string;
};

export type Env = {
  Variables: Variables & JwtVariables;
};
