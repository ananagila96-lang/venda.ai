import React from 'react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound
} from 'lucide-react';

const benefits = [
  ['Encontra oportunidades', 'Identifica quem está mais perto de comprar e ajuda a equipe a priorizar o que realmente importa.', Target],
  ['Recupera vendas', 'Retoma conversas, clientes e oportunidades que esfriaram antes de virar dinheiro perdido.', RefreshCw],
  ['Organiza o atendimento', 'Centraliza contexto comercial, histórico, clientes, leads, agenda e acompanhamento.', UsersRound],
  ['Mostra receita validada', 'Separa venda declarada de receita comprovada e ajuda a acompanhar o retorno real das ações.', CircleDollarSign]
];

const flow = [
  ['1', 'WhatsApp e conversas', 'O atendimento começa pelo canal onde o cliente já está.'],
  ['2', 'IA e contexto', 'A inteligência interpreta sinais, histórico e regras do negócio.'],
  ['3', 'Lead e oportunidade', 'Cada interesse pode seguir para acompanhamento comercial.'],
  ['4', 'Venda e validação', 'Ganhar uma oportunidade não basta: o resultado precisa ser validado.'],
  ['5', 'Receita e ROI', 'O Venda.AI conecta resultado validado ao investimento e à origem da oportunidade.']
];

export default function LandingPage({ onClientArea }) {
  return (
    <div className="lp">
      <header className="lp-nav">
        <a className="lp-brand" href="#top" aria-label="Venda.AI">
          <strong>VENDA</strong><span>.AI</span>
          <small>Receita que não escapa.</small>
        </a>
        <nav>
          <a href="#produto">Produto</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#agenda">Agenda inteligente</a>
          <a href="#resultado">Resultados</a>
        </nav>
        <button className="lp-client" onClick={onClientArea}>Área do Cliente <ArrowRight size={17}/></button>
      </header>

      <main>
        <section className="lp-hero" id="top">
          <div className="lp-hero-copy">
            <span className="lp-kicker"><Sparkles size={16}/> FUNCIONÁRIO DIGITAL PARA VENDER MELHOR</span>
            <h1>O Venda.AI encontra oportunidades, recupera vendas e mostra <em>receita validada.</em></h1>
            <p>
              Não é só chatbot, CRM ou agenda. É uma camada inteligente para acompanhar conversas,
              clientes, oportunidades e resultados — do interesse ao dinheiro realmente recebido.
            </p>
            <div className="lp-actions">
              <a className="lp-primary" href="#produto">Conhecer o Venda.AI <ArrowRight size={18}/></a>
              <button className="lp-secondary" onClick={onClientArea}>Já sou cliente</button>
            </div>
            <div className="lp-proof">
              <span><CheckCircle2/> Conversas com contexto</span>
              <span><CheckCircle2/> Receita validada</span>
              <span><CheckCircle2/> ROI rastreável</span>
            </div>
          </div>
          <div className="lp-hero-card" aria-label="Resumo do produto">
            <div className="lp-card-head"><Bot/><div><b>Venda.AI</b><span>Radar comercial ativo</span></div></div>
            <div className="lp-metric"><span>Oportunidade identificada</span><strong>92%</strong></div>
            <div className="lp-opportunity">
              <div><b>Cliente voltou a demonstrar interesse</b><span>Botox Capilar · conversa recente</span></div>
              <Target/>
            </div>
            <div className="lp-metric"><span>Receita</span><strong className="verified">VALIDAR</strong></div>
            <small>Venda ganha não vira receita automaticamente. O resultado precisa ser confirmado.</small>
          </div>
        </section>

        <section className="lp-section" id="produto">
          <div className="lp-section-title">
            <span>UM PRODUTO, VÁRIAS FRENTES DE RESULTADO</span>
            <h2>Transforme atendimento em operação comercial.</h2>
            <p>O Venda.AI conecta o que normalmente fica espalhado entre conversa, memória da equipe, agenda e planilha.</p>
          </div>
          <div className="lp-benefits">
            {benefits.map(([title,text,Icon]) => (
              <article key={title}>
                <Icon/>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-dark" id="como-funciona">
          <div className="lp-section-title">
            <span>DO CONTATO AO RESULTADO</span>
            <h2>O fluxo comercial fica visível de ponta a ponta.</h2>
          </div>
          <div className="lp-flow">
            {flow.map(([n,title,text]) => (
              <article key={n}><b>{n}</b><div><h3>{title}</h3><p>{text}</p></div></article>
            ))}
          </div>
          <div className="lp-rule"><ShieldCheck/><div><b>Regra de ouro do Venda.AI</b><p>GANHO ≠ RECEITA VALIDADA. O sistema deve separar potencial, venda declarada e dinheiro efetivamente confirmado.</p></div></div>
        </section>

        <section className="lp-section lp-agenda" id="agenda">
          <div>
            <span className="lp-kicker"><CalendarCheck2 size={16}/> AGENDA INTELIGENTE</span>
            <h2>Uma vaga cancelada não precisa virar horário perdido.</h2>
            <p>
              Confirmação, cancelamento, reagendamento e lista de espera trabalham juntos.
              Quando surge uma vaga, o Venda.AI pode identificar clientes compatíveis para ajudar a recuperar aquele horário.
            </p>
            <ul>
              <li><CheckCircle2/> Confirmações e respostas organizadas</li>
              <li><CheckCircle2/> Reagendamento sem perder o contexto</li>
              <li><CheckCircle2/> Lista de espera ligada às vagas liberadas</li>
              <li><CheckCircle2/> Valor recuperado separado de receita validada</li>
            </ul>
          </div>
          <div className="lp-agenda-card">
            <CalendarCheck2/>
            <span>Vaga liberada</span>
            <strong>14:30</strong>
            <p>2 clientes compatíveis encontrados na lista de espera.</p>
            <button>Oferecer horário</button>
          </div>
        </section>

        <section className="lp-section lp-result" id="resultado">
          <div className="lp-section-title">
            <span>MENOS ACHISMO. MAIS RESULTADO COMPROVADO.</span>
            <h2>Marketing, vendas e operação olhando para a mesma verdade.</h2>
          </div>
          <div className="lp-result-grid">
            <article><MessageCircle/><b>Conversas</b><p>Contexto comercial preservado para não começar do zero a cada atendimento.</p></article>
            <article><BarChart3/><b>Pipeline</b><p>Leads e oportunidades acompanhados por etapa, origem e potencial.</p></article>
            <article><CircleDollarSign/><b>Receita validada</b><p>O resultado só entra quando a venda é confirmada conforme a regra do negócio.</p></article>
          </div>
        </section>

        <section className="lp-cta">
          <div><span>VENDA.AI</span><h2>Seu atendimento pode trabalhar como uma operação de vendas de verdade.</h2></div>
          <button className="lp-primary" onClick={onClientArea}>Entrar na Área do Cliente <ArrowRight size={18}/></button>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-brand"><strong>VENDA</strong><span>.AI</span></div>
        <p>Funcionário digital que encontra oportunidades, recupera vendas e mostra receita validada.</p>
        <button onClick={onClientArea}>Área do Cliente</button>
      </footer>
    </div>
  );
}
