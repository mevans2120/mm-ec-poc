import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
  Hr,
  Preview,
} from '@react-email/components'

interface PurchaseConfirmationProps {
  customerName: string
  productName: string
  downloadUrl?: string
  isPhysical: boolean
}

export function PurchaseConfirmation({
  customerName = 'there',
  productName = 'your product',
  downloadUrl,
  isPhysical = false,
}: PurchaseConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your purchase of {productName} is confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Thank you for your purchase!</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            Your purchase of <strong>{productName}</strong> is confirmed.
          </Text>
          {!isPhysical && downloadUrl && (
            <Section style={downloadSection}>
              <Text style={text}>Download your product using the button below:</Text>
              <Button href={downloadUrl} style={button}>
                Download Now
              </Button>
              <Text style={smallText}>This link expires in 7 days.</Text>
            </Section>
          )}
          {isPhysical && (
            <Section>
              <Text style={text}>
                Your order will ship within 5-7 business days. We&apos;ll send
                tracking information when your package is on its way.
              </Text>
            </Section>
          )}
          <Hr style={hr} />
          <Text style={footer}>— Maggie Mistal</Text>
        </Container>
      </Body>
    </Html>
  )
}

// Use inline styles for email compatibility
const main = {
  backgroundColor: '#f4f4f4',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  borderRadius: '8px',
}

const heading = {
  color: '#333333',
  fontSize: '24px',
  fontWeight: '600' as const,
  lineHeight: '1.3',
  margin: '0 0 20px',
}

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 16px',
}

const smallText = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '8px 0 0',
}

const downloadSection = {
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const button = {
  backgroundColor: '#7dd1e1',
  borderRadius: '6px',
  color: '#1a1a1a',
  display: 'inline-block' as const,
  fontSize: '16px',
  fontWeight: '600' as const,
  padding: '12px 24px',
  textDecoration: 'none',
}

const hr = {
  borderColor: '#e6e6e6',
  margin: '24px 0',
}

const footer = {
  color: '#666666',
  fontSize: '14px',
  fontStyle: 'italic' as const,
}

export default PurchaseConfirmation
