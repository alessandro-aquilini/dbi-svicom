export type AssemblyType = 'ordinaria' | 'straordinaria';
export type AssemblyStatus = 'pianificata' | 'svolta' | 'annullata';
export type VoteOutcome = 'approvata' | 'respinta' | 'rinviata';

export interface Resolution {
	id: string;
	title: string;
	outcome: VoteOutcome;
	millesimalFor: number;
	millesimalAgainst: number;
	millesimalAbstain: number;
	notes?: string;
}

export interface Minutes {
	presidentId?: string; // References User.id
	secretaryId?: string; // References User.id
	attendeesCount: number;
	millesimalPresent: number;
	resolutions: Resolution[];
	text: string;
	publishedAt: string;
}

export interface Assembly {
	id: string;
	propertyId: string;
	type: AssemblyType;
	status: AssemblyStatus;
	scheduledAt: string;
	endTime?: string;
	location: string;
	agenda: string[];
	minutes?: Minutes;
}

export const assemblies: Assembly[] = [
	{
		id: 'asm-marconi-strao-2026-04-28',
		propertyId: 'cnd-marconi-14',
		type: 'straordinaria',
		status: 'svolta',
		scheduledAt: '2026-04-28T09:30',
		endTime: '11:00',
		location: 'Via Marconi 14 - Sala riunioni',
		agenda: [
			'Lavori urgenti scala B: stato e prossimi step',
			'Anticipo fondo cassa per intervento ascensore',
			'Aggiornamento copertura assicurativa cantiere'
		],
		minutes: {
			attendeesCount: 18,
			millesimalPresent: 740,
			text: 'Assemblea straordinaria convocata per autorizzare gli interventi urgenti sulla scala B. Discussione e voto sulle tre delibere previste.',
			publishedAt: '2026-04-28T10:20',
			resolutions: [
				{
					id: 'del-marconi-strao-1',
					title: 'Avvio lavori urgenti scala B',
					outcome: 'approvata',
					millesimalFor: 680,
					millesimalAgainst: 40,
					millesimalAbstain: 20,
					notes: 'Tempistiche concordate con il fornitore entro la settimana.'
				},
				{
					id: 'del-marconi-strao-2',
					title: 'Anticipo fondo cassa €12.000 per ascensore',
					outcome: 'approvata',
					millesimalFor: 590,
					millesimalAgainst: 90,
					millesimalAbstain: 60
				}
			]
		}
	},
	{
		id: 'asm-marconi-ord-2026-05-20',
		propertyId: 'cnd-marconi-14',
		type: 'ordinaria',
		status: 'pianificata',
		scheduledAt: '2026-05-20T18:30',
		location: 'Via Marconi 14 - Sala riunioni',
		agenda: [
			'Aggiornamento lavori scala B',
			'Proposte alternative per area bici',
			'Rinnovo polizza RC condominio'
		]
	}
];

export function getAssembliesByPropertyId(propertyId: string): Assembly[] {
	return assemblies.filter((a) => a.propertyId === propertyId);
}

export function getAssemblyById(id: string): Assembly | undefined {
	return assemblies.find((a) => a.id === id);
}
