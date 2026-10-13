import { Link } from 'react-router-dom'
import { BRAND } from '../utils/format'

const VALUES = [
  { no: '01', title: 'Craft', text: 'Each piece is cast, set and polished by hand in small batches by our partner ateliers.' },
  { no: '02', title: 'Material', text: 'Solid 10K and 14K gold, 925 sterling silver and nickel-free plating — gentle on sensitive skin.' },
  { no: '03', title: 'Timeless', text: 'Designs made to be layered and worn every day, not just for a season.' },
]

export default function BrandStoryPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-24">
      <header className="space-y-6 py-10 text-center">
        <p className="eyebrow text-muted">Brand Story</p>
        <h1 className="display text-5xl leading-tight sm:text-6xl">
          The beauty of
          <br />
          <em>quiet details.</em>
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-loose text-muted">
          {BRAND} was founded on the belief that the pieces you wear most should be the most beautifully made. We draw
          on the elegance of Parisian ateliers and the restraint of modern Seoul to create jewelry that feels personal,
          effortless and enduring.
        </p>
      </header>

      <div className="grid gap-px border border-line bg-line md:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.no} className="space-y-4 bg-canvas p-8">
            <p className="display text-lg text-gold">{v.no}</p>
            <p className="display text-3xl">{v.title}</p>
            <p className="text-sm leading-relaxed text-muted">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6 text-center">
        <p className="display text-2xl italic">“Jewelry is the most personal thing you own.”</p>
        <Link to="/catalogue" className="btn btn-secondary">Explore the Collections</Link>
      </div>
    </div>
  )
}
