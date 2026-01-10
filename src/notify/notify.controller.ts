import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { NotifyService } from './notify.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Controller('notify')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @Post()
  handle(@Body() dto: CreateLeadDto, @Req() req: Request) {
    const origin = req.headers.origin ?? req.headers.referer ?? 'unknown';
    return this.notifyService.sendAndCreateLead(dto, origin);
  }
}
