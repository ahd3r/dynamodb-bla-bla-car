import { z } from 'zod';

export const loginData = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
