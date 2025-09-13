import { allocateRooms, AllocationError, calculateTravelTime, IRoom } from "../src/services/allocation.service";

describe("allocateRooms", () => {
  const makeFloor = (floor: number, count: number, booked: number[] = []): IRoom[] => {
    const arr: IRoom[] = [];
    for (let j = 1; j <= count; j++) {
      arr.push({
        roomNumber: floor * 100 + j,
        floorNumber: floor,
        indexOnFloor: j - 1,
        isBooked: booked.includes(j),
      });
    }
    return arr;
  };

  test("rejects request > 5", () => {
    expect(() => allocateRooms(6, makeFloor(1, 10))).toThrow(AllocationError);
  });

  test("not enough rooms available", () => {
    const rooms = makeFloor(1, 3).map(r => ({ ...r, isBooked: true }));
    expect(() => allocateRooms(1, rooms)).toThrow(AllocationError);
  });

  test("single-floor contiguous allocation", () => {
    const rooms = makeFloor(1, 10);
    const res = allocateRooms(4, rooms);
    expect(res.allocated.map(r => r.roomNumber)).toEqual([101, 102, 103, 104]);
    expect(res.travelTime).toBe(3); // 4 rooms contiguous => 3 moves
  });

  test("multi-floor allocation minimal travel", () => {
    // Break floor 1 contiguity to force multi-floor
    const floor1 = makeFloor(1, 10, [2,3,4,6,7,8,9,10]); // free: 101,105
    const floor2 = makeFloor(2, 10, [2,3,4,5,6,7,8,9,10]); // free: 201
    const all = [...floor1, ...floor2];
    const res = allocateRooms(3, all);
    // Expect leftmost picks: 101 (idx 0), 105 (idx 4), 201 (idx 0)
    expect(res.allocated.map(r => r.roomNumber).sort()).toEqual([101,105,201].sort());
    // Travel time calculation sanity
    const t = calculateTravelTime(res.allocated);
    expect(res.travelTime).toBe(t);
  });
});
