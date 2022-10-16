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
    try {
      const r = await this.#client
        .get(route, { params });
      return r.data?.data;
    } catch (err) {
      return this.throwException(err as AxiosError);
    }
  }

  private async post(route: string, body: Params.Body): Promise<any> {
    try {
      const r = await this.#client
        .post(route, body);
      return r.data?.data;
    } catch (err) {
      return this.throwException(err as AxiosError);
    }
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