import { z } from 'zod';
import type { ServiceModule } from './chassis/bootstrap.js';
import type { Migration } from './chassis/db.js';
import { render } from './domain/templates.js';
import { subscriptions } from './messaging-config.js';

const migrations: Migration[] = [
  {
    id: '001_notifications',
    sql: `
      create table notifications (
        id bigserial primary key,
        event_id text not null unique,
        customer_id text not null,
        order_id text not null,
        template text not null,
        subject text not null,
        body text not null,
        channel text not null default 'email',
        sent_at timestamptz not null default now()
      );
      create index notifications_customer on notifications (customer_id, sent_at desc);
    `,
  },
];

/** O "envio" é um log: em produção, um adapter de e-mail (SES, SendGrid) entraria aqui. */
export const notificationModule: ServiceModule = {
  name: 'notification',
  defaultPort: 8086,
  migrations,
  subscriptions,
  register({ app, db, logger }) {
    app.get('/notifications', async (req) => {
      const { customerId } = z.object({ customerId: z.string() }).parse(req.query);
      const { rows } = await db.query(
        'select order_id as "orderId", template, subject, body, channel, sent_at as "sentAt" from notifications where customer_id = $1 order by sent_at desc limit 50',
        [customerId],
      );
      return { notifications: rows };
    });

    return {
      async handle(event, tx) {
        const n = render(event);
        if (!n) return;
        await tx.query(
          'insert into notifications (event_id, customer_id, order_id, template, subject, body) values ($1, $2, $3, $4, $5, $6) on conflict (event_id) do nothing',
          [event.id, n.customerId, n.orderId, n.template, n.subject, n.body],
        );
        logger.info({ to: n.customerId, subject: n.subject }, 'e-mail enviado (simulado)');
      },
    };
  },
};
