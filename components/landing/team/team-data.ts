import henriquePhoto from '@/IMG/IMG-DEVS/Henrique.png'
import leonardoPhoto from '@/IMG/IMG-DEVS/Leonardo.jpeg'
import marceloPhoto from '@/IMG/IMG-DEVS/Marcelo.jpeg'

import type { TeamMember } from './types'

/**
 * Fonte única de verdade da equipe.
 * Para adicionar um membro: importe a foto, inclua um objeto neste array.
 */
export const teamMembers: TeamMember[] = [
  {
    id: 'marcelo',
    name: 'Marcelo',
    role: 'Documentação & Análise de Projeto',
    badge: 'Core Team',
    bio: 'Dá forma e credibilidade ao TerritoryRun por trás do código. Estrutura a documentação técnica do repositório, conduz análises de arquitetura e fluxos, consolida projeções de negócio e assegura rastreabilidade entre produto, segurança e entrega.',
    image: marceloPhoto,
  },
  {
    id: 'henrique',
    name: 'Henrique',
    role: 'Full Stack Developer',
    badge: 'Core Team',
    bio: 'Impulsiona o produto de ponta a ponta no TerritoryRun. Desenvolve a experiência web — landing, PWA, mapa com GPS, autenticação e gamificação — conectando interface, APIs e performance para transformar cada corrida em conquista territorial.',
    image: henriquePhoto,
  },
  {
    id: 'leonardo',
    name: 'Leonardo',
    role: 'Backend & Banco de Dados',
    badge: 'Core Team',
    bio: 'Sustenta a espinha dorsal de dados do TerritoryRun. Modela o Firestore, define regras e transações críticas e implementa APIs e integrações que garantem territórios, corridas, ranking e autenticação com consistência e segurança.',
    image: leonardoPhoto,
  },
]
