import Link from 'next/link'

import { VentureGeoBrandLogo, VentureGeoMascot } from '@/components/brand/venture-geo-logo'
import { SignupForm } from '@/components/auth/signup-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                            linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-lg">
        <Link
          href="/"
          className="flex items-center justify-center gap-3 mb-8 text-foreground hover:text-primary transition-colors"
        >
          <VentureGeoBrandLogo height={48} />
          <span className="text-xl font-bold">TerritoryRun</span>
        </Link>

        <Card className="border-border shadow-lg">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl">Criar conta</CardTitle>
            <CardDescription>
              Preencha os dados para começar a conquistar territórios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SignupForm />
            <p className="text-center text-sm text-muted-foreground border-t border-border pt-4">
              Já tem conta?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Voltar ao início
          </Link>
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6 hidden sm:block opacity-35">
        <VentureGeoMascot height={100} />
      </div>
    </div>
  )
}
