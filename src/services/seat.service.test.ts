import { seatService } from "./seat.service";
import { ApiError } from "../utils/ApiError";

describe("SeatService Unit Tests (v1.0.0)", () => {
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      getSeatForUpdate: jest.fn(),
      updateSeatStatus: jest.fn(),
      tx: jest.fn(async (callback) => callback({}))
    };

    seatService.seatRepository = mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
