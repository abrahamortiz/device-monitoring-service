import type { FastifyReply, FastifyRequest } from "fastify";
import type { IDeviceModelService } from "../../application/services/device-model.service.ts";
import type {
  CreateDeviceModel,
  UpdateDeviceModel,
} from "../../domain/device-model.schema.ts";
import { BaseController } from "../../../../shared/base.controller.ts";
import { toDeviceModelResponse } from "../mappers/device-model.mapper.ts";

export class DeviceModelController extends BaseController {
  private modelService: IDeviceModelService;

  constructor(modelService: IDeviceModelService) {
    super();
    this.modelService = modelService;
  }

  public createModel = async (
    request: FastifyRequest<{ Body: CreateDeviceModel }>,
    reply: FastifyReply,
  ) => {
    try {
      const model = await this.modelService.createModel(request.body);
      return reply.code(201).send(toDeviceModelResponse(model));
    } catch (error: unknown) {
      return this.handleError(error, request, reply);
    }
  };

  public getAllModels = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const models = await this.modelService.getAllModels();
      return reply.code(200).send(models.map(toDeviceModelResponse));
    } catch (error: unknown) {
      return this.handleError(error, request, reply);
    }
  };

  public getModel = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) => {
    try {
      const model = await this.modelService.getModel(request.params.id);
      return reply.code(200).send(toDeviceModelResponse(model));
    } catch (error: unknown) {
      return this.handleError(error, request, reply);
    }
  };

  public updateModel = async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateDeviceModel;
    }>,
    reply: FastifyReply,
  ) => {
    try {
      const model = await this.modelService.updateModel(
        request.params.id,
        request.body,
      );

      return reply.code(200).send(model);
    } catch (error: unknown) {
      return this.handleError(error, request, reply);
    }
  };

  public deleteModel = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) => {
    try {
      await this.modelService.deleteModel(request.params.id);
      return reply.code(200).send();
    } catch (error: unknown) {
      return this.handleError(error, request, reply);
    }
  };
}
