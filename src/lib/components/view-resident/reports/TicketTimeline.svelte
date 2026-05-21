<script lang="ts">
	import { ticketStatusLabels } from './presentation';
	import TicketStatusBadge from './TicketStatusBadge.svelte';

	let {
		events,
		getAuthorLabel,
		formatDate,
		variant = 'default'
	}: {
		// events is an array of objects with at, actorId and toStatus fields (built from report.statusHistory)
		events: Array<{
			at: string;
			actorId?: string;
			toStatus?: string;
			note?: string;
			id?: string;
			label?: string;
		}>;
		getAuthorLabel: (authorId?: string) => string;
		formatDate: (value: string | undefined) => string;
		variant?: 'default' | 'operational';
	} = $props();

	const timelineSteps = $derived(
		events
			.map((ev) => {
				if (ev.label) {
					return {
						...ev,
						label: ev.label,
						status: ev.toStatus
					};
				}
				if (ev.toStatus) {
					return {
						...ev,
						label: ticketStatusLabels[ev.toStatus] ?? ev.toStatus,
						status: ev.toStatus
					};
				}
				if (ev.note) {
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
				<div
					class:ticket-timeline__dot--operational={variant === 'operational'}
					class="ticket-timeline__dot"
				></div>
				{#if index < timelineSteps.length - 1}
					<div
						class:ticket-timeline__line--operational={variant === 'operational'}
						class="ticket-timeline__line"
					></div>
				{/if}
			</div>

			<div
				class:ticket-timeline__content--operational={variant === 'operational'}
				class="ticket-timeline__content"
			>
				<div class="ticket-timeline__row">
					<div class="ticket-timeline__main">
						<p class="ticket-timeline__title">{step.label}</p>
						<p class="ticket-timeline__meta">{getAuthorLabel(step.actorId)}</p>
					</div>
					{#if step.status}
						<div class="ticket-timeline__status">
							<TicketStatusBadge status={step.status} />
						</div>
					{/if}
				</div>
				{#if 'note' in step && step.note}
					<p
						class:ticket-timeline__note--operational={variant === 'operational'}
						class="ticket-timeline__note"
					>
						{step.note}
					</p>
				{/if}
				<p class="ticket-timeline__date">{formatDate(step.at)}</p>
			</div>
		</div>
	{/each}
</div>
