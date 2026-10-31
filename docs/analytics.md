# Statistiche anonime d'uso

L'app conta installazioni, utenti attivi e ritorni, e registra alcuni eventi d'uso, senza account e senza dati personali. Deciso con Valerio il 30 ottobre 2026.

## Come funziona

- Al primo avvio l'app crea un **codice casuale** (UUID) e lo salva sul telefono. Non contiene nome, email, posizione o identificativi del dispositivo. Se si cancella l'app, il codice si perde e una nuova installazione ne crea uno nuovo.
- Ogni evento ha un nome (per esempio `app_open`), data e ora, eventuali proprietà (per esempio l'id della scheda), il sistema (iOS o Android), la versione dell'app e la lingua del dispositivo.
- Gli eventi si mettono **in coda sul telefono** e partono a gruppi di massimo 50, qualche secondo dopo. Se si è offline (in palestra capita) restano in coda e partono alla prossima apertura. La coda tiene al massimo gli ultimi 500 eventi.
- Si possono **disattivare** da Profilo › Privacy › Statistiche anonime. Da quel momento l'app non invia più nulla e cancella la coda.
- Gli eventi mandati da Expo Go o dal simulatore sono segnati come `is_dev` e non compaiono nei report.
- Privacy policy e termini lo spiegano (`src/features/legal/documents.ts`). Quando l'app andrà sullo store, nella scheda privacy dell'App Store vanno indicati «Identificativi: ID utente» e «Dati d'uso: interazioni con il prodotto», non collegati all'identità e non usati per il tracciamento. Il popup di Apple sul tracciamento non serve.

## Nel codice

- `src/features/analytics/events.ts`: l'elenco degli eventi con le loro proprietà. Un evento nuovo si aggiunge qui.
- `src/features/analytics/client.ts`: `track('nome', { … })`, la coda e l'invio.
- `src/features/analytics/use-analytics-lifecycle.ts`: `app_open` all'avvio e ogni volta che l'app torna in primo piano.

| Evento | Quando | Proprietà |
|---|---|---|
| `app_open` | apertura dell'app o ritorno in primo piano | — |
| `plan_viewed` | apertura del dettaglio di una scheda | `planId` |
| `exercise_viewed` | apertura del dettaglio di un esercizio | `exerciseId` |
| `plan_added` | «Inizia questa scheda» | `planId`, `level` |
| `workout_started` | inizio di un allenamento | `planId`, `day` |
| `workout_completed` | allenamento terminato (con almeno una serie) | `planId`, `day`, `exercisesDone`, `exercisesSkipped` |
| `plan_completed` | fatti tutti gli allenamenti della scheda | `planId`, `level` |

## Su Supabase

La migrazione è `supabase/migrations/20261030160000_create_analytics.sql`.

- I dati stanno nello schema **`analytics`**, che l'API non espone. L'app non può leggere nulla.
- L'app può solo aggiungere eventi, chiamando la funzione `public.track_events`. La funzione controlla il formato, accetta al massimo 50 eventi per volta e, se l'orologio del telefono è sbagliato (più di 30 giorni indietro o di un giorno avanti), usa l'ora del server.
- I report si leggono dalla dashboard di Supabase, nel **SQL Editor**. I giorni sono quelli del calendario italiano.

| Vista | Cosa mostra |
|---|---|
| `analytics.daily_stats` | per ogni giorno: nuove installazioni, installazioni totali, utenti attivi nel giorno, negli ultimi 7 giorni e negli ultimi 30 |
| `analytics.retention` | per giorno di installazione: quanti sono tornati il giorno dopo, nella seconda settimana e nel secondo mese |
| `analytics.event_counts` | per giorno ed evento: quante volte è successo e da quante installazioni |
| `analytics.installs` | una riga per installazione: primo e ultimo giorno, giorni di utilizzo, sistema, versione |

Esempi:

```sql
-- Gli ultimi 30 giorni
select * from analytics.daily_stats limit 30;

-- Le schede più aperte
select properties ->> 'planId' as scheda, count(distinct install_id) as persone
from analytics.real_events
where name = 'plan_viewed'
group by 1
order by 2 desc;
```

Per vedere anche gli eventi di sviluppo si interroga direttamente `analytics.events`.

## Quando arriverà l'account

Il codice casuale si collegherà all'utente al momento della registrazione, così lo storico di chi si iscrive non si perde.
