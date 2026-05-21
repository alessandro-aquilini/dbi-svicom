<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		MoneyReceiveCircleIcon,
		ChartBarLineIcon,
		Invoice01Icon,
		ArrowUp01Icon,
		ArrowDown01Icon
	} from '@hugeicons/core-free-icons';

	interface Props {
		totalRevenue: number;
		monthlyRevenue: number;
		activeInvoicesCount: number;
		growthRate: number;
	}

	let { totalRevenue, monthlyRevenue, activeInvoicesCount, growthRate }: Props = $props();

	function formatCurrency(value: number) {
		return value.toLocaleString('it-IT', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		});
	}
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<!-- Totale Guadagni -->
	<div class="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
		<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
			<HugeiconsIcon icon={MoneyReceiveCircleIcon} size={24} />
		</div>
		<div>
			<p class="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Volume d'Affari</p>
			<h3 class="text-xl font-bold text-foreground">
				{formatCurrency(totalRevenue)}
			</h3>
		</div>
	</div>

	<!-- Guadagni ultimo mese -->
	<div class="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
		<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600">
			<HugeiconsIcon icon={ChartBarLineIcon} size={24} />
		</div>
		<div>
			<p class="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Entrate del Mese</p>
			<h3 class="text-xl font-bold text-foreground">
				{formatCurrency(monthlyRevenue)}
			</h3>
		</div>
	</div>

	<!-- Fatture attive -->
	<div class="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
		<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
			<HugeiconsIcon icon={Invoice01Icon} size={24} />
		</div>
		<div>
			<p class="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Fatture Aperte</p>
			<h3 class="text-xl font-bold text-foreground">
				{activeInvoicesCount}
			</h3>
		</div>
	</div>

	<!-- Crescita Mensile -->
	<div class="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
		<div
			class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl {growthRate >= 0
				? 'bg-emerald-500/10 text-emerald-600'
				: 'bg-rose-500/10 text-rose-600'}"
		>
			<HugeiconsIcon icon={growthRate >= 0 ? ArrowUp01Icon : ArrowDown01Icon} size={24} />
		</div>
		<div>
			<p class="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Trend Mensile</p>
			<h3 class="text-xl font-bold {growthRate >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
				{growthRate >= 0 ? '+' : ''}{growthRate}%
			</h3>
		</div>
	</div>
</div>
