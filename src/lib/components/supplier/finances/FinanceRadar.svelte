<script lang="ts">
	import { ArrowUpRightIcon, ChartUpIcon, Invoice01Icon, Money03Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';

	let { totalGains, revenueLastMonth, activeInvoices, monthlyGrowthRatio } = $props<{
		totalGains: number;
		revenueLastMonth: number;
		activeInvoices: number;
		monthlyGrowthRatio: number;
	}>();
</script>

<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
	<div class="rounded-3xl border border-border bg-card p-6 shadow-sm">
		<div class="flex items-center justify-between gap-4">
			<div>
				<p class="text-sm font-medium text-muted-foreground">Totale guadagni</p>
				<h3 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">
					+ {totalGains.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
				</h3>
			</div>
			<div class="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500">
				<HugeiconsIcon icon={Money03Icon} size={20} />
			</div>
		</div>
	</div>

	<div class="rounded-3xl border border-border bg-card p-6 shadow-sm">
		<div class="flex items-center justify-between gap-4">
			<div>
				<p class="text-sm font-medium text-muted-foreground">Guadagni ultimo mese</p>
				<h3 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">
					+ {revenueLastMonth.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
				</h3>
			</div>
			<div class="rounded-2xl bg-primary/10 p-3 text-primary">
				<HugeiconsIcon icon={ArrowUpRightIcon} size={20} />
			</div>
		</div>
	</div>

	<div class="rounded-3xl border border-border bg-card p-6 shadow-sm">
		<div class="flex items-center justify-between gap-4">
			<div>
				<p class="text-sm font-medium text-muted-foreground">Fatture attive</p>
				<h3 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">{activeInvoices}</h3>
			</div>
			<div class="rounded-2xl bg-blue-500/10 p-3 text-blue-500">
				<HugeiconsIcon icon={Invoice01Icon} size={20} />
			</div>
		</div>
	</div>

	<div class="rounded-3xl border border-border bg-card p-6 shadow-sm">
		<div class="flex items-center justify-between gap-4">
			<div>
				<p class="text-sm font-medium text-muted-foreground">Crescita mensile</p>
				<h3 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">
					+{monthlyGrowthRatio}%
				</h3>
			</div>
			<div class="rounded-2xl bg-violet-500/10 p-3 text-violet-500">
				<HugeiconsIcon icon={ChartUpIcon} size={20} />
			</div>
		</div>
	</div>
</div>
