<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import type { SvicomDocument } from '$lib/data/documents';
	import { documentTypeLabels } from './presentation';

	let {
		type,
		class: className
	}: {
		type: SvicomDocument['type'];
		class?: string;
	} = $props();

	const label = $derived(documentTypeLabels[type]);
</script>

<Badge variant="secondary" class={cn('document-type-badge', className)}>
	{label}
</Badge>
