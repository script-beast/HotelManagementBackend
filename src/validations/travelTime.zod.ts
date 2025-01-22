import { z } from "zod";

const travelTime = z.object({
  roomNumber1: z
    .number({ message: "Room number must be a number" })
    .min(101, { message: "Room number must be greater than 101" })
    .max(1007, { message: "Room number must be less than 1007" }),
  roomNumber2: z
    .number({ message: "Room number must be a number" })
    .min(101, { message: "Room number must be greater than 101" })
    .max(1007, { message: "Room number must be less than 1007" }),
});

export default travelTime;

type travelTimeType = z.infer<typeof travelTime>;

export { travelTimeType };