# Dati degli esercizi

## La fonte

[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset): 1.324 esercizi, ognuno con:

- nome, zona del corpo, attrezzatura, muscolo principale e muscoli secondari;
- istruzioni passo per passo in 10 lingue, **italiano compreso**;
- un'animazione GIF e un'immagine fissa, entrambe 180×180 px.

Per ora nell'app ce ne sono 2 (`src/features/exercises/data/seed.ts`): la lat machine (`0150`, *cable bar lateral pulldown*) e la panca piana con bilanciere (`0025`).

### Licenza: attenzione alle animazioni

- **Dati e testi** (nomi, categorie, istruzioni e traduzioni): licenza **MIT**. Si possono usare liberamente, anche in un'app commerciale, mantenendo la nota di copyright.
- **Animazioni e immagini**: sono **© Gym visual** ([gymvisual.com](https://gymvisual.com/)) e **non** sono coperte dalla MIT. Il repository le ridistribuisce con un permesso scritto che vale per lui, non per chi lo clona: per usarle in un'app pubblicata serve una licenza da Gym visual (vedi i loro [termini](https://gymvisual.com/content/3-terms-and-conditions-of-use)). Le condizioni che il repository indica sono: risoluzione massima 180×180 e la dicitura «© Gym visual» visibile.

Per questo, in sviluppo:

- le GIF **non sono copiate** in questo repository (che è pubblico): l'app le carica dal repository originale, fissato a un commit preciso;
- sotto ogni animazione c'è la dicitura «Animazione © Gym visual»;
- le animazioni sono mostrate a 260 pt al massimo: la sorgente è 180×180 e più grande si sgrana.

**Prima del rilascio bisogna scegliere** una di queste strade:

1. comprare la licenza da Gym visual (offrono anche versioni a risoluzione più alta) e caricare i file sul nostro storage;
2. usare per le immagini [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db): 800+ esercizi in **pubblico dominio**, con due foto per esercizio (posizione iniziale e finale) al posto della GIF, istruzioni solo in inglese;
3. produrre le animazioni noi.

Il codice non cambia: ogni esercizio ha già i campi `media.gif`, `media.thumbnail` e `media.credit`.

### Traduzioni italiane

Le istruzioni italiane del dataset sono traduzioni automatiche, con errori (ad esempio *elbows tucked in* diventa «gomiti piegati» invece di «gomiti vicini al corpo») e forme miste («Sdraiati» / «Afferrare»). Quelle dei 2 esercizi di prova sono state riviste a mano; con l'import completo andranno riviste, almeno per gli esercizi più usati.

Anche i nomi sono solo in inglese: quelli italiani (per esempio «Lat machine») vanno scritti da noi.

## Il modello nell'app

```ts
type Exercise = {
  id: string; // slug per gli URL, es. "lat-pulldown"
  name: { it: string; en: string };
  bodyPart: BodyPart; // es. "back"
  equipment: Equipment; // es. "cable"
  targetMuscle: Muscle; // es. "lats"
  secondaryMuscles: Muscle[];
  steps: { it: string[]; en: string[] };
  media: { gif: string; thumbnail: string; credit: string };
  source: { dataset: string; id: string }; // per riallinearsi alla fonte
};
```

Zone del corpo, attrezzature e muscoli sono chiavi delle traduzioni (`bodyPart.*`, `equipment.*`, `muscle.*` in `src/i18n/locales/`): se un esercizio usa un valore senza traduzione, TypeScript dà errore. Le zone e le attrezzature del dataset ci sono già tutte; i muscoli secondari del dataset sono poco uniformi (`traps` e `trapezius`, `delts` e `shoulders`...) e vanno normalizzati durante l'import.

## Passare a Supabase

Le schermate non leggono `seed.ts` direttamente ma passano da `ExerciseRepository` (`src/features/exercises/repository.ts`), con React Query sopra. Quando avremo il progetto Supabase:

1. tabella `exercises` con le colonne del modello qui sopra (i testi localizzati come `jsonb` o colonne `name_it`/`name_en`);
2. uno script che importa il dataset (mappando e normalizzando i valori) e carica i media su Supabase Storage;
3. una seconda implementazione di `ExerciseRepository` che legge da Supabase, da sostituire a quella locale.

Le schede di allenamento e il diario dei progressi saranno tabelle legate all'utente, quindi serviranno anche l'autenticazione e le regole di accesso (RLS). Il catalogo degli esercizi invece può restare pubblico in sola lettura.
