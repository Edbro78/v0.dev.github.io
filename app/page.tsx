import { ArveKalkulator } from "@/components/arve-kalkulator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">Arveoppgjør uten testament</h1>
        <p className="text-slate-600 text-center mb-8">Beregn arvefordeling etter norsk arvelov for ulike scenarier</p>
        <ArveKalkulator />
      </div>
    </main>
  )
}
