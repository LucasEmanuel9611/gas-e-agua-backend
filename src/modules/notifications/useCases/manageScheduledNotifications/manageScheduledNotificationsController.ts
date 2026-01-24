import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { ManageScheduledNotificationsUseCase } from "./manageScheduledNotificationsUseCase";

export class ManageScheduledNotificationsController {
  async create(request: Request, response: Response): Promise<Response> {
    try {
      const {
        title,
        body,
        target_users,
        target_roles,
        scheduled_for,
        recurrence_pattern,
        timezone,
        data,
      } = request.body;

      const manageScheduledNotificationsUseCase = container.resolve(
        ManageScheduledNotificationsUseCase
      );

      const scheduled = await manageScheduledNotificationsUseCase.create({
        title,
        body,
        target_users,
        target_roles,
        scheduled_for: new Date(scheduled_for),
        recurrence_pattern,
        timezone,
        created_by: Number(request.user.id),
        data,
      });

      return response.status(201).json(scheduled);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async findById(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params;

      const manageScheduledNotificationsUseCase = container.resolve(
        ManageScheduledNotificationsUseCase
      );

      const scheduled = await manageScheduledNotificationsUseCase.findById(
        Number(id)
      );

      return response.status(200).json(scheduled);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async findAll(request: Request, response: Response): Promise<Response> {
    try {
      const { is_active, created_by } = request.query;

      const manageScheduledNotificationsUseCase = container.resolve(
        ManageScheduledNotificationsUseCase
      );

      const scheduled = await manageScheduledNotificationsUseCase.findAll({
        is_active: is_active ? is_active === "true" : undefined,
        created_by: created_by ? Number(created_by) : undefined,
      });

      return response.status(200).json(scheduled);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async update(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params;
      const {
        title,
        body,
        target_users,
        target_roles,
        scheduled_for,
        recurrence_pattern,
        timezone,
        is_active,
        data,
      } = request.body;

      const manageScheduledNotificationsUseCase = container.resolve(
        ManageScheduledNotificationsUseCase
      );

      const scheduled = await manageScheduledNotificationsUseCase.update({
        id: Number(id),
        title,
        body,
        target_users,
        target_roles,
        scheduled_for: scheduled_for ? new Date(scheduled_for) : undefined,
        recurrence_pattern,
        timezone,
        is_active,
        data,
      });

      return response.status(200).json(scheduled);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async delete(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params;

      const manageScheduledNotificationsUseCase = container.resolve(
        ManageScheduledNotificationsUseCase
      );

      await manageScheduledNotificationsUseCase.delete(Number(id));

      return response.status(204).send();
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async activate(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params;

      const manageScheduledNotificationsUseCase = container.resolve(
        ManageScheduledNotificationsUseCase
      );

      const scheduled = await manageScheduledNotificationsUseCase.activate(
        Number(id)
      );

      return response.status(200).json(scheduled);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async deactivate(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params;

      const manageScheduledNotificationsUseCase = container.resolve(
        ManageScheduledNotificationsUseCase
      );

      const scheduled = await manageScheduledNotificationsUseCase.deactivate(
        Number(id)
      );

      return response.status(200).json(scheduled);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
