// Copy for the scroll films (src/scripts/film.ts). One step per beat of the
// render; the labels ride on the 3D anchors exported in film.json.
import type { Lang } from '../i18n/ui';

export type Film = {
  src: string;
  kicker: string;
  steps: { title: string; body: string }[];
  labels: Record<string, string>;
};

export const films: Record<Lang, Record<string, Film>> = {
  en: {
    hexagon: {
      src: '/film/hexagon/',
      kicker: 'What I build at Hexagon',
      steps: [
        { title: 'One agent per person', body: 'Milo gives every person on a team their own AI agent, not one shared bot.' },
        { title: 'Its own machine', body: 'Each agent runs on a private machine in the cloud, with that person’s tools and logins, isolated from everyone else’s.' },
        { title: 'Where the team talks', body: 'I shipped Microsoft Teams and Google Chat at parity with Slack and WhatsApp: the agent acts as the person, streams its replies, handles files and transcribes voice.' },
        { title: 'Passwords it never sees', body: 'I built the vault behind the agent’s web browser: passwords and one-time codes are filled in by name, so the model never sees them.' },
        { title: 'Nothing ships untested', body: 'Every change passes tests that replay real production cases in two languages, plus nightly AI-graded reviews.' },
      ],
      labels: { team: 'Each person', machine: 'Their own machine', channels: 'Slack · WhatsApp · Teams · Chat', vault: 'Vault', tests: 'Real cases, replayed' },
    },
    flights: {
      src: '/film/flights/',
      kicker: 'How it finds the cheaper ticket',
      steps: [
        { title: 'Where you’re going', body: 'A live search: Salvador to São Paulo on 10 December. Congonhas, Guarulhos and Campinas all count as São Paulo.' },
        { title: 'The price everyone sees', body: 'The cheapest normal ticket to anywhere in São Paulo is the bar to beat: R$ 792, direct to Campinas.' },
        { title: 'Every way there', body: 'It prices tickets to 8 cities further on that change planes in São Paulo. 7 of them beat the direct fare to their own airport. 9 API calls, 7 seconds.' },
        { title: 'The one that saves', body: 'A ticket to Brasília that changes planes at Congonhas costs R$ 534. You get off at Congonhas and pay R$ 258 less than any normal ticket to São Paulo. Carry-on only, one way. When nothing beats the normal ticket, it says so.' },
      ],
      labels: { origin: 'From', dest: 'You get off', beyond: 'Ticket to', direct: 'Normal ticket', found: 'Found', saving: 'Saved' },
    },
  },
  pt: {
    hexagon: {
      src: '/film/hexagon/',
      kicker: 'O que eu construo na Hexagon',
      steps: [
        { title: 'Um agente por pessoa', body: 'O Milo dá a cada pessoa do time o seu próprio agente de IA, não um bot compartilhado.' },
        { title: 'A própria máquina', body: 'Cada agente roda numa máquina privada na nuvem, com as ferramentas e os acessos daquela pessoa, isolada da dos outros.' },
        { title: 'Onde o time conversa', body: 'Entreguei Microsoft Teams e Google Chat no mesmo nível de Slack e WhatsApp: o agente age como a pessoa, responde em tempo real, lida com arquivos e transcreve áudio.' },
        { title: 'Senhas que ele nunca vê', body: 'Construí o cofre por trás do navegador do agente: senhas e códigos são preenchidos pelo nome, e o modelo nunca vê nenhum deles.' },
        { title: 'Nada sai sem teste', body: 'Toda mudança passa por testes que repetem casos reais de produção em dois idiomas, mais revisões noturnas corrigidas por IA.' },
      ],
      labels: { team: 'Cada pessoa', machine: 'A própria máquina', channels: 'Slack · WhatsApp · Teams · Chat', vault: 'Cofre', tests: 'Casos reais repetidos' },
    },
    flights: {
      src: '/film/flights/',
      kicker: 'Como ele acha a passagem mais barata',
      steps: [
        { title: 'Para onde você vai', body: 'Uma busca ao vivo: Salvador para São Paulo em 10 de dezembro. Congonhas, Guarulhos e Campinas contam como São Paulo.' },
        { title: 'O preço que todo mundo vê', body: 'A passagem normal mais barata para qualquer aeroporto de São Paulo é a barra a vencer: R$ 792, direto para Campinas.' },
        { title: 'Todos os caminhos', body: 'Ele cota passagens para 8 cidades mais adiante com conexão em São Paulo. 7 delas saem mais baratas que o voo direto para o próprio aeroporto. 9 chamadas à API, 7 segundos.' },
        { title: 'O que economiza', body: 'Uma passagem para Brasília com conexão em Congonhas custa R$ 534. Você desce em Congonhas e paga R$ 258 a menos que qualquer passagem normal para São Paulo. Só bagagem de mão, só ida. Quando nada bate a passagem normal, ele diz isso.' },
      ],
      labels: { origin: 'Saída', dest: 'Você desce', beyond: 'Passagem até', direct: 'Passagem normal', found: 'Achada', saving: 'Economia' },
    },
  },
};
