<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import type { TicketStatus } from '$lib/data/tickets';
	import { ticketStatusLabels } from './presentation';

	let {
		status,
		class: className
	}: {
		status: TicketStatus;
		class?: string;
	} = $props();

	const label = $derived(ticketStatusLabels[status]);
	const statusClassName = $derived(`ticket-status-badge--${status}`);
</script>

<Badge variant="outline" class={cn('ticket-status-badge', statusClassName, className)}>
	{label}
</Badge>
