<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';

	type SummaryStat = {
		label: string;
		value: string | number;
	};

	let {
		eyebrow,
		title,
		copy,
		stats = [],
		chips = []
	}: {
		eyebrow: string;
		title: string;
		copy: string;
		stats?: SummaryStat[];
		chips?: string[];
	} = $props();
</script>

<Card class="resident-module-summary-card">
	<CardHeader class="resident-module-summary-card__header">
		<p class="resident-module-summary-card__eyebrow">{eyebrow}</p>
		<CardTitle class="resident-module-summary-card__title">{title}</CardTitle>
		<CardDescription class="resident-module-summary-card__copy">{copy}</CardDescription>
	</CardHeader>

	<CardContent class="resident-module-summary-card__content">
		{#if stats.length}
			<div class="resident-module-summary-card__stats">
				{#each stats as stat}
					<div class="resident-module-summary-card__stat">
						<p class="resident-module-summary-card__stat-label">{stat.label}</p>
						<p class="resident-module-summary-card__stat-value">{stat.value}</p>
					</div>
				{/each}
			</div>
		{/if}

		{#if chips.length}
			<div class="resident-module-summary-card__chips">
				{#each chips as chip}
					<span class="resident-module-summary-card__chip">{chip}</span>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>
