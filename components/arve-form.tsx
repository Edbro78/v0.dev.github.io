"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { InfoTooltip } from "./info-tooltip"
import type { ArveData } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface ArveFormProps {
  onBeregn: (data: ArveData) => void
}

export function ArveForm({ onBeregn }: ArveFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [arveType, setArveType] = useState<"oppgjor_idag" | "uskiftet_bo" | "minimumsarv" | "testament">("oppgjor_idag")
  const [avdod, setAvdod] = useState<"mann" | "kone">("mann")
  const [antallBarn, setAntallBarn] = useState<number>(0)
  const [antallFellesBarn, setAntallFellesBarn] = useState<number>(0)
  const [antallSaerkullsbarn, setAntallSaerkullsbarn] = useState<number>(0)
  const [nettoformue, setNettoformue] = useState<number>(0)
  const [harSaereie, setHarSaereie] = useState<boolean>(false)
  const [saereiebelop, setSaereiebelop] = useState<number>(0)
  const [harLivsforsikring, setHarLivsforsikring] = useState<boolean>(false)
  const [livsforsikringbelop, setLivsforsikringbelop] = useState<number>(0)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      // Validation for step 1 is simple - just radio buttons
      return true
    }

    if (step === 2) {
      if (!avdod) {
        newErrors.avdod = "Velg hvem som dør først"
      }
    }

    if (step === 3) {
      if (antallFellesBarn + antallSaerkullsbarn !== antallBarn) {
        newErrors.barnSum = "Summen av felles barn og særkullsbarn må være lik totalt antall barn"
      }
    }

    if (step === 4) {
      if (nettoformue < 0) {
        newErrors.nettoformue = "Nettoformue kan ikke være negativ"
      }
    }

    if (step === 5) {
      if (harSaereie && saereiebelop < 0) {
        newErrors.saereiebelop = "Særeiebeløp kan ikke være negativt"
      }

      if (harSaereie && saereiebelop > nettoformue) {
        newErrors.saereiebelop = "Særeiebeløp kan ikke være større enn nettoformue"
      }
    }

    if (step === 6) {
      if (harLivsforsikring && livsforsikringbelop < 0) {
        newErrors.livsforsikringbelop = "Livsforsikringsbeløp kan ikke være negativt"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1 && arveType === "testament") {
        // Håndter "kommer snart"-funksjonalitet
        setCurrentStep(7)
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const prevStep = () => {
    if (currentStep === 7 && arveType === "testament") {
      setCurrentStep(1)
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onBeregn({
        arveType,
        avdod,
        antallBarn,
        antallFellesBarn,
        antallSaerkullsbarn,
        nettoformue,
        harSaereie,
        saereiebelop: harSaereie ? saereiebelop : 0,
        harLivsforsikring,
        livsforsikringbelop: harLivsforsikring ? livsforsikringbelop : 0,
      })
    }
  }

  const handleAntallBarnChange = (value: number) => {
    setAntallBarn(value)
    // Reset felles barn and særkullsbarn if total changes
    setAntallFellesBarn(0)
    setAntallSaerkullsbarn(0)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Velg arvefordelingsalternativ</h2>
            <RadioGroup value={arveType} onValueChange={(value) => setArveType(value as any)} className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oppgjor_idag" id="oppgjor_idag" />
                <Label htmlFor="oppgjor_idag">Oppgjør i dag uten testament</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="uskiftet_bo" id="uskiftet_bo" />
                <Label htmlFor="uskiftet_bo">Gjenlevende skal sitte i uskiftet bo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minimumsarv" id="minimumsarv" />
                <Label htmlFor="minimumsarv">Barna får kun minimumsarven</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="testament" id="testament" />
                <Label htmlFor="testament">Arven fordeles iht testament</Label>
              </div>
            </RadioGroup>
            {errors.arveType && <p className="text-red-500 text-sm mt-1">{errors.arveType}</p>}
          </div>
        )
      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Hvem dør først?</h2>
            <RadioGroup
              value={avdod}
              onValueChange={(value) => setAvdod(value as "mann" | "kone")}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mann" id="mann" />
                <Label htmlFor="mann">Mann</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kone" id="kone" />
                <Label htmlFor="kone">Kone</Label>
              </div>
            </RadioGroup>
            {errors.avdod && <p className="text-red-500 text-sm mt-1">{errors.avdod}</p>}
          </div>
        )
      case 3:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Antall barn</h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-1">
                  <Label htmlFor="antallBarn" className="mr-2">
                    Totalt antall barn
                  </Label>
                  <InfoTooltip content="Inkluderer både felles barn og særkullsbarn" />
                </div>
                <Input
                  id="antallBarn"
                  type="number"
                  min="0"
                  value={antallBarn}
                  onChange={(e) => handleAntallBarnChange(Number.parseInt(e.target.value) || 0)}
                />
              </div>

              {antallBarn > 0 && (
                <>
                  <div>
                    <div className="flex items-center mb-1">
                      <Label htmlFor="antallFellesBarn" className="mr-2">
                        Antall felles barn
                      </Label>
                      <InfoTooltip content="Barn som er felles for begge ektefeller" />
                    </div>
                    <Input
                      id="antallFellesBarn"
                      type="number"
                      min="0"
                      max={antallBarn}
                      value={antallFellesBarn}
                      onChange={(e) => setAntallFellesBarn(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center mb-1">
                      <Label htmlFor="antallSaerkullsbarn" className="mr-2">
                        Antall særkullsbarn
                      </Label>
                      <InfoTooltip content="Barn som kun er avdødes, ikke gjenlevende ektefelles" />
                    </div>
                    <Input
                      id="antallSaerkullsbarn"
                      type="number"
                      min="0"
                      max={antallBarn}
                      value={antallSaerkullsbarn}
                      onChange={(e) => setAntallSaerkullsbarn(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>

                  {errors.barnSum && <p className="text-red-500 text-sm">{errors.barnSum}</p>}

                  <div className="p-3 bg-blue-50 rounded-md text-sm">
                    <p>
                      Felles barn + særkullsbarn = {antallFellesBarn + antallSaerkullsbarn} av {antallBarn} totalt
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      case 4:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Nettoformue</h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-1">
                  <Label htmlFor="nettoformue" className="mr-2">
                    Total nettoformue (NOK)
                  </Label>
                  <InfoTooltip content="Samlet verdi av alle eiendeler minus gjeld" />
                </div>
                <Input
                  id="nettoformue"
                  type="number"
                  min="0"
                  value={nettoformue}
                  onChange={(e) => setNettoformue(Number.parseInt(e.target.value) || 0)}
                />
                {errors.nettoformue && <p className="text-red-500 text-sm mt-1">{errors.nettoformue}</p>}
              </div>

              {nettoformue > 0 && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm">Nettoformue: {formatCurrency(nettoformue)}</p>
                </div>
              )}
            </div>
          </div>
        )
      case 5:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Særeie</h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="harSaereie"
                  checked={harSaereie}
                  onCheckedChange={(checked) => setHarSaereie(checked === true)}
                />
                <div className="flex items-center">
                  <Label htmlFor="harSaereie" className="mr-2">
                    Har avdøde særeie?
                  </Label>
                  <InfoTooltip content="Særeie er formue som ikke skal deles likt mellom ektefellene" />
                </div>
              </div>

              {harSaereie && (
                <div>
                  <div className="flex items-center mb-1">
                    <Label htmlFor="saereiebelop" className="mr-2">
                      Særeiebeløp (NOK)
                    </Label>
                    <InfoTooltip content="Beløpet som er definert som særeie i ektepakten" />
                  </div>
                  <Input
                    id="saereiebelop"
                    type="number"
                    min="0"
                    max={nettoformue}
                    value={saereiebelop}
                    onChange={(e) => setSaereiebelop(Number.parseInt(e.target.value) || 0)}
                  />
                  {errors.saereiebelop && <p className="text-red-500 text-sm mt-1">{errors.saereiebelop}</p>}
                </div>
              )}

              {harSaereie && saereiebelop > 0 && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm">Særeiebeløp: {formatCurrency(saereiebelop)}</p>
                  <p className="text-sm">Felleseie: {formatCurrency(nettoformue - saereiebelop)}</p>
                </div>
              )}
            </div>
          </div>
        )
      case 6:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Livsforsikring</h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="harLivsforsikring"
                  checked={harLivsforsikring}
                  onCheckedChange={(checked) => setHarLivsforsikring(checked === true)}
                />
                <div className="flex items-center">
                  <Label htmlFor="harLivsforsikring" className="mr-2">
                    Har avdøde livsforsikring?
                  </Label>
                  <InfoTooltip content="Utbetaling fra livsforsikring ved dødsfall" />
                </div>
              </div>

              {harLivsforsikring && (
                <div>
                  <div className="flex items-center mb-1">
                    <Label htmlFor="livsforsikringbelop" className="mr-2">
                      Livsforsikringsbeløp (NOK)
                    </Label>
                    <InfoTooltip content="Beløpet som utbetales fra livsforsikringen" />
                  </div>
                  <Input
                    id="livsforsikringbelop"
                    type="number"
                    min="0"
                    value={livsforsikringbelop}
                    onChange={(e) => setLivsforsikringbelop(Number.parseInt(e.target.value) || 0)}
                  />
                  {errors.livsforsikringbelop && (
                    <p className="text-red-500 text-sm mt-1">{errors.livsforsikringbelop}</p>
                  )}
                </div>
              )}

              <div className="p-3 bg-blue-50 rounded-md">
                <h3 className="font-medium mb-2">Oppsummering</h3>
                <p className="text-sm">Avdød: {avdod === "mann" ? "Mann" : "Kone"}</p>
                <p className="text-sm">
                  Antall barn: {antallBarn} (Felles: {antallFellesBarn}, Særkull: {antallSaerkullsbarn})
                </p>
                <p className="text-sm">Nettoformue: {formatCurrency(nettoformue)}</p>
                {harSaereie && <p className="text-sm">Særeie: {formatCurrency(saereiebelop)}</p>}
                {harLivsforsikring && <p className="text-sm">Livsforsikring: {formatCurrency(livsforsikringbelop)}</p>}
                <p className="text-sm font-medium mt-2">
                  Total formue til fordeling:{" "}
                  {formatCurrency(nettoformue + (harLivsforsikring ? livsforsikringbelop : 0))}
                </p>
              </div>
            </div>
          </div>
        )
      case 7:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Funksjonalitet kommer snart</h2>
            <p>Denne funksjonaliteten er under utvikling og vil være tilgjengelig snart.</p>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Arvefordeling iht. testament er en kompleks funksjonalitet som krever flere detaljer om testamentets
                innhold. Vi jobber med å implementere dette og det vil være tilgjengelig i en fremtidig oppdatering.
              </p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6">
      {currentStep <= 6 && currentStep !== 7 && (
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`w-1/6 h-2 rounded-full mx-1 ${step <= currentStep ? "bg-blue-500" : "bg-gray-200"}`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-500">Steg {currentStep} av 6</p>
        </div>
      )}

      <Card className="p-6">
        {renderStepContent()}

        <div className="flex justify-between mt-6">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              Tilbake
            </Button>
          ) : (
            <div></div>
          )}

          {currentStep < 6 ? (
            <Button onClick={nextStep}>Neste</Button>
          ) : currentStep === 6 ? (
            <Button onClick={handleSubmit}>Beregn arv</Button>
          ) : currentStep === 7 && arveType === "testament" ? (
            <Button onClick={prevStep}>Tilbake til start</Button>
          ) : (
            <div></div>
          )}
        </div>
      </Card>
    </div>
  )
}
