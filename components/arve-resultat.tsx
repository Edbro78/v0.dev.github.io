"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ArveResultatData } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { PieChart } from "./pie-chart"

interface ArveResultatProps {
  resultat: ArveResultatData
  onStartPaNytt: () => void
}

export function ArveResultat({ resultat, onStartPaNytt }: ArveResultatProps) {
  const { arveType, totalFormue, gjenlevendeEktefelle, barnArv, antallBarn, beregningsDetaljer, kortSikt, langSikt } =
    resultat

  // Prepare data for pie chart
  const getChartData = (isLongTerm = false) => {
    if (arveType === "uskiftet_bo" && isLongTerm) {
      return [
        { name: "Gjenlevende ektefelle", value: langSikt?.gjenlevendeEktefelle || 0, color: "#3b82f6" },
        ...(antallBarn > 0 ? [{ name: "Barn", value: langSikt?.barnArv || 0, color: "#10b981" }] : []),
      ]
    }

    return [
      {
        name: "Gjenlevende ektefelle",
        value:
          arveType === "uskiftet_bo" && !isLongTerm ? kortSikt?.gjenlevendeEktefelle || 0 : gjenlevendeEktefelle.total,
        color: "#3b82f6",
      },
      ...(antallBarn > 0
        ? [
            {
              name: "Barn",
              value: arveType === "uskiftet_bo" && !isLongTerm ? kortSikt?.barnArv || 0 : barnArv.total,
              color: "#10b981",
            },
          ]
        : []),
    ]
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Arvefordeling</h2>

      {arveType === "uskiftet_bo" ? (
        <Tabs defaultValue="kort_sikt" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kort_sikt">Kort sikt</TabsTrigger>
            <TabsTrigger value="lang_sikt">Lang sikt</TabsTrigger>
          </TabsList>

          <TabsContent value="kort_sikt">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Fordeling på kort sikt</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Total formue til fordeling</p>
                      <p className="text-xl font-medium">{formatCurrency(totalFormue)}</p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-500">Gjenlevende ektefelle (uskiftet bo)</p>
                      <p className="text-xl font-medium text-blue-600">
                        {formatCurrency(kortSikt?.gjenlevendeEktefelle || 0)}
                      </p>
                    </div>

                    {antallBarn > 0 && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-500">Barn (umiddelbart oppgjør)</p>
                        <p className="text-xl font-medium text-green-600">{formatCurrency(kortSikt?.barnArv || 0)}</p>
                        <p className="mt-2 text-sm">
                          {antallBarn} barn, {formatCurrency(kortSikt?.barnArvPerBarn || 0)} per barn
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col justify-center">
                <PieChart data={getChartData(false)} />
                <div className="flex justify-center gap-6 mt-4">
                  {getChartData(false).map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lang_sikt">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Fordeling på lang sikt</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Total formue til fordeling</p>
                      <p className="text-xl font-medium">{formatCurrency(totalFormue)}</p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-500">Gjenlevende ektefelle</p>
                      <p className="text-xl font-medium text-blue-600">
                        {formatCurrency(langSikt?.gjenlevendeEktefelle || 0)}
                      </p>
                    </div>

                    {antallBarn > 0 && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-500">Barn (etter skifte)</p>
                        <p className="text-xl font-medium text-green-600">{formatCurrency(langSikt?.barnArv || 0)}</p>
                        <p className="mt-2 text-sm">
                          {antallBarn} barn, {formatCurrency(langSikt?.barnArvPerBarn || 0)} per barn
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col justify-center">
                <PieChart data={getChartData(true)} />
                <div className="flex justify-center gap-6 mt-4">
                  {getChartData(true).map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Fordeling av arv</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total formue til fordeling</p>
                  <p className="text-xl font-medium">{formatCurrency(totalFormue)}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">Gjenlevende ektefelle</p>
                  <p className="text-xl font-medium text-blue-600">{formatCurrency(gjenlevendeEktefelle.total)}</p>
                  <div className="mt-2 text-sm space-y-1">
                    {gjenlevendeEktefelle.livsforsikring > 0 && (
                      <p>Livsforsikring: {formatCurrency(gjenlevendeEktefelle.livsforsikring)}</p>
                    )}
                    {gjenlevendeEktefelle.felleseieAndel > 0 && (
                      <p>Andel av felleseie: {formatCurrency(gjenlevendeEktefelle.felleseieAndel)}</p>
                    )}
                    {gjenlevendeEktefelle.saereieAndel > 0 && (
                      <p>Andel av særeie: {formatCurrency(gjenlevendeEktefelle.saereieAndel)}</p>
                    )}
                    {gjenlevendeEktefelle.minstearv > 0 && (
                      <p className="font-medium">Minstearv (4G): {formatCurrency(gjenlevendeEktefelle.minstearv)}</p>
                    )}
                  </div>
                </div>

                {antallBarn > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500">Barn</p>
                    <p className="text-xl font-medium text-green-600">{formatCurrency(barnArv.total)}</p>
                    <p className="mt-2 text-sm">
                      {antallBarn} barn, {formatCurrency(barnArv.perBarn)} per barn
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col justify-center">
            <PieChart data={getChartData()} />
            <div className="flex justify-center gap-6 mt-4">
              {getChartData().map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Beregningsdetaljer</h3>
          <div className="space-y-2 text-sm">
            {beregningsDetaljer.map((detalj, index) => (
              <p key={index}>{detalj}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={onStartPaNytt}>Start på nytt</Button>
      </div>
    </div>
  )
}
