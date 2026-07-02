import type { ServerResponse } from 'node:http';

import {
  getVercelRouteParam,
  handleVercelRequest,
  type VercelRequest,
} from '../../src/serverless/vercel-handler';

export default function handler(req: VercelRequest, res: ServerResponse) {
  const id = getVercelRouteParam(req, 'id');

  return handleVercelRequest(req, res, {
    routePath: `/credit-cards/${id}`,
  });
}
