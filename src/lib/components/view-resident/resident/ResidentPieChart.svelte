<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';

	export interface ResidentPieChartItem {
		key: string;
		label: string;
		value: number;
		color: string;
		copy?: string;
		valueLabel?: string;
	}

	let {
		items = [],
		selectedKey = $bindable<string | null>(null),
		totalLabel = 'Totale',
		totalCopy = 'Distribuzione aggiornata sulla base dei dati visibili in questa sezione.',
		formatValue = (value: number) => String(value),
		padAngle,
		showLegend = true
	}: {
		items?: ResidentPieChartItem[];
		selectedKey?: string | null;
		totalLabel?: string;
		totalCopy?: string;
		formatValue?: (value: number) => string;
		padAngle?: number;
		showLegend?: boolean;
	} = $props();
	let PieChartComponent = $state<any>(null);

	const total = $derived(items.reduce((sum, item) => sum + item.value, 0));
	const resolvedPadAngle = $derived(padAngle ?? (items.length > 4 ? 0.02 : 0.05));
	const resolvedSelectedKey = $derived(selectedKey ?? items[0]?.key ?? null);
	const activeItem = $derived(items.find((item) => item.key === resolvedSelectedKey) ?? items[0]);
	const activeValueLabel = $derived(
		activeItem?.valueLabel ?? (activeItem ? formatValue(activeItem.value) : formatValue(total))
	);

	function handleSelect(nextKey: string) {
		selectedKey = selectedKey === nextKey ? null : nextKey;
	}

	onMount(async () => {
		const module = await import('layerchart');
		PieChartComponent = module.PieChart;
	});
</script>

{#if items.length > 0}
	<div class="resident-pie-chart">
		<div class="resident-pie-chart__visual">
			{#if PieChartComponent}
				<PieChartComponent
					ssr={false}
					data={items}
					key="key"
					label="label"
					value="value"
					c="color"
					height={220}
					innerRadius={0.66}
					cornerRadius={6}
					padAngle={resolvedPadAngle}
					legend={false}
				/>
			{:else}
				<div class="resident-chart-skeleton" aria-hidden="true"></div>
			{/if}
		</div>

		<div class="resident-pie-chart__summary">
			<p class="resident-pie-chart__summary-label">{activeItem?.label ?? totalLabel}</p>
			<p class="resident-pie-chart__summary-value">{activeValueLabel}</p>
			<p class="resident-pie-chart__summary-copy">{activeItem?.copy ?? totalCopy}</p>
		</div>
	</div>

	{#if showLegend}
	<div class="resident-pie-chart__legend" aria-label="Filtri grafico">
		{#each items as item}
			<Button
				type="button"
				variant={resolvedSelectedKey === item.key ? 'default' : 'outline'}
				size="sm"
				class="resident-pie-chart__legend-button"
				aria-pressed={resolvedSelectedKey === item.key}
				onclick={() => handleSelect(item.key)}
			>
				<span
					class="resident-pie-chart__swatch"
					style={`--resident-chart-swatch:${item.color}`}
					aria-hidden="true"
				></span>
				<span class="resident-pie-chart__legend-main">
					<span class="resident-pie-chart__legend-label">{item.label}</span>
					<span class="resident-pie-chart__legend-value">
						{item.valueLabel ?? formatValue(item.value)}
					</span>
				</span>
			</Button>
		{/each}
	</div>
	{/if}
{/if}
