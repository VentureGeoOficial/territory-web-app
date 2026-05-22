import Link from 'next/link'
import { Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export function DashboardEmptyState() {
  return (
    <Empty className="border border-dashed border-border/80 bg-card/40">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Map className="h-6 w-6" aria-hidden />
        </EmptyMedia>
        <EmptyTitle>Comece sua primeira atividade</EmptyTitle>
        <EmptyDescription>
          Ainda não há percursos registrados. Vá ao mapa, percorra sua rota e conquiste território
          para ver estatísticas, gráficos e histórico aqui.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/mapa" aria-label="Ir para o mapa e iniciar percurso">
            <Map className="h-4 w-4 mr-2" />
            Ir para o mapa
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
