import { Axios, AxiosError } from "axios";
import { ZealParams as Params, ZealException } from "./index";

export class ZealClient {
  #client: Axios;

  constructor(client: Axios) {
    this.#client = client;
  }

  public async getReportingPeriodsByDateRange(
    params: Params.GetReportingPeriods
  ): Promise<any> {
    return await this.get("/reportingPeriod", params);
  }

  public async getAllEmployees(params: Params.GetEmployee): Promise<any> {
    return await this.get("/employees", params);
  }

  public async getEmployeeChecksByEmployee(
    params: Params.GetEmployeeCheck
  ): Promise<any> {
    return await this.get("/employeeCheck", params);
  }

  public async createEmployeeCheck(
    body: Params.CreateEmployeeCheck
  ): Promise<any> {
    return await this.post("/employeeCheck", body);
  }

  public async addShiftToExistingCheck(body: Params.AddShift): Promise<any> {
    return await this.post("/shifts", body);
  }

  private async get(route: string, params: Params.QueryParams): Promise<any> {
    return await this.#client
      .get(route, {params})
      .then((r) => r.data?.data)
      .catch(this.throwException);
  }

  private async post(route: string, body: Params.Body): Promise<any> {
    return await this.#client
      .post(route, body)
      .then((r) => r.data?.data)
      .catch(this.throwException);
  }

  private throwException(err: AxiosError) {
    const status = err.response?.status;
    if (status === 500) {
      // @ts-ignore
      throw ZealException.fromUndefinedError(err.response?.data?.message);
    } else {
      // @ts-ignore
      const errorsList = err.response?.data?.errors;
      throw new ZealException(errorsList, status);
    }
  }
}