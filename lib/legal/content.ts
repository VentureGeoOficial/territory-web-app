export interface LegalSection {
  id: string
  title: string
  body: string[]
}

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'aceitacao',
    title: '1. Aceitação dos Termos',
    body: [
      'Ao aceder ou utilizar o TerritoryRun ("Serviço"), operado pela Venture Geo ("nós"), você declara ter lido, compreendido e aceito estes Termos de Uso e a Política de Privacidade vigente.',
      'Se não concordar com qualquer disposição, não utilize o Serviço. O uso continuado após alterações publicadas constitui aceitação da versão atualizada.',
    ],
  },
  {
    id: 'definicoes',
    title: '2. Definições',
    body: [
      '"Utilizador" ou "você": pessoa que cria conta ou utiliza o Serviço.',
      '"Território": área geográfica representada no mapa associada a uma atividade de deslocamento (corrida, caminhada ou similar) registada na plataforma.',
      '"Conquista" ou "captura": processo pelo qual um território passa a ser associado ao seu perfil conforme as regras do jogo.',
      '"Amigos": outros utilizadores com quem mantém relação social aceite na plataforma, para comparação de desempenho e visualização no mapa.',
    ],
  },
  {
    id: 'elegibilidade',
    title: '3. Elegibilidade',
    body: [
      'O Serviço destina-se a utilizadores com idade mínima de 13 anos. Menores de 18 anos devem utilizar o Serviço com autorização e supervisão de responsável legal, quando aplicável.',
      'Você declara que as informações de cadastro são verdadeiras e que possui capacidade legal para aceitar estes Termos.',
    ],
  },
  {
    id: 'conta',
    title: '4. Conta e segurança',
    body: [
      'O registo exige e-mail, nome de utilizador único (slug público), palavra-passe e dados de perfil solicitados no formulário.',
      'É sua responsabilidade manter credenciais confidenciais e notificar-nos sobre uso não autorizado da conta.',
      'Podemos suspender ou encerrar contas em caso de violação destes Termos, fraude, abuso ou risco à segurança de outros utilizadores.',
      'A exclusão de conta pode ser solicitada na área de Conta, sujeita a confirmação e reautenticação, conforme descrito na Política de Privacidade.',
    ],
  },
  {
    id: 'geolocalizacao',
    title: '5. Mapa e geolocalização',
    body: [
      'Funcionalidades centrais do TerritoryRun dependem da localização do dispositivo. Ao utilizar o mapa, corridas ou captura de territórios, você autoriza o tratamento de dados de geolocalização conforme a Política de Privacidade.',
      'A precisão da localização depende do dispositivo, rede e permissões do sistema operativo. Não garantimos precisão absoluta em todas as condições.',
      'Utilize o Serviço em conformidade com a legislação de trânsito e segurança: não interaja com a aplicação de forma que distraia a condução ou coloque em risco você ou terceiros.',
    ],
  },
  {
    id: 'territorios',
    title: '6. Territórios, ranking e competição',
    body: [
      'Territórios, área dominada, níveis de domínio e rankings são elementos de gamificação. Regras de atribuição, sobreposição e disputa podem evoluir com atualizações do produto.',
      'Estatísticas públicas (por exemplo, área total e número de territórios no perfil público) podem ser visíveis a outros utilizadores conforme a configuração do Serviço.',
      'Tentativas de manipular localização (spoofing GPS), automatizar capturas ou explorar falhas técnicas constituem violação grave destes Termos.',
    ],
  },
  {
    id: 'amigos',
    title: '7. Funcionalidades sociais (amigos)',
    body: [
      'Pode enviar pedidos de amizade a outros utilizadores através do nome de utilizador registado. O destinatário pode aceitar ou recusar.',
      'Após aceitação, poderá comparar desempenho (por exemplo, área dominada) e visualizar territórios de amigos no mapa, dentro dos limites técnicos e de privacidade descritos na Política de Privacidade.',
      'Não utilize o Serviço para assédio, spam de pedidos, divulgação de dados pessoais de terceiros sem consentimento ou qualquer conduta ilícita.',
    ],
  },
  {
    id: 'conduta',
    title: '8. Conduta do utilizador',
    body: [
      'É proibido: violar leis aplicáveis; publicar conteúdo ofensivo, discriminatório ou ilegal; interferir na operação do Serviço; aceder a dados de outros utilizadores sem autorização; revender ou sublicenciar o Serviço sem permissão.',
      'Reservamo-nos o direito de remover conteúdo, restringir funcionalidades ou encerrar contas que violem estas regras.',
    ],
  },
  {
    id: 'propriedade',
    title: '9. Propriedade intelectual',
    body: [
      'Marcas, logótipos, interface, software e conteúdos do TerritoryRun e Venture Geo são protegidos por direitos de propriedade intelectual. Não é concedida qualquer licença além do uso pessoal e não comercial do Serviço.',
      'Conteúdos que você enviar (por exemplo, nome de exibição ou imagens de perfil, quando disponíveis) permanecem seus, mas concede-nos licença limitada para exibir e processar esse conteúdo na operação do Serviço.',
    ],
  },
  {
    id: 'disponibilidade',
    title: '10. Disponibilidade e limitação de responsabilidade',
    body: [
      'O Serviço é fornecido "no estado em que se encontra", em fase de evolução (protótipo). Podem ocorrer interrupções, erros ou perda temporária de dados.',
      'Na medida permitida pela lei, não nos responsabilizamos por danos indiretos, lucros cessantes ou lesões resultantes do uso do mapa em deslocamento real — a sua segurança física é sua responsabilidade.',
      'Nada nestes Termos exclui direitos irrenunciáveis do consumidor previstos na legislação brasileira aplicável.',
    ],
  },
  {
    id: 'alteracoes',
    title: '11. Alterações',
    body: [
      'Podemos atualizar estes Termos para refletir mudanças legais, técnicas ou de produto. A versão vigente é indicada no topo desta página.',
      'Alterações relevantes podem ser comunicadas no aplicativo ou por e-mail. O registo de aceite na sua conta pode ser atualizado quando você confirmar a nova versão.',
    ],
  },
  {
    id: 'lei',
    title: '12. Lei aplicável e foro',
    body: [
      'Estes Termos regem-se pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de Suzano/SP, com renúncia a qualquer outro, salvo disposição legal imperativa em contrário para consumidores.',
    ],
  },
  {
    id: 'contacto',
    title: '13. Contacto',
    body: [
      'Dúvidas sobre estes Termos: suporte@territoryrun.app',
      'Venture Geo — TerritoryRun.',
    ],
  },
]

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'introducao',
    title: '1. Introdução',
    body: [
      'Esta Política de Privacidade descreve como a Venture Geo trata dados pessoais no TerritoryRun, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) e boas práticas de transparência.',
      'Ao utilizar o Serviço, você declara ter lido esta Política. Em caso de conflito entre documentos, prevalecem disposições mais específicas sobre proteção de dados aqui descritas.',
    ],
  },
  {
    id: 'controlador',
    title: '2. Controlador dos dados',
    body: [
      'Controlador: Venture Geo, responsável pelas decisões referentes ao tratamento de dados pessoais no TerritoryRun.',
      'Encarregado / canal de privacidade: suporte@territoryrun.app',
    ],
  },
  {
    id: 'dados-coletados',
    title: '3. Dados que coletamos',
    body: [
      'Dados de cadastro e conta: nome, e-mail, nome de utilizador (slug), palavra-passe (tratada pelo provedor de autenticação), data de nascimento, sexo, peso e altura quando informados, preferências de notificação.',
      'Dados de autenticação e sessão: identificadores técnicos do Firebase Authentication, tokens de sessão necessários ao funcionamento do aplicativo.',
      'Dados de geolocalização: coordenadas e trilhas associadas a corridas, captura de territórios e exibição no mapa, quando você concede permissão no dispositivo.',
      'Dados de jogo e perfil público: área dominada, número de territórios, experiência (XP), cor de perfil, nome de exibição e estatísticas exibidas em ranking e lista de amigos.',
      'Dados sociais: pedidos e relações de amizade (identificadores dos utilizadores envolvidos e estado do pedido).',
      'Dados técnicos: logs de erro, tipo de dispositivo e navegador, quando necessários para segurança e diagnóstico.',
    ],
  },
  {
    id: 'bases-legais',
    title: '4. Bases legais (LGPD)',
    body: [
      'Execução de contrato ou procedimentos preliminares: criação de conta, autenticação, operação do mapa, territórios, ranking e amigos.',
      'Consentimento: geolocalização em tempo real, notificações por e-mail ou WhatsApp quando ativadas, e aceite expresso desta Política e dos Termos (registado com versão e data).',
      'Legítimo interesse: prevenção de fraude, segurança da conta, melhoria do Serviço e métricas agregadas, sempre com balanceamento em relação aos seus direitos.',
      'Cumprimento de obrigação legal: quando exigido por autoridade competente.',
    ],
  },
  {
    id: 'finalidades',
    title: '5. Finalidades do tratamento',
    body: [
      'Prestar o Serviço: mapa interativo, registo de deslocamentos, atribuição de territórios, competição entre amigos e gestão de perfil.',
      'Autenticar e proteger a conta: login, recuperação de palavra-passe, deteção de acessos suspeitos.',
      'Comunicar consigo: alertas no aplicativo e, se autorizado, e-mail ou WhatsApp conforme preferências na área de Conta.',
      'Cumprir obrigações legais e responder a solicitações de titulares de dados.',
    ],
  },
  {
    id: 'geolocalizacao',
    title: '6. Geolocalização',
    body: [
      'A geolocalização é essencial para o TerritoryRun. Sem permissão de localização, funcionalidades de corrida, captura e mapa em tempo real podem ficar limitadas ou indisponíveis.',
      'Pode revogar a permissão nas definições do dispositivo; a revogação não apaga automaticamente histórico já armazenado — para exclusão, utilize as opções de conta ou contacte o suporte.',
      'Territórios no mapa podem ser visíveis a outros utilizadores na área visualizada, conforme regras do produto (dados de polígonos em modo público para o jogo).',
    ],
  },
  {
    id: 'compartilhamento',
    title: '7. Compartilhamento e operadores',
    body: [
      'Utilizamos o Google Firebase (autenticação, Firestore, hospedagem) como operador de infraestrutura. Dados podem ser processados em servidores fora do Brasil, com salvaguardas contratuais e técnicas aplicáveis.',
      'Não vendemos seus dados pessoais. Podemos divulgar informações quando exigido por lei ou para proteger direitos, segurança e integridade do Serviço.',
      'Outros utilizadores veem apenas o que o perfil público e as regras sociais permitem (por exemplo, nome de exibição, username, estatísticas de área e territórios no mapa).',
    ],
  },
  {
    id: 'retencao',
    title: '8. Retenção',
    body: [
      'Mantemos dados enquanto a conta estiver ativa e pelo tempo necessário para cumprir finalidades descritas, obrigações legais e resolução de disputas.',
      'Após exclusão da conta, dados podem ser removidos ou anonimizados em prazo razoável, salvo retenção mínima exigida por lei ou backups temporários.',
    ],
  },
  {
    id: 'direitos',
    title: '9. Seus direitos (titular)',
    body: [
      'Nos termos da LGPD, você pode solicitar: confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação, informação sobre compartilhamento e revogação de consentimento, quando aplicável.',
      'Muitas ações estão disponíveis na área de Conta (edição de perfil, preferências, exclusão de conta). Para outros pedidos: suporte@territoryrun.app',
      'Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).',
    ],
  },
  {
    id: 'seguranca',
    title: '10. Segurança',
    body: [
      'Aplicamos medidas técnicas e organizacionais, incluindo autenticação segura, regras de acesso no banco de dados (Firestore Security Rules) e princípio de minimização de dados sensíveis em logs.',
      'Nenhum sistema é 100% seguro. Notifique-nos imediatamente se suspeitar de comprometimento da sua conta.',
    ],
  },
  {
    id: 'cookies',
    title: '11. Cookies e tecnologias similares',
    body: [
      'O aplicativo web pode utilizar armazenamento local (por exemplo, sessão de autenticação em localStorage) e cookies estritamente necessários ao funcionamento.',
      'Ferramentas de análise agregada podem ser utilizadas em produção para compreender uso do Serviço, sem identificação direta desnecessária.',
    ],
  },
  {
    id: 'menores',
    title: '12. Crianças e adolescentes',
    body: [
      'O Serviço não se destina a menores de 13 anos. Utilizadores entre 13 e 18 anos devem contar com orientação de responsáveis legais.',
      'Se tomarmos conhecimento de tratamento indevido de dados de menores, adotaremos medidas para cessar a conta e eliminar dados conforme aplicável.',
    ],
  },
  {
    id: 'alteracoes-privacidade',
    title: '13. Alterações desta Política',
    body: [
      'Podemos atualizar esta Política. A versão vigente é indicada abaixo. Alterações relevantes podem ser comunicadas no aplicativo.',
      'O registo de aceite na sua conta armazena a versão dos Termos e da Política aceites no cadastro ou quando você confirmar atualização na área de Conta.',
    ],
  },
  {
    id: 'contacto-privacidade',
    title: '14. Contacto',
    body: [
      'Privacidade e exercício de direitos: suporte@territoryrun.app',
      'Venture Geo — TerritoryRun.',
    ],
  },
]
