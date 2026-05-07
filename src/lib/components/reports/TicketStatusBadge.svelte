<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	// status is a string from Report.status (nuova | presa_in_carico | completata)
	import { ticketStatusLabels } from './presentation';

	let {
		status,
		class: className
	}: {
		status: string;
		class?: string;
	} = $props();

	const label = $derived(ticketStatusLabels[status]);
	const statusClassName = $derived(`ticket-status-badge--${status}`);
</script>

<Badge variant="outline" class={cn('ticket-status-badge', statusClassName, className)}>
	{label}
</Badge>
