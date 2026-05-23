import { Router } from "express";
import { seatController } from "../controllers/seat.controller";
import { validateDto } from "../middlewares/validation.middleware";
import { EventIdParamDto, SeatReservationParamDto } from "../dtos/seat.dto";

const router = Router();

router.get(
  "/events/:id/seats",
  validateDto(EventIdParamDto, "params"),
  seatController.getEventsSeats
);

router.post(
  "/events/:id/seats/:seatId/reserve",
  validateDto(SeatReservationParamDto, "params"),
  seatController.reserveSeat
);

router.post(
  "/events/:id/seats/:seatId/release",
  validateDto(SeatReservationParamDto, "params"),
  seatController.releaseSeat
);

router.post(
  "/events/:id/seats/:seatId/confirm",
  validateDto(SeatReservationParamDto, "params"),
  seatController.confirmSeat
);

export default router;
