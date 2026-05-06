<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import type { AssemblyStatus } from '$lib/data/assemblies';
	import { assemblyStatusLabels } from './presentation';

	let {
		status,
		class: className
	}: {
		status: AssemblyStatus;
		class?: string;
	} = $props();

	const label = $derived(assemblyStatusLabels[status]);
</script>

<Badge variant="outline" class={cn('assembly-status-badge', `assembly-status-badge--${status}`, className)}>
	{label}
</Badge>
