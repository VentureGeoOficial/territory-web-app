import { TeamGrid } from './team-grid'
import { TeamHeader } from './team-header'

export function TeamSection() {
  return (
    <section
      id="desenvolvido-por"
      aria-labelledby="team-heading"
      className="relative scroll-mt-20 px-4 py-20 md:py-28 animate-in fade-in duration-500"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
      <div className="relative mx-auto max-w-7xl">
        <TeamHeader />
        <TeamGrid />
      </div>
    </section>
  )
}
