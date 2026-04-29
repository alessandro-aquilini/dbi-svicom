export type DocumentCategory = 'verbale' | 'contratto' | 'compliance' | 'preventivo' | 'regolamento' | 'bilancio' | 'lavori';

export interface SvicomDocument {
	id: string;
	title: string;
	category: DocumentCategory;
	propertyId: string;
	summary: string;
	uploadedBy: string; // References User.id
	updatedAt: string;
	status: string;
	url: string;
	type: 'pdf' | 'doc' | 'image';
}

export const documents: SvicomDocument[] = [
	{
		id: 'doc-marconi-regolamento',
		title: 'Regolamento condominiale',
		category: 'regolamento',
		propertyId: 'cnd-marconi-14',
		summary: 'Uso spazi comuni, animali, rumori e orari per attività straordinarie.',
		uploadedBy: 'adm-svicom-01',
		updatedAt: '2024-04-26',
		status: 'Essenziale',
		url: '/docs/regolamento-marconi.pdf',
		type: 'pdf'
	},
	{
		id: 'doc-marconi-bilancio-q1',
		title: 'Ripartizione spese primo trimestre',
		category: 'bilancio',
		propertyId: 'cnd-marconi-14',
		summary: 'Dettaglio costi per pulizie, ascensore, energia comune e giardinaggio.',
		uploadedBy: 'adm-svicom-01',
		updatedAt: '2024-04-28',
		status: 'Aggiornato',
		url: '/docs/bilancio-q1-marconi.pdf',
		type: 'pdf'
	},
	{
		id: 'doc-carducci-preventivo-scale',
		title: 'Preventivo tinteggiatura scale',
		category: 'preventivo',
		propertyId: 'cnd-carducci-21',
		summary: 'Tre offerte comparate con tempi, materiali e validità.',
		uploadedBy: 'adm-svicom-01',
		updatedAt: '2024-04-28',
		status: 'In valutazione',
		url: '/docs/preventivo-scale-carducci.pdf',
		type: 'pdf'
	}
];

export function getDocumentsByPropertyId(propertyId: string): SvicomDocument[] {
	return documents.filter((d) => d.propertyId === propertyId);
}

export function getDocumentById(id: string): SvicomDocument | undefined {
	return documents.find((d) => d.id === id);
}
