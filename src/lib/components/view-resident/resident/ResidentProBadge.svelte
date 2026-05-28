<script lang="ts">
	import { SparklesIcon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';

	type Tone = 'default' | 'inverse';

	let {
		label = 'PRO',
		tone = 'default',
		class: className
	}: {
		label?: string;
		tone?: Tone;
		class?: string;
	} = $props();

	const toneClassName = $derived(
		tone === 'inverse' ? 'resident-pro-badge--inverse' : 'resident-pro-badge--default'
	);
</script>

<Badge variant="outline" class={cn('resident-pro-badge', toneClassName, className)}>
	<HugeiconsIcon icon={SparklesIcon} size={12} strokeWidth={2} />
	<span>{label}</span>
</Badge>
