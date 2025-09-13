import { Response, Request } from "express";

import roomsModel from "../models/rooms.model";
import catchAsync from "../utils/catchAsync.utils";
import ExpressResponse from "../libs/express/response.libs";

import { RoomType } from "../interfaces/models/RoomsDetails.types";
import { bookRoomType, travelTimeType } from "../validations";
import {
  allocateRooms,
  AllocationError,
  IRoom,
  calculateTravelTime,
} from "../services/allocation.service";

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
          indexOnFloor: j - 1,
        });
      }
    }

    await roomsModel.insertMany(rooms);

    ExpressResponse.accepted(res, "Rooms initiated successfully");
  });

  public bookRooms = catchAsync(async (req: Request, res: Response) => {
    const { requested } = req.body as bookRoomType;

    const availableDocs = await roomsModel
      .find({ isBooked: false })
      .sort({ floorNumber: 1, roomNumber: 1 })
      .lean();

    const available: IRoom[] = availableDocs.map((r: any) => ({
      _id: String(r._id),
      roomNumber: r.roomNumber,
      floorNumber: r.floorNumber,
      indexOnFloor: r.indexOnFloor,
      isBooked: r.isBooked,
    }));

    try {
      const { allocated, travelTime } = allocateRooms(requested, available);
      const ids = allocated.map((r) => r._id);
      await roomsModel.updateMany(
        { _id: { $in: ids } },
        { $set: { isBooked: true } }
      );

      return ExpressResponse.success(res, "Rooms booked successfully", {
        allocated,
        travelTime,
      });
    } catch (e) {
      if (e instanceof AllocationError) {
        return ExpressResponse.badRequest(res, e.message);
      }
      throw e;
    }
  });

  public getAllRooms = catchAsync(async (req: Request, res: Response) => {
    const rooms = await roomsModel
      .find({})
      .sort({ floorNumber: 1, roomNumber: 1 })
      .lean();
    ExpressResponse.success(res, "Rooms fetched successfully", rooms);
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
          indexOnFloor: j - 1,
        });
      }
    }

    await roomsModel.insertMany(rooms);

    ExpressResponse.accepted(res, "Rooms reset successfully");
  });

  public randomRooms = catchAsync(async (req: Request, res: Response) => {
    const { percent } = req.body as { percent?: number };
    const p = Math.min(100, Math.max(0, percent ?? 30));

    const rooms = await roomsModel.find({}).lean();
    const targetCount = Math.floor((rooms.length * p) / 100);
    const shuffled = [...rooms].sort(() => 0.5 - Math.random());
    const randomRooms = shuffled.slice(0, targetCount);

    const roomIds = randomRooms.map((room: any) => room._id);
    await roomsModel.updateMany({ _id: { $in: roomIds } }, { isBooked: true });

    ExpressResponse.accepted(res, "Random rooms booked successfully");
  });

  public getTravelTime = catchAsync(async (req: Request, res: Response) => {
    const { roomNumber1, roomNumber2 } = req.body as travelTimeType;

    // Find rooms to get indexOnFloor
    const docs = await roomsModel
      .find({ roomNumber: { $in: [roomNumber1, roomNumber2] } })
      .lean();
    const a = docs.find((d: any) => d.roomNumber === roomNumber1);
    const b = docs.find((d: any) => d.roomNumber === roomNumber2);
    if (!a || !b)
      return ExpressResponse.badRequest(res, "Invalid room numbers");

    const time = calculateTravelTime([
      {
        roomNumber: a.roomNumber,
        floorNumber: a.floorNumber,
        indexOnFloor: a.indexOnFloor,
        isBooked: a.isBooked,
      },
      {
        roomNumber: b.roomNumber,
        floorNumber: b.floorNumber,
        indexOnFloor: b.indexOnFloor,
        isBooked: b.isBooked,
      },
    ]);

    ExpressResponse.success(res, "Travel time calculated successfully", {
      travelTime: time,
    });
  });
}

export default new companyController();
