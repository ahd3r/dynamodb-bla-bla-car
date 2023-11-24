import { z } from 'zod';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

import { loginData } from '../utils/validation/auth';
import { getAdminByEmailRepo, updateAdminRepo } from '../repository/admin';
import { getUserByEmailRepo, updateUserRepo } from '../repository/user';
import { ValidationError } from '../utils/utils';

export const loginUser = async (data: z.infer<typeof loginData>): Promise<{ token: string }> => {
  const userToLogIn = await getUserByEmailRepo(data.email);
  if (!userToLogIn) {
    throw new ValidationError("User with this email doesn't exist");
  }
  if (!(await bcrypt.compare(data.password, userToLogIn.password))) {
    throw new ValidationError("User's password is wrong");
  }
  if (userToLogIn.confirmToken) {
    throw new ValidationError("User doesn't confirmed");
  }
  await updateUserRepo(userToLogIn.id, { resetToken: undefined });
  return {
    token: jwt.sign({ type: 'user', email: userToLogIn.email }, process.env.SECRET as string)
  };
};

export const loginAdmin = async (data: z.infer<typeof loginData>): Promise<{ token: string }> => {
  const adminToLogIn = await getAdminByEmailRepo(data.email);
  if (!adminToLogIn) {
    throw new ValidationError("Admin with this email doesn't exist");
  }
  if (!(await bcrypt.compare(data.password, adminToLogIn.password))) {
    throw new ValidationError("Admin's password is wrong");
  }
  await updateAdminRepo(adminToLogIn.id, { resetToken: undefined });
  return {
    token: jwt.sign({ type: 'admin', email: adminToLogIn.email }, process.env.SECRET as string)
  };
};
