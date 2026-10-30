# Fitness

App di allenamento per iOS (prima) e Android, fatta con **Expo** (React Native). Un solo codice per entrambe le piattaforme: niente cartelle `ios/` e `android/` scritte a mano, le genera Expo.

Per ora ci sono due sezioni:

- **Esercizi**: lista con ricerca e filtro per zona del corpo; il dettaglio mostra l'animazione, i muscoli coinvolti e i passaggi dell'esecuzione. Al momento ci sono 2 esercizi di prova (lat machine e panca piana).
- **Profilo**: nome, tema (automatico / chiaro / scuro), lingua (automatica / italiano / inglese), termini e condizioni, privacy policy, versione.

Decisioni, stato del lavoro e prossimi passi sono in [docs/memoria-progetto.md](docs/memoria-progetto.md).

Il backend sarà Supabase. La tabella degli esercizi è pronta come migrazione in `supabase/migrations/`, ma per ora l'app legge ancora gli esercizi dal codice e le preferenze restano sul dispositivo. Vedi [docs/exercise-data.md](docs/exercise-data.md) per da dove vengono gli esercizi e come si applicano le migrazioni.

## Avviarla

Serve Node 22 (dalla 22.13 in su) o Node 24.

```bash
npm install
npx expo start
```

Poi scansiona il QR code con l'app **Expo Go** sull'iPhone, oppure premi `i` per il simulatore iOS (serve un Mac con Xcode) o `a` per l'emulatore Android. Con `w` si apre un'anteprima nel browser: utile per provare al volo, ma l'app vera è quella nativa.

## Comandi

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript (lancia `npx expo start` almeno una volta prima: genera i tipi delle route)
npm run format      # Prettier
```

## Com'è fatta

- **Expo SDK 58**, **Expo Router** (le schermate sono i file in `src/app/`), TypeScript.
- **Tab native**: su iOS la tab bar di sistema con le SF Symbols, su Android quella Material.
- **Tema**: colori in `src/constants/theme.ts`, chiaro e scuro, con un arancione come colore del brand.
- **Lingue**: `i18next`; i testi sono in `src/i18n/locales/` (`it.ts` è il riferimento, `en.ts` deve avere le stesse chiavi o TypeScript segnala l'errore).
- **Preferenze** (nome, tema, lingua): `zustand` salvato con AsyncStorage, in `src/features/settings/`.
- **Esercizi**: le schermate leggono da un `ExerciseRepository` (`src/features/exercises/repository.ts`) tramite React Query. Oggi l'implementazione è locale; per Supabase basterà aggiungerne una seconda.

```
src/
  app/                  schermate (Expo Router)
    (exercises)/        tab Esercizi: lista e dettaglio
    profile/            tab Profilo: nome, tema, lingua, documenti legali
  components/           componenti condivisi (testi, liste, icone, tab)
  constants/theme.ts    colori, spaziature, raggi
  features/
    exercises/          tipi, dati, repository, query, componenti
    legal/              testi provvisori di termini e privacy
    settings/           preferenze salvate sul dispositivo
  i18n/                 configurazione e traduzioni
```

## Da fare prima del rilascio

- **Licenza delle animazioni**: le GIF degli esercizi sono © Gym visual e non sono coperte dalla licenza MIT del dataset. Vedi [docs/exercise-data.md](docs/exercise-data.md).
- **Termini e privacy**: i testi in `src/features/legal/documents.ts` sono bozze; vanno sostituiti con quelli definitivi (e la privacy policy deve essere anche su un URL pubblico per l'App Store).
- **Nome, icona e splash** dell'app: sono ancora quelli provvisori del template Expo.
