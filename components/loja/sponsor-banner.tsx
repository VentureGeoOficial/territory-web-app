import Image from 'next/image'
import { cn } from '@/lib/utils'

type SponsorBannerProps = {
  bannerUrl?: string
  alt: string
  className?: string
  priority?: boolean
}

export function SponsorBanner({
  bannerUrl,
  alt,
  className,
  priority = false,
}: SponsorBannerProps) {
  return (
    <div
      className={cn(
        'relative aspect-[3/1] w-full overflow-hidden rounded-xl border border-border',
        !bannerUrl &&
          'bg-gradient-to-br from-primary/20 via-background to-accent/20',
        className,
      )}
    >
      {bannerUrl ? (
        <Image
          src={bannerUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1152px"
          priority={priority}
          unoptimized
        />
      ) : null}
    </div>
  )
}
