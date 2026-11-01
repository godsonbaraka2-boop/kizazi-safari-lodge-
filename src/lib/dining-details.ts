import { z } from "zod";
import { ROOM_USD } from "./prices";

export const diningDetailsSchema = z.object({
  guestRoom: z.string().refine((room) => room === "Walk-in" || Object.hasOwn(ROOM_USD, room), "Please select a valid lodge room."),
  guestName: z.string().trim().min(1, "Please enter your name.").max(80),
  quantity: z.number().int().min(1).max(50),
});