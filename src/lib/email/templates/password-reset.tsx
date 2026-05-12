import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export function PasswordResetEmail({ url, name }: { url: string; name?: string | null }) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Moore Trading Co. password</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f7f2e8" }}>
        <Container style={{ padding: "32px", maxWidth: "560px", margin: "0 auto" }}>
          <Heading style={{ color: "#553819" }}>Reset your password</Heading>
          <Section>
            <Text>Hi{name ? ` ${name}` : ""},</Text>
            <Text>
              We received a request to reset your Moore Trading Co. password.
              Click below to choose a new one. This link expires in 1 hour.
            </Text>
            <Button
              href={url}
              style={{
                backgroundColor: "#553819",
                color: "#f7f2e8",
                padding: "12px 20px",
                borderRadius: "6px",
                textDecoration: "none",
              }}
            >
              Reset password
            </Button>
            <Text style={{ marginTop: "16px", fontSize: "12px", color: "#6f4a23" }}>
              If you didn&apos;t request this, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
