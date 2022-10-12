import { describe, expect, test } from "@jest/globals";
import * as ISO from "../../src/utils/isoHelpers";

describe("duration parser", () => {
  describe("parseHourlyShift", () => {
    test("given PT4H43M52S it returns an object representing the hours minutes and seconds", () => {
      const hours = ISO.parseHourlyShift("PT4H43M52S");
      expect(hours).toEqual(4.73);
    });

    test("given PT3M12S it returns an object representing the hours minutes and seconds", () => {
      const hours = ISO.parseHourlyShift("PT3M12S");
      expect(hours).toEqual(0.05);
    });

    test("given PT5H12S it returns an object representing the hours minutes and seconds", () => {
      const hours = ISO.parseHourlyShift("PT5H59S");
      expect(hours).toEqual(5.02);
    });

    test("given P24W6DT6H21M05S it throws an 'invalid input' error", () => {
      expect(() => ISO.parseHourlyShift("P24W6DT6H21M05S")).toThrowError(
        "Time Entry duration should not be longer than 24hrs."
      );
    });
  });

  describe("adjustDateBy", () => {
    test("given input of 7 it advances the date by 1 week", () => {
      const date = "2022-09-09T15:11:42.000Z";
      const oneWeekInFuture = ISO.adjustDateBy(date, 7);
      expect(oneWeekInFuture).toEqual("2022-09-16T15:11:42.000Z");
    });
  });

  describe("stripTimestamp", () => {
    test("given an ISO date with a timestamp it strips the timestamp leaving only the date", () => {
      const dateTime = "2022-09-09T15:11:42.000Z";
      const date = ISO.stripTimestamp(dateTime);
      expect(date).toEqual("2022-09-09");
    });

    test("given an invalid ISO date with a timestamp it returns an error", () => {
      const dateTime = "2022-9-9T15:11:42.000Z";
      expect(() => ISO.stripTimestamp(dateTime)).toThrowError(
        "ISO duration is improperly formatted. Please format as YYYY-MM-DD'T'HH:MM:SS"
      );
    });
  });
});