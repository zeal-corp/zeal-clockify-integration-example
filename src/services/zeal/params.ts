// Dates and times should be in ISO-8601 Date YYYY-MM-DD
// or DateTime YYYY-MM-DD'T'HH:MM:SS

export interface GetReportingPeriods {
  companyID: string;
  pay_schedule?: string;
  searchStart?: string;
  searchEnd?: string;
}

export interface GetEmployee {
  companyID: string;
  external_id?: string;
}

export interface GetEmployeeCheck {
  companyID: string;
  employeeID: string;
  status?: string;
  reportingPeriodID?: string;
}

export interface HourlyShift {
  time: string;
  hourly: {
    hours: number;
    wage?: number;
  };
}

export interface CreateEmployeeCheck {
  companyID: string;
  employeeID: string;
  reportingPeriodID: string;
  check_date: string;
  shifts: HourlyShift[];
}

export interface AddShift {
  companyID: string;
  employeeCheckID: string;
  shifts: HourlyShift[];
}

export type QueryParams = GetReportingPeriods | GetEmployee | GetEmployeeCheck;

export type Body = CreateEmployeeCheck | AddShift;
