# DOC_useToast

**Ficheiro:** [`hooks/use-toast.ts`](../../hooks/use-toast.ts)

Padrão inspirado em react-hot-toast: reducer interno, limite de toasts (`TOAST_LIMIT`), delays. Exporta API de toast consumida por [`components/ui/toaster.tsx`](../../components/ui/toaster.tsx) / Sonner pode coexistir — ver imports nos componentes.

**Detalhe:** documentação linha-a-linha opcional; comportamento = fila de toasts com dismiss automático após delay configurado.
