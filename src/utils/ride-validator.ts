import { z } from 'zod';

export const createRideData = z.object({
  driverId: z.string().uuid(),
  availablePlaces: z.number().min(1),
  carId: z.string().uuid(),
  from: z.string(),
  to: z.string(),
  distanceMeters: z.number().min(1),
  timeMinutes: z.number().min(1),
  description: z.string().optional()
});

export const addPassenger = z.object({
  userId: z.string()
});

export const updateRideData = z.object({
  driverId: z.string().uuid().optional(),
  availablePlaces: z.number().min(1).optional(),
  carId: z.string().uuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  distanceMeters: z.number().min(1).optional(),
  timeMinutes: z.number().min(1).optional(),
  description: z.string().optional()
});
