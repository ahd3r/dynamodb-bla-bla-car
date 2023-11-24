import { z } from 'zod';

import { RideStatus } from '../../repository/ride';

export const createRideData = z.object({
  availablePlaces: z.number().min(1),
  carId: z.string().uuid(),
  from: z.string(),
  to: z.string(),
  distanceMeters: z.number().min(1),
  timeMinutes: z.number().min(1),
  description: z.string().optional()
});

export const addPassengerData = z.object({
  userId: z.string()
});

export const updateRideData = z.object({
  status: z
    .string()
    .regex(new RegExp(`^(${RideStatus.FINISH})|(${RideStatus.ON_A_WAY})|(${RideStatus.STARTING})$`))
    .optional(),
  availablePlaces: z.number().min(1).optional(),
  carId: z.string().uuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  distanceMeters: z.number().min(1).optional(),
  timeMinutes: z.number().min(1).optional(),
  description: z.string().optional()
});
