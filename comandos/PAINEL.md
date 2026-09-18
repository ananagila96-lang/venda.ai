# PAINEL DE CONTROLE — VENDA.AI

## Estado atual
Versão: V1.7.8
Fase: QA e estabilização

---

## Tarefa principal
**Validar e estabilizar os fluxos antes de novas funções.**

Responsável principal: QA + DEV

Status: EM EXECUÇÃO

---

## Fluxos em teste

### 1. Catálogo → Cliente
Status: Pendente de validação

Critério:
- Serviço criado no catálogo aparece no cadastro do cliente.
- Seleção salva corretamente.
- Edição mantém dados.

### 2. Cliente → Conversa
Status: Pendente de validação

Critério:
- Cliente correto vinculado à conversa.
- Contexto carregado.

### 3. Conversas → Histórico
Status: Pendente de validação

Critério:
- Mensagens persistem.
- Histórico não mistura clientes.

### 4. Pipeline → Receita/ROI
Status: Pendente de validação

Critério:
- Receita só contabilizada após validação.
- ROI correto.

---

## Regra do projeto

Não adicionar novas funcionalidades enquanto existirem bugs críticos.

Toda alteração deve registrar:
- problema encontrado;
- solução aplicada;
- impacto.

---

## Próxima ação

Executar QA completo da V1.7.8 e registrar resultados em BUGS.md e CHANGELOG.md.
