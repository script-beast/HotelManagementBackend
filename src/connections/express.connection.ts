import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";

import ExpressError from "../libs/express/error.libs";
import ExpressErrorMiddleWare from "../middlewares/errorHandle.error";

import roomsRoutes from "../routes/rooms.routes";

export default class ExpressConnection {
  private app: Application;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  private middlewares() {
    this.app.use(cors());
    this.app.use(morgan("dev"));
    this.app.use(bodyParser.json({ limit: "30mb" }));
    this.app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
  }

  private routes() {
    this.app.get("/test", (req: Request, res: Response, next: NextFunction) => {
      res.json({ message: "Hello World" });
    });
    this.app.use("/", roomsRoutes);
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      next(new ExpressError(404, "Not Found"));
    });
    this.app.use(ExpressErrorMiddleWare);
  }

  public start(port: number) {
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}
