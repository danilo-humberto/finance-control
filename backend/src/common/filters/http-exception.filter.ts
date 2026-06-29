import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

export type StandardErrorResponse = {
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
  path: string;
  details?: string[];
};

type HttpResponse = {
  status: (statusCode: number) => {
    json: (body: StandardErrorResponse) => void;
  };
};

type HttpRequest = {
  url?: string;
};

const internalServerErrorStatus = Number(HttpStatus.INTERNAL_SERVER_ERROR);

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<HttpResponse>();
    const request = context.getRequest<HttpRequest>();
    const errorResponse = this.toErrorResponse(exception, request.url ?? '');

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private toErrorResponse(
    exception: unknown,
    path: string,
  ): StandardErrorResponse {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error.',
        timestamp: new Date().toISOString(),
        path,
      };
    }

    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const parsedResponse = this.parseExceptionResponse(
      exceptionResponse,
      statusCode,
    );

    return {
      statusCode,
      code: parsedResponse.code,
      message: parsedResponse.message,
      timestamp: new Date().toISOString(),
      path,
      ...(parsedResponse.details ? { details: parsedResponse.details } : {}),
    };
  }

  private parseExceptionResponse(
    exceptionResponse: string | object,
    statusCode: number,
  ): {
    code: string;
    message: string;
    details?: string[];
  } {
    if (statusCode >= internalServerErrorStatus) {
      return {
        code: this.getStatusCodeName(statusCode),
        message: this.getDefaultMessage(statusCode),
      };
    }

    if (typeof exceptionResponse === 'string') {
      return {
        code: this.getStatusCodeName(statusCode),
        message: exceptionResponse,
      };
    }

    if (!this.isRecord(exceptionResponse)) {
      return {
        code: this.getStatusCodeName(statusCode),
        message: this.getDefaultMessage(statusCode),
      };
    }

    const messageValue = exceptionResponse.message;
    const details = Array.isArray(messageValue)
      ? messageValue.filter(
          (message): message is string => typeof message === 'string',
        )
      : undefined;
    const message =
      details && details.length > 0
        ? details.join(' ')
        : this.getMessage(exceptionResponse, statusCode);
    const code =
      typeof exceptionResponse.code === 'string'
        ? this.toErrorCode(exceptionResponse.code)
        : this.toErrorCode(
            typeof exceptionResponse.error === 'string'
              ? exceptionResponse.error
              : this.getStatusCodeName(statusCode),
          );

    return {
      code,
      message,
      ...(details && details.length > 0 ? { details } : {}),
    };
  }

  private getMessage(
    exceptionResponse: Record<string, unknown>,
    statusCode: number,
  ): string {
    if (typeof exceptionResponse.message === 'string') {
      return exceptionResponse.message;
    }

    if (typeof exceptionResponse.error === 'string') {
      return exceptionResponse.error;
    }

    return this.getDefaultMessage(statusCode);
  }

  private getDefaultMessage(statusCode: number): string {
    return statusCode === internalServerErrorStatus
      ? 'Internal server error.'
      : 'Request failed.';
  }

  private getStatusCodeName(statusCode: number): string {
    const statusName = (HttpStatus as Record<number, string>)[statusCode];

    return statusName ?? 'ERROR';
  }

  private toErrorCode(value: string): string {
    return value
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toUpperCase();
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
