# Venda.AI — STATUS MASTER

## Versão atual
V1.7.8

## Objetivo atual
Estabilizar a versão antes de adicionar novas funcionalidades.

## Estado
- Deploy GitHub Pages: funcionando
- CI: configurado
- Última correção: cadastro de clientes seleciona serviços pelo Catálogo IA

## Em andamento
- QA completo
- Correção de bugs
- Validação dos fluxos principais

## Fluxos obrigatórios

### 1. Catálogo → Cliente
- Serviço criado no catálogo deve aparecer no cadastro.
- Seleção deve ser salva corretamente.
- Edição deve manter associação.

### 2. Cliente → Conversa
- Cliente deve abrir conversa correta.
- Contexto do cliente deve permanecer.

### 3. Conversas → Histórico
- Mensagens devem persistir.
- Histórico não pode misturar clientes.

### 4. Pipeline → Receita/ROI
- Lead deve virar oportunidade.
- Receita só entra após validação.
- ROI não pode duplicar valores.

## Regra da equipe
Não criar novas funções enquanto existirem bugs críticos na V1.7.8.
