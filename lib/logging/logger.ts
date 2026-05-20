type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'

export interface LogContext {
  scope: string
  event: string
  uid?: string
  [key: string]: unknown
}

function maskUid(uid?: string): string | undefined {
  if (!uid) return undefined
  if (uid.length <= 8) return `${uid.slice(0, 4)}…`
  return `${uid.slice(0, 8)}…`
}

function maskEmail(email?: string): string | undefined {
  if (!email || !email.includes('@')) return email
  const [local, domain] = email.split('@')
  const visible = local!.slice(0, Math.min(3, local!.length))
  return `${visible}***@${domain}`
}

function sanitize(ctx: LogContext): Record<string, unknown> {
  const out: Record<string, unknown> = { ...ctx }
  if (typeof out.uid === 'string') out.uid = maskUid(out.uid)
  if (typeof out.userId === 'string') out.userId = maskUid(out.userId as string)
  if (typeof out.email === 'string') out.email = maskEmail(out.email as string)
  return out
}

function write(level: LogLevel, ctx: LogContext): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    ...sanitize(ctx),
  }
  const line = JSON.stringify(payload)
  if (level === 'ERROR' || level === 'CRITICAL') {
    console.error(line)
  } else if (level === 'WARNING') {
    console.warn(line)
  } else {
    console.info(line)
  }
}

export const log = {
  info: (ctx: LogContext) => write('INFO', ctx),
  warn: (ctx: LogContext) => write('WARNING', ctx),
  error: (ctx: LogContext) => write('ERROR', ctx),
  critical: (ctx: LogContext) => write('CRITICAL', ctx),
}
