import type { ArveData, ArveResultatData } from "./types"
import { formatCurrency } from "./utils"

// Grunnbeløpet i folketrygden (G)
const GRUNNBELOP = 124028
const MINSTEARV_FAKTOR = 4 // 4G
const MINIMUMSARV_BARN_FAKTOR = 15 // 15G

export function beregnArv(data: ArveData): ArveResultatData {
  const beregningsDetaljer: string[] = []

  // 1. Beregn total formue
  const totalFormue = data.nettoformue + (data.harLivsforsikring ? data.livsforsikringbelop : 0)
  beregningsDetaljer.push(`1. Total formue til fordeling: ${formatCurrency(totalFormue)}`)
  beregningsDetaljer.push(`   - Nettoformue: ${formatCurrency(data.nettoformue)}`)
  if (data.harLivsforsikring) {
    beregningsDetaljer.push(`   - Livsforsikring: ${formatCurrency(data.livsforsikringbelop)}`)
  }

  if (data.arveType === "oppgjor_idag") {
    return beregnOppgjorIdag(data, totalFormue, beregningsDetaljer)
  } else if (data.arveType === "uskiftet_bo") {
    return beregnUskiftetBo(data, totalFormue, beregningsDetaljer)
  } else if (data.arveType === "minimumsarv") {
    return beregnMinimumsarv(data, totalFormue, beregningsDetaljer)
  } else {
    // Testament - ikke implementert ennå
    return {
      arveType: data.arveType,
      totalFormue,
      gjenlevendeEktefelle: {
        total: 0,
        livsforsikring: 0,
        felleseieAndel: 0,
        saereieAndel: 0,
        minstearv: 0,
      },
      barnArv: {
        total: 0,
        perBarn: 0,
      },
      antallBarn: data.antallBarn,
      beregningsDetaljer: ["Testament-beregning er ikke implementert ennå."],
    }
  }
}

function beregnOppgjorIdag(data: ArveData, totalFormue: number, beregningsDetaljer: string[]): ArveResultatData {
  // 2. Beregn gjenlevende ektefelles arv
  const livsforsikring = data.harLivsforsikring ? data.livsforsikringbelop : 0
  beregningsDetaljer.push(`\n2. Beregning av gjenlevende ektefelles arv:`)

  // Beregn andel av felleseie
  const felleseie = data.harSaereie ? data.nettoformue - data.saereiebelop : data.nettoformue
  const felleseieAndel = felleseie * 0.5
  beregningsDetaljer.push(`   - Felleseie: ${formatCurrency(felleseie)}`)
  beregningsDetaljer.push(`   - Andel av felleseie (50%): ${formatCurrency(felleseieAndel)}`)

  // Beregn andel av særeie
  let saereieAndel = 0
  if (data.harSaereie) {
    saereieAndel = data.saereiebelop * 0.25 // 1/4 av særeie
    beregningsDetaljer.push(`   - Særeie: ${formatCurrency(data.saereiebelop)}`)
    beregningsDetaljer.push(`   - Andel av særeie (1/4): ${formatCurrency(saereieAndel)}`)
  }

  // Beregn minstearv (4G)
  const minstearv = GRUNNBELOP * MINSTEARV_FAKTOR
  beregningsDetaljer.push(`   - Minstearv (4G): ${formatCurrency(minstearv)}`)

  // Beregn total arv til gjenlevende ektefelle
  let gjenlevendeTotal = felleseieAndel + saereieAndel + livsforsikring
  let minstearvsJustering = 0

  // Sjekk om gjenlevende får mindre enn minstearv
  if (gjenlevendeTotal < minstearv && totalFormue >= minstearv) {
    minstearvsJustering = minstearv - (felleseieAndel + saereieAndel + livsforsikring)
    gjenlevendeTotal = minstearv
    beregningsDetaljer.push(`   - Justering for minstearv: ${formatCurrency(minstearvsJustering)}`)
    beregningsDetaljer.push(`   - Gjenlevende ektefelle får minstearv: ${formatCurrency(minstearv)}`)
  } else if (totalFormue < minstearv) {
    gjenlevendeTotal = totalFormue
    beregningsDetaljer.push(
      `   - Total formue er mindre enn minstearv, gjenlevende får hele formuen: ${formatCurrency(totalFormue)}`,
    )
  } else {
    beregningsDetaljer.push(`   - Gjenlevende ektefelles arv: ${formatCurrency(gjenlevendeTotal)}`)
  }

  // 3. Beregn barnas arv
  beregningsDetaljer.push(`\n3. Beregning av barnas arv:`)

  const barnTotal = totalFormue - gjenlevendeTotal
  let barnPerBarn = 0

  if (data.antallBarn > 0 && barnTotal > 0) {
    barnPerBarn = barnTotal / data.antallBarn
    beregningsDetaljer.push(`   - Total arv til barn: ${formatCurrency(barnTotal)}`)
    beregningsDetaljer.push(`   - Arv per barn (${data.antallBarn} barn): ${formatCurrency(barnPerBarn)}`)
  } else if (data.antallBarn > 0) {
    beregningsDetaljer.push(`   - Ingen arv til barn da gjenlevende ektefelle får hele formuen.`)
  } else {
    beregningsDetaljer.push(`   - Ingen barn, gjenlevende ektefelle får hele formuen.`)
  }

  // 4. Verifisering
  beregningsDetaljer.push(`\n4. Verifisering:`)
  beregningsDetaljer.push(`   - Total fordelt arv: ${formatCurrency(gjenlevendeTotal + barnTotal)}`)
  beregningsDetaljer.push(`   - Total formue: ${formatCurrency(totalFormue)}`)

  return {
    arveType: data.arveType,
    totalFormue,
    gjenlevendeEktefelle: {
      total: gjenlevendeTotal,
      livsforsikring,
      felleseieAndel,
      saereieAndel,
      minstearv: minstearvsJustering,
    },
    barnArv: {
      total: barnTotal,
      perBarn: barnPerBarn,
    },
    antallBarn: data.antallBarn,
    beregningsDetaljer,
  }
}

function beregnUskiftetBo(data: ArveData, totalFormue: number, beregningsDetaljer: string[]): ArveResultatData {
  beregningsDetaljer.push(`\n2. Beregning for uskiftet bo:`)

  // Kort sikt (umiddelbart etter dødsfall)
  let kortSiktBarnArv = 0
  let kortSiktBarnArvPerBarn = 0

  // Hvis det er særeie, får barna 3/4 av særeiet umiddelbart
  if (data.harSaereie && data.antallBarn > 0) {
    kortSiktBarnArv = data.saereiebelop * 0.75
    kortSiktBarnArvPerBarn = kortSiktBarnArv / data.antallBarn

    beregningsDetaljer.push(`   - Kort sikt: Barna får 75% av særeie umiddelbart: ${formatCurrency(kortSiktBarnArv)}`)
    beregningsDetaljer.push(`   - Kort sikt: Per barn: ${formatCurrency(kortSiktBarnArvPerBarn)}`)
  } else if (data.antallBarn > 0) {
    beregningsDetaljer.push(`   - Kort sikt: Ingen særeie, barna får ikke umiddelbar arv`)
  }

  const kortSiktGjenlevende = totalFormue - kortSiktBarnArv
  beregningsDetaljer.push(`   - Kort sikt: Gjenlevende beholder i uskiftet bo: ${formatCurrency(kortSiktGjenlevende)}`)

  // Lang sikt (etter skifte)
  let langSiktBarnArv = 0
  let langSiktBarnArvPerBarn = 0

  if (data.antallBarn > 0) {
    // Barna får fortsatt 3/4 av særeiet
    const saereieArv = data.harSaereie ? data.saereiebelop * 0.75 : 0

    // Pluss 3/4 av halvparten av felleseiet
    const felleseie = data.nettoformue - (data.harSaereie ? data.saereiebelop : 0)
    const felleseieArv = (felleseie / 2) * 0.75

    langSiktBarnArv = saereieArv + felleseieArv
    langSiktBarnArvPerBarn = langSiktBarnArv / data.antallBarn

    beregningsDetaljer.push(`\n   - Lang sikt: Beregning av barnas arv:`)
    if (data.harSaereie) {
      beregningsDetaljer.push(`   - Lang sikt: 75% av særeie: ${formatCurrency(saereieArv)}`)
    }
    beregningsDetaljer.push(`   - Lang sikt: 75% av halvparten av felleseie: ${formatCurrency(felleseieArv)}`)
    beregningsDetaljer.push(`   - Lang sikt: Total arv til barn: ${formatCurrency(langSiktBarnArv)}`)
    beregningsDetaljer.push(`   - Lang sikt: Per barn: ${formatCurrency(langSiktBarnArvPerBarn)}`)
  }

  const langSiktGjenlevende = totalFormue - langSiktBarnArv
  beregningsDetaljer.push(`   - Lang sikt: Gjenlevende får: ${formatCurrency(langSiktGjenlevende)}`)

  // Verifisering
  beregningsDetaljer.push(`\n4. Verifisering:`)
  beregningsDetaljer.push(
    `   - Kort sikt: ${formatCurrency(kortSiktGjenlevende)} (gjenlevende) + ${formatCurrency(kortSiktBarnArv)} (barn) = ${formatCurrency(totalFormue)}`,
  )
  beregningsDetaljer.push(
    `   - Lang sikt: ${formatCurrency(langSiktGjenlevende)} (gjenlevende) + ${formatCurrency(langSiktBarnArv)} (barn) = ${formatCurrency(totalFormue)}`,
  )

  // For å opprettholde samme struktur som andre beregninger
  const gjenlevendeEktefelle = {
    total: langSiktGjenlevende,
    livsforsikring: data.harLivsforsikring ? data.livsforsikringbelop : 0,
    felleseieAndel: 0,
    saereieAndel: 0,
    minstearv: 0,
  }

  const barnArv = {
    total: langSiktBarnArv,
    perBarn: langSiktBarnArvPerBarn,
  }

  return {
    arveType: data.arveType,
    totalFormue,
    gjenlevendeEktefelle,
    barnArv,
    antallBarn: data.antallBarn,
    beregningsDetaljer,
    kortSikt: {
      gjenlevendeEktefelle: kortSiktGjenlevende,
      barnArv: kortSiktBarnArv,
      barnArvPerBarn: kortSiktBarnArvPerBarn,
    },
    langSikt: {
      gjenlevendeEktefelle: langSiktGjenlevende,
      barnArv: langSiktBarnArv,
      barnArvPerBarn: langSiktBarnArvPerBarn,
    },
  }
}

function beregnMinimumsarv(data: ArveData, totalFormue: number, beregningsDetaljer: string[]): ArveResultatData {
  beregningsDetaljer.push(`\n2. Beregning med minimumsarv til barn:`)

  const minimumsarvBarn = GRUNNBELOP * MINIMUMSARV_FAKTOR
  beregningsDetaljer.push(`   - Minimumsarv per barn (15G): ${formatCurrency(minimumsarvBarn)}`)

  let barnArv = 0
  let barnArvPerBarn = 0

  if (data.antallBarn > 0) {
    // Beregn særeieandel per barn
    let saereiePerBarn = 0
    if (data.harSaereie) {
      saereiePerBarn = (data.saereiebelop * 0.75) / data.antallBarn
      beregningsDetaljer.push(`   - Særeieandel per barn: ${formatCurrency(saereiePerBarn)}`)
    }

    // Velg det største av minimumsarv og særeieandel
    barnArvPerBarn = Math.max(saereiePerBarn, minimumsarvBarn)
    beregningsDetaljer.push(`   - Valgt beløp per barn: ${formatCurrency(barnArvPerBarn)}`)

    barnArv = barnArvPerBarn * data.antallBarn
    beregningsDetaljer.push(`   - Total arv til barn: ${formatCurrency(barnArv)}`)
  }

  // Gjenlevende får resten, men ikke mindre enn 0
  let gjenlevendeTotal = Math.max(0, totalFormue - barnArv)

  // Hvis barnas arv er større enn totalformuen, må vi justere
  if (barnArv > totalFormue) {
    barnArv = totalFormue
    barnArvPerBarn = data.antallBarn > 0 ? totalFormue / data.antallBarn : 0
    gjenlevendeTotal = 0

    beregningsDetaljer.push(`   - Barnas arv overstiger totalformuen, justert til: ${formatCurrency(barnArv)}`)
    beregningsDetaljer.push(`   - Justert arv per barn: ${formatCurrency(barnArvPerBarn)}`)
  }

  beregningsDetaljer.push(`   - Gjenlevende ektefelle får: ${formatCurrency(gjenlevendeTotal)}`)

  // Verifisering
  beregningsDetaljer.push(`\n4. Verifisering:`)
  beregningsDetaljer.push(`   - Total fordelt arv: ${formatCurrency(gjenlevendeTotal + barnArv)}`)
  beregningsDetaljer.push(`   - Total formue: ${formatCurrency(totalFormue)}`)

  return {
    arveType: data.arveType,
    totalFormue,
    gjenlevendeEktefelle: {
      total: gjenlevendeTotal,
      livsforsikring: data.harLivsforsikring ? data.livsforsikringbelop : 0,
      felleseieAndel: 0,
      saereieAndel: 0,
      minstearv: 0,
    },
    barnArv: {
      total: barnArv,
      perBarn: barnArvPerBarn,
    },
    antallBarn: data.antallBarn,
    beregningsDetaljer,
  }
}
