import { Link, Section, Text } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmailTemplate, emailStyles } from '../../_shared/email-templates/BaseEmailTemplate.tsx';

interface PasswordResetEmailProps {
  userName: string;
  userEmail: string;
  resetUrl: string;
  companyName?: string;
  companyLogoUrl?: string;
}

export const PasswordResetEmail = ({
  userName,
  userEmail,
  resetUrl,
  companyName,
  companyLogoUrl,
}: PasswordResetEmailProps) => (
  <BaseEmailTemplate
    previewText="Redefinição de senha - Akuris"
    title="Redefinição de Senha"
    companyLogoUrl={companyLogoUrl}
  >
    <Text style={emailStyles.text}>
      Olá <strong>{userName}</strong>,
    </Text>

    <Text style={emailStyles.text}>
      Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para definir uma nova senha:
    </Text>

    <Section style={emailStyles.buttonSection}>
      <Link href={resetUrl} style={emailStyles.button}>
        Redefinir Minha Senha
      </Link>
    </Section>

    <Section style={emailStyles.warningBox}>
      <Text style={{ ...emailStyles.text, margin: '0', fontSize: '13px' }}>
        <strong>Importante:</strong> Este link expira em 1 hora. Se expirar, solicite uma nova redefinição.
      </Text>
    </Section>

    <Text style={emailStyles.text}>
      Se você não solicitou esta redefinição, por favor ignore este e-mail. Sua senha permanecerá inalterada.
    </Text>
  </BaseEmailTemplate>
);

export default PasswordResetEmail;
