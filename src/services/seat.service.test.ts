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

    it("should safely reject the second concurrent request when two calls execute at the exact same time", async () => {
      let resolveRowLock: (value: any) => void = () => {};
      const databaseLockLatencyPromise = new Promise((resolve) => {
        resolveRowLock = resolve;
      });

      const mockSeatData = {
        id: 10,
        event_id: 1,
        seat_number: "A-10",
        status: "AVAILABLE"
      };

      mockRepository.getSeatForUpdate.mockImplementationOnce(async () => {
        await databaseLockLatencyPromise; // Simulates holding a row-level transactional lock
        return mockSeatData;
      });

      mockRepository.getSeatForUpdate.mockImplementationOnce(async () => {
        return { ...mockSeatData, status: "RESERVED" }; // Wakes up to find Request 1 changed the state
      });

      const request1Promise = seatService.reserveSeat(10, "buyer_one@test.com");
      const request2Promise = seatService.reserveSeat(10, "buyer_two@test.com");

      resolveRowLock(mockSeatData);

      const outcomes = await Promise.allSettled([
        request1Promise,
        request2Promise
      ]);

      const successCall = outcomes.find((o) => o.status === "fulfilled");
      const rejectedCall = outcomes.find(
        (o) => o.status === "rejected"
      ) as PromiseRejectedResult;

      expect(successCall).toBeDefined();
      expect(rejectedCall).toBeDefined();
      expect(rejectedCall.reason.statusCode).toBe(400);
      expect(rejectedCall.reason.message).toContain(
        "This seat is already reserved by another user."
      );
    });
  });
});
