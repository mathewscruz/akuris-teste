import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface WelcomeEmailProps {
  userName: string
  userEmail: string
  temporaryPassword: string
  loginUrl: string
}

export const WelcomeEmail = ({
  userName,
  userEmail,
  temporaryPassword,
  loginUrl,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Bem-vindo ao GovernAI! Aqui estão seus dados de acesso</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Img
            src={`${loginUrl}/governaii-logo.png`}
            width="200"
            height="80"
            alt="GovernAI Logo"
            style={logo}
          />
        </Section>
        
        <Heading style={h1}>Bem-vindo ao GovernAI!</Heading>
        
        <Text style={text}>
          Olá <strong>{userName}</strong>,
        </Text>
        
        <Text style={text}>
          Sua conta foi criada com sucesso! Aqui estão seus dados de acesso:
        </Text>
        
        <Section style={credentialsBox}>
          <Text style={credentialLabel}>E-mail:</Text>
          <Text style={credentialValue}>{userEmail}</Text>
          
          <Text style={credentialLabel}>Senha temporária:</Text>
          <Text style={credentialValue}>{temporaryPassword}</Text>
        </Section>
        
        <Section style={buttonContainer}>
          <Link
            href={loginUrl}
            target="_blank"
            style={button}
          >
            Acessar o GovernAI
          </Link>
        </Section>
        
        <Text style={importantNote}>
          <strong>Importante:</strong> Esta é uma senha temporária que deve ser alterada no seu primeiro acesso ao sistema.
        </Text>
        
        <Text style={text}>
          Se você tiver alguma dúvida, entre em contato com nossa equipe de suporte.
        </Text>
        
        <Text style={footer}>
          Atenciosamente,<br />
          Equipe GovernAI
        </Text>
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '"Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '8px',
  margin: '40px auto',
  padding: '40px',
  width: '600px',
}

const logoContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const logo = {
  margin: '0 auto',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 30px',
  textAlign: 'center' as const,
}

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const credentialsBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '6px',
  padding: '24px',
  margin: '24px 0',
}

const credentialLabel = {
  color: '#6c757d',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
}

const credentialValue = {
  color: '#212529',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  fontFamily: 'monospace',
}

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#007bff',
  border: 'none',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '14px 28px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  transition: 'background-color 0.3s ease',
}

const importantNote = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '6px',
  color: '#856404',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0',
  padding: '16px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '32px',
}