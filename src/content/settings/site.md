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
email: "[EMAIL]"              # ← E-MAIL TVRTKE. Prikazuje se u podnožju.
hours: "Pon – Pet: 08:00 – 16:00 · Subota i nedjelja: zatvoreno"
# Isto radno vrijeme u strojnom obliku, za Google (schema.org openingHours).
# Format: dvoslovne oznake dana Mo Tu We Th Fr Sa Su, npr. "Mo-Fr 08:00-16:00".
# Ostavite prazno ako ne želite da se šalje.
hoursSchema: "Mo-Fr 08:00-16:00"
region: "Od Zadra do Dubrovnika"

# ─────────────────────────────────────────────────────────────────────
#  OBRAZAC ZA KONTAKT — OVDJE SE POSTAVLJA SLANJE E-MAILA
#
#  Stranica je statična (nema servera), pa obrazac šalje poruku preko
#  besplatnog servisa koji je prosljeđuje na vaš e-mail.
#
#  Preporuka — Web3Forms (https://web3forms.com):
#    1. Upišite svoj e-mail, dobijete "Access Key" na taj e-mail.
#    2. formEndpoint:  https://api.web3forms.com/submit
#    3. formAccessKey: <ključ koji ste dobili>
#
#  Alternativa — Formspree (https://formspree.io):
#    formEndpoint:  https://formspree.io/f/<vaš-id>
#    formAccessKey: ostavite prazno
#
#  Dok je formEndpoint u [...] obliku, obrazac je vidljiv ali onemogućen.
#
#  TRENUTNO: privremeno spojeno na FormSubmit (bez registracije) za TESTIRANJE.
#  Poruke idu na ijerkovic13@gmail.com. Prije produkcije zamijeniti pravim
#  servisom i skriti e-mail (vidi README → Obrazac za kontakt).
# ─────────────────────────────────────────────────────────────────────
formEndpoint: "https://formsubmit.co/ajax/ijerkovic13@gmail.com"
formAccessKey: ""

# Sporedna navigacija (zaglavlje + podnožje). Vrt/Dom se ne navode ovdje —
# oni su sekcije naslovnice i imaju vlastiti prekidač u navigaciji.
nav:
  - { label: "Trgovina", href: "/trgovina" }
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
  description: "Bežični EGO Power+ vrtni alat, klima uređaji, Viessmann dizalice topline i solarni sustavi. Prodaja, ugradnja i servis iz Metkovića — od Zadra do Dubrovnika."
  ogImageAlt: "Electronic Solution — snaga za vrt, toplina za dom"
---
