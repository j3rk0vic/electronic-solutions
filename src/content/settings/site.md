---
company: "Electronic Solution"
tagline: "Prodaja i servis — vrt i dom na jednom mjestu"

# ─────────────────────────────────────────────────────────────────────
#  KONTAKT PODACI
#  Mijenjaju se na cijeloj stranici automatski.
# ─────────────────────────────────────────────────────────────────────
address: "Splitska ul. 48, 20350 Metković"
phone: "095 302 6666"
phoneHref: "+385953026666"    # bez razmaka, za tel: link
email: "info@electronic-solution.hr"   # ← E-MAIL TVRTKE. Prikazuje se u podnožju.
hours: "Pon – Pet: 08:00 – 16:00 · Subota i nedjelja: zatvoreno"
# Isto radno vrijeme u strojnom obliku, za Google (schema.org openingHours).
# Format: dvoslovne oznake dana Mo Tu We Th Fr Sa Su, npr. "Mo-Fr 08:00-16:00".
# Ostavite prazno ako ne želite da se šalje.
hoursSchema: "Mo-Fr 08:00-16:00"
region: "Od Zadra do Dubrovnika"
# Tocka na karti u podnozju (decimalni stupnjevi). Ako pin ne sjedne tocno
# na ulaz, popravite ovdje - na Google kartama desni klik -> prva stavka
# kopira koordinate.
mapLat: 43.0470226
mapLng: 17.6260102

# ─────────────────────────────────────────────────────────────────────
#  PODACI IZ SUDSKOG REGISTRA — prikazuju se na /impressum
#  Zakon o trgovačkim društvima (čl. 21. st. 4.) traži da ih svako d.o.o.
#  ima na svojim web stranicama. Izvor: sudreg.pravosudje.hr, MBS 090048534.
#  IBAN nije u sudskom registru — provjerite ga s bankom/knjigovođom.
# ─────────────────────────────────────────────────────────────────────
legal:
  name: "ELECTRONIC SOLUTION d.o.o. za usluge i trgovinu"
  seat: "Splitska 45, 20350 Metković"
  oib: "15100354402"
  mbs: "090048534"
  court: "Trgovački sud u Dubrovniku"
  capital: "2.500,00 EUR, uplaćen u cijelosti"
  director: "Robertino Jerković, direktor — zastupa samostalno i pojedinačno"
  iban: "HR5823600001103144242"
  bank: "Zagrebačka banka d.d., Zagreb"

# ─────────────────────────────────────────────────────────────────────
#  OBRAZAC ZA KONTAKT
#
#  Poruke šalje public/kontakt.php izravno s vašeg hostinga (PHP na cPanelu)
#  na e-mail tvrtke. Nema vanjskog servisa, ključa ni računa.
#
#  Primatelj je upisan u public/kontakt.php ($to) — ako se e-mail tvrtke
#  promijeni, promijenite ga ondje i u polju email: gore.
#
#  Alternativa, ako ikad zatreba vanjski servis:
#    Web3Forms:  formEndpoint: https://api.web3forms.com/submit
#                formAccessKey: ključ koji stigne na e-mail s web3forms.com
#    Formspree:  formEndpoint: https://formspree.io/f/<vaš-id>, ključ prazan
#  Dok je formEndpoint u [...] obliku, obrazac se prikazuje onemogućen.
# ─────────────────────────────────────────────────────────────────────
formEndpoint: "/kontakt.php"
formAccessKey: ""

# ─────────────────────────────────────────────────────────────────────
#  ANALITIKA — Cloudflare Web Analytics (besplatno, bez kolačića)
#
#  Broji posjete, stranice, s čega ljudi dolaze (Google, Facebook, izravno)
#  i s kojih uređaja. Ne postavlja kolačiće i ne prati pojedince, pa ne
#  treba kolačić-prozor — politika privatnosti to već opisuje.
#
#  KAKO UKLJUČITI:
#    1. Otvorite https://dash.cloudflare.com i napravite besplatan račun.
#    2. Lijevo: Web Analytics → Add a site → upišite electronic-solution.hr
#       (ne treba mijenjati DNS — odaberite "JS snippet").
#    3. U snippetu piše  data-cf-beacon='{"token": "xxxxxxxx"}'  —
#       kopirajte samo taj token niže.
#  Dok je polje prazno, na stranici nema nikakve skripte za analitiku.
# ─────────────────────────────────────────────────────────────────────
analyticsToken: "cecb73700ba849ddb19fce68b92e8a4a"

# Sporedna navigacija (zaglavlje + podnožje). Vrt/Dom se ne navode ovdje —
# oni su sekcije naslovnice i imaju vlastiti prekidač u navigaciji.
nav:
  - { label: "Trgovina", href: "/trgovina" }
  - { label: "Usluge", href: "/usluge" }
  - { label: "Servis", href: "/servis" }
  - { label: "O nama", href: "/o-nama" }

brands:
  - "EGO Power+"
  - "Viessmann"
  - "Fronius"
  - "BYD"
  - "Fujitsu"
  - "Samsung"
  - "LG"

seo:
  title: "Electronic Solution — Vrtni alat, klima i grijanje | Metković"
  description: "Bežični EGO Power+ vrtni alat, klima uređaji, Viessmann dizalice topline. Prodaja, ugradnja i servis iz Metkovića — od Zadra do Dubrovnika."
  ogImageAlt: "Electronic Solution — snaga za vrt, toplina za dom"
---
