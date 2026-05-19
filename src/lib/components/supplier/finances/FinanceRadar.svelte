<script lang="ts">
	import { ChartUpIcon, Money03Icon, Invoice01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';

	let { totalGains, activeInvoices, monthlyGrowthRatio } = $props<{
		totalGains: number;
		activeInvoices: number;
		monthlyGrowthRatio: number;
	}>();
</script>

<div class="grid gap-4 md:grid-cols-3">
	<!-- ...existing code... -->
	<div class="rounded-2xl border border-border bg-card p-6">
		<div class="flex items-center gap-4">
			<div class="rounded-full bg-emerald-500/10 p-3 text-emerald-500">
				<HugeiconsIcon icon={ChartUpIcon} size={24} />
			</div>
			<div>
				<p class="text-sm font-medium text-muted-foreground">Crescita Mensile</p>
				<h3 class="text-2xl font-bold">+{monthlyGrowthRatio}%</h3>
			</div>
		</div>
	</div>
</div>
