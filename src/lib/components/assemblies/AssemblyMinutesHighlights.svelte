<script lang="ts">
	import type { Assembly } from '$lib/data/events/assemblies';
	import { getAssemblyMinutesHighlights } from './presentation';

	let {
		assembly,
		unitsCount
	}: {
		assembly: Assembly;
		unitsCount?: number;
	} = $props();

	const highlights = $derived(getAssemblyMinutesHighlights(assembly, unitsCount));
</script>

<div class="assembly-minutes-highlights">
	{#each highlights as highlight}
		<div class="assembly-minutes-highlights__item">
			<p class="assembly-minutes-highlights__label">{highlight.label}</p>
			<p class="assembly-minutes-highlights__value">{highlight.value}</p>
			<p class="assembly-minutes-highlights__copy">{highlight.copy}</p>
		</div>
	{/each}
</div>
