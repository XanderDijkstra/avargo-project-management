---
title: Google Ads — Konverteringssporing
service: google-ads
order: 1
---

# Konverteringssporing for Google Ads

## Anbefalt løsning

Importer konverteringer fra GA4. Unngå dobbeltsporing ved å ha både GA4-konverteringer og Google Ads-tag for samme hendelse.

## Steg

1. **GA4 må være aktiv** og motta data.
2. **Definer konverteringshendelser i GA4** (f.eks. `form_submit`, `phone_click`, `purchase`).
3. **Marker dem som konverteringer** i GA4 (Hendelser → Merk som konvertering).
4. **I Google Ads: Verktøy → Konverteringer → Importer fra GA4**.
5. **Test i Sanntid** (GA4) eller med Tag Assistant.

## Vanlige feil

- Konvertering ikke importert: vent 24 timer etter første GA4-hendelse.
- Doble konverteringer: sjekk at samme hendelse ikke har både GA4 og en separat Google Ads-tag.
