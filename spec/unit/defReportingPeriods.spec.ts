import {
  beforeAll,
  afterAll,
  describe,
  expect,
  test,
  jest,
} from "@jest/globals";
import { mockReportingPeriods } from "../mock-data";
import {
  setSearchRange,
  filterByPayday,
} from "../../src/config/defReportingPeriods.config";

describe("defReportingPeriods", () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date("2022-09-28T11:01:58.135Z"));
  });

  afterAll(() => {
    jest.useRealTimers()
  })

  describe("#setSearchRange", () => {
    test("it sets the search start one month in the past and the search end 11 months in the future", () => {
      const [searchStart, searchEnd] = setSearchRange();
      expect(searchStart).toEqual("2022-08-28T11:01:58.135Z");
      expect(searchEnd).toEqual("2023-08-28T11:01:58.135Z");
    });
  });

  describe("#filterByPayday", () => {
    test("given a list of weekly reporting periods and a payday it filters out any reporting periods that don't end on the payday", () => {
        const filteredRPs = filterByPayday(mockReportingPeriods.data, "Mon");
        expect(filteredRPs[0].end).toEqual("2022-09-12")
    })
  })
});
