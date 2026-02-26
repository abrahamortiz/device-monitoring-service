import type {
  DiagnosticsResult,
  HealthCheckResult,
} from "@device-monitoring-service/shared";
import type { IHttpClient } from "../../../infrastructure/http/http-client.ts";
import type {
  Device,
  DeviceStatus,
} from "../../device/domain/device.schema.ts";
import type { CreateDeviceStatusLog } from "../domain/device-status-log.schema.ts";

type Snapshot = {
  hw_version: string;
  sw_version: string;
  fw_version: string;
  checksum: string;
};

export type HealthCheckExecutionResult = {
  log: CreateDeviceStatusLog;
  latestSnapshot?: Snapshot;
};

export class HealthCheckService {
  private httpClient: IHttpClient;
  private timeoutMs: number;

  constructor(httpClient: IHttpClient, timeoutMs: number) {
    this.httpClient = httpClient;
    this.timeoutMs = timeoutMs;
  }

  async check(device: Device): Promise<HealthCheckExecutionResult> {
    const startedAt = Date.now();

    try {
      const healthResponse = await this.httpClient.get<HealthCheckResult>(
        `${device.base_url}/health`,
        { timeout: this.timeoutMs },
      );

      if (healthResponse.data.status !== "UP") {
        return this.buildResult(
          device,
          "DEGRADED",
          startedAt,
          "Health status not UP",
        );
      }

      if (healthResponse.data.capabilities?.protocol === "REST") {
        try {
          const { data } = await this.httpClient.get<DiagnosticsResult>(
            `${device.base_url}/diagnostics`,
            { timeout: this.timeoutMs },
          );

          return this.buildResult(device, "ONLINE", startedAt, null, {
            hw_version: data.hardware_version,
            sw_version: data.software_version,
            fw_version: data.firmware_version,
            checksum: data.checksum,
          });
        } catch {
          return this.buildResult(
            device,
            "DEGRADED",
            startedAt,
            "Diagnostics call failed",
          );
        }
      }

      return this.buildResult(device, "ONLINE", startedAt, null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return this.buildResult(
          device,
          "OFFLINE",
          startedAt,
          error.message || "Unknown error",
        );
      }

      return this.buildResult(device, "OFFLINE", startedAt, "Unknown error");
    }
  }

  private buildResult(
    device: Device,
    status: DeviceStatus,
    startedAt: number,
    errorMessage: string | null,
    latestSnapshot?: Snapshot,
  ): HealthCheckExecutionResult {
    return {
      log: {
        device_id: device.id,
        status,
        response_time_ms: Date.now() - startedAt,
        error_message: errorMessage,
        checked_at: new Date(),
      },
      latestSnapshot,
    };
  }
}
