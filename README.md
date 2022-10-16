# 🦓 Zeal + Clockify Integration ⏰

## Description

This app serves as an example of how one might integrate a time and attendance system, such as Clockify, with Zeal's payroll API.

The app has one main purpose: receive time entry data from Clockify's Timer Stopped webhook event and convert it to a Shift on a Zeal Employee Check.

[Watch the video demo](https://www.loom.com/share/ad92a80e6e924a379b45c74ac4a21046)

### Tech Used

- Node
- Express
- TypeScript
- Jest

## Getting Started

### Guide

This app is mean to be used as part of Zeal's [Time & Attendance Guide](https://docs.zeal.com/docs/time-attendance-integration). Please be sure to follow that walk-through to learn how to configure your Clockify account to work with this application.

### Installation

1. Clone the repository.

```bash
git clone git@github.com:zeal-corp/zeal-clockify-integration-example.git
```

2. `cd` to the new directory.
3. Run `npm install`.
4. Add a `.env` file with your `ZEAL_TEST_KEY` and `ZEAL_COMPANY_ID`.

```bash
echo "ZEAL_TEST_KEY={{YOUR TEST KEY}}\nZEAL_COMPANY_ID={{YOUR COMPANY ID}}" >> .env
```

5. Run `npm test` to ensure everything is working as expected.
6. Run `npm run dev` to start the server in development mode.

In the terminal you should see:

> $ 🦓🦓🦓 [SERVER_START]: Server is running at http://localhost:3000

<br>

### File Structure

The app is fairly simple with only two main directories and a few sub-directories:

&#x203A; `src`: holds main app code.

- &#xbb; `config`: contains configuration of environmental variables and other data the app depends on.
- &#xbb; `controllers`: contains business logic for routes.
- &#xbb; `middleware`: contains helpful middleware such as loggers and error handlers.
- &#xbb; `routes`: contains Express routing logic.
- &#xbb; `services`: contains business logic for 3rd-party APIs and services (Zeal). _Note_: This app has no db.
- &#xbb; `utils`: contains useful helpers and reusable code.

&#x203A; `spec`: holds testing code.

- &#xbb; `mock-data`: contains JSON files mocking API responses.
- &#xbb; `unit`: contains unit tests.

## Code Walk-through

The app has two main sections that would be helpful to review:

1. The initial configuration on startup.
2. The handler for the `/time-entry/timer-stopped` route.

### App Configuration

Looking into `src/config/app.config.ts` we can see that there are several variables that the app is dependent on that are being configured.

```typescript
// snippet from app.config.ts

const port = process.env.PORT || 3000;
let zealClient: ZealClient;
let companyID: string;
let defReportingPeriods: any[];

async function configureAppVars() {
  if (!process.env.ZEAL_TEST_KEY || !process.env.ZEAL_COMPANY_ID) {
    throw Error(
      "Missing Configuration: Please add your ZEAL_TEST_KEY and ZEAL_COMPANY_ID in your .env file."
    );
  } else {
    zealClient = ZealFactory.fromDefaultClient(process.env.ZEAL_TEST_KEY);
    companyID = process.env.ZEAL_COMPANY_ID;
    defReportingPeriods = await getDefReportingPeriodsByPayday(
      "Fri",
      zealClient,
      companyID
    );
  }
}
```

> **Note:**
>
> In a production app, we'd likely rely on a database to store
> data such as the `companyID` and `defReportingPeriods`, but we wanted to keep this app as
> simple as possible so we chose to use this workaround.

Let's walk through the ones that may not be readily apparent:

1. `zealClient`: this is basically an wrapper for the commonly used [axios library](https://axios-http.com/docs/intro) for making HTTP requests. This Zeal module found in `src/services/zeal` simply helps us make requests to Zeal's API.
2. `companyID`: nearly all requests to Zeal's API require a company ID to be passed as a parameter so we initialize that here for later use.
3. `defReportingPeriods`: this establishes a list of Reporting Periods that our app can reference internally, instead of having to make a call to the [Zeal API](https://docs.zeal.com/reference/retrieve-reporting-period-by-date-range) every time we receive Time Entry data from Clockify.

> **Tip:**
>
> You can see the reporting periods the app is establishing by visting
> http://localhost:3000/reporting-periods after the app starts.

A few more words on `defReportingPeriods`:

Every Zeal Employee Check should be scoped to a particular Reporting Period that describes when the work was completed. Zeal supports every potential Reporting Period for a given calendar year. Since our app is determining the Reporting Period automatically, based off the time entry data we get from Clockify, it's useful to filter the all potential Reporting Periods down to only the ones that fit our desired pay schedules.

For the purpose of this example, the logic found in `src/config/defReportingPeriods.config.ts`
defines a ruleset that employees should be on a weekly pay schedule and that the Reporting
Periods should end one week before any given payday.

> For Example:
>
> If the payday is "Fri", then Reporting Period for a 2022-09-30 check date should
> be 2022-09-17 - 2022-09-23.

## Time Entry Controller

The main functionality of the app is defined in `src/controllers/timeEntry.controller.ts`. Looking into the code, we can see there are 3 main process the app performs whenever it receives Time Entry data from Clockify:

```typescript
// snippet from timeEntry.controller.ts

export async function handleTimeEntry(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const employee = await findEmployeeByClockifyID(req.body.userId);
    const reportingPeriod = findReportingPeriod(req.body.timeInterval?.start);
    const check = await createOrUpdateEmployeeCheck(
      req,
      employee,
      reportingPeriod
    );

    res
      .status(201)
      .json({ success: true, employeeCheckID: check.employeeCheckID });
  } catch (e) {
    return next(e);
  }
}
```

1. The app pulls the Clockify `userId` from the request body and makes a call to Zeal to find an Employee with a matching `external_id` field.

```typescript
// snippet from timeEntry.controller.ts

export async function findEmployeeByClockifyID(clockifyUserId: string) {
  const employees = await zealClient
    .getAllEmployees({
      companyID,
      external_id: clockifyUserId,
    });

  if (employees.length) {
    return employees[0];
  } else {
    throw new ResourceNotFoundException("Zeal Employee");
  }
}
```

2. It pulls the `start` time from the request body and searches our `defReportingPeriods` to find the Reporting Period that the `start` time falls within.

```typescript
// snippet from timeEntry.controller.ts

// Note: this helper function is called by #findReportingPeriod
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
```

3. It checks if there is an existing Employee Check for this Reporting Period and then makes a request to Zeal to either create a new check or update the existing check.

```typescript
// snippet from timeEntry.controller.ts

export async function createOrUpdateEmployeeCheck(
  req: Request,
  employee: any,
  reportingPeriod: any
) {
  /* #buildShift takes the time entry data and converts it
    to a Zeal Shift Object */
  const hourlyShift = buildShift(req.body.timeInterval);

  const existingCheck = await getAnyExistingCheck(
    employee.employeeID,
    reportingPeriod.reportingPeriodID
  );

  if (!existingCheck) {
    return await createCheck(employee.employeeID, reportingPeriod, hourlyShift);
  } else {
    return await updateCheck(existingCheck.employeeCheckID, hourlyShift);
  }
}
```
