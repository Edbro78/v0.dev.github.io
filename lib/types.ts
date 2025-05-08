export interface ArveData {
  arveType: "oppgjor_idag" | "uskiftet_bo" | "minimumsarv" | "testament"
  avdod: "mann" | "kone"
  antallBarn: number
  antallFellesBarn: number
  antallSaerkullsbarn: number
  nettoformue: number
  harSaereie: boolean
  saereiebelop: number
  harLivsforsikring: boolean
  livsforsikringbelop: number
}

export interface GjenlevendeEktefelleArv {
  total: number
  livsforsikring: number
  felleseieAndel: number
  saereieAndel: number
  minstearv: number
}

export interface BarnArv {
  total: number
  perBarn: number
}

export interface UskiftetBoData {
  gjenlevendeEktefelle: number
  barnArv: number
  barnArvPerBarn: number
}

export interface ArveResultatData {
  arveType: "oppgjor_idag" | "uskiftet_bo" | "minimumsarv" | "testament"
  totalFormue: number
  gjenlevendeEktefelle: GjenlevendeEktefelleArv
  barnArv: BarnArv
  antallBarn: number
  beregningsDetaljer: string[]
  kortSikt?: UskiftetBoData
  langSikt?: UskiftetBoData
}
