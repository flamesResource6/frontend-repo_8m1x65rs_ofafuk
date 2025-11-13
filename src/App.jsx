import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Search, ShoppingCart, LogIn, ChevronLeft, ChevronRight, Leaf, Recycle, Globe2, Truck, X, Menu } from 'lucide-react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || ''

function useFetch(url, fallback) {
  const [data, setData] = useState(fallback)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    async function run() {
      try {
        const res = await fetch(url)
        const json = await res.json()
        if (active) setData(json)
      } catch {
        if (active) setData(fallback)
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [url])
  return { data, loading }
}

function PromoBar() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('promoDismissed') === '1')
  const { data } = useFetch(`${BACKEND}/api/config/promo`, { message: '', active: false, background: '#e6f4f1', text_color: '#083c3a' })
  if (!data?.active || dismissed) return null
  return (
    <div className="sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-2 glass rounded-xl px-4">
          <div className="flex items-center justify-between py-2 text-sm" style={{ color: data.text_color }}>
            <span className="truncate" style={{ color: data.text_color }}>{data.message}</span>
            <button aria-label="Dismiss" onClick={() => { localStorage.setItem('promoDismissed','1'); setDismissed(true) }} className="/group p-1 rounded hover:bg-black/5">
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const { data: nav } = useFetch(`${BACKEND}/api/navigation`, { items: [] })

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query) { setSuggestions([]); return }
      try {
        const res = await fetch(`${BACKEND}/api/search?q=` + encodeURIComponent(query))
        const json = await res.json()
        setSuggestions(json.results || [])
      } catch {
        setSuggestions([])
      }
    }, 200)
    return () => clearTimeout(t)
  }, [query])

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass mt-2 px-4 flex h-16 items-center gap-4 rounded-xl">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setMobileOpen(v=>!v)} aria-label="Open Menu"><Menu/></button>
          <div className="shrink-0 font-semibold tracking-wide text-teal-900">
            Rockflowerpaper Wholesale
          </div>
          <div className="hidden lg:flex items-center gap-6 text-sm text-teal-900/80">
            {(nav.items||[]).map((item) => (
              <div key={item.slug} className="group relative py-5">
                <a href={`/#/collections/${item.slug}`} className="hover:text-teal-900">{item.name}</a>
                {item.children && item.children.length > 0 && (
                  <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition pointer-events-none group-hover:pointer-events-auto absolute left-0 top-full mt-2 glass rounded-xl p-5 grid grid-cols-2 gap-4 min-w-[420px]">
                    {item.children.map((c) => (
                      <a key={c.slug} href={`/#/collections/${c.slug}`} className="block px-2 py-2 rounded hover:bg-white/40 text-teal-900/80 hover:text-teal-900">
                        {c.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="ml-auto relative flex-1 max-w-xl">
            <div className="flex items-center gap-2 rounded-full border border-teal-200 bg-white/60 backdrop-blur px-3 py-2 shadow-sm focus-within:soft-ring">
              <Search className="text-teal-700" size={18} />
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search wholesale products…" className="w-full outline-none placeholder:text-teal-900/40 text-sm bg-transparent" />
            </div>
            {suggestions.length>0 && (
              <div className="absolute mt-2 w-full glass rounded-xl p-2 z-50">
                {suggestions.map((s,i)=>(
                  <a key={i} href={s.href} className="block px-3 py-2 rounded hover:bg-white/40 text-sm text-teal-900/80">{s.label}</a>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 pl-2">
            <a href="#login" className="flex items-center gap-1 text-sm text-teal-900/80 hover:text-teal-900"><LogIn size={18}/> Login</a>
            <a href="#cart" className="relative text-teal-900/80 hover:text-teal-900" aria-label="Cart"><ShoppingCart/></a>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden mt-2 glass rounded-xl border-t py-3 grid gap-2 text-teal-900/90 px-4">
            {(nav.items||[]).map((item) => (
              <details key={item.slug} className="px-1">
                <summary className="cursor-pointer py-2 text-sm">{item.name}</summary>
                <div className="pl-3 grid">
                  {(item.children||[]).map((c)=>(
                    <a key={c.slug} href={`/#/collections/${c.slug}`} className="py-1 text-sm text-teal-900/70">{c.name}</a>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}

function Hero() {
  const { data } = useFetch(`${BACKEND}/api/hero`, { slides: [] })
  const slides = data.slides || []
  const [index, setIndex] = useState(0)
  const timer = useRef(null)
  useEffect(() => {
    if (!slides.length) return
    timer.current = setInterval(() => setIndex(i => (i + 1) % slides.length), 5000)
    return () => clearInterval(timer.current)
  }, [slides.length])
  if (!slides.length) return null
  const current = slides[index]
  return (
    <section className="bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-2 gap-6 items-center">
        <div className="aspect-[16/10] lg:aspect-[4/3] w-full overflow-hidden rounded-2xl pastel-card hover-lift">
          <img src={current.image} alt={current.title} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-teal-950 tracking-tight fade-in-up">{current.title}</h1>
          <p className="text-teal-900/70 text-lg">{current.description}</p>
          <div>
            <a href={current.cta_href} className="inline-flex items-center gap-2 rounded-full bg-teal-700 text-white px-5 py-3 shadow hover:bg-teal-800 transition">{current.cta_label}</a>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <button aria-label="Prev" onClick={()=>setIndex(i => (i-1+slides.length)%slides.length)} className="p-2 rounded-full border text-teal-800 hover:bg-white/70 backdrop-blur"><ChevronLeft/></button>
            <button aria-label="Next" onClick={()=>setIndex(i => (i+1)%slides.length)} className="p-2 rounded-full border text-teal-800 hover:bg-white/70 backdrop-blur"><ChevronRight/></button>
          </div>
        </div>
      </div>
    </section>
  )
}

function CategoryTiles() {
  const { data } = useFetch(`${BACKEND}/api/collections`, { items: [] })
  const tiles = (data.items || []).filter((i) => ['eco','home','clothing','blu'].includes(i.slug)).slice(0,4)
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <a key={t.slug} href={`/#/collections/${t.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl pastel-card hover-lift">
              <img src={t.image} alt={t.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-950/30 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="inline-flex rounded-full glass px-3 py-1 text-teal-900 text-sm font-medium">{t.name}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function IconBar() {
  const items = [
    { icon: <Leaf/>, label: 'Eco-Friendly Materials' },
    { icon: <Recycle/>, label: 'Small Batch Quality' },
    { icon: <Globe2/>, label: 'Trusted by Retailers Worldwide' },
    { icon: <Truck/>, label: 'Fast Wholesale Shipping' },
  ]
  return (
    <section className="bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {items.map((it,i)=>(
            <div key={i} className="flex items-center gap-3 rounded-xl glass px-4 py-3 hover-lift">
              <div className="text-teal-800">{it.icon}</div>
              <div className="text-sm font-medium text-teal-900/90">{it.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedRail() {
  const { data } = useFetch(`${BACKEND}/api/featured-rail`, { items: [] })
  const items = data.items || []
  return (
    <section className="py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-teal-950">Featured</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
          {items.map((it)=> (
            <a key={it.slug} href={`/#/collections/${it.slug}`} className="snap-start shrink-0 w-64 group rounded-2xl overflow-hidden pastel-card hover-lift">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={it.image} alt={it.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/>
              </div>
              <div className="p-3 text-teal-900/90">{it.name}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function CampaignBanner() {
  const { data } = useFetch(`${BACKEND}/api/campaign`, { title: '', subtitle: '', cta_label: '', cta_href: '#', image: '' })
  if (!data?.image) return null
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl pastel-card">
          <img src={data.image} alt={data.title} className="w-full h-[320px] sm:h-[420px] object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-r from-teal-950/40 via-teal-900/20 to-transparent"/>
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center max-w-xl text-teal-950">
            <div className="glass rounded-2xl p-5 sm:p-6 inline-block">
              <h3 className="text-2xl sm:text-3xl font-semibold">{data.title}</h3>
              <p className="mt-2 text-teal-900/80">{data.subtitle}</p>
              <div className="mt-5">
                <a href={data.cta_href} className="inline-flex items-center gap-2 rounded-full bg-teal-700 text-white px-5 py-3 font-medium shadow hover:bg-teal-800">{data.cta_label}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ShopTheLook() {
  const { data } = useFetch(`${BACKEND}/api/shop-the-look`, { image: '', hotspots: [] })
  const [active, setActive] = useState(null)
  if (!data?.image) return null
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl pastel-card overflow-hidden">
          <img src={data.image} alt="Shop the look" className="w-full h-[420px] object-cover" />
          {(data.hotspots||[]).map((h, idx)=> (
            <div key={idx} style={{ left: `${h.position.x}%`, top: `${h.position.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2">
              <button onClick={()=> setActive(active===idx? null : idx)} className="h-5 w-5 rounded-full bg-white shadow ring-2 ring-teal-700 hover:soft-ring transition" aria-label="Hotspot"></button>
              {active===idx && (
                <div className="mt-2 w-64 rounded-xl glass overflow-hidden">
                  {h.image && <img src={h.image} alt={h.title} className="w-full h-32 object-cover"/>}
                  <div className="p-3">
                    <div className="font-medium text-teal-950">{h.title}</div>
                    {h.price && <div className="text-sm text-teal-900/70">${h.price.toFixed(2)}</div>}
                    <button className="mt-2 w-full rounded-full bg-teal-700 text-white py-2 text-sm hover:bg-teal-800">Add to Cart</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t/0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-xl p-5">
          <div className="font-semibold text-teal-950">Rockflowerpaper Wholesale</div>
          <p className="mt-2 text-sm text-teal-900/70">Coastal-inspired lifestyle and apparel for retailers.</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="font-semibold text-teal-950 mb-3">Learn More</div>
          <nav className="grid gap-2 text-sm text-teal-900/80">
            <a href="#contact" className="hover:text-teal-900">Contact Us</a>
            <a href="#story" className="hover:text-teal-900">How We Started</a>
            <a href="#policies" className="hover:text-teal-900">Wholesale Policies</a>
          </nav>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="font-semibold text-teal-950 mb-3">Wholesale Newsletter</div>
          <form onSubmit={(e)=>{e.preventDefault(); alert('Subscribed')}} className="flex gap-2">
            <input type="email" required placeholder="Your work email" className="flex-1 rounded-full border border-teal-200 bg-white/70 backdrop-blur px-4 py-2 text-sm outline-none focus:soft-ring" />
            <button className="rounded-full bg-teal-700 text-white px-4 py-2 text-sm hover:bg-teal-800">Sign Up</button>
          </form>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="font-semibold text-teal-950 mb-3">Follow Us</div>
          <div className="flex gap-3 text-teal-900/80">
            <a href="#" className="hover:text-teal-900">LinkedIn</a>
            <a href="#" className="hover:text-teal-900">Pinterest</a>
            <a href="#" className="hover:text-teal-900">Facebook</a>
          </div>
        </div>
      </div>
      <div className="py-4 text-center text-xs text-teal-900/60">© {new Date().getFullYear()} Rockflowerpaper Wholesale</div>
    </footer>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-coastal text-teal-900">
      <PromoBar />
      <Header />
      <Hero />
      <CategoryTiles />
      <IconBar />
      <FeaturedRail />
      <CampaignBanner />
      <ShopTheLook />
      <Footer />
    </div>
  )
}
