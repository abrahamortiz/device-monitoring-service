import { describe, it, expect, vi, beforeEach } from "vitest";
import { HealthCheckService } from "./health-check.service.ts";

describe("HealthCheckService", () => {
  let service: HealthCheckService;
  let httpClient: any;

  const mockDevice = {
    id: "device-1",
    base_url: "http://device.local",
  } as any;

  beforeEach(() => {
    httpClient = {
      get: vi.fn(),
    };

    service = new HealthCheckService(httpClient, 5000);
  });

  it("should return ONLINE when health is UP and diagnostics succeed", async () => {
    httpClient.get
      .mockResolvedValueOnce({
        status: 200,
        data: { status: "UP", capabilities: { protocol: "REST" } },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: {
          hardware_version: "v1",
          software_version: "v2",
          firmware_version: "v3",
          checksum: "sha256",
        },
      });

    const result = await service.check(mockDevice);

    expect(result.log.status).toBe("ONLINE");
    expect(result.latestSnapshot).toEqual({
      hw_version: "v1",
      sw_version: "v2",
      fw_version: "v3",
      checksum: "sha256",
    });
  });

  it("should return DEGRADED when health is not UP", async () => {
    httpClient.get.mockResolvedValue({ status: 200, data: { status: "DOWN" } });

    const result = await service.check(mockDevice);

    expect(result.log.status).toBe("DEGRADED");
    expect(result.log.error_message).toBe("Health status not UP");
  });

  it("should return DEGRADED when diagnostics fail for REST protocol", async () => {
    httpClient.get
      .mockResolvedValueOnce({
        status: 200,
        data: { status: "UP", capabilities: { protocol: "REST" } },
      })
      .mockRejectedValueOnce(new Error("Network error"));

    const result = await service.check(mockDevice);

    expect(result.log.status).toBe("DEGRADED");
    expect(result.log.error_message).toBe("Diagnostics call failed");
  });

  it("should return OFFLINE when health check fails", async () => {
    httpClient.get.mockRejectedValue(new Error("Timeout"));

    const result = await service.check(mockDevice);

    expect(result.log.status).toBe("OFFLINE");
    expect(result.log.error_message).toBe("Timeout");
  });
});
