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

    it("should successfully update status if the seat is AVAILABLE", async () => {
      const mockAvailableSeat = {
        seat_number: "A-10",
        id: 10,
        status: "AVAILABLE",
        event_id: 1
      };
      mockRepository.getSeatForUpdate.mockResolvedValue(mockAvailableSeat);

      await seatService.reserveSeat(10, "buyer@test.com");

      expect(mockRepository.updateSeatStatus).toHaveBeenCalled();
    });

    it("should throw a 400 error and not reserve seat if the seat is RESERVED", async () => {
      const mockReservedSeat = {
        id: 10,
        seat_number: "A-10",
        status: "RESERVED",
        event_id: 1,
        reserved_at: new Date()
      };
      mockRepository.getSeatForUpdate.mockResolvedValue(mockReservedSeat);

      await expect(seatService.reserveSeat(10, "qa@test.com")).rejects.toThrow(
        ApiError.badRequest("This seat is already reserved by another user.")
      );
    });
  });
});
