<script lang="ts">
	import type { TicketEvent } from '$lib/data/ticket/tickets';
	import { ticketStatusLabels } from './presentation';
	import TicketStatusBadge from './TicketStatusBadge.svelte';

	let {
		events,
		getAuthorLabel,
		formatDate
	}: {
		events: TicketEvent[];
		getAuthorLabel: (authorId?: string) => string;
		formatDate: (value: string | undefined) => string;
	} = $props();

	const timelineSteps = $derived(
		events
			.map((ev) => {
				if (ev.kind === 'status' || ev.kind === 'created' || ev.kind === 'closed') {
					return {
						...ev,
						label: ticketStatusLabels[ev.toStatus!],
						status: ev.toStatus!
					};
				}
				if (ev.kind === 'note') {
					return {
						...ev,
						label: 'Nota informativa',
						status: undefined
					};
				}
				return undefined;
			})
			.filter((step): step is NonNullable<typeof step> => Boolean(step))
	);
</script>

<div class="ticket-timeline" role="list" aria-label="Cronologia ticket">
	{#each timelineSteps as step, index}
		<div class="ticket-timeline__item" role="listitem">
			<div class="ticket-timeline__rail" aria-hidden="true">
				<div class="ticket-timeline__dot"></div>
				{#if index < timelineSteps.length - 1}
					<div class="ticket-timeline__line"></div>
				{/if}
			</div>

			<div class="ticket-timeline__content">
				<div class="ticket-timeline__row">
					<div class="ticket-timeline__main">
						<p class="ticket-timeline__title">{step.label}</p>
						<p class="ticket-timeline__meta">{getAuthorLabel(step.actorId)}</p>
					</div>
					{#if step.status}
						<TicketStatusBadge status={step.status} />
					{/if}
				</div>
				{#if 'note' in step && step.note}
					<p class="ticket-timeline__note">{step.note}</p>
				{/if}
				<p class="ticket-timeline__date">{formatDate(step.at)}</p>
			</div>
		</div>
	{/each}
</div>
