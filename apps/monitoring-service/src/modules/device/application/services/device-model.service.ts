import {
  type CreateDeviceModel,
  type DeviceModel,
  type UpdateDeviceModel,
} from "../../domain/device-model.schema.ts";
import type { IDeviceModelRepository } from "../../infrastructure/device-model.repository.ts";
import { ConflictError } from "../../../../shared/errors/conflict.error.ts";
import { DatabaseError } from "../../../../shared/errors/database.error.ts";
import { NotFoundError } from "../../../../shared/errors/not-found.error.ts";
import { ValidationError } from "../../../../shared/errors/validation.error.ts";
import { validateId } from "../../../../utils/validate-id.ts";
import { formatZodError } from "../../../../utils/zod-formatter.ts";
import {
  CreateDeviceModelSchema,
  UpdateDeviceModelSchema,
} from "../../domain/device-model.schema.ts";

export interface IDeviceModelService {
  createModel(data: CreateDeviceModel): Promise<DeviceModel>;
  getAllModels(): Promise<DeviceModel[]>;
  getModel(id: string): Promise<DeviceModel>;
  updateModel(id: string, data: UpdateDeviceModel): Promise<DeviceModel>;
  deleteModel(id: string): Promise<void>;
}

export class DeviceModelService implements IDeviceModelService {
  private repository: IDeviceModelRepository;

  constructor(deviceModelRepository: IDeviceModelRepository) {
    this.repository = deviceModelRepository;
  }

  public async createModel(data: CreateDeviceModel): Promise<DeviceModel> {
    const validationResult = CreateDeviceModelSchema.safeParse(data);

    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid data to create device model",
        formatZodError(validationResult.error),
      );
    }

    const existingModel = await this.repository.findByName(data.name);

    if (existingModel) {
      throw new ConflictError("Name already in use by another device model");
    }

    try {
      const model = await this.repository.insert(data);
      return model;
    } catch (error: unknown) {
      if (error instanceof DatabaseError) throw error;
      throw new ConflictError(
        "Failed to create the device model",
        error as Error,
      );
    }
  }

  public async getAllModels(): Promise<DeviceModel[]> {
    const models = await this.repository.findAll();
    return models;
  }

  public async getModel(id: string): Promise<DeviceModel> {
    await validateId(id);
    const model = await this.repository.findById(id);

    if (!model) {
      throw new NotFoundError("Device model", id);
    }

    return model;
  }

  public async updateModel(
    id: string,
    data: UpdateDeviceModel,
  ): Promise<DeviceModel> {
    await validateId(id);
    const validationResult = UpdateDeviceModelSchema.safeParse(data);

    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid update data",
        formatZodError(validationResult.error),
      );
    }

    const existingModel = await this.repository.findById(id);

    if (!existingModel) {
      throw new NotFoundError("Device model", id);
    }

    try {
      const updatedModel = await this.repository.update(id, data);

      if (!updatedModel) {
        throw new ConflictError("Failed to update device model");
      }

      return updatedModel;
    } catch (error: unknown) {
      if (error instanceof DatabaseError) throw error;
      throw new ConflictError("Failed to update device model", error as Error);
    }
  }

  public async deleteModel(id: string): Promise<void> {
    await validateId(id);

    const existingModel = await this.repository.findById(id);

    if (!existingModel) {
      throw new NotFoundError("Device model", id);
    }

    try {
      const deleted = await this.repository.softDelete(id);

      if (!deleted) {
        throw new ConflictError("Failed to delete device model");
      }

      return;
    } catch (error: unknown) {
      if (error instanceof DatabaseError) throw error;
      throw new ConflictError("Failed to delete device model", error as Error);
    }
  }
}
