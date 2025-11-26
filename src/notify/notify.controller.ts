import { Body, Controller, Post } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Controller('notify')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @Post()
  handle(@Body() dto: CreateLeadDto) {
    return this.notifyService.sendAndCreateLead(dto);
  }
}
