import { LEGAL_VERSION } from '@/lib/app-info'

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-4">
      <h1 className="text-3xl font-bold">Política de Privacidade</h1>
      <p className="text-sm text-muted-foreground">Versão {LEGAL_VERSION}</p>
      <p>
        Coletamos dados de cadastro, autenticação, uso do app e geolocalização para
        operar funcionalidades de mapa, ranking e segurança da conta.
      </p>
      <p>
        Os dados são usados para autenticação, personalização, prevenção de fraude e
        comunicação de alertas conforme suas preferências.
      </p>
      <p>
        Aplicamos controles técnicos de proteção e limitamos acesso a dados pessoais.
        Você pode solicitar atualização ou exclusão da conta pelos canais de suporte.
      </p>
    </main>
  )
}
