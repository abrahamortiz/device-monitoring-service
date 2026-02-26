import type { Mocked } from "vitest";
import type { IDeviceRepository } from "../../device/infrastructure/device.repository.ts";
import type { IDeviceStatusLogRepository } from "../infrastructure/device-status-log.repository.ts";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HealthCheckService } from "./health-check.service.ts";
import { MonitoringService } from "./monitoring.service.ts";

describe("MonitoringService", () => {
  let service: MonitoringService;
  let deviceRepository: Mocked<IDeviceRepository>;
  let logRepository: Mocked<IDeviceStatusLogRepository>;
  let healthCheckService: Mocked<HealthCheckService>;

  beforeEach(() => {
    deviceRepository = {
      findMonitored: vi.fn(),
      update: vi.fn(),
    } as any;

    logRepository = {
      insert: vi.fn(),
    } as any;

    healthCheckService = {
      check: vi.fn(),
    } as any;

    service = new MonitoringService(
      deviceRepository,
      logRepository,
      healthCheckService,
    );
  });

  it("should execute monitoring cycle for all monitored devices", async () => {
    const mockDevices = [{ id: "device-1" }, { id: "device-2" }] as any[];
    deviceRepository.findMonitored.mockResolvedValue(mockDevices);

    healthCheckService.check.mockResolvedValue({
      log: { status: "ONLINE", checked_at: new Date() } as any,
      latestSnapshot: { hw_version: "1.0" } as any,
    });

    await service.executeMonitoringCycle();

    expect(deviceRepository.findMonitored).toHaveBeenCalled();
    expect(healthCheckService.check).toHaveBeenCalledTimes(2);
    expect(logRepository.insert).toHaveBeenCalledTimes(2);
    expect(deviceRepository.update).toHaveBeenCalledTimes(2);
  });
});
