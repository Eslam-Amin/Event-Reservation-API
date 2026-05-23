import { IsNumberString } from "class-validator";

export class EventIdParamDto {
  @IsNumberString({}, { message: "Event ID must be a string." })
  id!: string;
}

export class SeatReservationParamDto {
  @IsNumberString({}, { message: "Event ID must be a string." })
  id!: string;

  @IsNumberString({}, { message: "Seat ID must be a string." })
  seatId!: string;
}
