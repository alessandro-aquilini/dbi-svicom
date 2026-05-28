/**
 * Stato condiviso per il flusso rapido di segnalazione del residente.
 *
 * La home apre il selettore foto nativo e, alla scelta del file, salva qui
 * un object URL + metadati. La pagina di anteprima li consuma per mostrare
 * la foto e inviare la segnalazione. Solo memoria di sessione: nessuna
 * persistenza, l'URL vive finché la tab è aperta.
 */

import { browser } from '$app/environment';

export type QuickReportPhoto = {
	url: string;
	name: string;
	type: string;
	size: number;
};

class QuickReportState {
	photo: QuickReportPhoto | null = $state(null);

	setPhoto(file: File) {
		if (!browser) return;
		this.clear();
		this.photo = {
			url: URL.createObjectURL(file),
			name: file.name,
			type: file.type,
			size: file.size
		};
	}

	clear() {
		if (this.photo?.url) {
			URL.revokeObjectURL(this.photo.url);
		}
		this.photo = null;
	}
}

export const quickReport = new QuickReportState();
