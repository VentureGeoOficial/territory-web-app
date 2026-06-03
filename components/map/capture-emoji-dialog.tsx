'use client'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { zModal } from '@/lib/layout/z-index'
import { cn } from '@/lib/utils'
import {
  CAPTURE_REACTION_EMOJIS,
  type CaptureReactionEmoji,
} from '@/lib/territory/capture-reactions'

export interface CaptureConfirmOptions {
  withReaction: boolean
}

interface CaptureEmojiDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedEmoji: CaptureReactionEmoji | null
  onSelectEmoji: (emoji: CaptureReactionEmoji) => void
  onConfirm: (options: CaptureConfirmOptions) => void | Promise<void>
  loading: boolean
}

export function CaptureEmojiDialog({
  open,
  onOpenChange,
  selectedEmoji,
  onSelectEmoji,
  onConfirm,
  loading,
}: CaptureEmojiDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <AlertDialogContent
        overlayClassName={cn(zModal)}
        className={cn(zModal, 'border-border bg-card/95 backdrop-blur-md sm:max-w-md')}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="font-mono text-base">
            Enviar reação ao amigo
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>Deseja enviar uma reação ao amigo?</p>
              <div className="flex justify-center gap-4">
                {CAPTURE_REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    disabled={loading}
                    onClick={() => onSelectEmoji(emoji)}
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 text-3xl transition-all hover:scale-105 ${
                      selectedEmoji === emoji
                        ? 'border-[#CCFF00] bg-[#CCFF00]/15 shadow-md'
                        : 'border-border bg-secondary/40 hover:border-[#CCFF00]/50'
                    }`}
                    aria-label={`Selecionar emoji ${emoji}`}
                    aria-pressed={selectedEmoji === emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button
            type="button"
            disabled={loading || !selectedEmoji}
            onClick={() => void onConfirm({ withReaction: true })}
            className="w-full bg-[#CCFF00] text-[#19305A] hover:bg-[#CCFF00]/90"
          >
            {loading ? 'A processar…' : 'Enviar reação e conquistar'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => void onConfirm({ withReaction: false })}
            className="w-full"
          >
            Conquistar sem enviar reação
          </Button>
          <AlertDialogCancel disabled={loading} className="mt-0 w-full">
            Cancelar
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
