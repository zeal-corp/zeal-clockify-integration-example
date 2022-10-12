import express, {Router } from "express";
import * as TimeEntryController from "../controllers/timeEntry.controller";

export const timeEntry: Router = express.Router()

timeEntry.post("/timer-stopped", TimeEntryController.handleTimeEntry)