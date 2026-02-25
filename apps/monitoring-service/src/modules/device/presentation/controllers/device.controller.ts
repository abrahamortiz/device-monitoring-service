import type { FastifyReply, FastifyRequest } from "fastify";
import type { IDeviceService } from "../../application/services/device.service.ts";
import type { CreateDevice, UpdateDevice } from "../../domain/device.schema.ts";
import { BaseController } from "../../../../shared/base.controller.ts";
import { toDeviceResponse } from "../mappers/device.mapper.ts";

export class DeviceController extends BaseController {
  private deviceService: IDeviceService;

  constructor(deviceService: IDeviceService) {
    super();
    this.deviceService = deviceService;
  }

  public createDevice = async (
    request: FastifyRequest<{ Body: CreateDevice }>,
    reply: FastifyReply,
  ) => {
    try {
      const device = await this.deviceService.createDevice(request.body);
      return reply.code(201).send(toDeviceResponse(device));
    } catch (error: unknown) {
      return this.handleError(error, request, reply);
    }
  };

  public getAllDevices = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const devices = await this.deviceService.getAllDevices();
      return reply.code(200).send(devices.map(toDeviceResponse));
    } catch (error: unknown) {
      return this.handleError(error, request, reply);
    }
  };

  public getDevice = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) => {
    try {
      const device = await this.deviceService.getDevice(request.params.id);
      return reply.code(200).send(toDeviceResponse(device));
    } catch (error: unknown) {
      return this.handleError(error, request, reply);
    }
  };

  public updateDevice = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateDevice }>,
    reply: FastifyReply,
  ) => {
    try {
      const device = await this.deviceService.updateDevice(
        request.params.id,
        request.body,
      );

      return reply.code(200).send(toDeviceResponse(device));
    } catch (error: unknown) {
      return this.handleError(error, request, reply);
    }
  };

  public deleteDevice = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) => {
    try {
      await this.deviceService.deleteDevice(request.params.id);
      return reply.code(200).send();
    } catch (error: unknown) {
      return this.handleError(error, request, reply);
    }
  };
}
