import type { Device, DeviceResponse } from "../../domain/device.schema.ts";
import { toDeviceModelResponse } from "./device-model.mapper.ts";

export function toDeviceResponse(device: Device): DeviceResponse {
  return {
    id: device.id,
    ip_address: device.ip_address,
    hw_version: device.hw_version,
    sw_version: device.sw_version,
    fw_version: device.fw_version,
    checksum: device.checksum,
    latest_status: device.latest_status,
    is_monitored: device.is_monitored,
    last_seen_at: device.last_seen_at,
    model: device.model ? toDeviceModelResponse(device.model) : undefined,
  };
}
