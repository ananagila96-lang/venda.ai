import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  Link2,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
  Zap
} from 'lucide-react';

const benefits = [
  ['Recupera vendas', 'Retoma clientes, conversas e oportunidades que esfriaram antes de virar dinheiro perdido.', RefreshCw],
  ['Encontra oportunidades', 'Identifica sinais de compra e ajuda a equipe a priorizar quem merece atenção agora.', Target],
  ['Secretária Virtual', 'Organiza atendimento, contexto, agenda, confirmação, reagendamento e lista de espera.', UsersRound],
  ['Mostra receita validada', 'Separa oportunidade ganha de receita comprovada e ajuda a acompanhar retorno real.', CircleDollarSign]
];

const flow = [
  ['1', 'WhatsApp conectado', 'O canal é conectado ao Venda.AI por integração segura e vinculada à empresa.'],
  ['2', 'Conversa com contexto', 'Mensagens e histórico alimentam o atendimento e a visão comercial.'],
  ['3', 'Oportunidade encontrada', 'Sinais de interesse viram acompanhamento e ação de recuperação.'],
  ['4', 'Secretária Virtual age', 'Atendimento e agenda trabalham juntos para não deixar oportunidade escapar.'],
  ['5', 'Venda e validação', 'A venda é registrada, validada e só então entra como receita comprovada.'],
  ['6', 'Resultado e ROI', 'A operação acompanha dinheiro recuperado, origem e retorno quando houver dados válidos.']
];

const integrationSteps = [
  ['01', 'Configuração', 'Cadastro da empresa, catálogo, regras, equipe e contexto operacional.'],
  ['02', 'Canal', 'Conexão do WhatsApp via Z-API, com credenciais mantidas no servidor.'],
  ['03', 'Webhook', 'Eventos do canal chegam ao backend e são associados ao tenant correto.'],
  ['04', 'Atendimento', 'Conversas alimentam histórico, Secretária Virtual e acompanhamento comercial.'],
  ['05', 'Resultado', 'Oportunidades, vendas e receita validada passam a ser acompanhadas no Venda.AI.']
];

const faq = {
  recuperacao: 'O Venda.AI procura oportunidades que estão esfriando ou foram abandonadas, organiza o contexto e ajuda a retomar o cliente antes que a venda se perca.',
  secretaria: 'A Secretária Virtual organiza conversas e agenda, apoia confirmações, cancelamentos, reagendamentos e lista de espera, mantendo atendimento e oportunidade comercial conectados.',
  integracao: 'A integração do WhatsApp está sendo estruturada via Z-API. O desenho prevê webhook, backend multiempresa e credenciais somente no servidor. A ativação real depende das credenciais e dos testes da integração.',
  receita: 'GANHO não é receita automaticamente. O Venda.AI separa oportunidade ganha de receita validada para que o resultado comercial não seja inflado.',
  contratar: 'A contratação online está em implantação. O botão “Contratar agora” leva para esta etapa comercial enquanto plano, preço e checkout real são finalizados.'
};

function HireNow({ dark = false }) {
  return <a className={dark ? 'lp-hire lp-hire-dark' : 'lp-hire'} href="#contratar">Contratar agora <ArrowRight size={17}/></a>;
}

function SalesAgent() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('Olá! Sou o agente comercial do Venda.AI. Posso explicar recuperação de vendas, Secretária Virtual, integração, receita validada e contratação.');
  const suggestions = useMemo(() => [
    ['Como recupera vendas?', 'recuperacao'],
    ['O que faz a Secretária Virtual?', 'secretaria'],
    ['Como integra o WhatsApp?', 'integracao'],
    ['Como funciona receita validada?', 'receita'],
    ['Quero contratar', 'contratar']
  ], []);

  const reply = (keyOrText) => {
    const text = String(keyOrText || '').toLowerCase();
    if (faq[text]) return setAnswer(faq[text]);
    if (text.includes('recuper')) return setAnswer(faq.recuperacao);
    if (text.includes('secret')) return setAnswer(faq.secretaria);
    if (text.includes('whats') || text.includes('integr')) return setAnswer(faq.integracao);
    if (text.includes('receita') || text.includes('roi') || text.includes('ganho')) return setAnswer(faq.receita);
    if (text.includes('contrat') || text.includes('compr') || text.includes('preço') || text.includes('preco')) return setAnswer(faq.contratar);
    setAnswer('Posso responder sobre recuperação de vendas, Secretária Virtual, integração do WhatsApp, receita validada e contratação. Nesta versão uso respostas comerciais aprovadas para não inventar capacidades do produto.');
  };

  return <div className="lp-agent">
    <div className="lp-agent-head"><Bot/><div><b>Agente comercial Venda.AI</b><span>Pré-venda · respostas aprovadas do produto</span></div></div>
    <div className="lp-agent-answer">{answer}</div>
    <div className="lp-agent-chips">
      {suggestions.map(([label,key]) => <button key={key} onClick={()=>reply(key)}>{label}</button>)}
    </div>
    <div className="lp-agent-input">
      <input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){reply(question);setQuestion('')}}} placeholder="Digite sua dúvida sobre o Venda.AI"/>
      <button onClick={()=>{reply(question);setQuestion('')}} aria-label="Enviar dúvida"><Send size={17}/></button>
    </div>
    <small>O agente de IA generativa real será ativado somente após endpoint/backend e testes. Esta versão não inventa respostas.</small>
  </div>;
}

export default function LandingPage({ onClientArea }) {
  return (
    <div className="lp">
      <header className="lp-nav">
        <a className="lp-brand" href="#top" aria-label="Venda.AI">
          <strong>VENDA</strong><span>.AI</span>
          <small>Receita que não escapa.</small>
        </a>
        <nav>
          <a href="#recuperacao">Recuperar vendas</a>
          <a href="#secretaria">Secretária Virtual</a>
          <a href="#integracao">Integração</a>
          <a href="#resultado">Resultados</a>
        </nav>
        <div className="lp-nav-actions">
          <a className="lp-nav-hire" href="#contratar">Contratar agora</a>
          <button className="lp-client" onClick={onClientArea}>Área do Cliente <ArrowRight size={17}/></button>
        </div>
      </header>

      <main>
        <section className="lp-hero" id="top">
          <div className="lp-hero-copy">
            <span className="lp-kicker"><Sparkles size={16}/> FUNCIONÁRIO DIGITAL PARA RECUPERAR RECEITA</span>
            <h1>Venda que esfria não precisa virar <em>dinheiro perdido.</em></h1>
            <p>
              O Venda.AI encontra oportunidades que estão escapando, ajuda a retomar clientes e conecta
              atendimento, Secretária Virtual, vendas e receita validada numa mesma operação.
            </p>
            <div className="lp-actions">
              <HireNow/>
              <a className="lp-secondary" href="#recuperacao">Ver como recupera vendas</a>
              <button className="lp-secondary" onClick={onClientArea}>Já sou cliente</button>
            </div>
            <div className="lp-proof">
              <span><CheckCircle2/> Recuperação de oportunidades</span>
              <span><CheckCircle2/> Secretária Virtual</span>
              <span><CheckCircle2/> Receita validada</span>
            </div>
          </div>
          <div className="lp-hero-card" aria-label="Resumo do produto">
            <div className="lp-card-head"><Zap/><div><b>Venda.AI</b><span>Radar de receita ativa</span></div></div>
            <div className="lp-metric"><span>Oportunidade esfriando</span><strong>ALTA</strong></div>
            <div className="lp-opportunity">
              <div><b>Cliente voltou a demonstrar interesse</b><span>Conversa recente · ação sugerida</span></div>
              <Target/>
            </div>
            <div className="lp-recovery-line"><RefreshCw/><div><b>Próxima ação</b><span>Retomar conversa e acompanhar até o resultado.</span></div></div>
            <div className="lp-metric"><span>Receita</span><strong className="verified">VALIDAR</strong></div>
            <small>GANHO ≠ RECEITA VALIDADA. O resultado só entra quando for confirmado pela regra do negócio.</small>
          </div>
          <div className="lp-section-cta"><HireNow/></div>
        </section>

        <section className="lp-section" id="recuperacao">
          <div className="lp-section-title">
            <span>RECUPERAÇÃO DE VENDAS</span>
            <h2>O dinheiro mais barato de encontrar pode ser o que você já quase vendeu.</h2>
            <p>O Venda.AI organiza sinais, conversas e oportunidades para ajudar sua operação a agir antes que interesse vire silêncio.</p>
          </div>
          <div className="lp-benefits">
            {benefits.map(([title,text,Icon]) => <article key={title}><Icon/><h3>{title}</h3><p>{text}</p></article>)}
          </div>
          <div className="lp-recovery-banner">
            <RefreshCw/>
            <div><b>Radar → ação → acompanhamento → resultado</b><p>Recuperar venda não é disparar mensagem aleatória. É usar contexto, prioridade e histórico para trabalhar a oportunidade certa.</p></div>
          </div>
          <div className="lp-section-cta"><HireNow/></div>
        </section>

        <section className="lp-dark lp-secretary" id="secretaria">
          <div className="lp-section-title">
            <span>SECRETÁRIA VIRTUAL</span>
            <h2>Atendimento e agenda trabalhando para não deixar cliente escapar.</h2>
            <p>A Secretária Virtual conecta contexto, agenda e oportunidade comercial para reduzir perda de atendimento e de horário.</p>
          </div>
          <div className="lp-secretary-grid">
            <article><MessageCircle/><b>Atende com contexto</b><p>Histórico e conversa organizados para o atendimento não recomeçar do zero.</p></article>
            <article><CalendarCheck2/><b>Cuida da agenda</b><p>Confirmação, cancelamento e reagendamento dentro do fluxo operacional.</p></article>
            <article><UsersRound/><b>Trabalha a lista de espera</b><p>Vaga liberada pode ser conectada a clientes compatíveis e recuperar valor potencial.</p></article>
            <article><Target/><b>Não separa atendimento de venda</b><p>Cada conversa pode carregar oportunidade e próxima ação comercial.</p></article>
          </div>
          <div className="lp-section-cta"><HireNow dark/></div>
        </section>

        <section className="lp-section lp-integration" id="integracao">
          <div className="lp-section-title">
            <span>COMO FUNCIONA A INTEGRAÇÃO</span>
            <h2>Do WhatsApp ao Venda.AI, com cada empresa isolada.</h2>
            <p>A integração escolhida para o canal é a Z-API. Credenciais ficam no backend; cada evento precisa ser associado ao tenant correto antes de alimentar conversa ou automação.</p>
          </div>
          <div className="lp-integration-grid">
            {integrationSteps.map(([n,title,text]) => <article key={n}><span>{n}</span><Link2/><h3>{title}</h3><p>{text}</p></article>)}
          </div>
          <div className="lp-status-note"><ShieldCheck/><div><b>Status técnico</b><p>Provider definido: Z-API. Integração real ainda depende de credenciais, webhook/backend e testes ponta a ponta. A landing não trata essa etapa como concluída antes da evidência.</p></div></div>
          <div className="lp-section-cta"><HireNow/></div>
        </section>

        <section className="lp-dark" id="como-funciona">
          <div className="lp-section-title">
            <span>DO CONTATO AO DINHEIRO VALIDADO</span>
            <h2>Um fluxo comercial visível de ponta a ponta.</h2>
          </div>
          <div className="lp-flow">
            {flow.map(([n,title,text]) => <article key={n}><b>{n}</b><div><h3>{title}</h3><p>{text}</p></div></article>)}
          </div>
          <div className="lp-rule"><ShieldCheck/><div><b>Regra de ouro do Venda.AI</b><p>GANHO ≠ RECEITA VALIDADA. Potencial, venda declarada e dinheiro confirmado são coisas diferentes.</p></div></div>
          <div className="lp-section-cta"><HireNow dark/></div>
        </section>

        <section className="lp-section lp-agenda" id="agenda">
          <div>
            <span className="lp-kicker"><CalendarCheck2 size={16}/> AGENDA INTELIGENTE</span>
            <h2>Uma vaga cancelada não precisa virar horário perdido.</h2>
            <p>Confirmação, cancelamento, reagendamento e lista de espera trabalham juntos. Quando surge uma vaga, o Venda.AI pode identificar clientes compatíveis para ajudar a recuperar aquele horário.</p>
            <ul>
              <li><CheckCircle2/> Confirmações e respostas organizadas</li>
              <li><CheckCircle2/> Reagendamento sem perder contexto</li>
              <li><CheckCircle2/> Lista de espera ligada às vagas liberadas</li>
              <li><CheckCircle2/> Valor recuperado separado de receita validada</li>
            </ul>
            <div className="lp-inline-cta"><HireNow/></div>
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
            <span>RESULTADO QUE APARECE</span>
            <h2>Marketing, atendimento e vendas olhando para a mesma verdade.</h2>
          </div>
          <div className="lp-result-grid">
            <article><RefreshCw/><b>Recuperação</b><p>Oportunidades retomadas e acompanhadas em vez de esquecidas na conversa.</p></article>
            <article><BarChart3/><b>Pipeline</b><p>Leads e oportunidades acompanhados por etapa, origem e potencial.</p></article>
            <article><CircleDollarSign/><b>Receita validada</b><p>O resultado só entra quando a venda é confirmada conforme a regra do negócio.</p></article>
          </div>
          <div className="lp-section-cta"><HireNow/></div>
        </section>

        <section className="lp-section lp-contract" id="contratar">
          <div className="lp-contract-copy">
            <span>CONTRATAR VENDA.AI</span>
            <h2>Comece pela pergunta que importa: quanto dinheiro está escapando hoje?</h2>
            <p>Use o agente comercial para entender como o Venda.AI se encaixa na sua operação. Plano, preço e checkout online serão ativados quando a oferta comercial estiver formalmente definida.</p>
            <div className="lp-contract-points">
              <span><CheckCircle2/> Recuperação de vendas</span>
              <span><CheckCircle2/> Secretária Virtual</span>
              <span><CheckCircle2/> Integração WhatsApp via Z-API</span>
              <span><CheckCircle2/> Receita validada e ROI</span>
            </div>
          </div>
          <SalesAgent/>
        </section>
      </main>

      <a className="lp-agent-fab" href="#contratar"><Bot size={18}/> Tirar dúvidas</a>

      <footer className="lp-footer">
        <div className="lp-brand"><strong>VENDA</strong><span>.AI</span></div>
        <p>Funcionário digital que encontra oportunidades, recupera vendas e mostra receita validada.</p>
        <div className="lp-footer-actions">
          <a href="#contratar">Contratar agora</a>
          <button onClick={onClientArea}>Área do Cliente</button>
        </div>
        <div className="lp-legal-pending" aria-label="Documentos legais em preparação">
          <span>Privacidade</span><span>Termos</span><span>Cookies</span><span>LGPD</span>
        </div>
      </footer>
    </div>
  );
}
