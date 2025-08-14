import { Controller, Get, Patch, Param, Delete, Query, UseGuards } from "@nestjs/common"
import type { NotificationsService } from "./notifications.service"
import { JwtAuthGuard } from "~/common/guards/jwt-auth.guard"
import type { AuthenticateRequest } from "~/common/types/user.type"

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Query() filterDto: any, req: AuthenticateRequest) {
    return this.notificationsService.findAll(req.user.id, filterDto)
  }

  @Get("unread-count")
  getUnreadCount(req: AuthenticateRequest) {
    return this.notificationsService.getUnreadCount(req.user.id)
  }

  @Patch(":id/read")
  markAsRead(@Param('id') id: string, req: AuthenticateRequest) {
    return this.notificationsService.markAsRead(id, req.user.id)
  }

  @Patch("mark-all-read")
  markAllAsRead(req: AuthenticateRequest) {
    return this.notificationsService.markAllAsRead(req.user.id)
  }

  @Delete(":id")
  remove(@Param('id') id: string, req: AuthenticateRequest) {
    return this.notificationsService.delete(id, req.user.id)
  }
}
