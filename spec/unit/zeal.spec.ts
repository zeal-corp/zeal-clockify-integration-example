import {
  describe,
  expect,
  test,
  beforeEach,
  beforeAll,
  jest,
} from "@jest/globals";
import {
  ZealFactory,
  ZealClient,
  ZealException,
} from "../../src/services/zeal";
import axios, { AxiosInstance } from "axios";
import { mockReportingPeriods, mockEmployeeCheck } from "../mock-data";

describe("Zeal", () => {
  const companyID = "XXXXXXXXXXXXXXXXXX4562";
  let zealClient: ZealClient;
  let axiosClient: AxiosInstance;
  beforeAll(() => {
    axiosClient = axios.create({});
  });

  beforeEach(() => {
    zealClient = ZealFactory.fromCustomClient(axiosClient);
  });

  describe("#getReportingPeriodsByDateRange", () => {
    test("given companyID and pay_schedule it returns a list of reporting periods", async () => {
      jest.spyOn(axiosClient, "get").mockResolvedValueOnce({
        data: mockReportingPeriods,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      const reportingPeriods = await zealClient.getReportingPeriodsByDateRange({
        companyID,
        pay_schedule: "weekly",
      });
      expect(reportingPeriods).toContainEqual({
        reportingPeriodID: "61d5556db8809ab05d4c176a",
        pay_schedule: "weekly",
        start: "2022-12-30",
        end: "2023-01-05",
      });
    });

    test("given a searchStart but not a searchEnd it returns an error", async () => {
      jest.spyOn(axiosClient, "get").mockRejectedValueOnce({
        response: {
          data: {
            errors: [
              { message: "please include searchStart and searchEnd", code: 13 },
            ],
          },
          status: 400,
        },
      });

      await expect(
        zealClient.getReportingPeriodsByDateRange({
          companyID,
          pay_schedule: "weekly",
          searchStart: "2021-01-09",
        })
      ).rejects.toThrowError(ZealException);
    });
  });

  describe("#createEmployeeCheck", () => {
    const employeeID = "XXXXXXXXXXXXXXXXXXXXXXXXXX3808";

    test("given employee check data it creates an employee check", async () => {
      jest.spyOn(axiosClient, "post").mockResolvedValueOnce({
        data: mockEmployeeCheck,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      });

      await expect(
        zealClient.createEmployeeCheck({
          companyID,
          employeeID,
          reportingPeriodID: "61d5556db8809ab05d4c1709",
          check_date: "2022-10-03",
          shifts: [
            {
              time: "2022-09-20T14:30:34Z",
              hourly: {
                hours: 4,
                wage: 20,
              },
            },
          ],
        })
      ).resolves.toBeTruthy();
    });

    test("given an invalid check date it throws an error", async () => {
      jest.spyOn(axiosClient, "post").mockRejectedValueOnce({
        response: {
          data: {
            errors: [
              {
                message:
                  "The given date is on a weekend/bank holiday or the current time is after 2 PM two days before the given date. Please correct the date and resubmit.",
                code: 89,
              },
            ],
          },
          status: 400,
        },
      });

      await expect(
        zealClient.createEmployeeCheck({
          companyID,
          employeeID,
          reportingPeriodID: "61d5556db8809ab05d4c1713",
          check_date: "2022-10-10",
          shifts: [
            {
              time: "2022-10-03T14:30:34Z",
              hourly: {
                hours: 4,
                wage: 20,
              },
            },
          ],
        })
      ).rejects.toThrowError(ZealException);
    });
  });
});
