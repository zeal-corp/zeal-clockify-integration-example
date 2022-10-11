import express, { Express, Request, Response } from "express";

export const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.send("Zeal + Clockify App");
});

app.listen(3000, () => {
  console.log(
    `🦓🦓🦓 [SERVER_START]: Server is running at http://localhost:${3000}`
  );
});
