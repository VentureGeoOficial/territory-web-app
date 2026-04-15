export interface TrophyDefinition {
  id: string
  title: string
  description: string
  icon: 'map' | 'trophy' | 'flame' | 'users' | 'star'
}

export interface TrophyProgress {
  definition: TrophyDefinition
  unlocked: boolean
  progress: number
  target: number
}

const DEFINITIONS: TrophyDefinition[] = [
  {
    id: 'first_territory',
    title: 'Primeira conquista',
    description: 'Capture o seu primeiro território.',
    icon: 'map',
  },
  {
    id: 'area_10k',
    title: 'Domínio em expansão',
    description: 'Acumule pelo menos 10.000 m² de área.',
    icon: 'star',
  },
  {
    id: 'area_50k',
    title: 'Império local',
    description: 'Acumule pelo menos 50.000 m² de área.',
    icon: 'trophy',
  },
  {
    id: 'three_territories',
    title: 'Três fronteiras',
    description: 'Mantenha pelo menos 3 territórios ativos.',
    icon: 'flame',
  },
  {
    id: 'social_first',
    title: 'Círculo de rivais',
    description: 'Adicione pelo menos um amigo.',
    icon: 'users',
  },
]

export function TrophyDefinitions(): TrophyDefinition[] {
  return DEFINITIONS
}

export function computeTrophyProgress(input: {
  territoriesCount: number
  totalAreaM2: number
  friendsCount: number
}): TrophyProgress[] {
  return DEFINITIONS.map((def) => {
    switch (def.id) {
      case 'first_territory':
        return {
          definition: def,
          unlocked: input.territoriesCount >= 1,
          progress: Math.min(input.territoriesCount, 1),
          target: 1,
        }
      case 'area_10k':
        return {
          definition: def,
          unlocked: input.totalAreaM2 >= 10_000,
          progress: Math.min(input.totalAreaM2, 10_000),
          target: 10_000,
        }
      case 'area_50k':
        return {
          definition: def,
          unlocked: input.totalAreaM2 >= 50_000,
          progress: Math.min(input.totalAreaM2, 50_000),
          target: 50_000,
        }
      case 'three_territories':
        return {
          definition: def,
          unlocked: input.territoriesCount >= 3,
          progress: Math.min(input.territoriesCount, 3),
          target: 3,
        }
      case 'social_first':
        return {
          definition: def,
          unlocked: input.friendsCount >= 1,
          progress: Math.min(input.friendsCount, 1),
          target: 1,
        }
      default:
        return {
          definition: def,
          unlocked: false,
          progress: 0,
          target: 1,
        }
    }
  })
}
