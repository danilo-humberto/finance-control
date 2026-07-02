import type { ServerResponse } from 'node:http';

import {
  handleVercelRequest,
  type VercelRequest,
} from '../src/serverless/vercel-handler';

export default function handler(req: VercelRequest, res: ServerResponse) {
  return handleVercelRequest(req, res, {
    routePath: '/invoices',
  });
}
