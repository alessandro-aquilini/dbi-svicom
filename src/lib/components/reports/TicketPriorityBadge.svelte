<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	// priority is a string from Report.priority (bassa | media | alta | critica)
	import { ticketPriorityLabels } from './presentation';

	let {
		priority,
		class: className
	}: {
		priority: string;
		class?: string;
	} = $props();

	const label = $derived(ticketPriorityLabels[priority]);
	const priorityClassName = $derived(`ticket-priority-badge--${priority}`);
</script>

<Badge variant="secondary" class={cn('ticket-priority-badge', priorityClassName, className)}>
	{label}
</Badge>
