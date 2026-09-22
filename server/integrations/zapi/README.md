# Adapter Z-API

Este diretório contém integração **server-side**. Não importar este adapter diretamente no bundle React.

## Implementado
- leitura de configuração por ambiente;
- envio de mensagem de texto via endpoint público documentado da Z-API Omni;
- falha explícita quando credenciais não existem;
- nenhum segredo versionado.

## Ainda não implementado
- rota HTTP do backend;
- recepção de webhook;
- verificação/autenticação de webhook;
- persistência;
- idempotência;
- retry/fila;
- associação tenant ↔ channel;
- testes com conta real.

## Próximo passo
Conectar este adapter ao backend multiempresa da issue #6 e ao fluxo da issue #7.
