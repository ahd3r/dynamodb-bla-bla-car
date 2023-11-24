import { z } from 'zod';

export const createAdminData = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  roleId: z.string().uuid()
});

export const requestToRecoveryAdminData = z.object({
  email: z.string().email()
});

export const recoveryAdminData = z.object({
  newPassword: z.string().min(8),
  confirmNewPassword: z.string().min(8)
});

export const updatePasswordAdminData = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmNewPassword: z.string().min(8)
});

export const updateRoleAdminData = z.object({
  roleId: z.string().uuid()
});
