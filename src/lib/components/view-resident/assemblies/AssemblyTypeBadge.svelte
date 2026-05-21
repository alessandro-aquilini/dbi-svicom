<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import type { AssemblyType } from '$lib/data/events/assemblies';
	import { assemblyTypeLabels } from './presentation';

	let {
		type,
		class: className
	}: {
		type: AssemblyType;
		class?: string;
	} = $props();

	const label = $derived(assemblyTypeLabels[type]);
</script>

<Badge variant="secondary" class={cn('assembly-type-badge', className)}>
	{label}
</Badge>
