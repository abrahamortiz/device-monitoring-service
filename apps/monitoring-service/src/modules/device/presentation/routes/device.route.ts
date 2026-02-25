import type { FastifyInstance } from "fastify";
import type { DeviceController } from "../controllers/device.controller.ts";

export class DeviceRoutes {
  private controller: DeviceController;

  constructor(controller: DeviceController) {
    this.controller = controller;
  }

  public register(app: FastifyInstance): void {
    app.register(
      async (devices) => {
        devices.post("/", this.controller.createDevice);
        devices.get("/", this.controller.getAllDevices);
        devices.get("/:id", this.controller.getDevice);
        devices.patch("/:id", this.controller.updateDevice);
        devices.delete("/:id", this.controller.deleteDevice);
      },
      { prefix: "devices" },
    );
  }
}
