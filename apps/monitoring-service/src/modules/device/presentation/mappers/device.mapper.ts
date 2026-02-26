import type { Device, DeviceResponse } from "../../domain/device.schema.ts";

export function toDeviceResponse(device: Device): DeviceResponse {
  return {
    id: device.id,
    base_url: device.base_url,
    hw_version: device.hw_version,
    sw_version: device.sw_version,
    fw_version: device.fw_version,
    checksum: device.checksum,
    latest_status: device.latest_status,
    is_monitored: device.is_monitored,
    last_seen_at: device.last_seen_at,
    model: device.model?.name,
    category: device.model?.category,
  };
}
