export interface Message {
	id: string;
	senderId: string; // References User.id
	text: string;
	timestamp: string;
}

export interface Chat {
	id: string;
	participantIds: string[]; // References User.id
	lastMessageAt: string;
	messages: Message[];
}

export const chats: Chat[] = [
	{
		id: 'chat-001',
		participantIds: ['adm-svicom-01', 'res-bianchi-01'],
		lastMessageAt: '2024-04-29T11:00:00Z',
		messages: [
			{
				id: 'msg-001',
				senderId: 'res-bianchi-01',
				text: 'Buongiorno, ci sono novità sulla perdita d\'acqua?',
				timestamp: '2024-04-29T10:45:00Z'
			},
			{
				id: 'msg-002',
				senderId: 'adm-svicom-01',
				text: 'Sì, abbiamo incaricato Idroclima Nord. L\'intervento è previsto per oggi pomeriggio.',
				timestamp: '2024-04-29T10:50:00Z'
			}
		]
	},
	{
		id: 'chat-002',
		participantIds: ['adm-svicom-01', 'frn-idroclima-nord'],
		lastMessageAt: '2024-04-30T14:30:00Z',
		messages: [
			{
				id: 'msg-101',
				senderId: 'adm-svicom-01',
				text: 'Potete intervenire oggi per la perdita a Via Marconi 14?',
				timestamp: '2024-04-29T09:15:00Z'
			},
			{
				id: 'msg-102',
				senderId: 'frn-idroclima-nord',
				text: 'Ricevuto. Sto aprendo ticket interno e le invio il preventivo.',
				timestamp: '2024-04-29T09:20:00Z'
			},
			{
				id: 'msg-103',
				senderId: 'adm-svicom-01',
				text: 'Perfetto, grazie. Mandate documento e preventivo appena pronti.',
				timestamp: '2024-04-29T09:25:00Z'
			},
			{
				id: 'msg-104',
				senderId: 'frn-idroclima-nord',
				text: 'Preventivo caricato e inviato sulla piattaforma.',
				timestamp: '2024-04-29T12:10:00Z'
			},
			{
				id: 'msg-105',
				senderId: 'adm-svicom-01',
				text: 'Grazie. Procedete con l’intervento urgente e tenetemi aggiornato.',
				timestamp: '2024-04-29T12:15:00Z'
			},
			{
				id: 'msg-106',
				senderId: 'frn-idroclima-nord',
				text: 'Intervento completato, ticket chiuso e fattura inviata. Attendo conferma pagamento.',
				timestamp: '2024-04-30T14:25:00Z'
			},
			{
				id: 'msg-107',
				senderId: 'adm-svicom-01',
				text: 'Pagamento autorizzato e inviato.',
				timestamp: '2024-04-30T14:30:00Z'
			}
		]
	},
	{
		id: 'chat-003',
		participantIds: ['adm-svicom-02', 'frn-idroclima-nord'],
		lastMessageAt: '2024-05-01T09:00:00Z',
		messages: [
			{
				id: 'msg-201',
				senderId: 'adm-svicom-02',
				text: 'Ciao, serve un preventivo urgente per un controllo sulla colonna montante di Roma 12.',
				timestamp: '2024-05-01T08:15:00Z'
			},
			{
				id: 'msg-202',
				senderId: 'frn-idroclima-nord',
				text: 'Confermiamo. Sto preparando il preventivo tecnico e lo invio entro mezzogiorno.',
				timestamp: '2024-05-01T08:40:00Z'
			},
			{
				id: 'msg-203',
				senderId: 'adm-svicom-02',
				text: 'Perfetto, grazie. Appena pronto, caricalo come preventivo sulla pratica.',
				timestamp: '2024-05-01T08:45:00Z'
			}
		]
	},
	{
		id: 'chat-004',
		participantIds: ['adm-svicom-03', 'frn-idroclima-nord'],
		lastMessageAt: '2024-05-02T10:05:00Z',
		messages: [
			{
				id: 'msg-301',
				senderId: 'adm-svicom-03',
				text: 'Hai ricevuto il pagamento relativo all’intervento di Marconi 14? Controlla il pay-003 e fammi sapere.',
				timestamp: '2024-05-02T09:50:00Z'
			},
			{
				id: 'msg-302',
				senderId: 'frn-idroclima-nord',
				text: 'Confermo, il bonifico è stato accreditato e il ticket è chiuso.',
				timestamp: '2024-05-02T10:05:00Z'
			}
		]
	}
];

export function getChatById(id: string): Chat | undefined {
	return chats.find((c) => c.id === id);
}

export function getChatsByUserId(userId: string): Chat[] {
	return chats.filter((c) => c.participantIds.includes(userId));
}
