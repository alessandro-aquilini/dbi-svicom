<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { Report } from '$lib/data/ticket/reports';
	import { getCurrentStatus } from './presentation';
	import TicketPriorityBadge from './TicketPriorityBadge.svelte';
	import TicketStatusBadge from './TicketStatusBadge.svelte';

	let {
		ticket,
		href,
		propertyName,
		apartment,
		updatedAtLabel,
		operationalTicketId,
		operationalStatusLabel,
		operationalSupplierLabel
	}: {
		ticket: Report;
		href: string;
		propertyName?: string;
		apartment?: string;
		updatedAtLabel: string;
		operationalTicketId?: string;
		operationalStatusLabel?: string;
		operationalSupplierLabel?: string;
	} = $props();

	const latestStatus = $derived(getCurrentStatus(ticket));
</script>

<Card class="report-card-shell">
	<CardHeader class="report-card-shell__header">
		<div class="report-card-shell__header-main">
			<p class="report-card-shell__eyebrow">{ticket.id}</p>
			<a href={href} class="report-card-shell__title-link">
				<CardTitle class="report-card-shell__title">{ticket.title}</CardTitle>
			</a>
		</div>
		{#if latestStatus}
			<TicketStatusBadge status={latestStatus} />
		{/if}
	</CardHeader>

	<CardContent class="report-card-shell__content">
		<p class="report-card-shell__description">{ticket.description}</p>

		<div class="report-card-shell__glance">
			<span class="report-card-shell__glance-item">{propertyName ?? 'Condominio non disponibile'}</span>
			<span class="report-card-shell__glance-item">{apartment ?? 'Unita non disponibile'}</span>
		</div>

		<div class="report-card-shell__meta">
			<span class="report-chip">{ticket.category}</span>
			<TicketPriorityBadge priority={ticket.priority} />
			<span class="report-chip">{ticket.statusHistory.length} step</span>
		</div>

		{#if operationalTicketId}
			<div class="report-card-shell__operational">
				<p class="report-card-shell__operational-label">Pratica operativa</p>
				<p class="report-card-shell__operational-value">{operationalTicketId}</p>
				<p class="report-card-shell__operational-copy">
					{operationalStatusLabel ?? 'Operativa'}{#if operationalSupplierLabel} · {operationalSupplierLabel}{/if}
				</p>
			</div>
		{/if}
	</CardContent>

	<CardFooter class="report-card-shell__footer">
		<div class="report-card-shell__footer-copy">
			<p class="report-card-shell__footer-label">Ultimo aggiornamento</p>
			<p class="report-card-shell__footer-value">{updatedAtLabel}</p>
		</div>

		<Button href={href} size="lg" class="report-card-shell__button">
			Apri dettaglio
		</Button>
	</CardFooter>
</Card>
