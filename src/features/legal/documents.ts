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
          it: 'Al momento l’app salva solo sul tuo dispositivo il nome che inserisci e le preferenze di tema e lingua. Questi dati non vengono inviati a nessun server.',
          en: 'Right now the app only stores the name you enter and your theme and language preferences, on your device. This data is not sent to any server.',
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
          it: 'Puoi cancellare questi dati in qualsiasi momento eliminando l’app dal dispositivo.',
          en: 'You can delete this data at any time by removing the app from your device.',
        },
      },
    ],
  },
};
