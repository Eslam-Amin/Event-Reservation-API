import { Response, Request, NextFunction } from "express";
import { seatService } from "../services/seat.service";
import { catchAsync } from "../utils/catch-async";

type Params = {
  id: string;
  seatId: string;
};

class SeatController {
  getEventsSeats = catchAsync(
    async (req: Request<Params>, res: Response): Promise<void> => {
      const eventId = parseInt(req.params.id, 10);
      const seats = await seatService.getEventsSeats(eventId);

      res.status(200).json({
        success: true,
        data: seats
      });
    }
  );

  reserveSeat = catchAsync(
    async (
      req: Request<Params, {}, { email: string }>,
      res: Response
    ): Promise<void> => {
      const eventId = parseInt(req.params.id, 10);
      const seatId = req.params.seatId;
      const userId = req.body.email;

      await seatService.reserveSeat(eventId, seatId, userId);

      res.status(200).json({
        success: true,
        message: "Seat successfully reserved for 10 minutes."
      });
    }
  );

  releaseSeat = catchAsync(
    async (
      req: Request<Params, {}, { email: string }>,
      res: Response
    ): Promise<void> => {
      const eventId = parseInt(req.params.id, 10);
      const seatId = req.params.seatId;
      const userId = req.body.email;

      await seatService.releaseSeat(eventId, seatId, userId);

      res.status(200).json({
        success: true,
        message: "Seat reservation successfully released."
      });
    }
  );

  confirmSeat = catchAsync(
    async (
      req: Request<Params, {}, { email: string }>,
      res: Response
    ): Promise<void> => {
      const eventId = parseInt(req.params.id, 10);
      const seatId = req.params.seatId;
      const userId = req.body.email;
      await seatService.confirmSeat(eventId, seatId, userId);

      res.status(200).json({
        success: true,
        message: "Seat reservation successfully confirmed."
      });
    }
  );
}

export const seatController = new SeatController();
