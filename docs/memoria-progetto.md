# Memoria del progetto

Questo file raccoglie tutto quello che è stato deciso finora su MaestraleGym (prima «Fitness»), perché chi riprende il lavoro (una persona o Claude in una nuova sessione) parta da qui senza dover rileggere le chat. Va aggiornato a ogni decisione importante.

Ultimo aggiornamento: 30 ottobre 2026.

## Dove siamo arrivati

- La base dell'app c'è: tab **Esercizi** (lista, ricerca, filtro, dettaglio con GIF) e tab **Profilo** (nome, tema, lingua, termini, privacy, versione). Il primo commit è `986624b` sul branch `claude/tender-archimedes-lr4kab`.
- Dal 31 ottobre 2026 la barra è **Home · Esercizi · Profilo**. La Home mostra il percorso: la scheda che stai seguendo, a che punto sei e il prossimo allenamento. La tab Esercizi ha due viste, **Schede** (la prima) ed **Esercizi**. Le schede sono livelli (1, 2…): si sceglie una scheda, la si assegna e ci si allena dalla Home un esercizio alla volta, segnando pesi e ripetizioni. Tutto è salvato sul telefono. Vedi «Percorso e allenamento».
- Valerio ha visto il primo risultato e la UI non lo convinceva, a partire dalla barra di navigazione in basso. **La UI è stata rifatta con lo stile di Paniere** (30 ottobre 2026): barra a pillola flottante, card bianche, righe in stile impostazioni, icone Hugeicons. Va ancora vista da Valerio su un telefono.
- Paniere non era raggiungibile dalla sessione cloud in cui è nata l'app (vedi «Paniere» più sotto). Ora è in locale in `../paniere-mobile-app`.
- L'app è collegata al progetto Expo `@maestrale-lab/maestralegym` e ha il suo `eas.json` (vedi «Expo, EAS e App Store»).
- La tabella Supabase degli esercizi (`public.exercises`, con i 2 esercizi di prova) è **applicata al progetto** dal 30 ottobre 2026, ma l'app legge ancora gli esercizi dal codice. Nel codice gli esercizi sono 36 e c'è il campo `muscleGroup`: prima di far leggere il catalogo da Supabase serve una nuova migrazione che aggiunga la colonna e gli altri esercizi.
- Ci sono le **statistiche anonime d'uso** (installazioni, utenti attivi, ritorni, eventi), inviate a Supabase senza account: vedi «Statistiche anonime» e `docs/analytics.md`. La migrazione `analytics` è **applicata** (30 ottobre 2026) e il primo evento di prova è arrivato.
- Il repository GitHub è `Maestrale-Labs/MaestraleGym-mobile-app` (prima `Maestrale-Labs/Fitness`, poi `Maestrale-Labs/MyFitness-mobile-app`; GitHub reindirizza i vecchi indirizzi). La cartella sul computer di Valerio si chiama ancora `MyFitness-mobile-app`: si può rinominare a mano quando nessuna sessione ci sta lavorando.

**Prossimi passi** (si parte da quello che si sblocca prima):

- far vedere a Valerio le schede sul telefono (Expo Go) e correggere quello che non va;
- applicare le migrazioni a Supabase e far leggere gli esercizi all'app da lì.

I dettagli sono in «Cosa fare adesso».

## Il prodotto

Riassunto della richiesta iniziale di Valerio (il testo integrale è in fondo):

- **Un'app di fitness.** Ha una libreria di tutti gli esercizi che si possono fare in palestra (la lat machine, per esempio), ognuno con GIF animata e istruzioni.
- **Schede di allenamento.** Possono essere personalizzate dall'utente, che aggiunge esercizi dalla libreria a un suo piano, oppure fornite da noi.
- **Diario.** L'utente segna giorno per giorno cosa ha fatto e vede i suoi progressi.
- **Piattaforme.** Esce prima per **iOS**; Android forse in futuro. Il codice deve comunque reggere entrambe, per questo si usa Expo/React Native.
- **Modello di riferimento: Paniere,** un'altra app del team, «fatta molto bene sia per Apple che per Android». Da Paniere si riprendono colori, funzionamento e stile.
- **Colore del brand:** arancione, «stile Claude». Oggi è `#E8622C`.
- **Lingue:** per ora solo italiano e inglese.
- **Si parte semplice.** Prima solo due sezioni: Esercizi, con tutti gli esercizi presi dal dataset su GitHub (per ora ne bastano due, per vedere come vengono lista e dettaglio), e Profilo, come quello di Paniere (termini e condizioni, privacy, nome, tema, lingua).

## Decisioni prese

### Tecnologia

- **Expo SDK 58**, Expo Router, TypeScript, React 19.3, React Native 0.88. Le cartelle `ios/` e `android/` non si scrivono a mano: le genera Expo.
- **Navigazione come Paniere:** c'è uno Stack alla radice senza header nativi. Le tab sono in `src/app/(tabs)/` e usano `expo-router/js-tabs` con la barra a pillola `src/components/floating-tab-bar.tsx`, la stessa su iOS, Android e web. Le sotto-pagine (`exercises/[id]`, `profile/*`) sono rotte dello Stack con `SubScreenHeader`. Le tab native di prima sono state tolte su richiesta di Valerio.
- **UI condivisa** (`src/components/`): `Screen`, `Card`, `SettingsRow`, `SectionLabel`, `SubScreenHeader`, `SearchField`, `Chip`. Gli stili che dipendono dal tema si scrivono con `makeStyles()` (`src/hooks/use-styles.ts`).
- **Icone:** Hugeicons come Paniere (`@hugeicons/react-native` e `react-native-svg`), scelte tutte in `src/constants/icons.ts` e disegnate con `Icon` (`src/components/icon.tsx`). Funzionano anche in Expo Go.
- **Lingue:** i18next. `src/i18n/locales/it.ts` è il riferimento ed `en.ts` è tipizzato contro di esso. La lingua «automatica» segue quella del dispositivo; se non è italiano o inglese si usa l'inglese.
- **Preferenze** (nome, tema, lingua): zustand salvato con AsyncStorage (`src/features/settings/store.ts`). Lo splash resta visibile finché le preferenze non sono state lette, per evitare un lampo del tema sbagliato.
- **Tema:** token in `src/constants/theme.ts` con i neutri freddi di Paniere (fondo `#F1F1F4`, card bianche; in scuro `#101214` e `#1B1E21`), ombre (`Shadows`) e misure della barra (`TabBar`). `brand` (`#E8622C`) è l'arancione decorativo; `tint` è l'accento per testi, icone e selezioni (`#BF4417` in chiaro, `#F07A3E` in scuro), scelto per restare leggibile secondo WCAG AA.
- **Dati degli esercizi:** le schermate leggono da `ExerciseRepository` (`src/features/exercises/repository.ts`) tramite React Query. Oggi l'implementazione è locale (`data/seed.ts`); per passare a Supabase basta scriverne una seconda.

### Supabase

- **Il progetto c'è** (30 ottobre 2026): nella dashboard si chiama «MaestraleGym» (rinominato da Valerio il 31 ottobre 2026; prima era «MyFitnessApp»). Ref `xkczxrhdligtguxcoitq`, URL `https://xkczxrhdligtguxcoitq.supabase.co`. L'app non lo usa ancora: gli esercizi sono nel codice e le preferenze restano sul telefono. Servirà con le schede personalizzate e il diario, cioè quando servono account, dati legati all'utente (con regole RLS) e sincronizzazione. Il catalogo degli esercizi potrà essere pubblico in sola lettura. Il piano completo è in `docs/exercise-data.md`.
- **Chiavi nell'app:** `.env` contiene solo `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_KEY` (la chiave _publishable_, fatta apposta per stare nel client). È nel repository, così le build EAS la trovano.
- **Cosa non va mai nel repository** (che è pubblico) né nell'app: la chiave _service role_, la password del database e il token personale `sbp_…`. Si tengono fuori dal codice e si passano alla CLI da terminale.
- **CLI:** `supabase/` è stato creato con `supabase init`. Dal 30 ottobre 2026 la CLI sul computer di Valerio è **collegata** al progetto (`npx supabase link --project-ref xkczxrhdligtguxcoitq`, senza bisogno della password del database). Le migrazioni si applicano con `npx supabase db push --linked`.
- **Tabelle:** si definiscono solo come migrazioni in `supabase/migrations/` e si applicano con `npx supabase db push`. La prima è `public.exercises`, il catalogo pubblico:
  - lettura per tutti, anche senza account;
  - nessuna scrittura con le chiavi dell'app;
  - solo 2 esercizi per ora, perché Valerio vuole vedere come vengono prima di caricarne altri.

  Dettagli in `docs/exercise-data.md`.

- **Dalla sessione cloud** Supabase non era raggiungibile: la rete bloccava `*.supabase.co` e `api.supabase.com`, e non c'erano credenziali fra le variabili d'ambiente. Le chiavi incollate nella sessione sul computer non passano alla sessione cloud. Per lavorarci dal cloud servono:
  - i due domini nella lista dei domini consentiti delle impostazioni di rete dell'ambiente;
  - un token come variabile d'ambiente segreta, da non scrivere mai in chat o nel repository.

  In alternativa le migrazioni si applicano dal computer.

### Statistiche anonime

Decise con Valerio il 30 ottobre 2026. Il percorso dell'utente (schede scelte, allenamenti fatti) resta **sul telefono** finché non ci sono gli account; a Supabase arrivano solo statistiche anonime, che servono a Valerio per sapere quante persone usano davvero l'app:

- installazioni, utenti attivi al giorno, alla settimana e al mese, quanti tornano;
- eventi: oggi `app_open`, `plan_viewed`, `exercise_viewed`; in arrivo `plan_added`, `workout_completed`, `plan_completed`.

Ogni installazione ha un codice casuale, senza dati personali. Si possono disattivare da Profilo › Privacy. Privacy policy e termini lo spiegano. Tutti i dettagli (tabelle, viste, query) sono in `docs/analytics.md`.

### Feedback

Deciso con Valerio il 30 ottobre 2026. Da Profilo › Informazioni › «Invia un feedback» chiunque, anche senza account, può mandare un messaggio. Si sceglie una categoria (Problema, Nuova funzionalità, Idea, Altro) e si scrive un testo di almeno 10 caratteri (al massimo 5.000, solo per proteggere la tabella). Non ci sono limiti al numero di invii: se arriva spam se ne riparla.

I messaggi finiscono nella tabella **`public.feedbacks`** su Supabase, che Valerio legge dal Table Editor. L'app può solo scrivere. Con il messaggio si salvano versione dell'app, sistema, lingua, `is_dev` (vero se inviato da Expo Go) e, se le statistiche sono attive, il codice anonimo dell'installazione, utile se servirà bloccare lo spam. Migrazione: `supabase/migrations/20261030190000_create_feedbacks.sql`; codice: `src/features/feedback/api.ts` e `src/app/profile/feedback.tsx`.

### Account e uso senza registrazione

Deciso con Valerio il 30 ottobre 2026:

- **L'app si usa senza registrarsi.** Senza account si vedono gli esercizi e si possono seguire le schede preimpostate.
- **L'account serve solo per salvare dati propri:** schede personalizzate, record, pesi, recuperi, progressi.
- **Si parte dalle basi.** Il profilo resta al minimo indispensabile; schede personalizzate e diario (peso sollevato, recupero) vengono dopo.
- **Proposta per le schede, non ancora confermata:** una sola struttura di tabelle per le schede nostre e per quelle personali. Una scheda senza proprietario (`owner_id` vuoto) è nostra e la vedono tutti; con proprietario è privata. Così le schede preimpostate funzionano senza account e «copia nelle mie schede» è semplice.
- **Regole Apple da rispettare quando arrivano gli account:**
  - non chiedere il login per funzioni che non ne hanno bisogno;
  - permettere di cancellare l'account dall'app;
  - se si offre il login con Google o simili, offrire anche «Accedi con Apple».
- **Più avanti, se serve:** Supabase permette utenti anonimi convertibili in account veri, utile per far registrare un allenamento prima dell'iscrizione senza perderlo. Per ora non si usa.

### Expo

- Per provare l'app sul telefono **non serve un account Expo**: basta `npx expo start` sul computer e l'app Expo Go sull'iPhone.
- L'account Expo (EAS) serve per le build vere: development build, TestFlight, App Store. Valerio vuole creare l'account e dare l'accesso.
- Dalla sessione cloud `expo.dev` e `api.expo.dev` erano bloccati. Per lanciare build da lì servono:
  - quei domini nella lista dei domini consentiti;
  - un `EXPO_TOKEN` come variabile segreta dell'ambiente.
- La prima build iOS conviene farla dal computer, perché EAS chiede il login Apple Developer.

### Expo, EAS e App Store

- **Progetto Expo:** `@maestrale-lab/maestralegym` (ID `4b6afaaf-2c23-460d-9fc7-7e0b84efe09c`), sotto l'organizzazione `maestrale-lab` come Paniere: https://expo.dev/accounts/maestrale-lab/projects/maestralegym. Il primo progetto, `@maestrale-lab/fitness`, era vuoto (nessuna build né pubblicazione) ed è stato sostituito il 31 ottobre 2026 per avere lo slug giusto; si può eliminare dalla dashboard di Expo.
- **`eas.json`:** stessi profili di Paniere (`development`, `preview`, `production`), con il numero di build gestito da EAS. Il profilo `development` richiede `expo-dev-client`, che non è ancora installato: si aggiunge quando serve la prima development build.
- **Sviluppo:** per ora basta Expo Go sull'iPhone, perché tutte le dipendenze sono incluse in Expo Go.
- **App Store Connect:** il 31 ottobre 2026 Valerio registra l'App ID `com.maestralelabs.maestralegym` (team `537737V753`) con le capability **Push Notifications** e **Sign In with Apple**, e crea l'app «MaestraleGym» su App Store Connect (SKU `maestralegym`, Apple ID `6829209983`, già in `eas.json` come `ascAppId`).
- **Bundle ID:** `com.maestralelabs.maestralegym`, sia iOS che Android (prima era `com.maestralelabs.fitness`, mai pubblicato).

### Il dataset degli esercizi

- Fonte scelta: [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset), con 1.324 esercizi, GIF, istruzioni in 10 lingue (italiano compreso) e licenza MIT per dati e testi.
- **Attenzione: le GIF sono © Gym visual** e non sono coperte dalla licenza MIT. Prima di pubblicare serve una licenza da Gym visual, oppure un'alternativa come [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db) (pubblico dominio, foto fisse). Per questo le GIF non sono copiate nel repository, che è pubblico: l'app le carica dal repo originale fissato a un commit, e sotto ogni animazione mostra «© Gym visual».
- Le traduzioni italiane del dataset sono automatiche e contengono errori. Per gli esercizi caricati i nomi e i passaggi in italiano sono scritti a mano.
- **Esercizi caricati (30 ottobre 2026): 36.** Ci sono 5 o 6 esercizi per gruppo muscolare (Schiena, Gambe, Glutei, Bicipiti, Petto), scelti tra i più comuni in palestra. Poi ci sono i 6 che servivano alle schede: lento avanti e alzate laterali con manubri (Spalle), push-down ai cavi e French press con manubrio (Tricipiti), calf raise in piedi alla macchina (Gambe) e crunch a terra (Addome). I gruppi sono anche i filtri della lista. Nel dataset non c'è un plank semplice, quindi per l'addome per ora c'è solo il crunch. Il gruppo (`muscleGroup`) lo decidiamo noi per ogni esercizio; il muscolo «target» del dataset a volte è diverso (per esempio lo squat lì risulta per i glutei, e l'abbiamo messo nelle gambe con i quadricipiti come muscolo principale).
- Nel dataset ci sono anche errori di contenuto: nel curl a martello i palmi ruotavano in avanti, e nel kickback ai cavi la posizione era girata rispetto all'immagine. Sono stati corretti in tutte e due le lingue.
- I dettagli sono in `docs/exercise-data.md`.

### Schede di allenamento

Decise il 30 ottobre 2026, riviste il 31:

- **Dove stanno:** nella tab **Esercizi**, vista **Schede** (la prima che si vede). Prima avevano una tab tutta loro (prima «Allenamenti», poi «Schede»). In alto c'è una riga che invita a partire dal livello 1, poi le schede in ordine di livello; sotto c'è «Le tue schede», per ora solo un messaggio che annuncia le schede personalizzate.
- **Le schede sono livelli** (decisione di Valerio): si parte dal **livello 1**, la più semplice, e si sale. Nella lista ogni scheda mostra solo il livello, il nome, i giorni a settimana e le settimane: la descrizione completa sta nella pagina della scheda.
- **Le prime 2 schede,** tutte e due con obiettivo **aumento muscolare**, di 8 settimane:
  - **Livello 1, Full body:** 3 giorni a settimana; il giorno 3 è uguale al giorno 1. Pochi esercizi, soprattutto macchine e manubri.
  - **Livello 2, Upper/Lower:** 4 giorni a settimana (giorni 1 e 3 per la parte alta, 2 e 4 per la parte bassa).
  - I livelli successivi (3, 4…) e i contenuti definitivi delle schede sono da decidere con Valerio.
- **Le schede sono divise per giorni** (Giorno 1, Giorno 2, Giorno 3…) e non per allenamenti A/B: così chi la segue sa cosa fare in ogni giorno della settimana, anche se due giorni sono uguali. Decisione di Valerio.
- **Cosa c'è in una scheda:** descrizione, giorni a settimana, durata, come organizzare la settimana, gli allenamenti (con serie, ripetizioni e recupero di ogni esercizio) e alcuni consigli generali (riscaldamento, scelta del peso, progressione). Dalla scheda si apre il dettaglio di ogni esercizio.
- **Codice:** `src/features/workouts/` ha i tipi (`WorkoutPlan`, `WorkoutDay`, `PlanExercise`), i dati in `data/plans.ts` e un `WorkoutPlanRepository` letto con React Query, come per gli esercizi, così anche le schede potranno passare a Supabase. La lista è `src/features/workouts/components/plan-list.tsx`, mostrata dalla tab Esercizi (`src/app/(tabs)/exercises.tsx`, vista `?view=plans`); la pagina di una scheda è `src/app/workouts/[id].tsx`. Una scheda fa riferimento agli esercizi tramite il loro `id`.
- **Esercizi aggiunti per le schede:** 6 (vedi «Il dataset degli esercizi»), con 3 gruppi muscolari nuovi: Spalle, Tricipiti e Addome.
- Il livello è il campo `level` (un numero); `WorkoutPlanRepository.list()` restituisce le schede già ordinate.

### Percorso e allenamento

Deciso con Valerio il 31 ottobre 2026. Tutto resta **sul telefono** (zustand con AsyncStorage, `src/features/training/store.ts`) finché non ci sono gli account; lo splash aspetta che i dati siano letti.

- **Scegliere una scheda:** dalla pagina di una scheda, «Inizia questa scheda». Se se ne segue già un'altra, l'app chiede conferma; gli allenamenti fatti restano salvati. Dalla stessa pagina si può smettere di seguirla.
- **Home:**
  - senza scheda: «Non hai ancora iniziato un percorso» e il bottone «Scegli una scheda», che apre la vista Schede;
  - con una scheda: livello e nome, una barra di avanzamento («Settimana 2 di 8», «4 di 24 allenamenti»), il prossimo allenamento (Giorno N, muscoli, numero di esercizi) con «Inizia allenamento» o «Riprendi allenamento», e gli ultimi 3 allenamenti fatti;
  - a scheda finita: «Scheda completata!», con «Passa al livello N+1» e «Ripeti la scheda».
- **Calendario della settimana** (31 ottobre 2026, richiesta di Valerio): nella Home, sotto la scheda, «Questa settimana» da lunedì a domenica. Ogni scheda ha i suoi giorni suggeriti (`weekdays`: Full body lunedì, mercoledì e venerdì; Upper/Lower lunedì, martedì, giovedì e venerdì), gli altri sono di **riposo**. Gli allenamenti **fatti** compaiono nel giorno in cui li hai fatti davvero, anche se non era quello previsto (giorno 1 fatto di martedì → spunta su martedì, «G1»). I giorni di allenamento ancora da venire mostrano il prossimo allenamento in ordine («G3»); quelli passati senza allenarsi restano vuoti; i giorni prima dell'inizio della scheda non contano. Sotto: «2 di 3 allenamenti» della settimana. Calcolo in `src/features/training/calendar.ts`, componente `week-calendar.tsx`.
- **Durata e avanzamento:** una scheda dura un certo numero di settimane di calendario dall'inizio («Settimana 2 di 8»), e vale *giorni a settimana × settimane* allenamenti (24 per il livello 1): la barra conta gli allenamenti fatti. È completata quando sono fatti tutti, anche se ci vuole più tempo. I giorni si susseguono (1, 2, 3, poi di nuovo 1).
- **Allenamento** (`src/app/workout.tsx`, a schermo intero). Dopo due prove sull'iPhone Valerio ha chiesto di **partire semplici** e aggiungere funzioni più avanti (31 ottobre 2026):
  - gli esercizi del giorno sono una **lista verticale a fisarmonica** (scelta di Valerio, più naturale di una striscia orizzontale): ogni esercizio è una card chiusa con miniatura, nome e «2/3 serie», o la spunta se è completato; toccandola si apre. Si vede tutta la scheda, anche mentre ci si riposa;
  - l'esercizio aperto mostra animazione, obiettivo, cosa hai fatto l'ultima volta, il bottone **«Come si fa»** (apre un foglio dal basso con animazione grande e passaggi dell'esecuzione) e la **tabella delle serie**: per ogni serie kg, ripetizioni e la spunta. Le ripetizioni partono già impostate (quelle dell'ultima volta o il massimo dell'obiettivo), il peso da quello dell'ultima volta; spuntata una serie, il suo peso passa alle successive ancora vuote;
  - **niente bottoni «avanti»**: spuntata l'ultima serie, l'esercizio si chiude come completato e si apre da solo il successivo; spuntata l'ultima serie dell'ultimo esercizio, l'allenamento si chiude da solo con il riepilogo (esercizi, serie, kg sollevati);
  - si può tornare su un esercizio fatto per vedere i risultati o correggerli (togliendo la spunta l'esercizio torna da completare);
  - «Termina» in alto chiude prima (gli esercizi senza serie fatte contano come saltati); la X esce e lascia l'allenamento in pausa, da riprendere dalla Home anche dopo aver chiuso l'app. Un allenamento senza nessuna serie fatta non viene salvato;
  - se l'ultima volta hai fatto tutte le ripetizioni in ogni serie, l'app suggerisce di aumentare il peso (**progressione**);
  - **tolti per ora**: timer di recupero, cambia/salta esercizio, aggiungi/rimuovi serie, annulla allenamento. Si rimettono se servono.
- **Statistiche:** `plan_added`, `workout_started`, `workout_completed`, `plan_completed` (vedi `docs/analytics.md`).
- **Da fare:** vedere dalla Home i risultati di un allenamento fatto, storico dei pesi per esercizio (grafico dei progressi), livelli successivi, promemoria con le notifiche; eventualmente rimettere timer di recupero e cambio esercizio.

### Profilo

- **Nome:** salvato solo sul dispositivo; in testa al profilo compaiono un avatar con le iniziali e il nome.
- **Tema:** automatico, chiaro o scuro. Viene applicato anche alle parti native dell'app tramite `Appearance.setColorScheme`.
- **Lingua:** automatica, italiano o inglese.
- **Termini e condizioni, privacy policy:** sono **bozze provvisorie**, segnalate come tali nell'app (`src/features/legal/documents.ts`). Vanno sostituite con i testi definitivi; la privacy policy deve stare anche su un URL pubblico per l'App Store.

## Paniere

- **Cos'è:** l'app di riferimento per lo stile. Va studiata prima di qualunque altro lavoro sulla UI.
- **Cosa è stato cercato:** nella sessione cloud non era accessibile. Non è tra i repository collegati e `Maestrale-Labs/Paniere` e `foddai0/paniere` non esistono o non sono accessibili. Non compare cercando sul web e sull'App Store, e non è citata nel repo `foddai0/valeriofoddai.com`.
- **Cosa non è:** `foddai0/panormus` è un gioco in Godot (un open world a Palermo), non c'entra.
- **Dove sta:** sul computer di Valerio, in `../paniere-mobile-app` accanto a questo progetto (progetto Expo `@maestrale-lab/paniere`).

### Lo stile di Paniere (studiato il 30 ottobre 2026)

- **Barra in basso:** non è quella nativa. Usa le tab JavaScript (`expo-router/js-tabs`) con una barra fatta a mano (`floating-tab-bar.tsx`): una **pillola flottante** bianca, alta 61 e larga il 90%, con ombra, staccata dal fondo. La voce attiva ha una pillola grigia (`surfaceMuted`) dietro icona ed etichetta. Le icone e i testi sono sempre del colore del testo e non del brand; l'attiva si riconosce dalla pillola e dal tratto più spesso dell'icona (2 contro 1,5). Etichette a 10 pt, peso 600. Le schermate sotto le tab lasciano spazio in fondo con `useTabBarInset()`.
- **Navigazione:** c'è uno Stack alla radice con `headerShown: false`. Le tab stanno in `(tabs)/` e le sotto-pagine sono rotte dello Stack, che quando si aprono coprono la barra. Non ci sono header nativi: il titolo della tab sta nella schermata (28 pt, peso 500, colore `heading`). Le sotto-pagine hanno `SubScreenHeader`, con un cerchio bianco con la freccia indietro e il titolo centrato a 17/600.
- **Colori:** neutri freddi. Il fondo è grigio chiaro `#F1F1F4`, le superfici sono bianche, `surfaceMuted` è `#E9E9EE` e il testo `#111111`. In scuro il fondo è `#101214` e le superfici `#1B1E21`. Il colore del brand c'è uno solo (in Paniere è verde) e si usa per bottoni, badge e spunte.
- **Card:** bianche, senza bordo, raggio 18 e ombra leggera (opacità 0,05, raggio 8). Gli elementi flottanti (la barra in basso, la ricerca) hanno un'ombra più forte (0,12, raggio 16).
- **Righe:** `SettingsRow`, con un'icona outline da 22, il titolo a 16 pt, il valore in grigio, la freccia e divisori sottili. Le scelte singole mostrano un cerchio vuoto o un cerchio con la spunta, del colore del brand.
- **Etichette di sezione:** 12 pt, peso 600, MAIUSCOLE e grigie.
- **Profilo:** si apre con una card che contiene l'avatar a iniziali e il nome, poi vengono le sezioni Account (nome, lingua, aspetto), Info (versione) e Legale (termini, privacy).
- **Icone:** Hugeicons (`@hugeicons/core-free-icons`, stile Stroke Rounded), tutte scelte in `constants/icons.ts`. Sono le stesse su iOS e su Android.
- **Font:** quello di sistema. Gli stili dipendono dal tema e si scrivono con `makeStyles()`.

## Cosa fare adesso

1. ~~Studiare Paniere~~ (fatto: vedi «Lo stile di Paniere»).
2. ~~Rifare la UI dell'app con lo stesso stile~~ (fatto il 30 ottobre 2026, provata nell'anteprima web).
3. **Farla vedere a Valerio** sul telefono, accanto a Paniere, e correggere quello che non lo convince.
4. **Supabase:**
   - applicare le migrazioni (`npx supabase db push`);
   - aggiungere un `ExerciseRepository` che legge da Supabase (con `@supabase/supabase-js` e le variabili di `.env`) e usarlo al posto di quello locale;
   - verificare sul telefono.
5. Poi, nell'ordine:
   - ~~schede preimpostate, senza account~~ (le prime 2 ci sono dal 30 ottobre 2026);
   - ~~scegliere una scheda e allenarsi segnando i pesi~~ (31 ottobre 2026, da provare sul telefono);
   - account;
   - schede personalizzate e aggiunta di esercizi a una scheda;
   - diario e progressi: storico dei pesi per esercizio, record;
   - import completo del catalogo.

## Domande ancora aperte

- **Nome dell'app:** deciso il 31 ottobre 2026: **MaestraleGym**, ovunque. «MyFitnessApp» era già usato sull'App Store. Nomi tecnici: slug e scheme `maestralegym`, bundle ID `com.maestralelabs.maestralegym`, pacchetto npm `maestralegym`, repository `MaestraleGym-mobile-app`. Icona e splash sono ancora quelli del template Expo.
- **Animazioni:** per ora si tengono le **GIF originali** del dataset. Vanno a scatti già all'origine (il lat pulldown ha 12 fotogrammi a 180×180 px, con pause di 1 s), e ricalcarle o interpolarle senza licenza non si può. Il 30 ottobre 2026 è stato provato un prototipo nostro (una figura SVG animata in codice), ma a Valerio non è piaciuto («terribile») ed è stato tolto. Resta aperta la licenza Gym visual prima del rilascio.
- **Testi legali** definitivi e URL della privacy policy.
- **Progetto Supabase:** creato, con le migrazioni del catalogo pronte; ancora da collegare alla CLI, applicare e usare nell'app (vedi «Supabase»).
- **Struttura delle schede:** confermare la proposta della tabella unica per schede nostre e personali (vedi «Account e uso senza registrazione»).
- **Account Expo:** da creare, per le build EAS.

## Come si lavora su questo progetto

- **Lingua:** Valerio scrive in italiano, quindi si risponde in italiano. Il codice e i commenti nel codice sono in inglese; README e documenti in `docs/` sono in italiano.
- **Fine lavoro:** a ogni lavoro concluso, commit e push.
- **Prima di consegnare:** `npm run lint`, `npm run typecheck`, `npm run format`. Il typecheck richiede di aver lanciato `npx expo start` almeno una volta, perché genera i tipi delle route. Le convenzioni del codice sono in `AGENTS.md`.
- **Verifica visiva:** nella sessione cloud si faceva con l'export web (`npx expo export --platform web`) e screenshot con Playwright, ora la barra in basso è la stessa anche sul web, quindi l'anteprima (`.claude/launch.json`, configurazione `web`) è fedele. Resta da provare su iPhone con Expo Go (ombre e safe area).
- **Server Expo che resta indietro:** il progetto sta in OneDrive e, dopo ore di lavoro, Metro può smettere di vedere le modifiche (nel log compare `EMFILE: too many open files`). Succede soprattutto quando si rinominano o spostano file. Il telefono allora riceve una versione vecchia dell'app: il 30 ottobre 2026 le tab Allenamenti ed Esercizi mostravano tutte e due gli esercizi. Dopo aver rinominato file, o se l'app non riflette le modifiche, conviene riavviare con `npx expo start --clear` e ricaricare Expo Go.
- **Documentazione Expo:** `docs.expo.dev` non era raggiungibile dalla sessione cloud, quindi le API sono state verificate sui tipi in `node_modules`. In locale conviene consultare la documentazione dell'SDK 58, come indica `AGENTS.md`.

## Cronologia

1. **Richiesta iniziale.** Valerio presenta l'app (testo integrale qui sotto). Viene creata la base: due tab, 2 esercizi dal dataset, profilo, tema arancione, IT/EN. Lint, typecheck e bundle iOS/Android/web passano, e il flusso è provato nell'anteprima web. Non è stata provata su un dispositivo reale.
2. **Feedback.** «Come UI ancora non ci siamo… se ti guardi come abbiamo fatto Paniere puoi molto migliorare l'applicazione… la bottom navigation non va bene». Valerio sceglie di dare accesso al repo di Paniere e vuole la barra in basso come quella di Paniere. Il repo non era però collegabile dalla sessione cloud.
3. **Passaggio al computer locale.** Valerio chiede di salvare in questo file tutto quello che ci si è detti, per riprendere la chat dal suo computer con accesso a tutti i repository.
4. **Supabase.** Dal computer locale si verifica che commit e push funzionano. Valerio fornisce il progetto Supabase: URL e chiave pubblica vanno in `.env` e viene creata la cartella `supabase/`. Il collegamento della CLI resta da fare.
5. **Piano e prime tabelle** (di nuovo nella sessione cloud). Valerio propone:
   - esercizi in una tabella pubblica;
   - schede personalizzate solo con account, più avanti;
   - pesi e recuperi più avanti;
   - app usabile senza registrazione, con schede preimpostate; registrazione per salvare record e progressi.

   Claude concorda e propone la tabella unica per le schede. Valerio chiede di caricare per ora solo 2 esercizi e vuole dare l'accesso a Expo. Viene scritta e provata in locale la migrazione `exercises`; la sessione cloud non raggiunge né Supabase né Paniere.

6. **Expo.** Valerio fa il login con Supabase e aggiunge la repo di Paniere in locale (`../paniere-mobile-app`). Si crea il progetto Expo `@maestrale-lab/fitness` e si aggiunge `eas.json`; App Store Connect si rimanda alla prima pubblicazione.
7. **UI come Paniere.** Si studia Paniere (vedi «Lo stile di Paniere») e si rifà la UI di Fitness: barra a pillola flottante con tab JavaScript, niente header nativi, card bianche, righe in stile impostazioni, icone Hugeicons, neutri freddi con l'arancione come unico colore del brand. Provata nell'anteprima web, in chiaro e in scuro.
8. **Animazioni e più esercizi.** Le GIF del dataset vanno a scatti. Un prototipo di animazione nostra viene scartato da Valerio, quindi si tengono le GIF originali. Si caricano 30 esercizi, 5 o 6 per gruppo (schiena, gambe, glutei, bicipiti, petto), con i nomi e i testi italiani scritti a mano, e la lista si filtra per gruppo muscolare.
9. **Schede.** Valerio chiede le prime schede, per l'aumento muscolare e di livello principiante, in una nuova sezione della navigazione («My Workout, qualcosa di questo genere»). Si aggiunge la tab **Allenamenti** con 2 schede, Full body (3 giorni) e Upper/Lower (4 giorni). Si caricano i 6 esercizi che mancavano, per un totale di 36.
10. **Allenamenti per primi e schede a giorni.** Valerio chiede di mettere Allenamenti come prima sezione e di dividere le schede per giorni (Giorno 1, 2, 3) invece che in allenamento A e B, «pazienza se giorno 1 è uguale al giorno 3».
11. **«Schede».** Valerio fa rinominare la sezione «I miei allenamenti» in «Schede», perché lì ci sono le schede. Chiede anche se si può già «aggiungere una scheda al proprio percorso» e vederla in una home, o se serve prima il login.
12. **Statistiche anonime.** Valerio vuole sapere quante persone usano l'app senza obbligarle a registrarsi. Si decide: percorso salvato sul telefono, e un contatore anonimo su Supabase con installazioni, utenti attivi, ritorni ed eventi. Si collega la CLI di Supabase, si scrive la migrazione `analytics`, si aggiungono il tracciamento nell'app, l'interruttore nel profilo e i testi in privacy e termini.
13. **Feedback.** Valerio chiede di poter ricevere feedback anche da chi non è registrato. Si aggiunge la pagina «Invia un feedback» nel profilo, con categoria e minimo 10 caratteri, senza limiti di invio, e la tabella `public.feedbacks` su Supabase (applicata e provata).
14. **Nome: MaestraleGym.** «MyFitnessApp» è già preso sull'App Store; Valerio sceglie «MaestraleGym», registra l'App ID `com.maestralelabs.maestralegym` con notifiche push e Sign In with Apple, e crea l'app su App Store Connect.
15. **MaestraleGym ovunque.** Valerio chiede di usare il nuovo nome dappertutto. Si rinominano il repository GitHub, il progetto Expo (nuovo `@maestrale-lab/maestralegym`), slug, scheme, pacchetto npm e la sessione di lavoro; l'Apple ID dell'app va in `eas.json`. Valerio rinomina anche il progetto Supabase dalla dashboard.
16. **Percorso e allenamento.** Valerio vuole poter scegliere una scheda e allenarsi davvero. Nuova barra Home · Esercizi · Profilo; le schede diventano livelli e finiscono nella tab Esercizi (vista Schede); dalla Home si avvia l'allenamento, un esercizio alla volta, con pesi e ripetizioni che ripartono dall'ultima volta.
17. **Una serie alla volta.** Provando l'allenamento sull'iPhone, Valerio nota che una serie aggiunta per sbaglio non si può togliere, e chiede un flusso diverso: kg e ripetizioni già impostate, «avanti», recupero che continua a contare se ci si riposa di più, poi la serie successiva. Si rifà la schermata così e si aggiunge «Rimuovi serie».
18. **Più semplice.** Anche la versione una serie alla volta è troppo complessa per Valerio. Si riparte dall'essenziale: esercizi in una lista a fisarmonica (prima una striscia orizzontale in alto, poi cambiata su suggerimento di Valerio), tabella delle serie con kg, ripetizioni e spunta, passaggio automatico all'esercizio successivo e chiusura automatica a fine allenamento; via timer e bottoni extra.
19. **Calendario.** Valerio vuole vedere nella Home la settimana corrente, con i giorni di allenamento e di riposo previsti dalla scheda e gli allenamenti fatti nel giorno in cui sono stati fatti davvero. La settimana della scheda si conta ora sul calendario dalla data di inizio.

### Richiesta iniziale (testo integrale)

> Allora, ti presento questa nuova app che per adesso sarà fatta solo per Apple e non è detto che la faremo anche per Android, quindi dovrà essere scritta in modo tale che possa reggere tutte e due, sia Apple che Android, però sicuramente la rilasceremo prima per Apple. Quindi tendenzialmente sarà molto uguale a quella che già abbiamo fatto di paniere. Però questa app si concentrerà principalmente sul fitness, quindi mi darà la possibilità di vedere tutti quelli che sono gli esercizi che posso fare a tutti gli effetti. Quindi i macchinari, cioè non i macchinari, però per esempio, che ne so, voglio fare la lat machine e quant'altro. E con la possibilità di avere poi delle schede, diciamo, personalizzate o comunque delle schede che forniremo noi. E tu avrai la possibilità di segnarti, diciamo, giorno per giorno quello che stai facendo, i tuoi progressi e quant'altro, però dobbiamo partire in maniera semplice. Non so se dovremo subito collegarci a un database di Supabase, secondo me sì, e quindi ti dovrò sicuramente più in là fornire il database di Supabase, anche se mi piacerebbe trovare una maniera per non darti subito un database, però vediamo, perché probabilmente a te il database di Supabase ti servirà fin dall'inizio, quindi sarà una cosa che dovremo capire, ecco. E mi devi cercare una repository su GitHub che contiene una lista open source di tutti quelli che sono gli esercizi che puoi fare in palestra, hanno addirittura le GIF animate ed è una cosa che a noi ci servirebbe, perché in quella maniera tu potresti avere una lista tipo di esercizi. Quindi mi immagino una sezione dedicata agli esercizi dove vedi tutti questi esercizi e puoi scegliere poi questi esercizi se te li vuoi aggiungere a un tuo piano personalizzato, o comunque noi ti forniremo sempre dei piani personalizzati. Però inizierei intanto da due semplici sezioni nella navigazione, una relativa proprio agli esercizi, e ci andrà a mettere tutti questi esercizi che provengono da GitHub. Per adesso caricane solamente due per vedere un pochino come viene la lista di tutti gli esercizi, che poi entri dentro e vedi il dettaglio con le GIF e quant'altro e come devi seguirlo. E poi un'altra sezione dedicata invece al profilo, che puoi vedere un po' come abbiamo fatto con paniere, cioè lì dentro ci abbiamo per esempio i termini e condizioni, la privacy, il nome, il tema, la lingua. Per adesso come lingua fai solamente italiano e inglese. E poi niente, ti direi di iniziare da queste due parti. Poi te l'ho detto, sicuramente ti dovrò fornire sicuramente il database per collegarti a Supabase, però intanto partiamo così e vediamo un attimo. E prendi molto spunto da paniere, perché paniere è fatta molto bene sia per Apple che per per Android, quindi come colori, funzionamento, stile e quant'altro puoi tranquillamente prendere spunto da paniere, ecco. Come colore di brand scegli tu, secondo me possiamo usare una sorta di arancione per un'app del fitness, quindi vedi tu un arancione carino, magari stile Claude e quant'altro.
