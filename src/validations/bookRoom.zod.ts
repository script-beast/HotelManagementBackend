import { z } from "zod";

const bookRoom = z.object({
  requested: z
    .number({ message: "Room number must be a number" })
    .min(1, { message: "Room number must be greater than 0" })
    .max(5, { message: "Room number must be less than 5" }),
});

export default bookRoom;
type bookRoomType = z.infer<typeof bookRoom>;

export { bookRoomType };
