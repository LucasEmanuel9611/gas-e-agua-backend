export const PRIVACY_POLICY_CONTACT_EMAIL = "eduardogas2013@hotmail.com";
export const PRIVACY_POLICY_CONTACT_PHONE_DISPLAY = "(81) 99732-67792";
export const PRIVACY_POLICY_CONTACT_WHATSAPP_URL =
  "https://wa.me/55819973267792";
export const PRIVACY_POLICY_LAST_UPDATED_LABEL = "28 de agosto de 2026";
export const PRIVACY_POLICY_ANDROID_PACKAGE_NAME = "com.gaseagua.app";
export const ACCOUNT_DELETION_REQUEST_PATH = "/exclusao-de-conta";

export function buildPrivacyPolicyHtml(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Política de Privacidade — Eduardo Gás</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1a1a1a; }
    h1 { font-size: 1.75rem; }
    h2 { font-size: 1.15rem; margin-top: 1.75rem; }
  </style>
</head>
<body>
  <h1>Política de Privacidade — Eduardo Gás</h1>
  <p>Última atualização: ${PRIVACY_POLICY_LAST_UPDATED_LABEL}.</p>
  <p>O aplicativo Eduardo Gás (pacote ${PRIVACY_POLICY_ANDROID_PACKAGE_NAME}) é usado para pedidos de gás e água. Esta política descreve quais dados tratamos e para quê, nos termos da LGPD (Lei nº 13.709/2018).</p>

  <h2>1. Quem é o responsável</h2>
  <p>Eduardo Gás. Contato: WhatsApp/telefone ${PRIVACY_POLICY_CONTACT_PHONE_DISPLAY}. E-mail: <a href="mailto:${PRIVACY_POLICY_CONTACT_EMAIL}">${PRIVACY_POLICY_CONTACT_EMAIL}</a>.</p>

  <h2>2. Quais dados coletamos</h2>
  <p>Cadastro: nome, e-mail, telefone e senha.</p>
  <p>Endereço de entrega (local, rua, número, referência).</p>
  <p>Pedidos (produtos, quantidades, status) e forma de pagamento informada (Pix, dinheiro ou cartão) — esse campo é opcional.</p>
  <p>Token de notificação do aparelho (FCM), para avisos de pedido e mensagens do administrador.</p>
  <p>Não pedimos data de nascimento. Não vendemos dados.</p>

  <h2>3. Para que usamos</h2>
  <p>Criar e autenticar a conta, entregar pedidos, registrar pagamentos, enviar notificações e melhorar o atendimento.</p>

  <h2>4. Com quem compartilhamos</h2>
  <p>Só com serviços necessários ao app: hospedagem da API, Google Play e Firebase Cloud Messaging. Não compartilhamos com anunciantes.</p>

  <h2>5. Por quanto tempo</h2>
  <p>Enquanto a conta existir e pelo tempo necessário para cumprir obrigações legais. Você pode pedir exclusão da conta e dos dados em <a href="${ACCOUNT_DELETION_REQUEST_PATH}">solicitar exclusão da conta e dos dados</a>.</p>

  <h2>6. Seus direitos (LGPD)</h2>
  <p>Acessar, corrigir, atualizar ou pedir exclusão dos dados, além de informações sobre o tratamento. Fale conosco pelo telefone ou e-mail acima.</p>

  <h2>7. Segurança</h2>
  <p>Senha é armazenada de forma protegida. Comunicação com o servidor em produção usa HTTPS.</p>

  <h2>8. Alterações</h2>
  <p>Se esta política mudar, atualizaremos esta página e a data acima.</p>
</body>
</html>`;
}
