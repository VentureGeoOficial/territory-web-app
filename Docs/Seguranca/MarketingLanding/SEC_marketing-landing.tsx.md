# SEC_marketing-landing.tsx

**Arquivo analisado:** [`components/home/marketing-landing.tsx`](../../../components/home/marketing-landing.tsx)

**Data da análise:** 2026-05-12

## Descrição da Vulnerabilidade

A versão anterior da landing utilizava imagens do mascote Speed por meio de URL externa hardcoded em domínio de blob storage:

```tsx
src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20260505_194510_0000-1UrbyUSIJhvFSFFbJnwKiZjVPfU2M2.png"
```

## Severidade

**MÉDIO**

## Risco Associado

- Dependência operacional de um domínio externo para renderizar parte importante da marca.
- Possível quebra visual caso o asset remoto seja removido, expire ou fique indisponível.
- Maior superfície de configuração para políticas futuras de CSP e carregamento de imagens.
- Menor controle sobre versionamento e auditoria do asset exibido na homepage.

## Correção Aplicada

- A imagem fornecida do Speed foi copiada para [`IMG/speed-mascote.png`](../../../IMG/speed-mascote.png).
- As referências externas foram removidas da landing.
- A renderização do mascote passou a usar `next/image` com import local.
- Os CTAs com observabilidade registram apenas metadados não sensíveis.

## Revisão OWASP

- **Input validation:** não há entrada de usuário nesta página.
- **XSS:** não há renderização de HTML dinâmico ou conteúdo não confiável.
- **SQL Injection:** não há acesso a banco de dados.
- **Autenticação/autorização:** links de login/cadastro preservados; página pública sem área restrita.
- **Exposição de dados sensíveis:** eventos de analytics não enviam usuário, email, token, cookie ou localização.
- **APIs externas:** removida dependência de imagem remota para o mascote.
- **Hardcoded secrets:** nenhum segredo identificado.

## Trecho Afetado

O trecho afetado estava nas imagens `<img>` da seção `#mascote-speed` e do bloco de patrocínios. A correção substituiu o `src` remoto por asset local importado em `components/home/marketing-landing.tsx`.
