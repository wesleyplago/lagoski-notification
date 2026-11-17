import type { CloudEvent } from '../chassis/cloudevent.js';
import { Consumed, ConsumedTypes as T } from '../contracts/events.js';

export type Notification = { customerId: string; orderId: string; template: string; subject: string; body: string };

const brl = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const short = (orderId: string) => orderId.slice(-6).toUpperCase();

const CANCEL_REASONS: Record<string, string> = {
  OUT_OF_STOCK: 'um dos itens acabou no estoque',
  PAYMENT_DECLINED: 'o pagamento não foi concluído',
  RESERVATION_EXPIRED: 'o prazo para pagar terminou',
};

/** Traduz um fato em e-mail. Devolve null para o que não gera notificação. */
export function render(event: CloudEvent): Notification | null {
  switch (event.type) {
    case T.orderConfirmed: {
      const d = Consumed.orderConfirmed.parse(event.data);
      return { customerId: d.customerId, orderId: d.orderId, template: 'order-confirmed', subject: `Pedido ${short(d.orderId)} confirmado`, body: `Recebemos o pagamento de ${brl(d.totalCents)}. Já estamos separando suas camisetas.` };
    }
    case T.orderCancelled: {
      const d = Consumed.orderCancelled.parse(event.data);
      return { customerId: d.customerId, orderId: d.orderId, template: 'order-cancelled', subject: `Pedido ${short(d.orderId)} cancelado`, body: `Cancelamos o pedido porque ${CANCEL_REASONS[d.reason] ?? d.reason}. Nada foi cobrado.` };
    }
    case T.paymentDeclined: {
      const d = Consumed.paymentDeclined.parse(event.data);
      return { customerId: d.customerId, orderId: d.orderId, template: 'payment-declined', subject: `Pagamento do pedido ${short(d.orderId)} não concluído`, body: 'O pagamento não foi concluído. Você pode fazer um novo pedido quando quiser.' };
    }
    case T.shipmentDispatched: {
      const d = Consumed.shipmentDispatched.parse(event.data);
      return { customerId: d.customerId, orderId: d.orderId, template: 'shipment-dispatched', subject: `Pedido ${short(d.orderId)} a caminho`, body: `${d.carrier} coletou seu pacote. Rastreio: ${d.trackingCode}.` };
    }
    default:
      return null;
  }
}
