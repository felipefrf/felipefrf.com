// Copy for the light home page ("day"), whose story is professional first:
// the job now, where I learned to ship, my own company, client work, then side
// projects and the education under all of it.
import type { Lang } from '../i18n/ui';

export const day = {
  en: {
    nav: { hexagon: 'Hexagon', journey: 'Journey', work: 'Side projects', education: 'Education' },
    heroCta: 'See the work',
    impact: [
      { value: 'Hexagon', label: 'Founding engineer, building Milo', detail: 'San Francisco · since Sep 2026' },
      { value: '189,157', label: 'questions in MedAlvo, the prep company I run', detail: 'Profitable · web, Android, Claude and ChatGPT' },
      { value: '−95%', label: 'manual review of court notices at NG.CASH', detail: 'Production AI in a fintech, 2026' },
      { value: '1st', label: 'overall, gold medal', detail: 'Iberoamerican Physics Olympiad 2020' },
    ],
    hexagon: {
      kicker: 'Now · Hexagon',
      title: 'An AI agent for <span class="serif">every person on a team</span>',
      lead: 'I’m a founding engineer at Hexagon, in San Francisco, building Milo. Every person on a team gets their own agent, running on its own private machine in the cloud with that person’s tools, and working where the team already talks.',
      link: { label: 'joinhexagon.com/milo', href: 'https://joinhexagon.com/milo' },
      howHead: 'How I work',
    },
    journey: {
      kicker: 'Before Hexagon',
      title: 'Where I learned <span class="serif">to ship</span>',
      lead: 'A fintech where a wrong answer costs real money, credit models for a lender in Belgium, LinkedIn’s sales team in New York, and internships at Safra, BTG Pactual and XP before that.',
    },
    fair: {
      kicker: 'President, ITA Jobs Commission · 2023–24',
      title: 'Brazil’s largest career fair outside a state capital',
      body: 'I led the student commission that connects ITA with the companies that hire its engineers: 45 people in five directorates, the annual fair on campus, training and corporate partnerships. The first sponsorship I closed myself, R$ 30k from SumUp, rebuilt the dorm’s cinema and opened the door to the rest.',
      stats: [
        { value: '1,800+', label: 'students at the fair' },
        { value: '40+', label: 'companies on campus' },
        { value: 'R$ 1M', label: 'annual budget managed' },
        { value: '45', label: 'people in 5 directorates' },
      ],
      photoAlt: 'The ITA career fair',
    },
    work: {
      kicker: 'Side projects',
      title: 'Built on <span class="serif">nights and weekends</span>',
      lead: 'A startup that got as far as a Y Combinator interview, the assistant that runs my day, and tools people install.',
    },
    chief: {
      kind: 'Personal tool',
      name: 'AI chief of staff',
      blurb: 'It reads my WhatsApp, Slack, e-mail, meetings and GitHub, works out what needs me, and has the answer, the e-mail or a whole working session ready. I only approve, from my phone.',
    },
    flights: {
      kind: 'Side project',
      name: 'Flight Price Finder',
      blurb: 'Finds hidden-city fares: a ticket to a city further on that changes planes where you actually want to land. In a live search, Salvador to São Paulo came out R$ 258 under any normal ticket.',
      cta: 'Try the demo',
    },
    education: {
      kicker: 'Education & olympiads',
      title: 'Where it <span class="serif">started</span>',
      lead: 'Aerospace engineering at ITA, and before that four years of physics, math and robotics olympiads, where I learned to like problems that don’t have a known answer yet.',
    },
  },
  pt: {
    nav: { hexagon: 'Hexagon', journey: 'Trajetória', work: 'Projetos', education: 'Formação' },
    heroCta: 'Ver o trabalho',
    impact: [
      { value: 'Hexagon', label: 'Founding engineer, construindo o Milo', detail: 'San Francisco · desde set 2026' },
      { value: '189.157', label: 'questões no MedAlvo, a empresa de preparação que eu toco', detail: 'Lucrativa · web, Android, Claude e ChatGPT' },
      { value: '−95%', label: 'de revisão manual de intimações na NG.CASH', detail: 'IA em produção numa fintech, 2026' },
      { value: '1º', label: 'lugar geral, ouro', detail: 'Olimpíada Iberoamericana de Física 2020' },
    ],
    hexagon: {
      kicker: 'Hoje · Hexagon',
      title: 'Um agente de IA para <span class="serif">cada pessoa do time</span>',
      lead: 'Sou founding engineer na Hexagon, em San Francisco, construindo o Milo. Cada pessoa do time ganha o seu próprio agente, rodando numa máquina privada na nuvem com as ferramentas daquela pessoa e trabalhando onde o time já conversa.',
      link: { label: 'joinhexagon.com/milo', href: 'https://joinhexagon.com/milo' },
      howHead: 'Como trabalho',
    },
    journey: {
      kicker: 'Antes da Hexagon',
      title: 'Onde aprendi <span class="serif">a entregar</span>',
      lead: 'Uma fintech onde resposta errada custa dinheiro de verdade, modelos de crédito para uma credora na Bélgica, o time de vendas do LinkedIn em Nova York e, antes disso, estágios no Safra, no BTG Pactual e na XP.',
    },
    fair: {
      kicker: 'Presidente da Comissão de Estágios e Empregos do ITA · 2023–24',
      title: 'A maior feira de carreiras do interior do Brasil',
      body: 'Liderei a comissão de alunos que liga o ITA às empresas que contratam seus engenheiros: 45 pessoas em cinco diretorias, a feira anual no campus, capacitações e parcerias com empresas. O primeiro patrocínio, que fechei pessoalmente, R$ 30 mil da SumUp, reformou o cinema do alojamento e abriu a porta para os outros.',
      stats: [
        { value: '1.800+', label: 'alunos na feira' },
        { value: '40+', label: 'empresas no campus' },
        { value: 'R$ 1 mi', label: 'de orçamento anual' },
        { value: '45', label: 'pessoas em 5 diretorias' },
      ],
      photoAlt: 'A feira de carreiras do ITA',
    },
    work: {
      kicker: 'Projetos paralelos',
      title: 'Feitos em <span class="serif">noites e fins de semana</span>',
      lead: 'Uma startup que chegou à entrevista da Y Combinator, o assistente que organiza o meu dia e ferramentas que o pessoal instala.',
    },
    chief: {
      kind: 'Ferramenta pessoal',
      name: 'Chief of staff de IA',
      blurb: 'Ele lê meu WhatsApp, Slack, e-mail, reuniões e GitHub, descobre o que depende de mim e deixa pronta a resposta, o e-mail ou uma sessão de trabalho inteira. Eu só aprovo, pelo celular.',
    },
    flights: {
      kind: 'Projeto paralelo',
      name: 'Flight Price Finder',
      blurb: 'Acha passagens hidden-city: um bilhete para uma cidade mais adiante que faz conexão onde você quer descer. Numa busca ao vivo, Salvador para São Paulo saiu R$ 258 abaixo de qualquer passagem normal.',
      cta: 'Testar a demo',
    },
    education: {
      kicker: 'Formação e olimpíadas',
      title: 'Onde tudo <span class="serif">começou</span>',
      lead: 'Engenharia aeroespacial no ITA e, antes disso, quatro anos de olimpíadas de física, matemática e robótica, onde aprendi a gostar de problemas que ainda não têm resposta.',
    },
  },
} satisfies Record<Lang, unknown>;
