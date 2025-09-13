export interface IRoom {
  _id?: string;
  roomNumber: number;
  floorNumber: number;
  indexOnFloor: number;
  isBooked: boolean;
}

export interface AllocationResult {
  allocated: IRoom[];
  travelTime: number;
}

export class AllocationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AllocationError";
  }
}

export function groupByFloor(rooms: IRoom[]): Map<number, IRoom[]> {
  const map = new Map<number, IRoom[]>();
  for (const r of rooms) {
    if (!map.has(r.floorNumber)) map.set(r.floorNumber, []);
    map.get(r.floorNumber)!.push(r);
  }
  for (const [, arr] of map) {
    arr.sort((a, b) => a.indexOnFloor - b.indexOnFloor);
  }
  return map;
}

function findMaxContiguousRuns(floorRooms: IRoom[]): IRoom[][] {
  const runs: IRoom[][] = [];
  let current: IRoom[] = [];
  for (let i = 0; i < floorRooms.length; i++) {
    const r = floorRooms[i];
    if (current.length === 0) {
      current.push(r);
    } else {
      const prev = current[current.length - 1];
      if (r.indexOnFloor === prev.indexOnFloor + 1) {
        current.push(r);
      } else {
        runs.push(current);
        current = [r];
      }
    }
  }
  if (current.length) runs.push(current);
  return runs;
}

function moveCost(a: IRoom, b: IRoom): number {
  if (a.floorNumber === b.floorNumber) {
    return Math.abs(a.indexOnFloor - b.indexOnFloor);
  }
  return (
    a.indexOnFloor +
    b.indexOnFloor +
    2 * Math.abs(a.floorNumber - b.floorNumber)
  );
}

export function calculateTravelTime(rooms: IRoom[]): number {
  const n = rooms.length;

  let best = Infinity;

  const arr = rooms.slice();
  const c = new Array(n).fill(0);

  const ORIGIN: IRoom = {
    roomNumber: 0,
    floorNumber: 1,
    indexOnFloor: 0,
    isBooked: false,
  };

  if (n === 0) return 0;
  if (n === 1) {
    return moveCost(ORIGIN, rooms[0]);
  }

  const evalOrder = (order: IRoom[]) => {
    let t = moveCost(ORIGIN, order[0]);
    for (let i = 0; i < order.length - 1; i++)
      t += moveCost(order[i], order[i + 1]);
    if (t < best) best = t;
  };

  evalOrder(arr);
  let i = 0;
  while (i < n) {
    if (c[i] < i) {
      if (i % 2 === 0) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
      } else {
        [arr[c[i]], arr[i]] = [arr[i], arr[c[i]]];
      }
      evalOrder(arr);
      c[i]++;
      i = 0;
    } else {
      c[i] = 0;
      i++;
    }
  }

  return best === Infinity ? 0 : best;
}

function generateDistributions(
  K: number,
  avail: number[],
  start = 0
): number[][] {
  const N = avail.length;
  const results: number[][] = [];
  function dfs(i: number, remaining: number, acc: number[]) {
    if (i === N) {
      if (remaining === 0) results.push(acc.slice());
      return;
    }
    const maxOnThis = Math.min(avail[i], remaining);
    for (let take = 0; take <= maxOnThis; take++) {
      acc.push(take);
      dfs(i + 1, remaining - take, acc);
      acc.pop();
    }
  }
  dfs(start, K, []);
  return results;
}

export function allocateRooms(
  requested: number,
  available: IRoom[]
): AllocationResult {
  if (requested < 1)
    throw new AllocationError("Requested rooms must be at least 1.");
  if (requested > 5) throw new AllocationError("You can book at most 5 rooms.");
  const free = available.filter((r) => !r.isBooked);
  if (free.length < requested)
    throw new AllocationError("Not enough rooms available.");

  const byFloor = groupByFloor(free);
  let bestContiguous: IRoom[] | null = null;
  let bestContiguousTime: number = Infinity;
  for (const [, rooms] of byFloor) {
    const runs = findMaxContiguousRuns(rooms);
    for (const run of runs) {
      if (run.length >= requested) {
        const candidate = run.slice(0, requested);
        const candTime = calculateTravelTime(candidate);
        if (
          !bestContiguous ||
          candTime < bestContiguousTime ||
          (candTime === bestContiguousTime &&
            candidate[0].indexOnFloor < bestContiguous[0].indexOnFloor)
        ) {
          bestContiguous = candidate;
          bestContiguousTime = candTime;
        }
      }
    }
  }
  if (bestContiguous) {
    return { allocated: bestContiguous, travelTime: bestContiguousTime };
  }

  const floors = Array.from(byFloor.keys()).sort((a, b) => a - b);
  const floorRoomsSorted = floors.map((f) =>
    byFloor
      .get(f)!
      .slice()
      .sort((a, b) => a.indexOnFloor - b.indexOnFloor)
  );
  const availPerFloor = floorRoomsSorted.map((r) => r.length);

  const distributions = generateDistributions(requested, availPerFloor);
  if (!distributions.length) {
    throw new AllocationError("Unable to allocate the requested rooms.");
  }

  let best: AllocationResult | null = null;
  for (const dist of distributions) {
    const chosen: IRoom[] = [];
    for (let i = 0; i < dist.length; i++) {
      const count = dist[i];
      if (count === 0) continue;
      const floorArr = floorRoomsSorted[i];
      let seg: IRoom[] = [];
      let segTime = Infinity;
      if (count === 1) {
        for (const r of floorArr) {
          const t = calculateTravelTime([r]);
          if (t < segTime) {
            segTime = t;
            seg = [r];
          }
        }
      } else {
        const candidate = floorArr.slice(0, count);
        seg = candidate;
      }
      if (seg.length !== count) {
        chosen.length = 0;
        break;
      }
      chosen.push(...seg);
    }
    if (!chosen.length) continue;
    const time = calculateTravelTime(chosen);
    if (!best || time < best.travelTime) {
      best = { allocated: chosen, travelTime: time };
    }
  }

  if (!best)
    throw new AllocationError("Unable to allocate the requested rooms.");
  return best;
}

export default {
  allocateRooms,
  groupByFloor,
  calculateTravelTime,
};
