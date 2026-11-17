import type { CloudEvent } from '../chassis/cloudevent.js';

/** O Notification não publica eventos: não há o que validar contra os schemas. */
export function contractSamples(): CloudEvent[] {
  return [];
}
