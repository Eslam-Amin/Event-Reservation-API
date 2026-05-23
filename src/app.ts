import "reflect-metadata"; // Must be the absolute first import for DTO decorators
import express, { Application } from "express";
import seatRoutes from "./routes/seat.routes";
import { globalErrorHandler } from "./middlewares/error.middleware";

const app: Application = express();

app.use(express.json());

app.use(seatRoutes);

app.use(globalErrorHandler);

export default app;
