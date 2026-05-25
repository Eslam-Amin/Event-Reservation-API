import { IsNumberString, IsString, IsEmail, IsNotEmpty } from "class-validator";

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


export class CreateReservationBodyDto {
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email format" })
  email!: string;
}