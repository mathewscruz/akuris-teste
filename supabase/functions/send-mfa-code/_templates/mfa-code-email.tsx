import { Section, Text } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmailTemplate, emailStyles } from '../../_shared/email-templates/BaseEmailTemplate.tsx';

interface MFACodeEmailProps {
  userName: string;
  code: string;
}

export const MFACodeEmail = ({
  userName,
  code,
}: MFACodeEmailProps) => (
  <BaseEmailTemplate
    previewText={`${code} - Código de verificação Akuris`}
    title="Código de Verificação"
  >
    <Text style={emailStyles.text}>
      Olá <strong>{userName}</strong>,
    </Text>

    <Text style={emailStyles.text}>
      Use o código abaixo para completar seu login na plataforma Akuris:
    </Text>

    <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
      <Text style={{
        ...emailStyles.code,
        fontSize: '32px',
        letterSpacing: '8px',
        padding: '20px 32px',
      }}>
        {code}
      </Text>
    </Section>

    <Section style={emailStyles.warningBox}>
      <Text style={{ ...emailStyles.text, margin: '0', fontSize: '13px' }}>
        Este código expira em <strong>5 minutos</strong>. Não compartilhe este código com ninguém.
      </Text>
    </Section>

    <Text style={emailStyles.textSmall}>
      Se você não tentou fazer login, sua conta pode estar comprometida. Altere sua senha imediatamente.
    </Text>
  </BaseEmailTemplate>
);

export default MFACodeEmail;
