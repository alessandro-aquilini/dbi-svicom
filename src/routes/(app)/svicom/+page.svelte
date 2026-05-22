<script lang="ts">
	import { onMount } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		AlertDiamondIcon,
		ArrowUpRight01Icon,
		Building03Icon,
		MoneyBag02Icon,
		Note01Icon,
		UserGroupIcon
	} from '@hugeicons/core-free-icons';
	import { PropertiesMap } from '$lib/components/shared';
	import {
		totalProperties,
		totalUnits,
		totalResidents,
		totalAdmins,
		totalSuppliers,
		activeTicketsCount,
		healthDistribution,
		statusDistribution,
		monthlyRecurringRevenue,
		transactionalRevenue,
		totalAnnualizedRevenue,
		revenueTrend,
		ecosystemAlerts,
		properties,
		eurFormatter
	} from '$lib/svicom/metrics';

	const health = healthDistribution();
	const status = statusDistribution();
	const mrr = monthlyRecurringRevenue();
	const tx = transactionalRevenue();
	const arr = totalAnnualizedRevenue();
	const alerts = ecosystemAlerts();
	const trend = revenueTrend();
	const maxTrend = Math.max(...trend.map((t) => t.recurring + t.transactional));

	type KpiCard = {
		label: string;
		value: string;
		hint: string;
		icon: typeof Building03Icon;
	};

	const kpis: KpiCard[] = [
		{
			label: 'Condomìni',
			value: String(totalProperties),
			hint: `${totalUnits} unità totali`,
			icon: Building03Icon
		},
		{
			label: 'Residenti',
			value: String(totalResidents),
			hint: `${totalAdmins} amministratori · ${totalSuppliers} fornitori`,
			icon: UserGroupIcon
		},
		{
			label: 'Ticket attivi',
			value: String(activeTicketsCount),
			hint: 'Tutti i condomìni',
			icon: Note01Icon
		},
		{
			label: 'Ricavi annualizzati',
			value: eurFormatter.format(arr),
			hint: `${eurFormatter.format(mrr)} MRR · ${eurFormatter.format(tx)} transazionali`,
			icon: MoneyBag02Icon
		}
	];

	const healthCells: Array<{ key: keyof typeof health; label: string; tone: string }> = [
		{ key: 'verde', label: 'In salute', tone: 'bg-success' },
		{ key: 'giallo', label: 'Da monitorare', tone: 'bg-warning' },
		{ key: 'rosso', label: 'Critici', tone: 'bg-destructive' }
	];

	const statusCells: Array<{ key: keyof typeof status; label: string }> = [
		{ key: 'attivo', label: 'Attivi' },
		{ key: 'onboarding', label: 'In onboarding' },
		{ key: 'in-uscita', label: 'In uscita' }
	];

	const toneClasses: Record<string, string> = {
		destructive: 'border-destructive/40 bg-destructive/5 text-destructive',
		warning: 'border-warning/40 bg-warning/10 text-foreground',
		info: 'border-primary/30 bg-primary/5 text-foreground'
	};

	const now = new Date();
	const lastUpdate = now.toLocaleString('it-IT', {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	});
</script>

<svelte:head>
	<title>Dashboard — Svicom — Living Hub</title>
</svelte:head>

<div class="space-y-8 p-8">
	<!-- Header -->
	<header class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
				Strategic governance
			</p>
			<h1 class="mt-1 text-3xl font-semibold tracking-tight text-foreground">
				Control room dell'ecosistema
			</h1>
			<p class="mt-2 max-w-2xl text-sm text-muted-foreground">
				Stato in tempo reale di condomìni, amministratori, fornitori e flussi commerciali del network Svicom.
			</p>
		</div>
		<div class="flex items-center gap-3 text-xs text-muted-foreground">
			<span class="flex items-center gap-1.5">
				<span class="h-2 w-2 animate-pulse rounded-full bg-success"></span>
				Sistemi operativi
			</span>
			<span>Aggiornato: {lastUpdate}</span>
		</div>
	</header>

	<!-- KPI strip -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each kpis as kpi}
			<div class="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
				<div class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground">{kpi.label}</span>
					<span class="rounded-md bg-primary/10 p-2 text-primary">
						<HugeiconsIcon icon={kpi.icon} size={18} strokeWidth={1.75} />
					</span>
				</div>
				<p class="mt-3 text-3xl font-semibold tracking-tight text-primary">{kpi.value}</p>
				<p class="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
			</div>
		{/each}
	</div>

	<!-- Health + status + alerts -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Health -->
		<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<div class="flex items-baseline justify-between">
				<h2 class="text-base font-semibold text-foreground">Health del portafoglio</h2>
				<a
					href="/svicom/portfolio"
					class="flex items-center gap-1 text-xs text-primary hover:underline"
				>
					Apri portafoglio
					<HugeiconsIcon icon={ArrowUpRight01Icon} size={12} strokeWidth={2} />
				</a>
			</div>
			<p class="mt-1 text-xs text-muted-foreground">Indicatore aggregato sui {totalProperties} condomìni gestiti.</p>

			<div class="mt-5 space-y-3">
				{#each healthCells as cell}
					{@const value = health[cell.key]}
					{@const pct = totalProperties === 0 ? 0 : Math.round((value / totalProperties) * 100)}
					<div>
						<div class="flex items-center justify-between text-sm">
							<span class="flex items-center gap-2 text-foreground">
								<span class="h-2 w-2 rounded-full {cell.tone}"></span>
								{cell.label}
							</span>
							<span class="text-muted-foreground">{value} · {pct}%</span>
						</div>
						<div class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
							<div class="h-full {cell.tone}" style="width: {pct}%"></div>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-6 border-t border-border pt-4">
				<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
					Stato amministrativo
				</p>
				<dl class="mt-2 grid grid-cols-3 gap-3 text-sm">
					{#each statusCells as cell}
						<div>
							<dt class="text-xs text-muted-foreground">{cell.label}</dt>
							<dd class="mt-1 text-lg font-semibold text-foreground">{status[cell.key]}</dd>
						</div>
					{/each}
				</dl>
			</div>
		</section>

		<!-- Revenue mini -->
		<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<div class="flex items-baseline justify-between">
				<h2 class="text-base font-semibold text-foreground">Ricavi · 12 mesi</h2>
				<a
					href="/svicom/revenue"
					class="flex items-center gap-1 text-xs text-primary hover:underline"
				>
					Apri ricavi
					<HugeiconsIcon icon={ArrowUpRight01Icon} size={12} strokeWidth={2} />
				</a>
			</div>
			<p class="mt-1 text-xs text-muted-foreground">Ricorrenti (management fee) + transazionali.</p>

			<div class="mt-5 flex items-end gap-1.5">
				{#each trend as t, i}
					{@const total = t.recurring + t.transactional}
					{@const heightPct = Math.round((total / maxTrend) * 100)}
					{@const recPct = Math.round((t.recurring / total) * 100)}
					<div class="flex flex-1 flex-col items-center gap-1.5">
						<div class="relative flex h-32 w-full items-end overflow-hidden rounded-md bg-muted/50">
							<div
								class="absolute inset-x-0 bottom-0 bg-primary/30 transition-all"
								style="height: {heightPct}%"
							></div>
							<div
								class="absolute inset-x-0 bottom-0 bg-primary transition-all"
								style="height: {Math.round((heightPct * recPct) / 100)}%"
							></div>
						</div>
						<span class="text-[10px] text-muted-foreground">{t.month}</span>
					</div>
				{/each}
			</div>

			<div class="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
				<span class="flex items-center gap-1.5">
					<span class="h-2 w-2 rounded-full bg-primary"></span>
					Ricorrenti
				</span>
				<span class="flex items-center gap-1.5">
					<span class="h-2 w-2 rounded-full bg-primary/30"></span>
					Transazionali
				</span>
			</div>
		</section>

		<!-- Alerts -->
		<section class="rounded-xl border border-border bg-card p-6 shadow-sm">
			<div class="flex items-baseline justify-between">
				<h2 class="text-base font-semibold text-foreground">Segnalazioni di ecosistema</h2>
				<span class="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
					{alerts.length}
				</span>
			</div>
			<p class="mt-1 text-xs text-muted-foreground">Segnali che richiedono attenzione orchestrante.</p>

			<ul class="mt-4 space-y-2">
				{#each alerts as alert (alert.id)}
					<li>
						<a
							href={alert.href ?? '#'}
							class="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40 {toneClasses[alert.tone]}"
						>
							<HugeiconsIcon icon={AlertDiamondIcon} size={16} strokeWidth={1.75} />
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium">{alert.title}</p>
								<p class="mt-0.5 line-clamp-2 text-xs opacity-80">{alert.body}</p>
							</div>
						</a>
					</li>
				{:else}
					<li class="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
						Nessuna segnalazione attiva.
					</li>
				{/each}
			</ul>
		</section>
	</div>

	<!-- Map -->
	<section class="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
		<div class="flex items-baseline justify-between border-b border-border px-6 py-4">
			<div>
				<h2 class="text-base font-semibold text-foreground">Mappa del portafoglio</h2>
				<p class="mt-1 text-xs text-muted-foreground">
					{totalProperties} condomìni distribuiti su Milano.
				</p>
			</div>
			<a
				href="/svicom/portfolio"
				class="flex items-center gap-1 text-xs text-primary hover:underline"
			>
				Vai al dettaglio
				<HugeiconsIcon icon={ArrowUpRight01Icon} size={12} strokeWidth={2} />
			</a>
		</div>
		<div class="h-[420px] w-full">
			<PropertiesMap {properties} />
		</div>
	</section>
</div>
