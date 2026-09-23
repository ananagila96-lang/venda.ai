# Adapter Z-API

Este diretório contém integração **server-side**. Não importar este adapter diretamente no bundle React.

## Implementado
- leitura de configuração por ambiente;
- envio de mensagem de texto via endpoint público documentado da Z-API Omni;
- normalização inicial de eventos recebidos por webhook;
- validação de segredo próprio do endpoint do Venda.AI;
- filtro para ignorar mensagens sem remetente/texto e mensagens enviadas pelo próprio número;
- handler desacoplado do framework HTTP para ligar ao backend definitivo;
- falha explícita quando credenciais não existem;
- nenhum segredo versionado.

## Variáveis de ambiente
- `ZAPI_MODE=omni`
- `ZAPI_OMNI_BASE_URL` (opcional)
- `ZAPI_OMNI_SECRET_KEY`
- `ZAPI_OMNI_CHANNEL_ID`
- `ZAPI_WEBHOOK_SECRET` (segredo gerado pelo Venda.AI para proteger o endpoint público)

Nunca versionar os valores reais.

## Ainda não implementado
- servidor/rota HTTP pública definitiva;
- confirmação do payload real da conta Z-API da Nagila e ajuste fino do normalizador;
- persistência;
- idempotência por `messageId`;
- retry/fila;
- associação tenant ↔ channel;
- IA de resposta;
- testes ponta a ponta com conta real.

## Próximo passo P0
1. Disponibilizar o backend do Venda.AI em HTTPS.
2. Cadastrar a URL pública do webhook na Z-API.
3. Configurar credenciais como secrets no servidor, nunca no React/GitHub.
4. Enviar uma mensagem real para o WhatsApp conectado e capturar o evento.
5. Associar `channelId` ao tenant correto antes de persistir ou responder.
6. Conectar conversa → IA → resposta via `sendZapiText`.
