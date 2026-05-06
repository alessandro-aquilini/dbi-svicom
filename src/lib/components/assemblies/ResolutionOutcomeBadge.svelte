<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import type { VoteOutcome } from '$lib/data/events/assemblies';
	import { resolutionOutcomeLabels } from './presentation';

	let {
		outcome,
		class: className
	}: {
		outcome: VoteOutcome;
		class?: string;
	} = $props();

	const label = $derived(resolutionOutcomeLabels[outcome]);
</script>

<Badge variant="outline" class={cn('resolution-outcome-badge', `resolution-outcome-badge--${outcome}`, className)}>
	{label}
</Badge>
