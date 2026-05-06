<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { Ticket } from '$lib/data/tickets-admin';
	import { getCurrentStatus } from './presentation';
	import TicketPriorityBadge from './TicketPriorityBadge.svelte';
	import TicketStatusBadge from './TicketStatusBadge.svelte';

	let {
		ticket,
		href,
		propertyName,
		apartment,
		updatedAtLabel
	}: {
		ticket: Ticket;
		href: string;
		propertyName?: string;
		apartment?: string;
		updatedAtLabel: string;
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
			<div class="report-card-shell__glance-item">
				<p class="report-card-shell__glance-label">Condominio</p>
				<p class="report-card-shell__glance-value">{propertyName ?? 'N/D'}</p>
			</div>
			<div class="report-card-shell__glance-item">
				<p class="report-card-shell__glance-label">Unita</p>
				<p class="report-card-shell__glance-value">{apartment ?? 'N/D'}</p>
			</div>
		</div>

		<div class="report-card-shell__meta">
			<span class="report-chip">{ticket.category}</span>
			<TicketPriorityBadge priority={ticket.priority} />
			<span class="report-chip">{ticket.eventTimeline.length} step</span>
		</div>
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
