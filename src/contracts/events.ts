import { z } from 'zod';

/**
 * Conformist: o Notification não tem modelo próprio dos fatos; lê os eventos
 * como os outros contextos publicam (só os campos que usa).
 */
export const ConsumedTypes = {
  orderConfirmed: 'lagoski.ordering.order.confirmed.v1',
  orderCancelled: 'lagoski.ordering.order.cancelled.v1',
  paymentDeclined: 'lagoski.payment.payment.declined.v1',
  shipmentDispatched: 'lagoski.fulfillment.shipment.dispatched.v1',
} as const;

export const Consumed = {
  orderConfirmed: z.object({ orderId: z.string(), customerId: z.string(), totalCents: z.number().int() }),
  orderCancelled: z.object({ orderId: z.string(), customerId: z.string(), reason: z.string() }),
  paymentDeclined: z.object({ orderId: z.string(), customerId: z.string(), reason: z.string() }),
  shipmentDispatched: z.object({ orderId: z.string(), customerId: z.string(), trackingCode: z.string(), carrier: z.string() }),
};
