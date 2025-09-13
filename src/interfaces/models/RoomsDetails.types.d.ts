import mongoose from "mongoose";

export type RoomType = {
  roomNumber: number;
  isBooked: boolean;
  floorNumber: number;
  indexOnFloor: number;
};

export type RoomDocument = mongoose.Document & RoomType;
