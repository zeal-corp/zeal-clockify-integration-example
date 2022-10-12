import { ZealClient } from "../services/zeal";

export type Payday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";

// _Sun should never be read but is included so that other days
// are indexed in line with Date.getDay() API
const DOW: readonly string[] = ["_Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

export async function getDefReportingPeriodsByPayday(
  payday: Payday,
  client: ZealClient,
  companyID: string
): Promise<any[]> {
  const [searchStart, searchEnd] = setSearchRange();
  const reportingPeriods = await client.getReportingPeriodsByDateRange({
    companyID,
    pay_schedule: "weekly",
    searchStart,
    searchEnd,
  });
  return filterByPayday(reportingPeriods, payday);
}

export function setSearchRange(): [string, string] {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  const searchStart = date.toISOString();

  date.setFullYear(date.getFullYear() + 1);
  const searchEnd = date.toISOString();
  return [searchStart, searchEnd];
}

export function filterByPayday(reportingPeriods: any[], payday: Payday): any[] {
  const payDayIndex = DOW.findIndex((day) => day === payday);
  return reportingPeriods.filter((rp) => {
    // T12:00.. added in line below to offset how Date API interprets dates with no T
    const endDate = new Date(rp.end + "T12:00:00Z");
    return endDate.getDay() === payDayIndex;
  });
}
