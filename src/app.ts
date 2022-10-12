import express, { Express, Request, Response } from "express";
import * as configs from "./config/app.config";

export const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.send("Zeal + Clockify App");
});

app.get("/reportingPeriods", (_req: Request, res: Response) => {
  res.json(configs.defReportingPeriods)
})

app.listen(configs.port, () => {
  console.log(
    `🦓🦓🦓 [SERVER_START]: Server is running at http://localhost:${configs.port}`
  );
});
