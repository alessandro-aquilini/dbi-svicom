<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';

	let {
		eyebrow,
		title,
		copy,
		children
	}: {
		eyebrow?: string;
		title: string;
		copy: string;
		children?: Snippet;
	} = $props();
</script>

<Card class="resident-chart-card">
	<CardHeader class="resident-chart-card__header">
		{#if eyebrow}
			<p class="resident-chart-card__eyebrow">{eyebrow}</p>
		{/if}
		<CardTitle class="resident-chart-card__title">{title}</CardTitle>
		<CardDescription class="resident-chart-card__copy">{copy}</CardDescription>
	</CardHeader>

	<CardContent class="resident-chart-card__content">
		{@render children?.()}
	</CardContent>
</Card>
