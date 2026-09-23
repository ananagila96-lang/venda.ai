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
  ['Recupera vendas', 'Ajuda a retomar clientes que demonstraram interesse, mas pararam de responder ou não concluíram a compra.', RefreshCw],
  ['Encontra oportunidades', 'Mostra quais clientes merecem atenção para sua equipe não deixar boas oportunidades passarem.', Target],
  ['Ajuda no atendimento', 'Organiza conversas, agenda, confirmações, reagendamentos e lista de espera em uma mesma rotina.', UsersRound],
  ['Mostra o resultado', 'Ajuda você a acompanhar quais oportunidades realmente viraram vendas e quanto resultado foi gerado.', CircleDollarSign]
];

const flow = [
  ['1', 'O cliente chama no WhatsApp', 'A conversa começa no canal que seus clientes já usam todos os dias.'],
  ['2', 'O Venda.AI organiza o atendimento', 'As informações da conversa ficam reunidas para você não precisar começar do zero a cada contato.'],
  ['3', 'Uma oportunidade é identificada', 'O sistema ajuda a perceber quem demonstrou interesse e precisa de acompanhamento.'],
  ['4', 'O atendimento continua', 'Sua equipe consegue acompanhar conversas, agenda e próximos passos com mais organização.'],
  ['5', 'A venda é confirmada', 'Quando uma oportunidade realmente vira venda, o resultado pode ser registrado.'],
  ['6', 'Você enxerga o retorno', 'Fica mais fácil entender quais ações trouxeram vendas e quanto resultado foi gerado.']
];

const integrationSteps = [
  ['01', 'Conte sobre sua empresa', 'Cadastre seus serviços, horários, equipe e as informações importantes para o atendimento.'],
  ['02', 'Conecte seu WhatsApp', 'Seu número passa a trabalhar junto com o Venda.AI para organizar os atendimentos.'],
  ['03', 'Receba seus clientes', 'As conversas ficam organizadas para que nenhum atendimento importante seja esquecido.'],
  ['04', 'Acompanhe oportunidades', 'Veja quem demonstrou interesse e quem ainda pode precisar de uma nova atenção da sua equipe.'],
  ['05', 'Veja o que virou resultado', 'Acompanhe as vendas confirmadas e entenda melhor o retorno gerado pela operação.']
];

const faq = {
  recuperacao: 'O Venda.AI ajuda a identificar clientes e oportunidades que ficaram pelo caminho, reúne o contexto e facilita a retomada do atendimento antes que a venda seja esquecida.',
  secretaria: 'A Secretária Virtual ajuda a organizar conversas e agenda, incluindo confirmações, cancelamentos, reagendamentos e lista de espera.',
  integracao: 'Você conecta o WhatsApp da sua empresa ao Venda.AI. Depois disso, as conversas podem ser organizadas junto com clientes, oportunidades e histórico de atendimento.',
  receita: 'O Venda.AI diferencia uma oportunidade de uma venda realmente confirmada. Assim, você acompanha resultados com mais clareza e evita contar como receita algo que ainda não aconteceu.',
  contratar: 'Clique em “Contratar agora” para iniciar seu cadastro. A área do cliente é reservada para empresas que já possuem acesso.'
};

function HireNow({ dark = false }) {
  return <a className={dark ? 'lp-hire lp-hire-dark' : 'lp-hire'} href="#contratar">Contratar agora <ArrowRight size={17}/></a>;
}

function SalesAgent() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('Olá! Posso explicar, em linguagem simples, como o Venda.AI ajuda no atendimento, na agenda, na recuperação de oportunidades e no acompanhamento das vendas.');
  const suggestions = useMemo(() => [
    ['Como recupera vendas?', 'recuperacao'],
    ['O que faz a Secretária Virtual?', 'secretaria'],
    ['Como funciona com meu WhatsApp?', 'integracao'],
    ['Como acompanho os resultados?', 'receita'],
    ['Quero contratar', 'contratar']
  ], []);

  const reply = (keyOrText) => {
    const text = String(keyOrText || '').toLowerCase();
    if (faq[text]) return setAnswer(faq[text]);
    if (text.includes('recuper')) return setAnswer(faq.recuperacao);
    if (text.includes('secret') || text.includes('agenda')) return setAnswer(faq.secretaria);
    if (text.includes('whats') || text.includes('integr')) return setAnswer(faq.integracao);
    if (text.includes('receita') || text.includes('resultado') || text.includes('roi') || text.includes('venda')) return setAnswer(faq.receita);
    if (text.includes('contrat') || text.includes('compr') || text.includes('preço') || text.includes('preco')) return setAnswer(faq.contratar);
    setAnswer('Posso explicar como o Venda.AI ajuda a recuperar oportunidades, organizar atendimento e agenda, trabalhar com o WhatsApp e acompanhar vendas e resultados.');
  };

  return <div className="lp-agent">
    <div className="lp-agent-head"><Bot/><div><b>Assistente Venda.AI</b><span>Tire suas dúvidas sobre o produto</span></div></div>
    <div className="lp-agent-answer">{answer}</div>
    <div className="lp-agent-chips">
      {suggestions.map(([label,key]) => <button key={key} onClick={()=>reply(key)}>{label}</button>)}
    </div>
    <div className="lp-agent-input">
      <input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){reply(question);setQuestion('')}}} placeholder="Digite sua dúvida sobre o Venda.AI"/>
      <button onClick={()=>{reply(question);setQuestion('')}} aria-label="Enviar dúvida"><Send size={17}/></button>
    </div>
    <small>As respostas desta página explicam as funções apresentadas do Venda.AI de forma simples.</small>
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
          <a href="#secretaria">Atendimento e agenda</a>
          <a href="#integracao">Como funciona</a>
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
            <span className="lp-kicker"><Sparkles size={16}/> UM FUNCIONÁRIO DIGITAL PARA AJUDAR SUA EMPRESA A VENDER MAIS</span>
            <h1>Não deixe clientes interessados virarem <em>vendas perdidas.</em></h1>
            <p>
              O Venda.AI ajuda sua empresa a organizar atendimentos, acompanhar clientes, recuperar oportunidades e entender quais contatos realmente viraram vendas.
            </p>
            <div className="lp-actions">
              <HireNow/>
              <a className="lp-secondary" href="#recuperacao">Entender como funciona</a>
              <button className="lp-secondary" onClick={onClientArea}>Já sou cliente</button>
            </div>
            <div className="lp-proof">
              <span><CheckCircle2/> Ajuda a recuperar oportunidades</span>
              <span><CheckCircle2/> Organiza atendimento e agenda</span>
              <span><CheckCircle2/> Mostra vendas confirmadas</span>
            </div>
          </div>
          <div className="lp-hero-card" aria-label="Exemplo de oportunidade">
            <div className="lp-card-head"><Zap/><div><b>Venda.AI</b><span>Oportunidades que merecem atenção</span></div></div>
            <div className="lp-metric"><span>Cliente interessado</span><strong>ATENÇÃO</strong></div>
            <div className="lp-opportunity">
              <div><b>Este cliente pode precisar de uma nova mensagem</b><span>Interesse identificado · acompanhamento sugerido</span></div>
              <Target/>
            </div>
            <div className="lp-recovery-line"><RefreshCw/><div><b>Próximo passo</b><span>Retomar o atendimento e acompanhar até saber o resultado.</span></div></div>
            <div className="lp-metric"><span>Resultado</span><strong className="verified">CONFIRMAR</strong></div>
            <small>Uma oportunidade só é contada como venda quando o resultado realmente é confirmado.</small>
          </div>
          <div className="lp-section-cta"><HireNow/></div>
        </section>

        <section className="lp-section" id="recuperacao">
          <div className="lp-section-title">
            <span>RECUPERAÇÃO DE VENDAS</span>
            <h2>Você pode já ter clientes interessados esperando uma nova atenção.</h2>
            <p>O Venda.AI ajuda a organizar conversas e oportunidades para sua equipe saber quem acompanhar e não deixar bons contatos esquecidos.</p>
          </div>
          <div className="lp-benefits">
            {benefits.map(([title,text,Icon]) => <article key={title}><Icon/><h3>{title}</h3><p>{text}</p></article>)}
          </div>
          <div className="lp-recovery-banner">
            <RefreshCw/>
            <div><b>Encontre → acompanhe → confirme o resultado</b><p>Em vez de depender da memória ou procurar conversas antigas uma por uma, sua equipe ganha uma visão mais organizada das oportunidades.</p></div>
          </div>
          <div className="lp-section-cta"><HireNow/></div>
        </section>

        <section className="lp-dark lp-secretary" id="secretaria">
          <div className="lp-section-title">
            <span>ATENDIMENTO E AGENDA</span>
            <h2>Menos cliente esquecido. Menos horário perdido.</h2>
            <p>O Venda.AI ajuda a manter conversas e agenda organizadas para sua equipe acompanhar cada cliente com mais facilidade.</p>
          </div>
          <div className="lp-secretary-grid">
            <article><MessageCircle/><b>Conversa organizada</b><p>O histórico ajuda sua equipe a entender o que já foi conversado com cada cliente.</p></article>
            <article><CalendarCheck2/><b>Agenda mais simples</b><p>Confirmações, cancelamentos e reagendamentos ficam ligados ao atendimento.</p></article>
            <article><UsersRound/><b>Lista de espera</b><p>Quando uma vaga aparece, clientes interessados podem ser identificados para tentar ocupar aquele horário.</p></article>
            <article><Target/><b>Atendimento com objetivo</b><p>Além de responder, sua equipe consegue acompanhar o que ainda precisa acontecer com cada oportunidade.</p></article>
          </div>
          <div className="lp-section-cta"><HireNow dark/></div>
        </section>

        <section className="lp-section lp-integration" id="integracao">
          <div className="lp-section-title">
            <span>SEU WHATSAPP + VENDA.AI</span>
            <h2>Seu WhatsApp trabalhando junto com o Venda.AI.</h2>
            <p>Você conecta o WhatsApp da sua empresa e o Venda.AI ajuda a organizar atendimentos, acompanhar clientes e identificar oportunidades que poderiam virar vendas.</p>
          </div>
          <div className="lp-integration-grid">
            {integrationSteps.map(([n,title,text]) => <article key={n}><span>{n}</span><Link2/><h3>{title}</h3><p>{text}</p></article>)}
          </div>
          <div className="lp-status-note"><ShieldCheck/><div><b>Você continua no controle</b><p>O Venda.AI trabalha para ajudar sua equipe a organizar o atendimento e acompanhar oportunidades. Cada empresa acessa somente as informações da própria operação.</p></div></div>
          <div className="lp-section-cta"><HireNow/></div>
        </section>

        <section className="lp-dark" id="como-funciona">
          <div className="lp-section-title">
            <span>DO PRIMEIRO CONTATO AO RESULTADO</span>
            <h2>Entenda o caminho do cliente sem precisar falar “tecnologuês”.</h2>
          </div>
          <div className="lp-flow">
            {flow.map(([n,title,text]) => <article key={n}><b>{n}</b><div><h3>{title}</h3><p>{text}</p></div></article>)}
          </div>
          <div className="lp-rule"><ShieldCheck/><div><b>Resultado de verdade</b><p>Demonstrar interesse não é a mesma coisa que comprar. O Venda.AI ajuda a separar oportunidades de vendas realmente confirmadas.</p></div></div>
          <div className="lp-section-cta"><HireNow dark/></div>
        </section>

        <section className="lp-section lp-agenda" id="agenda">
          <div>
            <span className="lp-kicker"><CalendarCheck2 size={16}/> AGENDA INTELIGENTE</span>
            <h2>Uma desistência não precisa deixar um horário vazio.</h2>
            <p>Confirmação, cancelamento, reagendamento e lista de espera trabalham juntos. Quando uma vaga aparece, o Venda.AI ajuda a encontrar clientes interessados naquele horário.</p>
            <ul>
              <li><CheckCircle2/> Confirmações mais organizadas</li>
              <li><CheckCircle2/> Reagendamento sem perder o histórico</li>
              <li><CheckCircle2/> Lista de espera para aproveitar vagas liberadas</li>
              <li><CheckCircle2/> Acompanhamento do resultado gerado</li>
            </ul>
            <div className="lp-inline-cta"><HireNow/></div>
          </div>
          <div className="lp-agenda-card">
            <CalendarCheck2/>
            <span>Vaga liberada</span>
            <strong>14:30</strong>
            <p>2 clientes da lista de espera podem ter interesse neste horário.</p>
            <button>Ver clientes interessados</button>
          </div>
        </section>

        <section className="lp-section lp-result" id="resultado">
          <div className="lp-section-title">
            <span>RESULTADOS</span>
            <h2>Veja o que sua empresa está conseguindo transformar em venda.</h2>
          </div>
          <div className="lp-result-grid">
            <article><RefreshCw/><b>Oportunidades recuperadas</b><p>Veja clientes que voltaram a ser acompanhados em vez de ficarem esquecidos.</p></article>
            <article><BarChart3/><b>Acompanhamento das vendas</b><p>Organize clientes e oportunidades por etapa para saber o que ainda precisa de atenção.</p></article>
            <article><CircleDollarSign/><b>Vendas confirmadas</b><p>Acompanhe o resultado somente quando a venda realmente for confirmada.</p></article>
          </div>
          <div className="lp-section-cta"><HireNow/></div>
        </section>

        <section className="lp-section lp-contract" id="contratar">
          <div className="lp-contract-copy">
            <span>COMECE COM O VENDA.AI</span>
            <h2>Quantas oportunidades sua empresa pode estar deixando escapar hoje?</h2>
            <p>Conheça o Venda.AI e entenda como ele pode ajudar sua equipe a organizar atendimentos, recuperar oportunidades e acompanhar vendas. Ao contratar, você inicia seu cadastro antes de entrar na área exclusiva do cliente.</p>
            <div className="lp-contract-points">
              <span><CheckCircle2/> Recuperação de oportunidades</span>
              <span><CheckCircle2/> Atendimento e agenda organizados</span>
              <span><CheckCircle2/> WhatsApp conectado ao atendimento</span>
              <span><CheckCircle2/> Acompanhamento de vendas e resultados</span>
            </div>
          </div>
          <SalesAgent/>
        </section>
      </main>

      <a className="lp-agent-fab" href="#contratar"><Bot size={18}/> Tirar dúvidas</a>

      <footer className="lp-footer">
        <div className="lp-brand"><strong>VENDA</strong><span>.AI</span></div>
        <p>Funcionário digital que ajuda sua empresa a encontrar oportunidades, recuperar vendas e acompanhar resultados.</p>
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
