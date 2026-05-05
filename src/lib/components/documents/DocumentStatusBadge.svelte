<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import { getDocumentStatusTone } from './presentation';

	let {
		status,
		class: className
	}: {
		status: string;
		class?: string;
	} = $props();

	const tone = $derived(getDocumentStatusTone(status));
</script>

<Badge variant="outline" class={cn('document-status-badge', `document-status-badge--${tone}`, className)}>
	{status}
</Badge>
