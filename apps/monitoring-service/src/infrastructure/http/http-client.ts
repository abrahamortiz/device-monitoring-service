import axios from "axios";

export type HttpRequestOptions = {
  timeout?: number;
  headers?: Record<string, string>;
};

export interface IHttpClient {
  get<T>(
    url: string,
    options?: HttpRequestOptions,
  ): Promise<{ status: number; data: T }>;
}

export class HttpClient implements IHttpClient {
  public async get<T>(
    url: string,
    options?: HttpRequestOptions,
  ): Promise<{ status: number; data: T }> {
    try {
      const response = await axios.get<T>(url, {
        timeout: options?.timeout,
        headers: options?.headers,
        validateStatus: () => true,
      });

      return {
        status: response.status,
        data: response.data,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(`HTTP request failed: ${error.message}`, {
          cause: error,
        });
      }

      throw error as Error;
    }
  }
}
