# Venda.AI — STATUS MASTER

## Versão atual
V1.7.8 — estabilização P0 para piloto comercial

## Objetivo P0
Fluxo alvo: WhatsApp real → IA → conversa registrada → lead/oportunidade → venda → receita validada → ROI, com isolamento por empresa.

## Entregue nesta frente em 2026-09-21
- Corrigidos os trechos truncados de Campanhas & ROI e Leads & Pipeline.
- Restaurado o fluxo campanha → lead → venda ganha → validação de receita → ROI.
- Corrigido o teste Catálogo → Cliente para o seletor atual da interface.
- Persistência do navegador agora usa namespace por tenant (`venda.ai:<tenant>:<chave>`), com migração compatível dos dados legados para o tenant `demo`.
- GitHub Pages e CI permanecem configurados.

## QA obrigatório
- [x] Estrutura Catálogo → Cliente alinhada ao teste automatizado.
- [x] Cliente → Conversa implementado com abertura pelo nome.
- [x] Conversas → Histórico persiste por cliente no storage isolado.
- [x] Pipeline → Receita/ROI restaurado; receita exige validação.
- [ ] Confirmar execução verde do CI após os commits P0.
- [ ] Teste ponta a ponta com WhatsApp real e backend.

## Bloqueios reais para piloto comercial
1. **WhatsApp real:** o repositório atual não contém backend/webhook/credenciais de WhatsApp; a UI apenas registra mensagens localmente.
2. **IA real:** Radar e respostas ainda são demonstrativos; não existe serviço backend de inferência no repositório atual.
3. **Multiempresa de produção:** o frontend agora evita mistura local por namespace de tenant, mas isolamento seguro para centenas/1.000 clientes exige autenticação + tenant_id validado no servidor + banco com políticas/queries por tenant.
4. **Receita/ROI de produção:** regra de validação existe no frontend, mas precisa persistência transacional no backend para auditoria e não duplicação entre dispositivos.

## Critério de saída P0
Não declarar piloto comercial pronto enquanto WhatsApp, IA, persistência backend e isolamento server-side não estiverem integrados e testados.

## Regra da equipe
Nada de funcionalidades novas até fechar os bloqueios P0.
