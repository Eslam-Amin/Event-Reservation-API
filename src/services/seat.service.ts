import {
  seatRepository,
  Seat,
  SeatStatus
} from "../repositories/seat.repository";
import { ApiError } from "../utils/ApiError";

class SeatService {
  seatRepository = seatRepository;
  private EXPIRATION_TIME_MS = 10 * 60 * 1000; // 10 minutes lock

  private isExpired(reservedAt: Date | null): boolean {
    if (!reservedAt) return false;
    return (
      Date.now() - new Date(reservedAt).getTime() > this.EXPIRATION_TIME_MS
    );
  }

  // List seats with dynamic hybrid validation mapping
  async getEventsSeats(eventId: number): Promise<Seat[]> {
    const seats = await seatRepository.getSeatsByEventId(eventId);

    return seats.map((seat) => {
      // Lazy-evaluation check: If database record is expired, mask it to user as AVAILABLE
      if (
        seat.status === SeatStatus.RESERVED &&
        this.isExpired(seat.reserved_at)
      ) {
        return {
          ...seat,
          status: SeatStatus.AVAILABLE,
          reserved_by: null,
          reserved_at: null
        };
      }
      return seat;
    });
  }

  // Lock a single targeted seat
  async reserveSeat(
    eventId: number,
    seatId: number,
    userId: string
  ): Promise<void> {
    await this.seatRepository.tx(async (client) => {
      const seat = await this.seatRepository.getSeatForUpdate(
        client,
        eventId,
        seatId
      );

      if (!seat) {
        throw ApiError.notFound(
          "The requested seat does not exist for this event."
        );
      }

      // Check if seat is truly free or if its lock timer has already run down
      const isAvailable =
        seat.status === SeatStatus.AVAILABLE ||
        (seat.status === SeatStatus.RESERVED &&
          this.isExpired(seat.reserved_at));

      if (!isAvailable) {
        throw ApiError.badRequest(
          "This seat is already reserved by another user."
        );
      }

      // Assign structural asset reservation parameters securely
      await this.seatRepository.updateSeatStatus(
        client,
        seatId,
        SeatStatus.RESERVED,
        userId,
        new Date()
      );
    });
  }

  // Release an active reservation
  async releaseSeat(
    eventId: number,
    seatId: number,
    userId: string
  ): Promise<void> {
    await this.seatRepository.tx(async (client) => {
      const seat = await this.seatRepository.getSeatForUpdate(
        client,
        eventId,
        seatId
      );

      if (!seat) {
        throw ApiError.notFound("The requested seat does not exist.");
      } else if (seat.status === SeatStatus.AVAILABLE) {
        throw ApiError.badRequest("This seat is already active and available.");
      } else if (seat.status === SeatStatus.CONFIRMED) {
        throw ApiError.badRequest(
          "Cannot release a fully confirmed ticket purchase."
        );
      } else if (seat.reserved_by !== userId) {
        throw ApiError.forbidden(
          "You do not have permission to release a seat reserved by someone else."
        );
      }

      await this.seatRepository.updateSeatStatus(
        client,
        seatId,
        SeatStatus.AVAILABLE,
        null,
        null
      );
    });
  }

  async confirmSeat(
    eventId: number,
    seatId: number,
    userId: string
  ): Promise<void> {
    await this.seatRepository.tx(async (client) => {
      const seat = await this.seatRepository.getSeatForUpdate(
        client,
        eventId,
        seatId
      );

      if (!seat) {
        throw ApiError.notFound("The requested seat does not exist.");
      } else if (seat.status !== SeatStatus.RESERVED) {
        throw ApiError.badRequest("This seat is not reserved.");
      } else if (this.isExpired(seat.reserved_at)) {
        throw ApiError.badRequest(
          "This seat's reservation has been already expired."
        );
      } else if (seat.reserved_by !== userId) {
        throw ApiError.forbidden(
          "You do not have permission to confirm a seat reserved by someone else."
        );
      }

      await this.seatRepository.updateSeatStatus(
        client,
        seatId,
        SeatStatus.CONFIRMED,
        userId,
        null,
        new Date()
      );
    });
  }
}

export const seatService = new SeatService();
