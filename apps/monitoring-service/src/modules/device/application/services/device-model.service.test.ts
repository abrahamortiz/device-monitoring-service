import type { Mocked } from "vitest";
import type { DeviceCategory } from "../../domain/device-model.schema.ts";
import type { IDeviceModelRepository } from "../../infrastructure/device-model.repository.ts";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConflictError } from "../../../../shared/errors/conflict.error.ts";
import { NotFoundError } from "../../../../shared/errors/not-found.error.ts";
import { ValidationError } from "../../../../shared/errors/validation.error.ts";
import { DeviceModelService } from "./device-model.service.ts";

describe("DeviceModelService", () => {
  let service: DeviceModelService;
  let repository: Mocked<IDeviceModelRepository>;

  const mockModel = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Model A",
    category: "ROUTER" as DeviceCategory,
    description: "Description A",
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  beforeEach(() => {
    repository = {
      insert: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    } as any;
    service = new DeviceModelService(repository);
  });

  describe("createModel", () => {
    it("should create a model successfully", async () => {
      const createData = {
        name: "Model A",
        category: "ROUTER" as DeviceCategory,
        description: "Description A",
      };
      repository.findByName.mockResolvedValue(null);
      repository.insert.mockResolvedValue(mockModel);

      const result = await service.createModel(createData);

      expect(result).toEqual(mockModel);
      expect(repository.findByName).toHaveBeenCalledWith(createData.name);
      expect(repository.insert).toHaveBeenCalledWith(createData);
    });

    it("should throw ValidationError if data is invalid", async () => {
      const invalidData = { name: "" }; // Empty name
      await expect(service.createModel(invalidData as any)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw ConflictError if name is already in use", async () => {
      const createData = {
        name: "Model A",
        category: "ROUTER" as DeviceCategory,
        description: "Description A",
      };
      repository.findByName.mockResolvedValue(mockModel);

      await expect(service.createModel(createData)).rejects.toThrow(
        ConflictError,
      );
    });
  });

  describe("getModel", () => {
    it("should return a model if found", async () => {
      repository.findById.mockResolvedValue(mockModel);

      const result = await service.getModel(mockModel.id);

      expect(result).toEqual(mockModel);
    });

    it("should throw NotFoundError if model is not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getModel(mockModel.id)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("should throw ValidationError if id is invalid", async () => {
      await expect(service.getModel("invalid-id")).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("updateModel", () => {
    it("should update a model successfully", async () => {
      const updateData = { name: "Updated Model" };
      repository.findById.mockResolvedValue(mockModel);
      repository.update.mockResolvedValue({ ...mockModel, ...updateData });

      const result = await service.updateModel(mockModel.id, updateData);

      expect(result.name).toBe("Updated Model");
    });

    it("should throw NotFoundError if model to update is not found", async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.updateModel(mockModel.id, {})).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("deleteModel", () => {
    it("should delete a model successfully", async () => {
      repository.findById.mockResolvedValue(mockModel);
      repository.softDelete.mockResolvedValue(true);

      await service.deleteModel(mockModel.id);

      expect(repository.softDelete).toHaveBeenCalledWith(mockModel.id);
    });

    it("should throw NotFoundError if model to delete is not found", async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.deleteModel(mockModel.id)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
