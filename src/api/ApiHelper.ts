import type { APIRequestContext } from '@playwright/test';

export type ApiResponse<T> = {
  status: number;
  body: T;
};

export class ApiHelper {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
  ) {}

  async get<T>(path: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    const response = await this.request.get(new URL(path, this.baseUrl).toString(), { headers });
    return {
      status: response.status(),
      body: await response.json() as T,
    };
  }

  async post<T>(
    path: string,
    data: unknown,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const response = await this.request.post(new URL(path, this.baseUrl).toString(), {
      data,
      headers,
    });
    return {
      status: response.status(),
      body: await response.json() as T,
    };
  }
}
