import express from "express";

import roomController from "../controllers/rooms.controller";

import validate from "../middlewares/validation.zod";

import roomBook from "../validations/bookRoom.zod";
import travelTime from "../validations/travelTime.zod";

const router = express.Router();

// Seed/init
router.post("/api/init", roomController.initiateRooms);

// Spec endpoints
router.get("/api/status", roomController.getAllRooms);
router.post("/api/book", validate(roomBook), roomController.bookRooms);
router.post("/api/randomize", roomController.randomRooms);
router.post("/api/reset", roomController.resetCompanies);

// Utility (optional)
router.post("/api/travel-time", validate(travelTime), roomController.getTravelTime);

// Backward compat for earlier paths (optional)
router.get("/get-all-rooms", roomController.getAllRooms);
router.post("/book-room", validate(roomBook), roomController.bookRooms);
router.patch("/random-rooms", roomController.randomRooms);
router.patch("/reset-rooms", roomController.resetCompanies);

export default router;
