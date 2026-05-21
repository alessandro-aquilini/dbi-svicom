<script lang="ts">
	import { onMount } from 'svelte';

	export interface ResidentBarChartItem {
		key: string;
		label: string;
		value: number;
		valueLabel?: string;
	}

	let {
		items = [],
		color = 'var(--chart-1)',
		formatValue = (value: number) => String(value)
	}: {
		items?: ResidentBarChartItem[];
		color?: string;
		formatValue?: (value: number) => string;
	} = $props();
	let BarChartComponent = $state<any>(null);

	const chartHeight = $derived(Math.max(180, items.length * 54));

	onMount(async () => {
		const module = await import('layerchart');
		BarChartComponent = module.BarChart;
	});
</script>

{#if items.length > 0}
	<div class="resident-bar-chart">
		<div class="resident-bar-chart__visual">
			{#if BarChartComponent}
				<BarChartComponent
					ssr={false}
					data={items}
					x="value"
					y="label"
					height={chartHeight}
					orientation="horizontal"
					axis="y"
					grid={false}
					rule={false}
					bandPadding={0.38}
					series={[{ key: 'default', color }]}
				/>
			{:else}
				<div class="resident-chart-skeleton resident-chart-skeleton--tall" aria-hidden="true"></div>
			{/if}
		</div>

		<div class="resident-bar-chart__list" aria-label="Dettaglio valori grafico">
			{#each items as item}
				<div class="resident-bar-chart__list-item">
					<div class="resident-bar-chart__list-main">
						<p class="resident-bar-chart__list-label">{item.label}</p>
					</div>
					<p class="resident-bar-chart__list-value">{item.valueLabel ?? formatValue(item.value)}</p>
				</div>
			{/each}
		</div>
	</div>
{/if}
