import { Request, Response, NextFunction } from "express";
import { ZealException } from "../services/zeal";
import {
  TimeEntryException,
  ResourceNotFoundException,
} from "../utils/exceptions";

export function handleErrors<E extends Error>(
  err: E,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("ERROR: " + err.message);

  let stdErrBody = {
    success: false,
    errorType: err.name,
  };

  if (err instanceof ZealException) {
    return res.status(err.status || 500).json({
      ...stdErrBody,
      errors: err.errors,
    });
  } else if (
    err instanceof ResourceNotFoundException ||
    err instanceof TimeEntryException
  ) {
    return res.status(err.status || 500).json({
      ...stdErrBody,
      error: err.message,
    });
  } else {
    return res.status(500).json({
      ...stdErrBody,
      error: `An uknown error has occurred at ${err.stack}`,
    });
  }
}
