import { Controller, Get, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
@UseGuards(FirebaseAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(): { message: string } {
    return this.invoicesService.findAll();
  }
}
