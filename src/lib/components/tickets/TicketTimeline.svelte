<script lang="ts">
	import type { StatusHistoryEntry } from '$lib/data/tickets';
	import { getLatestTicketStatus, ticketStatusLabels } from './presentation';
	import TicketStatusBadge from './TicketStatusBadge.svelte';

	let {
		history,
		getAuthorLabel,
		formatDate
	}: {
		history: StatusHistoryEntry[];
		getAuthorLabel: (authorId?: string) => string;
		formatDate: (value: string | undefined) => string;
	} = $props();

	const timelineSteps = $derived(
		history
			.map((step) => {
				const status = getLatestTicketStatus([{ status: step.status }]);
				if (!status) return undefined;

				return {
					...step,
					status,
					label: ticketStatusLabels[status]
				};
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
						<p class="ticket-timeline__meta">{getAuthorLabel(step.authorId)}</p>
					</div>
					<TicketStatusBadge status={step.status} />
				</div>
				<p class="ticket-timeline__date">{formatDate(step.at)}</p>
			</div>
		</div>
	{/each}
</div>
