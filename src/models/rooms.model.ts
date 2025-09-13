import mongoose from "mongoose";
import { RoomDocument } from "../interfaces/models/RoomsDetails.types";

const roomsSchema = new mongoose.Schema<RoomDocument>(
  {
    roomNumber: { type: Number, required: true },
    isBooked: { type: Boolean, required: true },
    floorNumber: { type: Number, required: true },
    indexOnFloor: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<RoomDocument>("rooms", roomsSchema);
