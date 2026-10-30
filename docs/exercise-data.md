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

## Su Supabase

La tabella è definita nelle migrazioni in `supabase/migrations/`:

- `20261030130000_create_exercises.sql` crea `public.exercises`, con le stesse informazioni del modello qui sopra:
  - i testi localizzati (`name`, `steps`) sono `jsonb` nel formato `{"it": …, "en": …}`;
  - zone, attrezzature e muscoli sono le chiavi delle traduzioni;
  - c'è un vincolo unico sulla fonte (`source_dataset` + `source_id`).
- **Regole di accesso (RLS)**: chiunque può leggere, anche senza account; nessuno può scrivere con le chiavi dell'app. Si scrive solo con le migrazioni o con la chiave *service role*.
- `20261030130100_add_sample_exercises.sql` inserisce i 2 esercizi di prova. Sta in una migrazione e non in `seed.sql` perché il catalogo deve esserci anche in produzione, e `seed.sql` gira solo in locale.

Le migrazioni sono state provate su un Postgres 16 con i ruoli `anon` e `authenticated` di Supabase:
- la lettura funziona e restituisce dati identici a `seed.ts`;
- inserimenti, modifiche e cancellazioni dall'app vengono rifiutati;
- i vincoli bloccano nomi senza una lingua, slug non validi e duplicati della fonte.

**Applicarle al progetto** (dal computer, con la CLI collegata):

```bash
npx supabase login
npx supabase link --project-ref xkczxrhdligtguxcoitq
npx supabase db push
```

### Ancora da fare

1. L'app legge ancora da `seed.ts`. Una volta applicate le migrazioni, si aggiunge un `ExerciseRepository` che legge da Supabase e si sostituisce a quello locale; poi `seed.ts` si può cancellare.
2. Per l'import completo serve uno script che mappa e normalizza i valori del dataset. Caricare i media su Supabase Storage è possibile solo con la licenza delle animazioni (vedi sopra).

Schede di allenamento e diario saranno tabelle legate all'utente, con autenticazione e RLS. Il catalogo degli esercizi resta pubblico in sola lettura.
