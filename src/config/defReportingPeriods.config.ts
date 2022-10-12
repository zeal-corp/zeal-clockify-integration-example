import { zealClient, companyID } from "./app.config";

export type Payday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
const PAYDAYS: readonly Payday[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export async function getDefReportingPeriodsByPayday(payday: Payday) {
  const [searchStart, searchEnd] = setSearchRange();
  const reportingPeriods = await zealClient.getReportingPeriodsByDateRange({
    companyID,
    pay_schedule: "weekly",
    searchStart,
    searchEnd,
  });
  const reportingPeriodsForPayday = filterByPayday(
    reportingPeriods,
    payday
  );
  // @ts-ignore
  return reportingPeriodsForPayday;
}

function setSearchRange(): [string, string] {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  const searchStart = date.toISOString();

  date.setFullYear(date.getFullYear() + 1);
  const searchEnd = date.toISOString();
  return [searchStart, searchEnd];
}

export function filterByPayday(
  reportingPeriods: any[],
  payday: Payday
): any[] {
  const payDayIndex = PAYDAYS.findIndex((day) => day === payday);
  return reportingPeriods.filter((rp) => {
    // T12:00.. added in line below to offset how Date API interprets dates with no T
    const endDate = new Date(rp.end + "T12:00:00Z");
    return endDate.getDay() === payDayIndex;
  });
}