// The Império field app walkthrough: one real screen per step, captured from
// the app's web preview with demo data on 15 Nov 2026 (app 1.10.5).
export type WalkStep = { src: string; alt: string; title: string; body: string };

const img = (name: string) => `/media/imperio/app/${name}.webp`;

export const STEPS_EN: WalkStep[] = [
  {
    src: img('01-home'),
    alt: 'My shift: the job that needs the crew leader now, with a button to start it',
    title: 'What’s on me now',
    body: 'The app opens on the one thing the crew leader has to do next, with a big button to do it, plus the day’s invites and the hotel for tonight.',
  },
  {
    src: img('04-saida-embarque'),
    alt: 'Departure: ticking who boarded each vehicle',
    title: 'Departure',
    body: 'Before leaving the warehouse, the leader ticks who got on each truck. The office knows who is on the job before the truck leaves.',
  },
  {
    src: img('05-deslocamento'),
    alt: 'Travel: live trip with time, distance, arrival estimate and traffic',
    title: 'On the road',
    body: 'GPS follows the trip on its own: time, distance, arrival estimate and traffic. The office sees it too, without calling anyone.',
  },
  {
    src: img('06-chegada'),
    alt: 'Arrival: the time is recorded and the leader says whether the venue is free to set up',
    title: 'Arrival',
    body: 'The arrival time is recorded automatically. The leader answers one question: is the venue free to start setting up?',
  },
  {
    src: img('07-montagem-checklist'),
    alt: 'Setup: item checklist by category, 80 of 105 counted',
    title: 'Setup checklist',
    body: 'Every item on the order, counted by category, so the team sees exactly what’s still missing before the guests arrive.',
  },
  {
    src: img('08-montagem-fotos'),
    alt: 'Setup: required photos, each with a name, showing which are still missing',
    title: 'Proof in photos',
    body: 'The photos the client expects have names, like the hall, the cake table and the entrance, and the app shows which ones are still missing.',
  },
  {
    src: img('10-aceite-cliente'),
    alt: 'Client sign-off: summary of items and photos, and a signature on the phone',
    title: 'Client sign-off',
    body: 'After a summary of everything delivered, the person in charge of the venue signs right on the phone. Everyone keeps the same record of what was delivered.',
  },
  {
    src: img('11-desmontagem'),
    alt: 'Teardown: timer running and before-and-after photos of the space',
    title: 'Teardown',
    body: 'A timer runs while the crew photographs the space before and after taking everything down.',
  },
  {
    src: img('13-conferencia-final'),
    alt: 'Final check: the office checks the return, and the crew’s part is done',
    title: 'Back at base',
    body: 'Once the truck is back, the turn passes to the office to check what returned, and the crew can see their part is done.',
  },
];

export const STEPS_PT: WalkStep[] = [
  {
    src: img('01-home'),
    alt: 'Meu turno: a tarefa que é do líder agora, com um botão para começar',
    title: 'O que é comigo agora',
    body: 'O app abre na única coisa que o líder tem que fazer em seguida, com um botão grande para fazer já, além dos convites do dia e do hotel da noite.',
  },
  {
    src: img('04-saida-embarque'),
    alt: 'Saída: marcando quem embarcou em cada veículo',
    title: 'Saída',
    body: 'Antes de sair do galpão, o líder marca quem subiu em cada caminhão. O escritório sabe quem está no serviço antes de o caminhão sair.',
  },
  {
    src: img('05-deslocamento'),
    alt: 'Deslocamento: a viagem ao vivo, com tempo, distância, chegada prevista e trânsito',
    title: 'Na estrada',
    body: 'O GPS acompanha a viagem sozinho: tempo, distância, chegada prevista e trânsito. O escritório vê tudo também, sem ligar para ninguém.',
  },
  {
    src: img('06-chegada'),
    alt: 'Chegada: o horário é registrado e o líder diz se o local está liberado para montar',
    title: 'Chegada',
    body: 'A hora de chegada é registrada sozinha. O líder responde uma pergunta só: o local já está liberado para montar?',
  },
  {
    src: img('07-montagem-checklist'),
    alt: 'Montagem: checklist de itens por categoria, 80 de 105 conferidos',
    title: 'Checklist da montagem',
    body: 'Cada item do pedido, contado por categoria, para a equipe ver exatamente o que ainda falta antes de os convidados chegarem.',
  },
  {
    src: img('08-montagem-fotos'),
    alt: 'Montagem: fotos obrigatórias, cada uma com nome, mostrando as que faltam',
    title: 'A prova em fotos',
    body: 'As fotos que o cliente espera têm nome, como o salão, a mesa do bolo e a entrada, e o app mostra quais ainda faltam.',
  },
  {
    src: img('10-aceite-cliente'),
    alt: 'Aceite do cliente: resumo de itens e fotos, e assinatura no celular',
    title: 'Aceite do cliente',
    body: 'Depois de um resumo de tudo o que foi entregue, a responsável pelo local assina no próprio celular. Todo mundo fica com o mesmo registro do que foi entregue.',
  },
  {
    src: img('11-desmontagem'),
    alt: 'Desmontagem: cronômetro correndo e fotos do espaço antes e depois',
    title: 'Desmontagem',
    body: 'Um cronômetro corre enquanto a equipe fotografa o espaço antes e depois de desmontar tudo.',
  },
  {
    src: img('13-conferencia-final'),
    alt: 'Conferência final: o escritório confere a devolução, e a parte da equipe está feita',
    title: 'De volta à base',
    body: 'Com o caminhão de volta, a vez passa para o escritório conferir o que retornou, e a equipe vê que a parte dela acabou.',
  },
];
