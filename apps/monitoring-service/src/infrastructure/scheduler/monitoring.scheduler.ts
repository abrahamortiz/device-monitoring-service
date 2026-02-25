import type { IMonitoringService } from "../../modules/monitoring/application/monitoring.service.ts";

export class MonitoringScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private monitoringService: IMonitoringService;
  private intervalMs: number;
  private isRunning = false;

  constructor(monitoringService: IMonitoringService, intervalMs: number) {
    this.monitoringService = monitoringService;
    this.intervalMs = intervalMs;
  }

  start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      if (this.isRunning) return;

      this.isRunning = true;

      try {
        await this.monitoringService.executeMonitoringCycle();
      } catch (error) {
        console.error("Monitoring cycle failed:", error);
      } finally {
        this.isRunning = false;
      }
    }, this.intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
