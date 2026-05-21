import { Store } from 'lucide-react'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export function EmptySponsorState() {
  return (
    <Empty className="border border-dashed border-border/80 bg-card/40">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Store className="h-6 w-6" aria-hidden />
        </EmptyMedia>
        <EmptyTitle>Nenhum parceiro nesta categoria</EmptyTitle>
        <EmptyDescription>
          Novos patrocinadores e lojas serão exibidos aqui em breve. Enquanto isso, explore
          outras categorias ou entre em contato para anunciar sua marca.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent />
    </Empty>
  )
}
