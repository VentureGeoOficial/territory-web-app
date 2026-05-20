import { Sparkles } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function EmptySponsorState() {
  return (
    <Card className="border-dashed border-primary/25 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Sparkles className="h-6 w-6" aria-hidden />
        </div>
        <CardTitle className="text-lg">Patrocinadores em breve</CardTitle>
        <CardDescription className="text-sm">
          Estamos a fechar parcerias com marcas esportivas, lojas de equipamento e
          suplementação para a comunidade What You.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-xs text-muted-foreground">
          Volte em breve para descobrir ofertas exclusivas dos nossos parceiros.
        </p>
      </CardContent>
    </Card>
  )
}
