import type { Mocked } from "vitest";
import type { IDeviceRepository } from "../../infrastructure/device.repository.ts";
import type { IDeviceModelRepository } from "../../infrastructure/device-model.repository.ts";
import type { IDeviceStatusLogRepository } from "../../../monitoring/infrastructure/device-status-log.repository.ts";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConflictError } from "../../../../shared/errors/conflict.error.ts";
import { NotFoundError } from "../../../../shared/errors/not-found.error.ts";
import { DeviceService } from "./device.service.ts";

describe("DeviceService", () => {
  let service: DeviceService;
  let deviceRepository: Mocked<IDeviceRepository>;
  let deviceModelRepository: Mocked<IDeviceModelRepository>;
  let deviceLogRepository: Mocked<IDeviceStatusLogRepository>;

  const mockDeviceId = "550e8400-e29b-41d4-a716-446655440001";
  const mockModelId = "550e8400-e29b-41d4-a716-446655440000";

  const mockDevice = {
    id: mockDeviceId,
    model_id: mockModelId,
    base_url: "http://192.168.1.10",
    is_monitored: true,
    hw_version: "1.0",
    sw_version: "2.0",
    fw_version: "3.0",
    checksum: "abc",
    latest_status: "ONLINE",
    last_seen_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  const mockModel = {
    id: mockModelId,
    name: "Model A",
    category: "ROUTER",
    description: "Desc",
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  beforeEach(() => {
    deviceRepository = {
      insert: vi.fn(),
      findAll: vi.fn(),
      findMonitored: vi.fn(),
      findById: vi.fn(),
      findByBaseUrl: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    } as any;
    deviceModelRepository = {
      findById: vi.fn(),
    } as any;
    deviceLogRepository = {
      findByDevice: vi.fn(),
    } as any;

    service = new DeviceService(
      deviceRepository,
      deviceModelRepository,
      deviceLogRepository,
    );
  });

  describe("createDevice", () => {
    it("should create a device successfully", async () => {
      const createData = {
        model_id: mockModelId,
        base_url: "http://192.168.1.10",
        is_monitored: true,
      };

      deviceModelRepository.findById.mockResolvedValue(mockModel as any);
      deviceRepository.findByBaseUrl.mockResolvedValue(null);
      deviceRepository.insert.mockResolvedValue(mockDevice as any);

      const result = await service.createDevice(createData as any);

      expect(result).toEqual(mockDevice);
      expect(deviceModelRepository.findById).toHaveBeenCalledWith(mockModelId);
    });

    it("should throw NotFoundError if model does not exist", async () => {
      const validButNonExistentModelId = "550e8400-e29b-41d4-a716-446655449999";
      deviceModelRepository.findById.mockResolvedValue(null);

      await expect(
        service.createDevice({
          model_id: validButNonExistentModelId,
          base_url: "http://test.com",
        } as any),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ConflictError if base_url is already in use", async () => {
      deviceModelRepository.findById.mockResolvedValue(mockModel as any);
      deviceRepository.findByBaseUrl.mockResolvedValue(mockDevice as any);

      await expect(
        service.createDevice({
          model_id: mockModelId,
          base_url: "http://192.168.1.10",
        } as any),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe("getDevice", () => {
    it("should return a device if found", async () => {
      deviceRepository.findById.mockResolvedValue(mockDevice as any);
      const result = await service.getDevice(mockDeviceId);
      expect(result).toEqual(mockDevice);
    });

    it("should throw NotFoundError if device not found", async () => {
      deviceRepository.findById.mockResolvedValue(null);
      await expect(service.getDevice(mockDeviceId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("updateDevice", () => {
    it("should update device successfully", async () => {
      deviceRepository.findById.mockResolvedValue(mockDevice as any);
      deviceRepository.update.mockResolvedValue({
        ...mockDevice,
        base_url: "http://new.com",
      } as any);

      const result = await service.updateDevice(mockDeviceId, {
        base_url: "http://new.com",
      });
      expect(result.base_url).toBe("http://new.com");
    });
  });

  describe("deleteDevice", () => {
    it("should soft delete device", async () => {
      deviceRepository.findById.mockResolvedValue(mockDevice as any);
      deviceRepository.softDelete.mockResolvedValue(true);

      await service.deleteDevice(mockDeviceId);
      expect(deviceRepository.softDelete).toHaveBeenCalledWith(mockDeviceId);
    });
  });
});
