import { describe, expect, it } from 'vitest';
import { newEvent } from '../src/chassis/cloudevent.js';
import { render } from '../src/domain/templates.js';

const ev = (type: string, data: unknown) => newEvent({ source: 'test', type, data, correlationId: 'ord_01JD3XABC123' });

describe('templates', () => {
  it('pedido confirmado mostra o valor em reais', () => {
    const n = render(ev('lagoski.ordering.order.confirmed.v1', { orderId: 'ord_01JD3XABC123', customerId: 'cus_1', totalCents: 17980, lines: [] }));
    expect(n).toMatchObject({ customerId: 'cus_1', template: 'order-confirmed', subject: 'Pedido ABC123 confirmado' });
    expect(n?.body).toContain('179,80');
  });

  it('cancelamento explica o motivo em português', () => {
    const n = render(ev('lagoski.ordering.order.cancelled.v1', { orderId: 'ord_X', customerId: 'cus_1', reason: 'OUT_OF_STOCK' }));
    expect(n?.body).toContain('acabou no estoque');
  });

  it('despacho traz o rastreio; evento desconhecido não notifica', () => {
    expect(render(ev('lagoski.fulfillment.shipment.dispatched.v1', { orderId: 'ord_X', customerId: 'c', trackingCode: 'LG000000001BR', carrier: 'T' }))?.body).toContain('LG000000001BR');
    expect(render(ev('lagoski.x.y.v1', {}))).toBeNull();
  });
});
