# Adapter Z-API

Este diretório contém integração **server-side**. Não importar este adapter diretamente no bundle React.

## Decisão vigente P0
O Venda.AI está configurado para **Z-API Classic** como modo padrão, compatível com instância Z-API no formato:

`https://api.z-api.io/instances/{instanceId}/token/{token}/...`

A autenticação adicional usa o header `Client-Token` quando exigido pela conta/instância.

## Implementado
- leitura de configuração por ambiente;
- modo padrão `classic`;
- envio de mensagem de texto por `send-text`;
- `Instance ID`, `Token` e `Client-Token` somente por variáveis de ambiente;
- falha explícita quando credenciais não existem;
- tratamento de respostas HTTP não-2xx;
- compatibilidade Omni preservada quando `ZAPI_MODE=omni`;
- testes automatizados do adapter no CI;
- nenhum segredo versionado.

## Variáveis P0
- `ZAPI_MODE=classic`
- `ZAPI_CLASSIC_BASE_URL=https://api.z-api.io`
- `ZAPI_INSTANCE_ID`
- `ZAPI_TOKEN`
- `ZAPI_CLIENT_TOKEN`
- `ZAPI_WEBHOOK_SECRET`

## Ainda não implementado
- rota HTTP pública do backend;
- recepção/normalização de webhook inbound;
- verificação/autenticação do webhook;
- persistência;
- idempotência;
- retry/fila;
- associação tenant ↔ instância;
- teste E2E com conta real.

## Segurança
Nunca versionar token, Client-Token ou segredo de webhook. Segredos reais devem ficar em secret management do ambiente de execução.

## Próximo passo
Conectar este adapter ao backend multiempresa da issue #6 e ao fluxo WhatsApp/IA da issue #7; depois registrar o endpoint HTTPS público na Z-API e executar o E2E real.
