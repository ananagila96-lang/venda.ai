# Integração WhatsApp — Z-API

## Decisão vigente
O Venda.AI utilizará **Z-API** como provedor da integração de WhatsApp.

Para operação com ambição de ~200 empresas em 3 meses, a arquitetura deve manter a integração desacoplada do restante do produto.

## Caminhos do provedor

### Z-API clássica
Documentação: https://v2.developer.z-api.io/

A documentação pública descreve integração REST + webhooks sobre uma sessão compatível com WhatsApp Web.

### Z-API Omni
Site: https://omni.z-api.io/
Documentação: https://developer.omni.z-api.io/
Partner: https://omni.z-api.io/seja-partner-zapi

A oferta Omni é o caminho preferencial para produção/escala porque o próprio provedor a apresenta como camada sobre WhatsApp Oficial/Meta, com webhooks em tempo real, autenticação por API Key/OAuth2, rate limiting e recursos para SaaS/partners.

**IMPORTANTE:** preferência técnica não significa contratação concluída. Plano, preço, conta, credenciais e condições comerciais dependem de decisão/autorização de Nagila.

## Arquitetura Venda.AI

```
WhatsApp
   ↓
Z-API
   ↓ webhook
Backend Venda.AI
   ↓ identifica tenant
Persistência / Conversa
   ↓
IA / Secretária Virtual / Radar
   ↓
Lead/Oportunidade
   ↓
Venda
   ↓
Receita validada
   ↓
ROI
```

## Regras obrigatórias
- Nunca colocar API Key/token no frontend.
- Secrets somente em ambiente seguro do backend.
- Todo evento deve ser associado ao tenant correto antes de persistir.
- Webhooks críticos devem ser idempotentes.
- Guardar IDs externos necessários para evitar duplicidade.
- Registrar erro/retry/status de entrega.
- Não contar mensagem enviada como venda.
- Não contar GANHO como RECEITA VALIDADA.

## Variáveis previstas
Ver `.env.example`.

- `ZAPI_MODE`
- `ZAPI_OMNI_BASE_URL`
- `ZAPI_OMNI_SECRET_KEY`
- `ZAPI_OMNI_CHANNEL_ID`
- `ZAPI_WEBHOOK_SECRET` quando aplicável

## Estado atual
**PROVIDER: CONFIRMADO — Z-API**

**Adapter outbound Omni: PREPARADO**

**Credenciais: BLOQUEADO até fornecimento/configuração segura**

**Webhook real: PENDENTE**

**Mensagem real enviada/recebida: NÃO TESTADO**

**E2E WhatsApp → Venda.AI → resposta: NÃO TESTADO**
