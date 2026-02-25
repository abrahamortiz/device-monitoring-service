import type { HttpRequestOptions, IHttpClient } from "./http-client.ts";

export class RetryHttpClient implements IHttpClient {
  private httpClient: IHttpClient;
  private maxRetries: number;

  constructor(httpClient: IHttpClient, maxRetries: number) {
    this.httpClient = httpClient;
    this.maxRetries = maxRetries;
  }

  async get<T>(
    url: string,
    options?: HttpRequestOptions,
  ): Promise<{ status: number; data: T }> {
    let attempt = 0;

    while (true) {
      try {
        return await this.httpClient.get<T>(url, options);
      } catch (error) {
        attempt++;

        if (attempt >= this.maxRetries) {
          throw error;
        }
      }
    }
  }
}
