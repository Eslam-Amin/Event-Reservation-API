import "reflect-metadata"; // Must be the absolute first import for DTO decorators
import express, { Application } from "express";
import seatRoutes from "./routes/seat.routes";
import { globalErrorHandler } from "./middlewares/error.middleware";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../swagger-docs.json"; // Ensure resolveJsonModule is true in tsconfig

const app: Application = express();

app.use(express.json());
// Mount Interactive Explorer UI endpoint
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(seatRoutes);

app.use(globalErrorHandler);

export default app;
