# Venda.AI — Arquitetura Atual

## Objetivo

Este documento registra o estado técnico atual antes da refatoração.
A regra é evoluir sem quebrar funcionalidades existentes.

---

# Stack atual

- React
- Vite
- JavaScript JSX
- LocalStorage para persistência da versão MVP
- Lucide React para ícones

---

# Estrutura atual

```
src/
├── main.jsx
└── style.css
```

O arquivo `main.jsx` concentra atualmente a maior parte da aplicação.

---

# Módulos existentes dentro do main.jsx

## App principal

Responsável por:
- navegação;
- estados globais;
- carregamento de dados;
- persistência.

## Dashboard

Responsável por:
- visão geral;
- receita validada;
- potencial;
- ROI;
- ações principais.

## Catálogo & IA

Responsável por:
- serviços;
- preços;
- ciclo de retorno;
- regras para IA.

## Clientes

Responsável por:
- cadastro;
- acompanhamento;
- retorno.

## Leads & Pipeline

Responsável por:
- etapas comerciais;
- oportunidades;
- conversão.

## Campanhas & ROI

Responsável por:
- campanhas;
- investimento;
- atribuição de receita.

## Reativação

Responsável por:
- clientes inativos;
- recuperação de vendas.

---

# Pontos de melhoria identificados

1. Separar componentes grandes.
2. Criar camada de serviços.
3. Separar regras de negócio da interface.
4. Melhorar escalabilidade para SaaS multiempresa.

---

# Plano de evolução

Fase 1:
- documentação;
- testes;
- segurança de alterações.

Fase 2:
- extração de componentes React.

Fase 3:
- módulos independentes.

Fase 4:
- preparação para backend e múltiplas empresas.

---

Regra principal:

Não reescrever. Refatorar com segurança.
