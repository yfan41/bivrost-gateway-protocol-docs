import type { APIRoute } from 'astro';
import { renderFull, textResponse } from '../../lib/llms';

// Full English documentation as one plain-text file (dist/en/llms-full.txt).
export const GET: APIRoute = async () => textResponse(await renderFull('en'));
