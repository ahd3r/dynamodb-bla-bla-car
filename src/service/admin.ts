import { z } from 'zod';

import { createAdminData } from '../utils/validation/admin';

export const getAdmins = () => {};
export const getAdminById = () => {};
export const createAdmin = (data: z.infer<typeof createAdminData>) => {};
export const requestToRecoverAdmin = () => {};
export const recoverAdmin = () => {};
export const updatePasswordAdmin = () => {};
export const changeRoleAdmin = () => {};
export const deleteAdmin = () => {};
