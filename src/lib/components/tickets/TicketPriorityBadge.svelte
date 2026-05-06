<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import type { TicketPriority } from '$lib/data/tickets-admin';
	import { ticketPriorityLabels } from './presentation';

	let {
		priority,
		class: className
	}: {
		priority: TicketPriority;
		class?: string;
	} = $props();

	const label = $derived(ticketPriorityLabels[priority]);
	const priorityClassName = $derived(`ticket-priority-badge--${priority}`);
</script>

<Badge variant="secondary" class={cn('ticket-priority-badge', priorityClassName, className)}>
	{label}
</Badge>
