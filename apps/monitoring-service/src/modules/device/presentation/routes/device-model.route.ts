import type { FastifyInstance } from "fastify";
import type { DeviceModelController } from "../controllers/device-model.controller.ts";

export class DeviceModelRoutes {
  private controller: DeviceModelController;

  constructor(controller: DeviceModelController) {
    this.controller = controller;
  }

  public register(app: FastifyInstance): void {
    app.register(
      async (models) => {
        models.post("/", this.controller.createModel);
        models.get("/", this.controller.getAllModels);
        models.get("/:id", this.controller.getModel);
        models.patch("/:id", this.controller.updateModel);
        models.delete("/:id", this.controller.deleteModel);
      },
      { prefix: "models" },
    );
  }
}
