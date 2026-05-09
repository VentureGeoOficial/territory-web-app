# DOC_UIPrimitives (shadcn/ui)

Ficheiros em [`components/ui/`](../../components/ui/) gerados/mantidos no estilo **shadcn** (`components.json` style `new-york`). São encapsuladores em torno de **Radix UI** + Tailwind. **Não** alterar comportamento significativo sem documentar; a maioria segue a documentação oficial shadcn.

## Inventário (58 ficheiros .tsx em `components/ui/`)

| Ficheiro | Componente base |
|----------|-----------------|
| `accordion.tsx` | Radix Accordion |
| `alert-dialog.tsx` | Radix Alert Dialog |
| `alert.tsx` | — |
| `aspect-ratio.tsx` | Radix Aspect Ratio |
| `avatar.tsx` | Radix Avatar |
| `badge.tsx` | — |
| `breadcrumb.tsx` | — |
| `button-group.tsx` | — |
| `button.tsx` | Slot + variantes CVA |
| `calendar.tsx` | react-day-picker |
| `card.tsx` | — |
| `carousel.tsx` | embla-carousel-react |
| `chart.tsx` | recharts |
| `checkbox.tsx` | Radix Checkbox |
| `collapsible.tsx` | Radix Collapsible |
| `command.tsx` | cmdk |
| `context-menu.tsx` | Radix Context Menu |
| `dialog.tsx` | Radix Dialog |
| `drawer.tsx` | vaul |
| `dropdown-menu.tsx` | Radix Dropdown Menu |
| `empty.tsx` | — |
| `field.tsx` | — |
| `floating-input.tsx` | — |
| `form.tsx` | react-hook-form |
| `hover-card.tsx` | Radix Hover Card |
| `input-group.tsx` | — |
| `input-otp.tsx` | input-otp |
| `input.tsx` | — |
| `item.tsx` | — |
| `kbd.tsx` | — |
| `label.tsx` | Radix Label |
| `menubar.tsx` | Radix Menubar |
| `navigation-menu.tsx` | Radix Navigation Menu |
| `pagination.tsx` | — |
| `popover.tsx` | Radix Popover |
| `progress.tsx` | Radix Progress |
| `radio-group.tsx` | Radix Radio Group |
| `resizable.tsx` | react-resizable-panels |
| `scroll-area.tsx` | Radix Scroll Area |
| `select.tsx` | Radix Select |
| `separator.tsx` | Radix Separator |
| `sheet.tsx` | Radix Dialog (drawer pattern) |
| `sidebar.tsx` | composição layout + `useIsMobile` |
| `skeleton.tsx` | placeholder animado |
| `skeletons.tsx` | **composto projeto** — ver [DOC_Skeletons.md](DOC_Skeletons.md) |
| `slider.tsx` | Radix Slider |
| `sonner.tsx` | sonner Toaster |
| `spinner.tsx` | — |
| `switch.tsx` | Radix Switch |
| `table.tsx` | — |
| `tabs.tsx` | Radix Tabs |
| `textarea.tsx` | — |
| `toast.tsx` | Radix Toast |
| `toaster.tsx` | — |
| `toggle-group.tsx` | Radix Toggle Group |
| `toggle.tsx` | Radix Toggle |
| `tooltip.tsx` | Radix Tooltip |
| `use-mobile.tsx` | duplicata potencial de [`hooks/use-mobile.ts`](../../hooks/use-mobile.ts) |

## Hooks UI duplicados

- [`components/ui/use-toast.ts`](../../components/ui/use-toast.ts) vs [`hooks/use-toast.ts`](../../hooks/use-toast.ts) — ver imports por componente antes de alterar.

## Customização global

Tokens CSS em [`app/globals.css`](../../app/globals.css) (`--primary`, `--destructive`, etc.).
