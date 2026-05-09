# DOC_CaptureXpDialog

**Ficheiro:** [`components/map/capture-xp-dialog.tsx`](../../components/map/capture-xp-dialog.tsx)

`AlertDialog` (Radix/shadcn) que mostra área sobreposta, XP ganho/custo/re líquido via [`computeXpFromRun`](../../lib/territory/scoring.ts) e dados [`CaptureImpactOk`](../../lib/territory/geoLogic.ts).

Props: `open`, `onOpenChange`, `impact`, `distanceMeters`, `newTerritoryAreaM2`, `onConfirm`, `loading`.
