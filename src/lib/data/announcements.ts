export type AnnouncementCategory = 'official' | 'community' | 'proposal' | 'service';

export interface Announcement {
	id: string;
	title: string;
	content: string;
	category: AnnouncementCategory;
	propertyId: string;
	createdBy: string; // References User.id
	createdAt: string;
	pinned?: boolean;
	tags?: string[];
}

export const announcements: Announcement[] = [
	{
		id: 'ann-001',
		title: 'Convocazione assemblea ordinaria del 1 maggio',
		content: 'L\'ordine del giorno è stato pubblicato. Gli allegati sono disponibili nell\'area documenti. Potete caricare le deleghe entro il 29 aprile.',
		category: 'official',
		propertyId: 'cnd-marconi-14',
		createdBy: 'adm-svicom-01',
		createdAt: '2024-04-20T09:20:00Z',
		pinned: true,
		tags: ['Assemblea', 'Ufficiale']
	},
	{
		id: 'ann-002',
		title: 'Chiusura acqua programmata scala B',
		content: 'Intervento di manutenzione previsto mercoledì mattina (08:30 - 12:30). Si prega di non utilizzare l\'acqua durante questa fascia oraria.',
		category: 'service',
		propertyId: 'cnd-marconi-14',
		createdBy: 'adm-svicom-01',
		createdAt: '2024-04-28T08:10:00Z',
		tags: ['Manutenzione', 'Acqua']
	},
	{
		id: 'ann-003',
		title: 'Proposta nuovo spazio biciclette coperto',
		content: 'Alcuni residenti propongono di riconvertire parte della sala comune in un deposito bici sicuro. Esprimete il vostro parere nei commenti.',
		category: 'proposal',
		propertyId: 'cnd-marconi-14',
		createdBy: 'res-bianchi-01',
		createdAt: '2024-04-27T18:40:00Z',
		tags: ['Proposta', 'Bici']
	}
];

export function getAnnouncementsByPropertyId(propertyId: string): Announcement[] {
	return announcements.filter((a) => a.propertyId === propertyId);
}
