import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import {
  InvoiceItemResponse,
  InvoiceResponse,
  InvoicesService,
} from './invoices.service';

@Controller('invoices')
@UseGuards(FirebaseAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findOne(
    @CurrentUser() user: User,
    @Query() query: QueryInvoiceDto,
  ): Promise<InvoiceResponse> {
    return this.invoicesService.findOne(user.id, query);
  }

  @Patch('installments/:id/pay')
  payInstallment(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InvoiceItemResponse> {
    return this.invoicesService.payInstallment(user.id, id);
  }

  @Patch('installments/:id/reopen')
  reopenInstallment(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InvoiceItemResponse> {
    return this.invoicesService.reopenInstallment(user.id, id);
  }

  @Patch('installments/:id/cancel')
  cancelInstallment(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InvoiceItemResponse> {
    return this.invoicesService.cancelInstallment(user.id, id);
  }
}
