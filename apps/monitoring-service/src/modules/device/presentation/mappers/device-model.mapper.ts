import type {
  DeviceModel,
  DeviceModelResponse,
} from "../../domain/device-model.schema.ts";

export function toDeviceModelResponse(model: DeviceModel): DeviceModelResponse {
  return {
    id: model.id,
    category: model.category,
    name: model.name,
    description: model.description,
  };
}
