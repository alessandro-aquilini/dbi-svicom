/**
 * Ripartizione presentazionale della rata condominiale del residente.
 *
 * I dati sono una semplificazione didattica: ogni voce ha una quota
 * percentuale fissa e un'icona Hugeicons per il colpo d'occhio. La somma
 * delle percentuali è 100. La pagina pagamenti usa questa lista per
 * disegnare il grafico a torta centrale che spiega "dove vanno i soldi"
 * della rata.
 */

import {
	CleanIcon,
	Plant01Icon,
	Wrench01Icon,
	SecurityCheckIcon,
	DropletIcon,
	LiftTruckIcon,
	Briefcase01Icon,
	FlashIcon
} from '@hugeicons/core-free-icons';

export interface ResidentFeeBreakdownCategory {
	key: string;
	label: string;
	share: number;
	color: string;
	icon: typeof CleanIcon;
	copy: string;
}

export const residentFeeBreakdown: ResidentFeeBreakdownCategory[] = [
	{
		key: 'cleaning',
		label: 'Pulizie',
		share: 0.22,
		color: 'var(--chart-1)',
		icon: CleanIcon,
		copy: 'Pulizia scale, ingresso e parti comuni con cadenza settimanale.'
	},
	{
		key: 'maintenance',
		label: 'Manutenzioni',
		share: 0.2,
		color: 'var(--chart-2)',
		icon: Wrench01Icon,
		copy: 'Interventi ordinari e piccole riparazioni programmate.'
	},
	{
		key: 'gardening',
		label: 'Giardinaggio',
		share: 0.13,
		color: 'var(--chart-3)',
		icon: Plant01Icon,
		copy: 'Cura del verde condominiale, potature stagionali e irrigazione.'
	},
	{
		key: 'elevator',
		label: 'Ascensore',
		share: 0.11,
		color: 'var(--chart-4)',
		icon: LiftTruckIcon,
		copy: 'Contratto di manutenzione e verifiche periodiche obbligatorie.'
	},
	{
		key: 'utilities',
		label: 'Utenze comuni',
		share: 0.12,
		color: 'var(--chart-5)',
		icon: FlashIcon,
		copy: 'Luce vani scala, citofono e consumi delle parti comuni.'
	},
	{
		key: 'water',
		label: 'Acqua',
		share: 0.08,
		color: 'oklch(0.62 0.13 220)',
		icon: DropletIcon,
		copy: 'Quota dell\'utenza idrica ripartita tra gli appartamenti.'
	},
	{
		key: 'security',
		label: 'Sicurezza',
		share: 0.08,
		color: 'oklch(0.55 0.12 30)',
		icon: SecurityCheckIcon,
		copy: 'Sorveglianza, antincendio e controlli periodici degli impianti.'
	},
	{
		key: 'admin',
		label: 'Amministrazione',
		share: 0.06,
		color: 'oklch(0.6 0.05 280)',
		icon: Briefcase01Icon,
		copy: 'Compenso amministratore, segreteria e gestione documentale.'
	}
];

export interface ResidentFeeBreakdownItem extends ResidentFeeBreakdownCategory {
	amount: number;
	percentLabel: string;
}

export function getResidentFeeBreakdown(totalAmount: number): ResidentFeeBreakdownItem[] {
	return residentFeeBreakdown.map((category) => ({
		...category,
		amount: totalAmount * category.share,
		percentLabel: `${Math.round(category.share * 100)}%`
	}));
}
