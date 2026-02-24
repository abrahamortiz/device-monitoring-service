import type {
  CreateDevice,
  Device,
  UpdateDevice,
} from "../../domain/device.schema.ts";
import type { IDeviceRepository } from "../../infrastructure/device.repository.ts";
import { ConflictError } from "../../../../shared/errors/conflict.error.ts";
import { DatabaseError } from "../../../../shared/errors/database.error.ts";
import { NotFoundError } from "../../../../shared/errors/not-found.error.ts";
import { ValidationError } from "../../../../shared/errors/validation.error.ts";
import { validateId } from "../../../../utils/validate-id.ts";
import { formatZodError } from "../../../../utils/zod-formatter.ts";
import {
  CreateDeviceSchema,
  UpdateDeviceSchema,
} from "../../domain/device.schema.ts";

export interface IDeviceService {
  createDevice(data: CreateDevice): Promise<Device>;
  getAllDevices(): Promise<Device[]>;
  getDevice(id: string): Promise<Device>;
  updateDevice(id: string, data: UpdateDevice): Promise<Device>;
  deleteDevice(id: string): Promise<void>;
}

export class DeviceService implements IDeviceService {
  private deviceRepository: IDeviceRepository;

  constructor(repository: IDeviceRepository) {
    this.deviceRepository = repository;
  }

  public async createDevice(data: CreateDevice): Promise<Device> {
    const validationResult = CreateDeviceSchema.safeParse(data);

    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid data to create device",
        formatZodError(validationResult.error),
      );
    }

    const existingDevice = await this.deviceRepository.findByIpAddress(
      data.ip_address,
    );

    if (existingDevice) {
      throw new ConflictError("IP address already in use by another device");
    }

    try {
      const device = await this.deviceRepository.insert(data);
      return device;
    } catch (error: unknown) {
      if (error instanceof DatabaseError) throw error;
      throw new ConflictError("Failed to create the device", error as Error);
    }
  }

  public async getAllDevices(): Promise<Device[]> {
    const devices = await this.deviceRepository.findAll();
    return devices;
  }

  public async getDevice(id: string): Promise<Device> {
    await validateId(id);
    const device = await this.deviceRepository.findById(id);

    if (!device) {
      throw new NotFoundError("Device", id);
    }

    return device;
  }

  public async updateDevice(id: string, data: UpdateDevice): Promise<Device> {
    await validateId(id);
    const validationResult = UpdateDeviceSchema.safeParse(data);

    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid update data",
        formatZodError(validationResult.error),
      );
    }

    const existingDevice = await this.deviceRepository.findById(id);

    if (!existingDevice) {
      throw new NotFoundError("Device", id);
    }

    try {
      const updatedDevice = await this.deviceRepository.update(id, data);

      if (!updatedDevice) {
        throw new ConflictError("Failed to update device");
      }

      return updatedDevice;
    } catch (error: unknown) {
      if (error instanceof DatabaseError) throw error;
      throw new ConflictError("Failed to update device", error as Error);
    }
  }

  public async deleteDevice(id: string): Promise<void> {
    await validateId(id);

    const existingDevice = await this.deviceRepository.findById(id);

    if (!existingDevice) {
      throw new NotFoundError("Device", id);
    }

    try {
      const deleted = await this.deviceRepository.softDelete(id);

      if (!deleted) {
        throw new ConflictError("Failed to delete device");
      }

      return;
    } catch (error: unknown) {
      if (error instanceof DatabaseError) throw error;
      throw new ConflictError("Failed to delete device", error as Error);
    }
  }
}
