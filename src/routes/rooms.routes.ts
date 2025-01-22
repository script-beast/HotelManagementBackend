import express from "express";

import roomController from "../controllers/rooms.controller";

import validate from "../middlewares/validation.zod";

import roomBook from "../validations/bookRoom.zod";
import travelTime from "../validations/travelTime.zod";

const router = express.Router();

router.get("/initiate-rooms", roomController.initiateRooms);

router.post("/book-room", validate(roomBook), roomController.bookRooms);

router.get("/get-all-rooms", roomController.getAllRooms);

router.patch("/reset-rooms", roomController.resetCompanies);

router.patch("/random-rooms", roomController.randomRooms);

router.post(
  "get-travel-time",
  validate(travelTime),
  roomController.getTravelTime
);

export default router;
