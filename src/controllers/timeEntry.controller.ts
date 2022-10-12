import { Request, Response, NextFunction } from "express";
import { ZealParams } from "../services/zeal";
import { companyID, zealClient, defReportingPeriods } from "../config/app.config";
import * as ISO from "../utils/isoHelpers";
import { ResourceNotFoundException, InvalidTimeEntryException } from "../utils/exceptions";

/* 
In place of a call to a local function you may see
exports.functionName used in this file instead. 
This is to facilitate spying on functions with jest.
*/

export async function handleTimeEntry(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const employee = await findEmployeeByClockifyID(req.body.userId);
    const reportingPeriod = findReportingPeriod(req.body.timeInterval?.start);
    const check = await createOrUpdateEmployeeCheck(req, employee, reportingPeriod)

    res.status(201).json({success: true, employeeCheckID: check.employeeCheckID});
  } catch (e) {
    return next(e);
  }
}

export async function findEmployeeByClockifyID(clockifyUserId: string) {
  const employee = await zealClient
    .getAllEmployees({
      companyID,
      external_id: clockifyUserId,
    })
    .then((r) => r[0]);

  if (!employee) {
    throw new ResourceNotFoundException("Zeal Employee");
  } else {
    return employee;
  }
}

export function findReportingPeriod(start: string) {
  const reportingPeriod = exports.findMatchingReportingPeriod(
    defReportingPeriods,
    ISO.stripTimestamp(start)
  );

  if (!reportingPeriod) {
    throw new ResourceNotFoundException("Zeal Reporting Period");
  } else {
    return reportingPeriod;
  }
}

export function findMatchingReportingPeriod(
    reportingPeriods: any[],
    startDate: string
  ): any {
    const reportingPeriod = reportingPeriods.find((rp) => {
      const isDateWithinRP = startDate >= rp.start && startDate <= rp.end;
      return isDateWithinRP;
    });
    return reportingPeriod;
  }

export async function createOrUpdateEmployeeCheck(
  req: Request,
  employee: any,
  reportingPeriod: any
) {
  const hourlyShift = buildShift(req.body.timeInterval);

  const existingCheck = await exports.getAnyExistingCheck(
    employee.employeeID,
    reportingPeriod.reportingPeriodID
  );
  
  if (!existingCheck) {
    return await exports.createCheck(
      employee.employeeID,
      reportingPeriod,
      hourlyShift
    )
  } else {
    return await exports.updateCheck(existingCheck.employeeCheckID, hourlyShift)
  }
}

export function buildShift(timeInterval: { end: string; duration: string }): any {
  const { end, duration } = timeInterval;
  const hours = ISO.parseDuration(duration);

  if (!hours) throw new InvalidTimeEntryException("Time Entry duration must be at least 18 seconds.");

  return {
    time: end,
    hourly: {
      hours,
    },
  };
}

export async function getAnyExistingCheck(
  employeeID: string,
  reportingPeriodID: string
) {
  return await zealClient
    .getEmployeeChecksByEmployee({
      companyID,
      employeeID,
      reportingPeriodID,
      status: "pending",
    })
    .then((checks) => checks[0]);
}

export async function createCheck(employeeID: string, reportingPeriod: any, hourlyShift: ZealParams.HourlyShift) {
  const checkDate = setCheckDate(reportingPeriod)
  return await zealClient
      .createEmployeeCheck({
        companyID,
        employeeID,
        reportingPeriodID: reportingPeriod.reportingPeriodID,
        check_date: checkDate,
        shifts: [hourlyShift],
      })
}

export function setCheckDate(reportingPeriod: any): string {
  const ONE_WEEK = 7;
  const checkDate = ISO.adjustDateBy(
    reportingPeriod.end,
    ONE_WEEK
  );
  return ISO.stripTimestamp(checkDate);
}

export async function updateCheck(existingCheckID: string, hourlyShift: ZealParams.HourlyShift) {
  return await zealClient.addShiftToExistingCheck({
    companyID,
    employeeCheckID: existingCheckID,
    shifts: [hourlyShift],
  });
}