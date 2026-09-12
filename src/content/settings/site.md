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
#  OBRAZAC ZA KONTAKT — OVDJE SE POSTAVLJA SLANJE E-MAILA
#
#  Stranica je statična (nema servera), pa obrazac poruku šalje preko
#  besplatnog servisa Web3Forms, koji je prosljeđuje na vaš e-mail.
#
#  KAKO SPOJITI (nekoliko minuta, besplatno):
#    1. Otvorite https://web3forms.com i upišite e-mail tvrtke.
#    2. Na taj e-mail stigne "Access Key" — dugačak niz slova i brojeva.
#    3. Zalijepite ga niže u formAccessKey, umjesto [WEB3FORMS KEY].
#       formEndpoint ostaje ovakav kakav jest.
#
#  Poruke od tada stižu na e-mail upisan na web3forms.com. Ta adresa
#  NIJE nigdje u kodu stranice, pa je roboti za skupljanje e-mailova
#  ne mogu pokupiti — vidljiv je samo ključ, koji sam po sebi ništa ne odaje.
#
#  Dok je bilo koje od ta dva polja u [...] obliku, obrazac se prikazuje
#  onemogućen uz napomenu — da nitko ne šalje poruku u prazno.
#
#  Alternativa — Formspree (https://formspree.io):
#    formEndpoint:  https://formspree.io/f/<vaš-id>
#    formAccessKey: ostavite prazno (Formspree ne koristi ključ)
# ─────────────────────────────────────────────────────────────────────
formEndpoint: "https://api.web3forms.com/submit"
# Access Key dobivate na web3forms.com upisom svog e-maila (vidi upute gore).
formAccessKey: "e61637ed-3228-4938-a98a-b17b5bfb2a09"

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
  - "Fujitsu"
  - "Samsung"
  - "LG"

seo:
  title: "Electronic Solution — Vrtni alat, klima i grijanje | Metković"
  description: "Bežični EGO Power+ vrtni alat, klima uređaji, Viessmann dizalice topline. Prodaja, ugradnja i servis iz Metkovića — od Zadra do Dubrovnika."
  ogImageAlt: "Electronic Solution — snaga za vrt, toplina za dom"
---
