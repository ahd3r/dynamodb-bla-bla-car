import { z } from 'zod';

export const createUserData = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional()
});

export const changePasswordData = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmNewPassword: z.string().min(8)
});

export const recoveryPasswordData = z.object({
  newPassword: z.string().min(8),
  confirmNewPassword: z.string().min(8)
});

export const changePasswordRequestData = z.object({
  email: z.string().email()
});

export const updateUserData = z.object({
  phone: z.string().optional()
});

export const addCarData = z.object({
  mark: z.string(),
  year: z.number().gt(1500).lt(2030),
  number: z.string()
});
