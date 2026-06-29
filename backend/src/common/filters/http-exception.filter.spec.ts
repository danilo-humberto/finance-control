import {
  ArgumentsHost,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  HttpExceptionFilter,
  type StandardErrorResponse,
} from './http-exception.filter';

function createArgumentsHost(path = '/test'): {
  host: ArgumentsHost;
  json: jest.Mock<void, [StandardErrorResponse]>;
  status: jest.Mock<{ json: jest.Mock<void, [StandardErrorResponse]> }, [number]>;
} {
  const json = jest.fn<void, [StandardErrorResponse]>();
  const status = jest.fn<
    { json: jest.Mock<void, [StandardErrorResponse]> },
    [number]
  >(() => ({
    json,
  }));
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({
        status,
      }),
      getRequest: () => ({
        url: path,
      }),
    }),
  } as unknown as ArgumentsHost;

  return {
    host,
    json,
    status,
  };
}

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  it('formats known HTTP exceptions', () => {
    const { host, json, status } = createArgumentsHost('/auth/me');

    filter.catch(
      new UnauthorizedException('Authorization token is required.'),
      host,
    );

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Authorization token is required.',
        path: '/auth/me',
      }) as StandardErrorResponse,
    );
  });

  it('keeps validation details in a standard response', () => {
    const { json, host, status } = createArgumentsHost('/transactions');

    filter.catch(
      new BadRequestException([
        'amount must not be less than 0.01',
        'categoryId must be a UUID',
      ]),
      host,
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        code: 'BAD_REQUEST',
        message:
          'amount must not be less than 0.01 categoryId must be a UUID',
        details: [
          'amount must not be less than 0.01',
          'categoryId must be a UUID',
        ],
      }) as StandardErrorResponse,
    );
  });

  it('does not expose unknown exception messages', () => {
    const { json, host, status } = createArgumentsHost('/credit-cards');

    filter.catch(new Error('database password leaked'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error.',
        path: '/credit-cards',
      }) as StandardErrorResponse,
    );
  });

  it('does not expose custom internal server exception messages', () => {
    const { json, host, status } = createArgumentsHost('/settings');

    filter.catch(new InternalServerErrorException('database failed'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error.',
      }) as StandardErrorResponse,
    );
  });
});
