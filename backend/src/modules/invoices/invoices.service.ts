import { Injectable } from '@nestjs/common';

type InvoicesReadyResponse = {
  message: string;
};

@Injectable()
export class InvoicesService {
  findAll(): InvoicesReadyResponse {
    return {
      message: 'Invoices module ready',
    };
  }
}
