import { describe, expect, test, jest } from "@jest/globals";
import { Request} from "express";
import {
  mockTimerStopped,
  mockEmployees,
  mockEmployeeCheck,
} from "../mock-data";
import * as TimeEntryController from "../../src/controllers/timeEntry.controller";
import { ZealClient } from "../../src/services/zeal";
import {
  ResourceNotFoundException,
  InvalidTimeEntryException,
} from "../../src/utils/exceptions";

describe("Time Entry Controller", () => {

  describe("findEmployeeByClockifyID", () => {
    test("given a Clockify ID associated with Zeal Employee it returns that employee", async () => {
      jest
        .spyOn(ZealClient.prototype, "getAllEmployees")
        .mockResolvedValueOnce(new Array(mockEmployees.data[2]));

      const resp = await TimeEntryController.findEmployeeByClockifyID(
        "XXXXXXXXXXXXXXXXXXXX64ea"
      );

      expect(resp.email).toEqual("richard@piedpiper.com");
    });

    test("given a Clockify ID that is not associated with a Zeal Employee it throws a ResourceNotFoundException", async () => {
      jest
        .spyOn(ZealClient.prototype, "getAllEmployees")
        .mockResolvedValueOnce([]);

      await expect(
        TimeEntryController.findEmployeeByClockifyID("UNASSOCIATED_ID")
      ).rejects.toThrowError(ResourceNotFoundException);
    });
  });

  describe("findReportingPeriod", () => {
    test("given a recent start date it returns the matching reporting period", () => {
      jest
        .spyOn(TimeEntryController, "findMatchingReportingPeriod")
        .mockReturnValueOnce({
          reportingPeriodID: "61d5556db8809ab05d4c16f4",
          pay_schedule: "weekly",
          start: "2022-09-03",
          end: "2022-09-09",
        });

      const rp = TimeEntryController.findReportingPeriod(
        "2022-09-08T14:30:34Z"
      );

      expect(rp.reportingPeriodID).toEqual("61d5556db8809ab05d4c16f4");
    });

    test("given a start date far in the past it throws a ResourceNotFoundException", () => {
      jest
        .spyOn(TimeEntryController, "findMatchingReportingPeriod")
        .mockReturnValue(undefined);

      expect(() =>
        TimeEntryController.findReportingPeriod("2022-01-01T14:30:34Z")
      ).toThrowError(ResourceNotFoundException);
    });
  });

  describe("buildShift", () => {
    test("given a vaild Time Interval object it returns a related shift object", () => {
      const shift = TimeEntryController.buildShift({
        end: "2022-09-03T17:24:34Z",
        duration: "PT8H24M34S",
      });
      expect(shift).toEqual({
        time: "2022-09-03T17:24:34Z",
        hourly: {
          hours: 8.41,
        },
      });
    });

    test("given a Time Interval with a duration that is too short it returns an InvalidTimeEntryException", () => {
      expect(() =>
        TimeEntryController.buildShift({
          end: "2022-09-03T17:24:34Z",
          duration: "PT10S",
        })
      ).toThrowError(InvalidTimeEntryException);
    });
  });

  describe("setCheckDate", () => {
    test("given a reporting period it sets the check date to one week from the end of the reporting period", () => {
      const checkDate = TimeEntryController.setCheckDate({
        reportingPeriodID: "61d5556db8809ab05d4c16f9",
        pay_schedule: "weekly",
        start: "2022-09-08",
        end: "2022-09-14",
      });

      expect(checkDate).toEqual("2022-09-21");
    });
  });

  describe("createOrUpdateEmployeeCheck", () => {
    const expressRequest = {
      body: mockTimerStopped,
    } as Request;

    const employee = {
      employeeID: "XXXXXXXXXXXXXXXXXXXXXXXXXX383a",
    };

    const reportingPeriod = {
      reportingPeriodID: "61d5556db8809ab05d4c16f9",
    };

    test("given a reporting period that has an existing check in Zeal it calls updateCheck", async () => {
      jest
        .spyOn(TimeEntryController, "getAnyExistingCheck")
        .mockResolvedValueOnce(mockEmployeeCheck.data);

      const updateCheck = jest
        .spyOn(TimeEntryController, "updateCheck")
        .mockImplementation(async () => {
          return Promise.resolve({});
        });

      await TimeEntryController.createOrUpdateEmployeeCheck(
        expressRequest,
        employee,
        reportingPeriod
      );

      expect(updateCheck).toBeCalled();
    });

    test("given a reporting period that doesn't have an existing check in Zeal it calls createCheck", async () => {
      jest
        .spyOn(TimeEntryController, "getAnyExistingCheck")
        .mockResolvedValueOnce(undefined);

      const createCheck = jest
        .spyOn(TimeEntryController, "createCheck")
        .mockImplementation(async () => {
          return Promise.resolve({});
        });

      await TimeEntryController.createOrUpdateEmployeeCheck(
        expressRequest,
        employee,
        reportingPeriod
      );

      expect(createCheck).toBeCalled();
    });
  });
});
