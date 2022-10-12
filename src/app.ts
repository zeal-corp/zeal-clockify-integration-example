import express, { Express, Request, Response } from "express";
import * as configs from "./config/app.config";
import { timeEntry } from "./routes/timeEntry.route";
import { logger } from "./middleware/logger.middleware";
import { handleErrors } from "./middleware/errorHandler.middleware";

export const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);

app.get("/", (_req: Request, res: Response) => {
  res.send("Zeal + Clockify App");
});

app.get("/reporting-periods", (_req: Request, res: Response) => {
  res.json(configs.defReportingPeriods);
});

app.use("/time-entry", timeEntry);

app.use(handleErrors);

app.listen(configs.port, () => {
  console.log(
    `🦓🦓🦓 [SERVER_START]: Server is running at http://localhost:${configs.port}`
  );
});
