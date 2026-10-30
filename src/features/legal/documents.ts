import type { Localized } from '@/i18n';

export const LEGAL_DOCUMENTS = ['terms', 'privacy'] as const;
export type LegalDocumentId = (typeof LEGAL_DOCUMENTS)[number];

type LegalDocument = {
  /** ISO date of the last change. */
  updatedAt: string;
  sections: { heading: Localized; body: Localized }[];
};

export function isLegalDocumentId(value: string): value is LegalDocumentId {
  return LEGAL_DOCUMENTS.includes(value as LegalDocumentId);
}

// Draft content describing what the app does today. Replace with the reviewed texts
// before release (the App Store also needs the privacy policy at a public URL).
export const legalDocuments: Record<LegalDocumentId, LegalDocument> = {
  terms: {
    updatedAt: '2026-10-30',
    sections: [
      {
        heading: { it: 'Il servizio', en: 'The service' },
        body: {
          it: 'L’app offre una libreria di esercizi con istruzioni e animazioni, a scopo informativo.',
          en: 'The app provides a library of exercises with instructions and animations, for information purposes.',
        },
      },
      {
        heading: { it: 'Salute e sicurezza', en: 'Health and safety' },
        body: {
          it: 'I contenuti non sostituiscono il parere di un medico o di un professionista. Consulta un medico prima di iniziare un programma di allenamento e interrompi l’esercizio in caso di dolore o malessere.',
          en: 'The content does not replace the advice of a doctor or a professional. Talk to a doctor before starting a training program and stop exercising if you feel pain or unwell.',
        },
      },
      {
        heading: { it: 'Contenuti di terzi', en: 'Third-party content' },
        body: {
          it: 'Le animazioni degli esercizi appartengono ai rispettivi titolari dei diritti, indicati sotto ogni animazione.',
          en: 'Exercise animations belong to their respective rights holders, credited below each animation.',
        },
      },
      {
        heading: { it: 'Statistiche d’uso', en: 'Usage statistics' },
        body: {
          it: 'Per migliorare l’app raccogliamo statistiche anonime d’uso, come descritto nella privacy policy. Puoi disattivarle dal profilo.',
          en: 'To improve the app we collect anonymous usage statistics, as described in the privacy policy. You can turn them off from your profile.',
        },
      },
      {
        heading: { it: 'Modifiche', en: 'Changes' },
        body: {
          it: 'Questi termini possono essere aggiornati. La versione in vigore è sempre disponibile in questa pagina.',
          en: 'These terms may be updated. The current version is always available on this page.',
        },
      },
    ],
  },
  privacy: {
    updatedAt: '2026-10-30',
    sections: [
      {
        heading: { it: 'Dati salvati sul dispositivo', en: 'Data stored on your device' },
        body: {
          it: 'Il nome che inserisci e le preferenze di tema e lingua restano salvati solo sul tuo dispositivo e non vengono inviati a nessun server.',
          en: 'The name you enter and your theme and language preferences are stored only on your device and are not sent to any server.',
        },
      },
      {
        heading: { it: 'Statistiche anonime d’uso', en: 'Anonymous usage statistics' },
        body: {
          it: 'Per capire quante persone usano l’app e quali funzioni sono più utili, al primo avvio l’app crea un codice casuale che resta sul dispositivo. Insieme a questo codice invia alcuni eventi d’uso: l’apertura dell’app, le schede e gli esercizi visualizzati e, più avanti, le schede aggiunte e gli allenamenti completati. Invia anche la data e l’ora, il sistema operativo, la versione dell’app e la lingua del dispositivo. Non raccogliamo nome, email, posizione o identificativi del dispositivo, e non usiamo questi dati per pubblicità né li condividiamo con terzi. I dati sono conservati su Supabase, il nostro fornitore di database, con server a Londra.',
          en: 'To understand how many people use the app and which features help most, on first launch the app creates a random code that stays on your device. Along with this code it sends a few usage events: opening the app, the plans and exercises you view and, later on, the plans you add and the workouts you complete. It also sends the date and time, the operating system, the app version and the device language. We do not collect your name, email, location or device identifiers, and we do not use this data for advertising or share it with third parties. The data is stored with Supabase, our database provider, on servers in London.',
        },
      },
      {
        heading: { it: 'Disattivare le statistiche', en: 'Turning statistics off' },
        body: {
          it: 'Puoi disattivare le statistiche in qualsiasi momento da Profilo › Statistiche anonime: da quel momento l’app non invia più nulla e cancella gli eventi non ancora inviati.',
          en: 'You can turn statistics off at any time in Profile › Anonymous statistics: from then on the app sends nothing and deletes any events not yet sent.',
        },
      },
      {
        heading: { it: 'Contenuti scaricati', en: 'Downloaded content' },
        body: {
          it: 'Le immagini degli esercizi vengono scaricate da un server esterno. Come per ogni richiesta web, quel server riceve l’indirizzo IP del dispositivo.',
          en: 'Exercise images are downloaded from an external server. As with any web request, that server receives your device’s IP address.',
        },
      },
      {
        heading: { it: 'Cancellazione', en: 'Deleting your data' },
        body: {
          it: 'Puoi cancellare i dati salvati sul dispositivo, compreso il codice casuale, eliminando l’app. Le statistiche già inviate non sono collegate a te e restano solo in forma anonima.',
          en: 'You can delete the data stored on your device, including the random code, by removing the app. Statistics already sent are not linked to you and remain only in anonymous form.',
        },
      },
    ],
  },
};
