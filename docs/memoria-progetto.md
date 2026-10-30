# Memoria del progetto

Questo file raccoglie tutto quello che è stato deciso finora su Fitness, perché chi riprende il lavoro (una persona o Claude in una nuova sessione) parta da qui senza dover rileggere le chat. Va aggiornato a ogni decisione importante.

Ultimo aggiornamento: 30 ottobre 2026.

## Dove siamo arrivati

- La base dell'app c'è: tab **Esercizi** (lista, ricerca, filtro, dettaglio con GIF) e tab **Profilo** (nome, tema, lingua, termini, privacy, versione). Il primo commit è `986624b` sul branch `claude/tender-archimedes-lr4kab`.
- Valerio ha visto il risultato e **la UI non lo convince ancora**: va rifatta prendendo lo stile da **Paniere**, a partire dalla **barra di navigazione in basso**, che non va bene.
- Paniere non era raggiungibile dalla sessione cloud in cui è nata l'app (vedi «Paniere» più sotto). Valerio sta per collegarlo.
- La tabella Supabase degli esercizi è pronta come migrazione in `supabase/migrations/` (con i 2 esercizi di prova) ed è stata provata su un Postgres locale. **Non è ancora applicata al progetto**, e l'app legge ancora gli esercizi dal codice.
- Il repository GitHub è stato rinominato da `Maestrale-Labs/Fitness` a `Maestrale-Labs/MyFitness-mobile-app`.

**Prossimi passi** (si parte da quello che si sblocca prima):
- studiare Paniere e rifare la UI di Fitness nello stesso stile;
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
- **Tab native** (`expo-router/native-tabs`): su iOS la tab bar di sistema con le SF Symbols, su Android quella Material. Sul web, che è solo un'anteprima di sviluppo, c'è una barra fatta a mano in `src/components/app-tabs.web.tsx`. Visto il feedback, questa scelta va rivista sulla base di Paniere.
- **Lingue:** i18next. `src/i18n/locales/it.ts` è il riferimento ed `en.ts` è tipizzato contro di esso. La lingua «automatica» segue quella del dispositivo; se non è italiano o inglese si usa l'inglese.
- **Preferenze** (nome, tema, lingua): zustand salvato con AsyncStorage (`src/features/settings/store.ts`). Lo splash resta visibile finché le preferenze non sono state lette, per evitare un lampo del tema sbagliato.
- **Tema:** token in `src/constants/theme.ts` con sfondi crema e grigio caldo. `brand` (`#E8622C`) è l'arancione decorativo; `tint` è l'accento per testi, icone e selezioni (`#BF4417` in chiaro, `#F07A3E` in scuro), scelto per restare leggibile secondo WCAG AA.
- **Dati degli esercizi:** le schermate leggono da `ExerciseRepository` (`src/features/exercises/repository.ts`) tramite React Query. Oggi l'implementazione è locale (`data/seed.ts`); per passare a Supabase basta scriverne una seconda.

### Supabase

- **Il progetto c'è** (30 ottobre 2026): ref `xkczxrhdligtguxcoitq`, URL `https://xkczxrhdligtguxcoitq.supabase.co`. L'app non lo usa ancora: gli esercizi sono nel codice e le preferenze restano sul telefono. Servirà con le schede personalizzate e il diario, cioè quando servono account, dati legati all'utente (con regole RLS) e sincronizzazione. Il catalogo degli esercizi potrà essere pubblico in sola lettura. Il piano completo è in `docs/exercise-data.md`.
- **Chiavi nell'app:** `.env` contiene solo `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_KEY` (la chiave *publishable*, fatta apposta per stare nel client). È nel repository, così le build EAS la trovano.
- **Cosa non va mai nel repository** (che è pubblico) né nell'app: la chiave *service role*, la password del database e il token personale `sbp_…`. Si tengono fuori dal codice e si passano alla CLI da terminale.
- **CLI:** `supabase/` è stato creato con `supabase init`. Per il collegamento (`supabase link --project-ref xkczxrhdligtguxcoitq`) serve un login con l'account che possiede il progetto, perché quello che era già collegato sul computer (organizzazione di Paniere e Hommy) non ha accesso.
- **Tabelle:** si definiscono solo come migrazioni in `supabase/migrations/` e si applicano con `npx supabase db push`. La prima è `public.exercises`, il catalogo pubblico:
  - lettura per tutti, anche senza account;
  - nessuna scrittura con le chiavi dell'app;
  - solo 2 esercizi per ora, perché Valerio vuole vedere come vengono prima di caricarne altri.

  Dettagli in `docs/exercise-data.md`.
- **Dalla sessione cloud** Supabase non era raggiungibile: la rete bloccava `*.supabase.co` e `api.supabase.com`, e non c'erano credenziali fra le variabili d'ambiente. Le chiavi incollate nella sessione sul computer non passano alla sessione cloud. Per lavorarci dal cloud servono:
  - i due domini nella lista dei domini consentiti delle impostazioni di rete dell'ambiente;
  - un token come variabile d'ambiente segreta, da non scrivere mai in chat o nel repository.

  In alternativa le migrazioni si applicano dal computer.

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

### Il dataset degli esercizi

- Fonte scelta: [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset), con 1.324 esercizi, GIF, istruzioni in 10 lingue (italiano compreso) e licenza MIT per dati e testi.
- **Attenzione: le GIF sono © Gym visual** e non sono coperte dalla licenza MIT. Prima di pubblicare serve una licenza da Gym visual, oppure un'alternativa come [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db) (pubblico dominio, foto fisse). Per questo le GIF non sono copiate nel repository, che è pubblico: l'app le carica dal repo originale fissato a un commit, e sotto ogni animazione mostra «© Gym visual».
- Le traduzioni italiane del dataset sono automatiche e contengono errori. Quelle dei 2 esercizi di prova sono state corrette a mano.
- Gli esercizi caricati sono 2: lat machine (`0150`) e panca piana con bilanciere (`0025`).
- I dettagli sono in `docs/exercise-data.md`.

### Profilo

- **Nome:** salvato solo sul dispositivo; in testa al profilo compaiono un avatar con le iniziali e il nome.
- **Tema:** automatico, chiaro o scuro. Viene applicato anche alle parti native dell'app tramite `Appearance.setColorScheme`.
- **Lingua:** automatica, italiano o inglese.
- **Termini e condizioni, privacy policy:** sono **bozze provvisorie**, segnalate come tali nell'app (`src/features/legal/documents.ts`). Vanno sostituite con i testi definitivi; la privacy policy deve stare anche su un URL pubblico per l'App Store.

## Paniere

- **Cos'è:** l'app di riferimento per lo stile. Va studiata prima di qualunque altro lavoro sulla UI.
- **Cosa è stato cercato:** nella sessione cloud non era accessibile. Non è tra i repository collegati e `Maestrale-Labs/Paniere` e `foddai0/paniere` non esistono o non sono accessibili. Non compare cercando sul web e sull'App Store, e non è citata nel repo `foddai0/valeriofoddai.com`.
- **Cosa non è:** `foddai0/panormus` è un gioco in Godot (un open world a Palermo), non c'entra.
- **Come procedere:** dal computer di Valerio, cercare il repo di Paniere tra quelli locali o su GitHub. Se non si trova, chiedere a Valerio dove sta.

## Cosa fare adesso

1. **Studiare Paniere.** Annotare in questo file cosa usa per:
   - la barra di navigazione in basso (nativa o personalizzata, flottante o no, icone, etichette, indicatore);
   - colori e tipografia (font, dimensioni, pesi);
   - card, liste e righe, raggi degli angoli, ombre;
   - le intestazioni delle schermate;
   - la schermata profilo (struttura, sezioni, righe);
   - librerie e componenti condivisi che si possono riprendere.
2. **Rifare la UI di Fitness con lo stesso stile,** tenendo l'arancione come colore del brand. Si parte dalla barra di navigazione in basso, poi lista esercizi, dettaglio e profilo.
3. **Mostrare a Valerio gli screenshot affiancati** di Paniere e Fitness prima di chiudere il lavoro.
4. **Supabase:**
   - applicare le migrazioni (`npx supabase db push`);
   - aggiungere un `ExerciseRepository` che legge da Supabase (con `@supabase/supabase-js` e le variabili di `.env`) e usarlo al posto di quello locale;
   - verificare sul telefono.
5. Poi, nell'ordine:
   - schede preimpostate, senza account;
   - account;
   - schede personalizzate e aggiunta di esercizi a una scheda;
   - diario giornaliero, pesi, recuperi e record;
   - import completo del catalogo.

## Domande ancora aperte

- **Nome dell'app:** per ora è «Fitness». Icona e splash sono ancora quelli del template Expo.
- **Animazioni:** licenza Gym visual, oppure un'altra fonte per le immagini?
- **Testi legali** definitivi e URL della privacy policy.
- **Progetto Supabase:** creato, con le migrazioni del catalogo pronte; ancora da collegare alla CLI, applicare e usare nell'app (vedi «Supabase»).
- **Struttura delle schede:** confermare la proposta della tabella unica per schede nostre e personali (vedi «Account e uso senza registrazione»).
- **Account Expo:** da creare, per le build EAS.

## Come si lavora su questo progetto

- **Lingua:** Valerio scrive in italiano, quindi si risponde in italiano. Il codice e i commenti nel codice sono in inglese; README e documenti in `docs/` sono in italiano.
- **Fine lavoro:** a ogni lavoro concluso, commit e push.
- **Prima di consegnare:** `npm run lint`, `npm run typecheck`, `npm run format`. Il typecheck richiede di aver lanciato `npx expo start` almeno una volta, perché genera i tipi delle route. Le convenzioni del codice sono in `AGENTS.md`.
- **Verifica visiva:** nella sessione cloud si faceva con l'export web (`npx expo export --platform web`) e screenshot con Playwright, ma l'anteprima web **non** rappresenta la tab bar nativa. Sul computer locale conviene provare su simulatore iOS o con Expo Go.
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

### Richiesta iniziale (testo integrale)

> Allora, ti presento questa nuova app che per adesso sarà fatta solo per Apple e non è detto che la faremo anche per Android, quindi dovrà essere scritta in modo tale che possa reggere tutte e due, sia Apple che Android, però sicuramente la rilasceremo prima per Apple. Quindi tendenzialmente sarà molto uguale a quella che già abbiamo fatto di paniere. Però questa app si concentrerà principalmente sul fitness, quindi mi darà la possibilità di vedere tutti quelli che sono gli esercizi che posso fare a tutti gli effetti. Quindi i macchinari, cioè non i macchinari, però per esempio, che ne so, voglio fare la lat machine e quant'altro. E con la possibilità di avere poi delle schede, diciamo, personalizzate o comunque delle schede che forniremo noi. E tu avrai la possibilità di segnarti, diciamo, giorno per giorno quello che stai facendo, i tuoi progressi e quant'altro, però dobbiamo partire in maniera semplice. Non so se dovremo subito collegarci a un database di Supabase, secondo me sì, e quindi ti dovrò sicuramente più in là fornire il database di Supabase, anche se mi piacerebbe trovare una maniera per non darti subito un database, però vediamo, perché probabilmente a te il database di Supabase ti servirà fin dall'inizio, quindi sarà una cosa che dovremo capire, ecco. E mi devi cercare una repository su GitHub che contiene una lista open source di tutti quelli che sono gli esercizi che puoi fare in palestra, hanno addirittura le GIF animate ed è una cosa che a noi ci servirebbe, perché in quella maniera tu potresti avere una lista tipo di esercizi. Quindi mi immagino una sezione dedicata agli esercizi dove vedi tutti questi esercizi e puoi scegliere poi questi esercizi se te li vuoi aggiungere a un tuo piano personalizzato, o comunque noi ti forniremo sempre dei piani personalizzati. Però inizierei intanto da due semplici sezioni nella navigazione, una relativa proprio agli esercizi, e ci andrà a mettere tutti questi esercizi che provengono da GitHub. Per adesso caricane solamente due per vedere un pochino come viene la lista di tutti gli esercizi, che poi entri dentro e vedi il dettaglio con le GIF e quant'altro e come devi seguirlo. E poi un'altra sezione dedicata invece al profilo, che puoi vedere un po' come abbiamo fatto con paniere, cioè lì dentro ci abbiamo per esempio i termini e condizioni, la privacy, il nome, il tema, la lingua. Per adesso come lingua fai solamente italiano e inglese. E poi niente, ti direi di iniziare da queste due parti. Poi te l'ho detto, sicuramente ti dovrò fornire sicuramente il database per collegarti a Supabase, però intanto partiamo così e vediamo un attimo. E prendi molto spunto da paniere, perché paniere è fatta molto bene sia per Apple che per per Android, quindi come colori, funzionamento, stile e quant'altro puoi tranquillamente prendere spunto da paniere, ecco. Come colore di brand scegli tu, secondo me possiamo usare una sorta di arancione per un'app del fitness, quindi vedi tu un arancione carino, magari stile Claude e quant'altro.
