import {
  PRIVACY_POLICY_CONTACT_EMAIL,
  PRIVACY_POLICY_CONTACT_PHONE_DISPLAY,
  PRIVACY_POLICY_CONTACT_WHATSAPP_URL,
} from "./privacyPolicyHtml";

const ACCOUNT_DELETION_REQUEST_MESSAGE =
  "Quero solicitar a exclusão da minha conta e dos meus dados no aplicativo Eduardo Gás.";

export function buildAccountDeletionHtml(): string {
  const whatsAppRequestUrl = `${PRIVACY_POLICY_CONTACT_WHATSAPP_URL}?text=${encodeURIComponent(
    ACCOUNT_DELETION_REQUEST_MESSAGE
  )}`;
  const emailSubject = encodeURIComponent(
    "Solicitação de exclusão de conta e dados"
  );
  const emailBody = encodeURIComponent(
    `${ACCOUNT_DELETION_REQUEST_MESSAGE}\n\nNome:\nE-mail da conta:\nTelefone:\n`
  );
  const emailRequestUrl = `mailto:${PRIVACY_POLICY_CONTACT_EMAIL}?subject=${emailSubject}&amp;body=${emailBody}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Solicitar exclusão da conta e dos dados — Eduardo Gás</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1a1a1a; }
    h1 { font-size: 1.75rem; }
    h2 { font-size: 1.15rem; margin-top: 1.75rem; }
  </style>
</head>
<body>
  <h1>Solicitar exclusão da conta e dos dados</h1>
  <p>Use um dos contatos abaixo para pedir a exclusão da sua conta e dos seus dados no aplicativo Eduardo Gás. Informe o nome, o e-mail e o telefone cadastrados.</p>

  <h2>Como solicitar</h2>
  <p><a href="${whatsAppRequestUrl}">WhatsApp ${PRIVACY_POLICY_CONTACT_PHONE_DISPLAY}</a></p>
  <p><a href="${emailRequestUrl}">E-mail ${PRIVACY_POLICY_CONTACT_EMAIL}</a></p>

  <h2>O que é excluído</h2>
  <p>Conta (nome, e-mail, telefone e senha), endereços de entrega e token de notificação do aparelho.</p>

  <h2>O que pode ser mantido</h2>
  <p>Registros de pedidos e pagamentos pelo tempo necessário para cumprir obrigações legais. Não vendemos dados.</p>
</body>
</html>`;
}
