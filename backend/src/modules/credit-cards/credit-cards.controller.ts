import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import {
  type CreditCardResponse,
  CreditCardsService,
} from './credit-cards.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';

@Controller('credit-cards')
@UseGuards(FirebaseAuthGuard)
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateCreditCardDto,
  ): Promise<CreditCardResponse> {
    return this.creditCardsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User): Promise<CreditCardResponse[]> {
    return this.creditCardsService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<CreditCardResponse> {
    return this.creditCardsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCreditCardDto,
  ): Promise<CreditCardResponse> {
    return this.creditCardsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<CreditCardResponse> {
    return this.creditCardsService.remove(user.id, id);
  }
}
