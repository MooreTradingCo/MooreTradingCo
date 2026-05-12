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

export function VerifyEmail({ url, name }: { url: string; name?: string | null }) {
  return (
    <Html>
      <Head />
      <Preview>Verify your Moore Trading Co. email</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f7f2e8" }}>
        <Container style={{ padding: "32px", maxWidth: "560px", margin: "0 auto" }}>
          <Heading style={{ color: "#553819" }}>Confirm your email</Heading>
          <Section>
            <Text>Welcome{name ? `, ${name}` : ""}!</Text>
            <Text>
              Click the button below to confirm your email and finish setting
              up your Moore Trading Co. account.
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
              Confirm email
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
