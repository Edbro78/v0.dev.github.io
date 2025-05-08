"use client"

import { useState } from "react"
import { ArveForm } from "./arve-form"
import { ArveResultat } from "./arve-resultat"
import type { ArveData, ArveResultatData } from "@/lib/types"
import { beregnArv } from "@/lib/arve-beregning"

export function ArveKalkulator() {
  const [steg, setSteg] = useState<"form" | "resultat">("form")
  const [resultat, setResultat] = useState<ArveResultatData | null>(null)

  const handleBeregn = (data: ArveData) => {
    const beregnetResultat = beregnArv(data)
    setResultat(beregnetResultat)
    setSteg("resultat")
  }

  const handleStartPaNytt = () => {
    setSteg("form")
    setResultat(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {steg === "form" && <ArveForm onBeregn={handleBeregn} />}
      {steg === "resultat" && resultat && <ArveResultat resultat={resultat} onStartPaNytt={handleStartPaNytt} />}
    </div>
  )
}
