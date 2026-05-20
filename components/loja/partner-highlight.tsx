import { Mail, Megaphone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const CONTACT_EMAIL = 'parcerias@whatyou.app'

export function PartnerHighlight() {
  return (
    <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
          <Megaphone className="h-5 w-5" aria-hidden />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-base">Seja um patrocinador no What You</CardTitle>
          <CardDescription>
            Sua marca aqui — alcance corredores, comunidades de território e atletas
            que dominam o mapa todos os dias.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <a href={`mailto:${CONTACT_EMAIL}?subject=Parceria%20What%20You`}>
            <Mail className="mr-2 size-4" aria-hidden />
            Falar com a equipa comercial
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
