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
    flights: {
      src: '/film/flights/',
      kicker: 'How it finds the cheaper ticket',
      steps: [
        { title: 'Where you’re going', body: 'A real search from the demo: Fortaleza to the São Paulo area, one date. Campinas counts as São Paulo.' },
        { title: 'The price everyone sees', body: 'The direct ticket is the starting point, the price any search engine shows you.' },
        { title: 'Every way there', body: 'It tries other dates, nearby airports and tickets to cities further on that connect where you want to land, each priced against the real fare.' },
        { title: 'The one that saves', body: 'A ticket to Belo Horizonte that changes planes in Campinas costs R$ 750. You get off in Campinas: R$ 724 less than the direct flight. When nothing beats the direct ticket, it says that too.' },
      ],
      labels: { origin: 'From', dest: 'You get off', beyond: 'Ticket to', direct: 'Direct', found: 'Found', saving: 'Saved' },
    },
  },
  pt: {
    flights: {
      src: '/film/flights/',
      kicker: 'Como ele acha a passagem mais barata',
      steps: [
        { title: 'Para onde você vai', body: 'Uma busca real da demo: Fortaleza para a região de São Paulo, numa data. Campinas conta como São Paulo.' },
        { title: 'O preço que todo mundo vê', body: 'A passagem direta é o ponto de partida, o preço que qualquer buscador mostra.' },
        { title: 'Todos os caminhos', body: 'Ele testa outras datas, aeroportos próximos e passagens para cidades mais adiante que fazem conexão onde você quer descer, cada uma comparada com a tarifa real.' },
        { title: 'O que economiza', body: 'Uma passagem para Belo Horizonte com conexão em Campinas custa R$ 750. Você desce em Campinas: R$ 724 a menos que o voo direto. Quando nada bate a direta, ele diz isso também.' },
      ],
      labels: { origin: 'Saída', dest: 'Você desce', beyond: 'Passagem até', direct: 'Direta', found: 'Achada', saving: 'Economia' },
    },
  },
};
