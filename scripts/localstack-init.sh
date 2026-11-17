#!/bin/bash
# Topologia local (LocalStack) só do que este serviço publica e consome.
set -euo pipefail

awslocal sns create-topic --name lagoski-dev-ordering-events >/dev/null
awslocal sns create-topic --name lagoski-dev-payment-events >/dev/null
awslocal sns create-topic --name lagoski-dev-fulfillment-events >/dev/null
awslocal sqs create-queue --queue-name lagoski-dev-notification-on-ordering-dlq >/dev/null
awslocal sqs create-queue --queue-name lagoski-dev-notification-on-ordering --attributes '{"RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:lagoski-dev-notification-on-ordering-dlq\",\"maxReceiveCount\":\"5\"}"}' >/dev/null
awslocal sns subscribe --topic-arn arn:aws:sns:us-east-1:000000000000:lagoski-dev-ordering-events --protocol sqs --notification-endpoint arn:aws:sqs:us-east-1:000000000000:lagoski-dev-notification-on-ordering --attributes '{"RawMessageDelivery":"true","FilterPolicyScope":"MessageAttributes","FilterPolicy":"{\"ce_type\":[\"lagoski.ordering.order.confirmed.v1\",\"lagoski.ordering.order.cancelled.v1\"]}"}' >/dev/null
awslocal sqs create-queue --queue-name lagoski-dev-notification-on-payment-dlq >/dev/null
awslocal sqs create-queue --queue-name lagoski-dev-notification-on-payment --attributes '{"RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:lagoski-dev-notification-on-payment-dlq\",\"maxReceiveCount\":\"5\"}"}' >/dev/null
awslocal sns subscribe --topic-arn arn:aws:sns:us-east-1:000000000000:lagoski-dev-payment-events --protocol sqs --notification-endpoint arn:aws:sqs:us-east-1:000000000000:lagoski-dev-notification-on-payment --attributes '{"RawMessageDelivery":"true","FilterPolicyScope":"MessageAttributes","FilterPolicy":"{\"ce_type\":[\"lagoski.payment.payment.declined.v1\"]}"}' >/dev/null
awslocal sqs create-queue --queue-name lagoski-dev-notification-on-fulfillment-dlq >/dev/null
awslocal sqs create-queue --queue-name lagoski-dev-notification-on-fulfillment --attributes '{"RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:lagoski-dev-notification-on-fulfillment-dlq\",\"maxReceiveCount\":\"5\"}"}' >/dev/null
awslocal sns subscribe --topic-arn arn:aws:sns:us-east-1:000000000000:lagoski-dev-fulfillment-events --protocol sqs --notification-endpoint arn:aws:sqs:us-east-1:000000000000:lagoski-dev-notification-on-fulfillment --attributes '{"RawMessageDelivery":"true","FilterPolicyScope":"MessageAttributes","FilterPolicy":"{\"ce_type\":[\"lagoski.fulfillment.shipment.dispatched.v1\"]}"}' >/dev/null
touch /tmp/lagoski-ready
echo "topologia Lagoski pronta"
