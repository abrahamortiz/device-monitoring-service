import type { IDeviceRepository } from "../../device/infrastructure/device.repository.ts";
import type { IDeviceStatusLogRepository } from "../infrastructure/device-status-log.repository.ts";
import type { HealthCheckService } from "./health-check.service.ts";

export interface IMonitoringService {
  executeMonitoringCycle(): Promise<void>;
}

export class MonitoringService implements IMonitoringService {
  private deviceRepository: IDeviceRepository;
  private logRepository: IDeviceStatusLogRepository;
  private healthCheckService: HealthCheckService;

  constructor(
    deviceRepository: IDeviceRepository,
    logRepository: IDeviceStatusLogRepository,
    healthCheckService: HealthCheckService,
  ) {
    this.deviceRepository = deviceRepository;
    this.logRepository = logRepository;
    this.healthCheckService = healthCheckService;
  }

  public async executeMonitoringCycle(): Promise<void> {
    const monitoredDevices = await this.deviceRepository.findMonitored();

    await Promise.all(
      monitoredDevices.map(async (device) => {
        const { log, latestSnapshot } =
          await this.healthCheckService.check(device);

        await this.logRepository.insert(log);

        await this.deviceRepository.update(device.id, {
          latest_status: log.status,
          last_seen_at: log.checked_at,
          hw_version: latestSnapshot?.hw_version,
          sw_version: latestSnapshot?.sw_version,
          fw_version: latestSnapshot?.fw_version,
          checksum: latestSnapshot?.checksum,
        });
      }),
    );
  }
}
