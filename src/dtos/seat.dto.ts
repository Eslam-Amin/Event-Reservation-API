import { IsNumberString, IsString } from "class-validator";

export class EventIdParamDto {
  @IsNumberString({}, { message: "Event ID must be a string." })
  id!: string;
}

export class SeatReservationParamDto {
  @IsNumberString({}, { message: "Event ID must be a string." })
  id!: string;

  @IsString({})
  seatId!: string;
}
