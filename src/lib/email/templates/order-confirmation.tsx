import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type OrderConfirmationProps = {
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number; priceCents: number }[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  shipTo: {
    line1: string;
    line2?: string | null;
    city: string;
    region: string;
    postalCode: string;
  };
};

const money = (c: number) => `$${(c / 100).toFixed(2)}`;

export function OrderConfirmationEmail(props: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Order {props.orderNumber} confirmed</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f7f2e8" }}>
        <Container style={{ padding: "32px", maxWidth: "600px", margin: "0 auto" }}>
          <Heading style={{ color: "#553819" }}>Thanks for your order!</Heading>
          <Text>Hi {props.customerName}, we&apos;re packing your order now.</Text>
          <Text>
            <strong>Order:</strong> {props.orderNumber}
          </Text>

          <Hr />
          <Section>
            <Heading as="h3" style={{ color: "#553819", fontSize: "16px" }}>Items</Heading>
            {props.items.map((i, idx) => (
              <Text key={idx} style={{ margin: "4px 0" }}>
                {i.quantity} × {i.name} — {money(i.priceCents * i.quantity)}
              </Text>
            ))}
          </Section>

          <Hr />
          <Section>
            <Text style={{ margin: "4px 0" }}>Subtotal: {money(props.subtotalCents)}</Text>
            <Text style={{ margin: "4px 0" }}>Shipping: {money(props.shippingCents)}</Text>
            <Text style={{ margin: "4px 0" }}>Tax: {money(props.taxCents)}</Text>
            <Text style={{ margin: "4px 0", fontWeight: "bold" }}>
              Total: {money(props.totalCents)}
            </Text>
          </Section>

          <Hr />
          <Section>
            <Heading as="h3" style={{ color: "#553819", fontSize: "16px" }}>
              Shipping to
            </Heading>
            <Text style={{ margin: "2px 0" }}>{props.shipTo.line1}</Text>
            {props.shipTo.line2 && <Text style={{ margin: "2px 0" }}>{props.shipTo.line2}</Text>}
            <Text style={{ margin: "2px 0" }}>
              {props.shipTo.city}, {props.shipTo.region} {props.shipTo.postalCode}
            </Text>
          </Section>

          <Hr />
          <Text style={{ fontSize: "12px", color: "#6f4a23" }}>
            Questions? Reply to this email and we&apos;ll take care of you.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
