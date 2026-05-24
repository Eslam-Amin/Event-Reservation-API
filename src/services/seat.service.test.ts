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

  describe("reserveSeat", () => {
    it("should throw a 404 ApiError if the target seat record does not exist", async () => {
      mockRepository.getSeatForUpdate.mockResolvedValue(null);

      await expect(seatService.reserveSeat(999, "qa@test.com")).rejects.toThrow(
        ApiError.notFound("The requested seat does not exist for this event.")
      );
    });
  });
});
