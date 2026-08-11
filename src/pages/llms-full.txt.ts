import type { APIRoute } from 'astro';
import { renderFull, textResponse } from '../lib/llms';

// Full Simplified Chinese documentation as one plain-text file (dist/llms-full.txt).
export const GET: APIRoute = async () => textResponse(await renderFull('zh'));
