import { Response, Request } from "express";
import mongoose from "mongoose";

import roomsModel from "../models/rooms.model";
import catchAsync from "../utils/catchAsync.utils";
import ExpressResponse from "../libs/express/response.libs";

import {
  RoomDocument,
  RoomType,
} from "../interfaces/models/RoomsDetails.types";
import { bookRoomType, travelTimeType } from "../validations";

class companyController {
  public initiateRooms = catchAsync(async (req: Request, res: Response) => {
    await roomsModel.deleteMany({});

    const rooms: RoomType[] = [];
    for (let i = 1; i <= 10; i++) {
      for (let j = 1; j <= (i === 10 ? 7 : 10); j++) {
        rooms.push({
          roomNumber: i * 100 + j,
          isBooked: false,
          floorNumber: i,
        });
      }
    }

    await roomsModel.insertMany(rooms);

    ExpressResponse.accepted(res, "Rooms initiated successfully");
  });

  public bookRooms = catchAsync(async (req: Request, res: Response) => {
    const { number } = req.body as bookRoomType;

    const availableRooms = await roomsModel
      .find({ isBooked: false })
      .sort({ floorNumber: 1, roomNumber: 1 });

    if (availableRooms.length < number) {
      return ExpressResponse.badRequest(
        res,
        "Not enough rooms available to book."
      );
    }

    let bookedRooms: RoomDocument[] = [];
    let currentFloor = availableRooms[0].floorNumber;
    let roomsOnCurrentFloor = availableRooms.filter(
      (room) => room.floorNumber === currentFloor
    );

    if (roomsOnCurrentFloor.length >= number) {
      bookedRooms = roomsOnCurrentFloor.slice(0, number);
    } else {
      bookedRooms = roomsOnCurrentFloor;
      let remainingRooms = number - roomsOnCurrentFloor.length;

      for (let i = 1; i < availableRooms.length && remainingRooms > 0; i++) {
        if (availableRooms[i].floorNumber !== currentFloor) {
          currentFloor = availableRooms[i].floorNumber;
          roomsOnCurrentFloor = availableRooms.filter(
            (room) => room.floorNumber === currentFloor
          );
        }

        if (roomsOnCurrentFloor.length > 0) {
          const roomsToBook = roomsOnCurrentFloor.slice(0, remainingRooms);
          bookedRooms = bookedRooms.concat(roomsToBook);
          remainingRooms -= roomsToBook.length;
        }
      }
    }

    if (bookedRooms.length !== number) {
      return ExpressResponse.badRequest(
        res,
        "Unable to book the required number of rooms."
      );
    }

    const roomIds = bookedRooms.map((room) => room._id);
    await roomsModel.updateMany({ _id: { $in: roomIds } }, { isBooked: true });

    ExpressResponse.accepted(res, "Rooms booked successfully");
  });

  public getAllRooms = catchAsync(async (req: Request, res: Response) => {
    const rooms = await roomsModel.find({}).lean();

    const rooms2D: RoomType[][] = [];

    for (let i = 1; i <= 10; i++) {
      const floorRooms = rooms.filter((room) => room.floorNumber === i);
      rooms2D.push(floorRooms);
    }

    ExpressResponse.success(res, "Rooms fetched successfully", rooms2D);
  });

  public resetCompanies = catchAsync(async (req: Request, res: Response) => {
    await roomsModel.deleteMany({});

    const rooms: RoomType[] = [];
    for (let i = 1; i <= 10; i++) {
      for (let j = 1; j <= (i === 10 ? 7 : 10); j++) {
        rooms.push({
          roomNumber: i * 100 + j,
          isBooked: false,
          floorNumber: i,
        });
      }
    }

    await roomsModel.insertMany(rooms);

    ExpressResponse.accepted(res, "Rooms reset successfully");
  });

  public randomRooms = catchAsync(async (req: Request, res: Response) => {
    const rooms = await roomsModel.find({}).lean();

    // Mark 10 random rooms as booked

    const randomRooms = rooms.sort(() => 0.5 - Math.random()).slice(0, 10);

    const roomIds = randomRooms.map((room) => room._id);
    await roomsModel.updateMany({ _id: { $in: roomIds } }, { isBooked: true });

    ExpressResponse.accepted(res, "Rooms booked successfully");
  });

  public getTravelTime = catchAsync(async (req: Request, res: Response) => {
    const { roomNumber1, roomNumber2 } = req.body as travelTimeType;

    const floorRoom1 = Math.floor(roomNumber1 / 100);
    const floorRoom2 = Math.floor(roomNumber2 / 100);

    let travelTime = 0;

    if (floorRoom1 === floorRoom2) {
      travelTime = Math.abs(roomNumber1 - roomNumber2);
    } else {
      travelTime = Math.abs(floorRoom1 - floorRoom2) * 2;
      travelTime += roomNumber2;
      travelTime += roomNumber1;
    }

    ExpressResponse.success(res, "Travel time calculated successfully", {
      travelTime,
    });
  });
}

export default new companyController();
