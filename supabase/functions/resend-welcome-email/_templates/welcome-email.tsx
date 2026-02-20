import { Link, Section, Text } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmailTemplate, emailStyles } from '../../_shared/email-templates/BaseEmailTemplate.tsx';

interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  setupPasswordUrl: string;
  companyName?: string;
  companyLogoUrl?: string;
}

export const WelcomeEmail = ({
  userName,
  userEmail,
  setupPasswordUrl,
  companyName,
  companyLogoUrl,
}: WelcomeEmailProps) => (
  <BaseEmailTemplate
    previewText="Bem-vindo ao Akuris - Defina sua senha"
    title={`Bem-vindo, ${userName}!`}
    companyLogoUrl={companyLogoUrl}
  >
    <Text style={emailStyles.text}>
      Sua conta foi criada com sucesso na plataforma <strong>Akuris</strong>.
    </Text>

    <Text style={emailStyles.text}>
      Para começar a usar a plataforma, defina sua senha clicando no botão abaixo:
    </Text>

    <Section style={emailStyles.infoBox}>
      <Text style={{ ...emailStyles.text, margin: '0 0 8px' }}>
        <strong>E-mail de acesso:</strong> {userEmail}
      </Text>
    </Section>

    <Section style={emailStyles.buttonSection}>
      <Link href={setupPasswordUrl} style={emailStyles.button}>
        Definir Minha Senha
      </Link>
    </Section>

    <Section style={emailStyles.warningBox}>
      <Text style={{ ...emailStyles.text, margin: '0', fontSize: '13px' }}>
        <strong>Importante:</strong> Este link expira em 24 horas. Se expirar, peça ao administrador para reenviar o convite.
      </Text>
    </Section>

    <Text style={emailStyles.textSmall}>
      Se você não solicitou este cadastro, por favor desconsidere este e-mail.
    </Text>
  </BaseEmailTemplate>
);

export default WelcomeEmail;
