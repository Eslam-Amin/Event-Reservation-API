import { seatRepository, Seat } from "../repositories/seat.repository";

class SeatService {
  // List seats with dynamic hybrid validation mapping
  async getEventsSeats(eventId: number): Promise<Seat[]> {
    const seats = await seatRepository.getSeatsByEventId(eventId);
    return seats;
  }
}

export const seatService = new SeatService();
