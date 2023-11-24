import { z } from 'zod';

export const createRoleData = z.object({
  name: z.string().min(1),
  rights: z.string().array().nonempty()
});

export const updateRoleData = z.object({
  name: z.string().min(1).optional(),
  rights: z.string().array().nonempty().optional()
});
