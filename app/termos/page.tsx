import { LEGAL_VERSION } from '@/lib/app-info'

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-4">
      <h1 className="text-3xl font-bold">Termos de Uso</h1>
      <p className="text-sm text-muted-foreground">Versão {LEGAL_VERSION}</p>
      <p>
        Ao usar o TerritoryRun, você concorda em utilizar o serviço de forma legítima,
        respeitando outros usuários e as regras de geolocalização e competição.
      </p>
      <p>
        Você é responsável pela segurança de sua conta e por manter seus dados atualizados.
      </p>
      <p>
        Podemos atualizar estes termos para refletir melhorias técnicas, legais e operacionais.
      </p>
    </main>
  )
}
