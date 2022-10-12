import { ZealClient } from "./ZealClient";
import axios, { Axios, AxiosInstance } from "axios";

export class ZealFactory {

  public static fromDefaultClient(zealTestKey: string): ZealClient {
    const client: Axios = axios.create({
      baseURL: "https://api.zeal.com",
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${zealTestKey}`,
        accept: "application/json",
        "content-type": "application/json",
      },
    });
    return new ZealClient(client);
  }

  public static fromCustomClient(client: AxiosInstance){
    return new ZealClient(client)
  }
}