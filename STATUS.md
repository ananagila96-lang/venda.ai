# Venda.AI Status

## Estado atual

Versão de referência: V1.7.8 (controle da equipe)

## P0 — WhatsApp / Z-API

- Provedor ativo: Z-API Classic.
- Backend público: Railway, serviço `venda-ai-backend`.
- Webhook público ativo em `/webhooks/zapi` com healthcheck em `/health`.
- Variáveis de produção presentes: `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN`, `ZAPI_INSTANCE_TENANT_MAP`, `ZAPI_MODE`, `ZAPI_WEBHOOK_SECRET` e `ZAPI_WEBHOOK_URL`.
- Entrada real confirmada: requisições `POST /webhooks/zapi` recebidas com HTTP 202.
- Retorno controlado preparado no `main`: somente a frase `teste venda ai` dispara `Venda.AI online ⚡` via Z-API.
- Mensagens fora do gatilho continuam marcadas como pendentes de persistência.
- Próximos bloqueios P0: comprovar roundtrip real, persistir conversa no servidor, ligar IA e concluir E2E até receita validada/ROI.

## Auditoria Dev

- Repositório conectado.
- Comando central criado.
- Arquitetura em revisão.
- GitHub `main` é a fonte da verdade do código.

## Equipe ativa

- CEO Produto: prioridades.
- CTO Arquitetura: decisões técnicas.
- Dev: implementação.
- QA: validação.
- Growth: aquisição.

## Regra

Não substituir funcionalidades sem análise prévia.
