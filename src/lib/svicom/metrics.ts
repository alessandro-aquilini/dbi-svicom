/**
 * Svicom (platform orchestrator) derived metrics.
 *
 * All computations here read from the static data layer and produce
 * aggregated views for the strategic governance dashboards. No state
 * is mutated; functions are pure and deterministic for a given dataset.
 */

import { properties, type Property, type PropertyHealth } from '$lib/data/properties';
import { residents } from '$lib/data/residents';
import { users, type User } from '$lib/data/users';
import { suppliers, type Supplier } from '$lib/data/suppliers';
import { services } from '$lib/data/services';
import { tickets, getCurrentStatus, type Ticket, type TicketStatus } from '$lib/data/ticket/tickets';
import { reports, inferReportStatus } from '$lib/data/ticket/reports';
import { bookings, inferBookingStatus } from '$lib/data/ticket/booking';
import { payments, type Payment } from '$lib/data/embeds/payments';
import { invoices } from '$lib/data/embeds/invoices';
import { quotes } from '$lib/data/embeds/quotes';
import { documents } from '$lib/data/documents';
import { announcements } from '$lib/data/announcements';
import { meetings } from '$lib/data/events/meetings';
import { assemblies } from '$lib/data/events/assemblies';

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio
// ─────────────────────────────────────────────────────────────────────────────

export const totalProperties = properties.length;
export const totalUnits = properties.reduce((s, p) => s + p.units, 0);
export const totalResidents = residents.length;
export const totalAdmins = users.filter((u) => u.role === 'admin').length;
export const totalSuppliers = users.filter((u) => u.role === 'supplier').length;

export function healthDistribution(): Record<PropertyHealth, number> {
	return properties.reduce(
		(acc, p) => {
			acc[p.health] = (acc[p.health] ?? 0) + 1;
			return acc;
		},
		{ verde: 0, giallo: 0, rosso: 0 } as Record<PropertyHealth, number>
	);
}

export function statusDistribution(): Record<Property['status'], number> {
	return properties.reduce(
		(acc, p) => {
			acc[p.status] = (acc[p.status] ?? 0) + 1;
			return acc;
		},
		{ attivo: 0, onboarding: 0, 'in-uscita': 0 } as Record<Property['status'], number>
	);
}

export function isActiveTicket(t: Ticket): boolean {
	const s = getCurrentStatus(t);
	return s !== 'closed' && s !== 'paid';
}

export const activeTicketsCount = tickets.filter(isActiveTicket).length;

export function activeTicketsByProperty(propertyId: string): number {
	return tickets.filter((t) => t.propertyId === propertyId && isActiveTicket(t)).length;
}

export function openReportsByProperty(propertyId: string): number {
	return reports
		.filter((r) => r.propertyId === propertyId)
		.filter((r) => {
			const s = inferReportStatus(r);
			return s === 'nuova' || s === 'presa in carico';
		}).length;
}

export type PropertyHealthRow = {
	property: Property;
	activeTickets: number;
	openReports: number;
	residents: number;
	overduePayments: number;
};

export function buildPortfolioRows(): PropertyHealthRow[] {
	return properties.map((p) => ({
		property: p,
		activeTickets: activeTicketsByProperty(p.id),
		openReports: openReportsByProperty(p.id),
		residents: p.residentIds.length,
		overduePayments: overduePaymentsByProperty(p.id)
	}));
}

// ─────────────────────────────────────────────────────────────────────────────
// Revenue (mocked commercial model)
//
// Recurring: Svicom charges a flat per-unit management fee per month.
// Transactional: Svicom takes an intermediation fee on supplier invoices
// and a small activation fee on service bookings.
// ─────────────────────────────────────────────────────────────────────────────

export const RECURRING_FEE_PER_UNIT = 2.4; // €/unit/month (mock)
export const INTERMEDIATION_RATE = 0.05; // 5% on supplier invoices
export const ACTIVATION_FEE = 3; // € per service booking (mock)

export function monthlyRecurringRevenue(): number {
	return totalUnits * RECURRING_FEE_PER_UNIT;
}

export function intermediationRevenue(): number {
	return invoices.reduce((s, i) => s + i.amount * INTERMEDIATION_RATE, 0);
}

export function activationsRevenue(): number {
	return bookings.length * ACTIVATION_FEE;
}

export function transactionalRevenue(): number {
	return intermediationRevenue() + activationsRevenue();
}

export function totalAnnualizedRevenue(): number {
	return monthlyRecurringRevenue() * 12 + transactionalRevenue();
}

/** Return last-12-months series (mock seasonality on a flat MRR + variable transactional). */
export function revenueTrend(): Array<{ month: string; recurring: number; transactional: number }> {
	const labels = [
		'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov',
		'Dic', 'Gen', 'Feb', 'Mar', 'Apr', 'Mag'
	];
	const baseMRR = monthlyRecurringRevenue();
	const baseTx = transactionalRevenue() / 12;
	const seasonality = [0.92, 0.95, 0.7, 1.05, 1.1, 1.0, 0.85, 0.95, 1.05, 1.15, 1.2, 1.25];
	return labels.map((m, i) => ({
		month: m,
		recurring: Math.round(baseMRR * (0.9 + i * 0.01)),
		transactional: Math.round(baseTx * seasonality[i] * (1 + i * 0.04))
	}));
}

/** Naive linear projection of the next 3 months based on the last 6 of the trend. */
export function revenueProjection(): Array<{ month: string; total: number }> {
	const trend = revenueTrend();
	const last6 = trend.slice(-6).map((t) => t.recurring + t.transactional);
	const slope = (last6[5] - last6[0]) / 5;
	const base = last6[5];
	return ['Giu', 'Lug', 'Ago'].map((m, i) => ({
		month: m,
		total: Math.round(base + slope * (i + 1))
	}));
}

export function overduePaymentsByProperty(propertyId: string): number {
	return payments.filter(
		(p) => p.propertyId === propertyId && p.description.toLowerCase().includes('quota') && !p.paidAt
	).length;
}

export const totalOverduePayments = payments.filter(
	(p) => p.description.toLowerCase().includes('quota') && !p.paidAt
).length;

// ─────────────────────────────────────────────────────────────────────────────
// Administrator KPIs (mocked plausible signals)
// ─────────────────────────────────────────────────────────────────────────────

export type AdminKpi = {
	admin: User;
	propertiesManaged: number;
	openTickets: number;
	closedTickets: number;
	avgResponseHours: number;
	adoptionPct: number;
};

export function adminKpis(): AdminKpi[] {
	const admins = users.filter((u) => u.role === 'admin');
	return admins.map((admin) => {
		const managed = properties.filter((p) => p.adminId === admin.id);
		const adminTickets = tickets.filter((t) => managed.some((p) => p.id === t.propertyId));
		const open = adminTickets.filter(isActiveTicket).length;
		const closed = adminTickets.length - open;
		// Deterministic pseudo-metric derived from id hash → response hours 1-9
		const hash = [...admin.id].reduce((s, c) => s + c.charCodeAt(0), 0);
		const avgResponse = ((hash % 7) + 1) + 0.5;
		const adoption = 60 + (hash % 35);
		return {
			admin,
			propertiesManaged: managed.length,
			openTickets: open,
			closedTickets: closed,
			avgResponseHours: avgResponse,
			adoptionPct: adoption
		};
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Supplier KPIs
// ─────────────────────────────────────────────────────────────────────────────

export type SupplierKpi = {
	supplier: Supplier;
	rating: number;
	jobsCompleted: number;
	openJobs: number;
	onTimePct: number;
	feedbackCount: number;
	revenueContribution: number;
};

export function supplierKpis(): SupplierKpi[] {
	return suppliers.map((s) => {
		const jobs = tickets.filter((t) =>
			t.eventTimeline.some((e) => e.supplierId === s.id)
		);
		const open = jobs.filter(isActiveTicket).length;
		const completed = jobs.length - open;
		const supplierInvoices = invoices.filter((i) => i.supplierId === s.id);
		const revenue = supplierInvoices.reduce((sum, i) => sum + i.amount, 0);
		const hash = [...s.id].reduce((a, c) => a + c.charCodeAt(0), 0);
		const onTime = 75 + (hash % 22);
		return {
			supplier: s,
			rating: s.rating,
			jobsCompleted: completed,
			openJobs: open,
			onTimePct: onTime,
			feedbackCount: s.comments?.length ?? 0,
			revenueContribution: revenue
		};
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Condominium KPIs
// ─────────────────────────────────────────────────────────────────────────────

export type CondoKpi = {
	property: Property;
	engagementPct: number;
	recurringTicketsRate: number;
	satisfactionScore: number;
	openTickets: number;
};

export function condoKpis(): CondoKpi[] {
	return properties.map((p) => {
		const open = activeTicketsByProperty(p.id);
		const propertyTickets = tickets.filter((t) => t.propertyId === p.id);
		const recurringRate = propertyTickets.length === 0
			? 0
			: Math.min(100, (propertyTickets.length / Math.max(p.units / 4, 1)) * 100);
		const healthScore: Record<PropertyHealth, number> = { verde: 4.6, giallo: 3.8, rosso: 2.9 };
		const hash = [...p.id].reduce((a, c) => a + c.charCodeAt(0), 0);
		const engagement = 40 + (hash % 50);
		return {
			property: p,
			engagementPct: engagement,
			recurringTicketsRate: Math.round(recurringRate),
			satisfactionScore: healthScore[p.health],
			openTickets: open
		};
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Cross-condominium insights (AI-flavoured aggregations)
// ─────────────────────────────────────────────────────────────────────────────

export function recurringIssues(): Array<{ category: string; count: number; properties: number }> {
	const map = new Map<string, { count: number; properties: Set<string> }>();
	for (const t of tickets) {
		const entry = map.get(t.category) ?? { count: 0, properties: new Set() };
		entry.count += 1;
		entry.properties.add(t.propertyId);
		map.set(t.category, entry);
	}
	for (const r of reports) {
		const entry = map.get(r.category) ?? { count: 0, properties: new Set() };
		entry.count += 1;
		entry.properties.add(r.propertyId);
		map.set(r.category, entry);
	}
	return [...map.entries()]
		.map(([category, { count, properties }]) => ({
			category,
			count,
			properties: properties.size
		}))
		.toSorted((a, b) => b.count - a.count);
}

export function bestSuppliersByCategory(): Array<{ category: string; supplier: Supplier }> {
	const map = new Map<string, Supplier>();
	for (const s of suppliers) {
		const current = map.get(s.category);
		if (!current || s.rating > current.rating) map.set(s.category, s);
	}
	return [...map.entries()].map(([category, supplier]) => ({ category, supplier }));
}

export function seasonalityHints(): Array<{ label: string; copy: string; tone: 'info' | 'warning' }> {
	return [
		{
			label: 'Caldaie · Ottobre-Novembre',
			copy: 'Picco di interventi termoidraulici previsto nei prossimi 60 giorni in base agli storici.',
			tone: 'warning'
		},
		{
			label: 'Ascensori · Quadrimestre estivo',
			copy: 'Riduzione storica del 18% delle richieste su ascensori da giugno a settembre.',
			tone: 'info'
		},
		{
			label: 'Pulizie spazi comuni · Primavera',
			copy: 'Aumento attese di prenotazione servizi residenziali tra marzo e maggio.',
			tone: 'info'
		}
	];
}

export function anomalies(): Array<{
	propertyId: string;
	title: string;
	description: string;
	severity: 'alta' | 'media' | 'bassa';
}> {
	const out: ReturnType<typeof anomalies> = [];
	for (const p of properties) {
		const open = activeTicketsByProperty(p.id);
		if (open >= 1 && p.health === 'rosso') {
			out.push({
				propertyId: p.id,
				title: 'Cluster di interventi in immobile a rischio',
				description: `${p.name} presenta ${open} ticket attivi con health rosso. Possibile escalation.`,
				severity: 'alta'
			});
		}
		if (p.status === 'in-uscita') {
			out.push({
				propertyId: p.id,
				title: 'Immobile in uscita dal portafoglio',
				description: `${p.name} risulta in fase di disattivazione: verificare clausole di chiusura.`,
				severity: 'media'
			});
		}
	}
	return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Compliance
// ─────────────────────────────────────────────────────────────────────────────

export type ComplianceRequirement = {
	key: string;
	label: string;
	description: string;
};

export const complianceRequirements: ComplianceRequirement[] = [
	{ key: 'regolamento', label: 'Regolamento condominiale', description: 'Documento di governance interno.' },
	{ key: 'bilancio', label: 'Bilancio consuntivo', description: 'Bilancio dell\'ultimo esercizio.' },
	{ key: 'verbale', label: 'Verbale ultima assemblea', description: 'Minute formali pubblicate.' },
	{ key: 'compliance', label: 'Documentazione compliance', description: 'DURC, antincendio, ascensori.' },
	{ key: 'contratto', label: 'Contratti fornitori attivi', description: 'Contratti firmati e in vigore.' }
];

export type ComplianceRow = {
	property: Property;
	checks: Record<string, boolean>;
	scorePct: number;
};

export function complianceMatrix(): ComplianceRow[] {
	return properties.map((p) => {
		const propertyDocs = documents.filter((d) => d.propertyId === p.id);
		const checks: Record<string, boolean> = {};
		for (const req of complianceRequirements) {
			checks[req.key] = propertyDocs.some((d) => d.category === req.key);
		}
		// Fake: assemblies count satisfies verbale; tickets-with-quote satisfies contratto
		if (assemblies.some((a) => a.propertyId === p.id && a.status === 'svolta')) {
			checks.verbale = true;
		}
		const total = complianceRequirements.length;
		const passed = Object.values(checks).filter(Boolean).length;
		return {
			property: p,
			checks,
			scorePct: Math.round((passed / total) * 100)
		};
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Service catalogue
// ─────────────────────────────────────────────────────────────────────────────

export type CatalogueEntry = {
	id: string;
	name: string;
	category: string;
	rating: number;
	supplierId: string;
	availability: string;
	enabledProperties: number;
	availableProperties: number;
	pricing: string;
	contactEmail?: string;
};

export function catalogueEntries(): CatalogueEntry[] {
	return services.map((s) => ({
		id: s.id,
		name: s.name,
		category: s.category,
		rating: s.rating,
		supplierId: s.supplierId,
		availability: s.availabilityText ?? 'Su disponibilità',
		enabledProperties: s.enabledAtPropertyIds.length,
		availableProperties: s.availableAtPropertyIds.length,
		pricing: s.pricing,
		contactEmail: s.contactEmail
	}));
}

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding pipeline
// ─────────────────────────────────────────────────────────────────────────────

export type OnboardingStage =
	| 'invito'
	| 'configurazione'
	| 'verifica-documenti'
	| 'attivazione';

export type OnboardingItem = {
	id: string;
	name: string;
	target: 'condominio' | 'amministratore' | 'fornitore';
	stage: OnboardingStage;
	progress: number;
	startedAt: string;
	owner: string;
};

export function onboardingPipeline(): OnboardingItem[] {
	const out: OnboardingItem[] = [];

	for (const p of properties) {
		if (p.status === 'onboarding') {
			out.push({
				id: `onb-${p.id}`,
				name: p.name,
				target: 'condominio',
				stage: 'configurazione',
				progress: 65,
				startedAt: '2026-04-12',
				owner: 'Studio Svicom Milano'
			});
		}
	}

	// Mock pending invitations for admins/suppliers
	out.push({
		id: 'onb-admin-newdraft',
		name: 'Studio Andreasi & Boleso (espansione)',
		target: 'amministratore',
		stage: 'verifica-documenti',
		progress: 80,
		startedAt: '2026-04-30',
		owner: 'Svicom HQ'
	});
	out.push({
		id: 'onb-supplier-edilstar',
		name: 'EdilStar Manutenzioni',
		target: 'fornitore',
		stage: 'invito',
		progress: 25,
		startedAt: '2026-05-08',
		owner: 'Svicom HQ'
	});
	out.push({
		id: 'onb-supplier-energie',
		name: 'Energie Verdi srl',
		target: 'fornitore',
		stage: 'attivazione',
		progress: 95,
		startedAt: '2026-04-02',
		owner: 'Svicom HQ'
	});

	return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Operational signals (for the dashboard alerts column)
// ─────────────────────────────────────────────────────────────────────────────

export type EcosystemAlert = {
	id: string;
	title: string;
	body: string;
	tone: 'destructive' | 'warning' | 'info';
	href?: string;
};

export function ecosystemAlerts(): EcosystemAlert[] {
	const alerts: EcosystemAlert[] = [];

	for (const p of properties) {
		if (p.health === 'rosso') {
			alerts.push({
				id: `health-${p.id}`,
				title: `${p.name} · health critica`,
				body: 'Verificare ticket aperti e ultima ispezione operativa.',
				tone: 'destructive',
				href: '/svicom/portfolio'
			});
		}
	}

	const critical = tickets.filter((t) => t.priority === 'critica' && isActiveTicket(t));
	for (const t of critical) {
		alerts.push({
			id: `tkt-${t.id}`,
			title: `Ticket critico aperto`,
			body: t.title,
			tone: 'destructive',
			href: '/svicom/portfolio'
		});
	}

	if (totalOverduePayments > 0) {
		alerts.push({
			id: 'pay-overdue',
			title: `${totalOverduePayments} quote condominiali scadute`,
			body: 'Aggregato cross-portafoglio. Aprire la procedura di sollecito coordinato.',
			tone: 'warning',
			href: '/svicom/revenue'
		});
	}

	return alerts.slice(0, 6);
}

// ─────────────────────────────────────────────────────────────────────────────
// Currency formatter
// ─────────────────────────────────────────────────────────────────────────────

export const eurFormatter = new Intl.NumberFormat('it-IT', {
	style: 'currency',
	currency: 'EUR',
	maximumFractionDigits: 0
});

export const eurDetailedFormatter = new Intl.NumberFormat('it-IT', {
	style: 'currency',
	currency: 'EUR',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

// Re-exports for convenience
export { properties, tickets, reports, suppliers, services, users, payments, invoices, quotes, residents, announcements, meetings, assemblies, bookings };
