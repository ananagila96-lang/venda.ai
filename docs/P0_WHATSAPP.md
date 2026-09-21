# P0 — WhatsApp real

## Entrega
Camada isolada de transporte para WhatsApp Cloud API: verificação do webhook, validação HMAC `X-Hub-Signature-256`, normalização de mensagens recebidas, envio de texto, contrato de IA e registro de conversa por `tenantId + contactWaId`.

## Segurança e multiempresa
O `phone_number_id` recebido da Meta resolve a empresa antes de qualquer gravação. Toda mensagem registrada exige `tenantId`. Tokens ficam somente em variáveis de ambiente.

## Rodar
`npm run test:whatsapp` e `npm run start:whatsapp`.

Configure na Meta o callback HTTPS público em `/webhooks/whatsapp` e o mesmo `META_VERIFY_TOKEN`.

## Contrato da IA
Se `AI_WEBHOOK_URL` estiver configurado, o backend envia JSON com `tenantId`, `contactWaId`, `message` e `history`. Espera JSON `{"reply":"..."}`.

## Testado
Testes automatizados cobrem assinatura Meta, parsing do webhook e isolamento de conversas por tenant.

## Bloqueios reais antes do piloto
1. Persistência atual do backend é apenas o adapter em memória. Para piloto real, conectar `conversationStore` a banco durável com índice/constraint por tenant e ID da mensagem.
2. É necessário configurar as credenciais reais da Meta e callback HTTPS no ambiente do servidor.
3. É necessário apontar `AI_WEBHOOK_URL` para o serviço de IA do Venda.AI.
4. O encadeamento conversa → lead → venda → receita/ROI pertence às frentes de domínio; este módulo expõe `tenantId` e contato de forma estável para integração.

## Escala
Transporte, resolução de tenant, persistência e IA são interfaces separadas. Isso permite trocar o adapter de memória por Postgres/serviço gerenciado e executar múltiplas instâncias sem reescrever o transporte.
