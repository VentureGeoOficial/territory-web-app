import Link from 'next/link'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_VERSION } from '@/lib/app-info'

export default function AjudaPage() {
  return (
    <AuthenticatedShell>
      <div className="space-y-6 pb-16 lg:pb-0">
        <h1 className="text-2xl font-bold">Ajuda e suporte</h1>
        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Como recuperar a senha?</AccordionTrigger>
                <AccordionContent>
                  Use a opção "Esqueci minha senha" na tela de login para receber token por e-mail.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Como alterar meus dados?</AccordionTrigger>
                <AccordionContent>
                  Acesse a área de Conta para editar perfil e preferências de notificação.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fale conosco</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>Chat: segunda a sexta, 09h às 18h</p>
            <p>E-mail: suporte@territoryrun.app</p>
            <p>Telefone: +55 (11) 4000-2000</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Informações do sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Versão atual: v{APP_VERSION}</p>
            <div className="flex gap-3">
              <Link className="text-primary hover:underline" href="/termos">
                Termos de Uso
              </Link>
              <Link className="text-primary hover:underline" href="/privacidade">
                Política de Privacidade
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <MobileBottomNav />
    </AuthenticatedShell>
  )
}
