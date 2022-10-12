import { ZealFactory, ZealClient } from "../services/zeal";
import { getDefReportingPeriodsByPayday } from "./defReportingPeriods.config";
import dotenv from "dotenv";
dotenv.config();

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
    defReportingPeriods = await getDefReportingPeriodsByPayday("Fri", zealClient, companyID);
  }
}

configureAppVars();

export {port, zealClient, companyID, defReportingPeriods };
