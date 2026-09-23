# Adapter Z-API

Este diretório contém integração **server-side**. Não importar este adapter diretamente no bundle React.

## Modo ativo no P0
**Z-API Classic**.

## Implementado
- configuração server-side por ambiente;
- envio de texto via Z-API Classic;
- suporte preservado ao adapter Omni para compatibilidade futura;
- endpoint HTTP `POST /webhooks/zapi` em `server/index.js`;
- normalização básica de mensagens inbound;
- vínculo server-side `instance -> tenant` via `ZAPI_INSTANCE_TENANT_MAP`;
- proteção opcional do webhook por `ZAPI_WEBHOOK_SECRET`;
- healthcheck `GET /health`;
- testes automatizados do outbound e webhook;
- nenhum segredo versionado.

## Configuração necessária em produção
- `ZAPI_INSTANCE_ID`;
- `ZAPI_TOKEN`;
- `ZAPI_CLIENT_TOKEN`;
- `ZAPI_WEBHOOK_SECRET` com valor aleatório forte;
- `ZAPI_INSTANCE_TENANT_MAP` com o vínculo real da instância ao tenant.

## URL do webhook
Depois de publicar o backend em HTTPS, cadastrar no campo **Ao receber** da Z-API:

`https://<BACKEND_PUBLICO>/webhooks/zapi?secret=<SEGREDO_CONFIGURADO>`

O segredo real deve ser configurado no secret management do host e nunca commitado.

## Ainda pendente para E2E P0
- hospedar o backend em uma URL HTTPS pública;
- configurar secrets no host;
- registrar a URL real no painel Z-API;
- persistência da conversa no backend/banco;
- integração com IA/contexto comercial;
- idempotência persistente/retry/fila;
- teste real com mensagem entrando e resposta saindo.

## Dependências
O endpoint HTTP está pronto para hospedagem, mas a persistência multiempresa continua dependente da fundação backend da issue #6. O E2E WhatsApp permanece acompanhado pela issue #7.
