<script lang="ts">
	import type { Assembly } from '$lib/data/events/assemblies';
	import { getAssemblyTranscriptPoints } from './presentation';

	let {
		assembly
	}: {
		assembly: Assembly;
	} = $props();

	const transcriptPoints = $derived(getAssemblyTranscriptPoints(assembly));
</script>

<div class="assembly-transcript-list">
	{#each transcriptPoints as point}
		<div class="assembly-transcript-list__item">
			<p class="assembly-transcript-list__title">{point.title}</p>
			<p class="assembly-transcript-list__copy">{point.copy}</p>
		</div>
	{/each}
</div>
