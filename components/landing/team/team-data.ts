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
    id: 'henrique',
    name: 'Henrique',
    role: 'Full Stack Developer',
    badge: 'Core Team',
    bio: 'Desenvolve a arquitetura do produto, integrações e experiências que conectam mapa, dados e performance em tempo real.',
    image: henriquePhoto,
  },
  {
    id: 'leonardo',
    name: 'Leonardo',
    role: 'Frontend Developer',
    badge: 'Core Team',
    bio: 'Responsável pela interface, responsividade e microinterações que tornam o TerritoryRun rápido e envolvente no dia a dia.',
    image: leonardoPhoto,
  },
  {
    id: 'marcelo',
    name: 'Marcelo',
    role: 'Backend Engineer',
    badge: 'Core Team',
    bio: 'Atua na camada de serviços, regras de negócio e confiabilidade dos fluxos críticos de território e autenticação.',
    image: marceloPhoto,
  },
]
