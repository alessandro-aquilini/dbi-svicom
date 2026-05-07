<script lang="ts">
	import { reports, type ReportStatus, type ReportPriority } from '$lib/data/ticket/reports';
	import { getPropertyById } from '$lib/data/properties';
	import { getUserById } from '$lib/data/users';
	import { propertySelection } from '$lib/state/property-selection.svelte';
	import { PropertyScopeChip, EmptyState } from '$lib/components/shared';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Search01Icon } from '@hugeicons/core-free-icons';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';

	const statusLabels: Record<ReportStatus, string> = {
		nuova: 'Nuova',
		presa_in_carico: 'In carico',
		completata: 'Completata'
	};

	const statusColors: Record<ReportStatus, string> = {
		nuova: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
		presa_in_carico: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
		completata: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
	};

	const priorityLabels: Record<ReportPriority, string> = {
		bassa: 'Bassa',
		media: 'Media',
		alta: 'Alta',
		critica: 'Critica'
	};

	const priorityColors: Record<ReportPriority, string> = {
		critica: 'bg-destructive/15 text-destructive border-destructive/20',
		alta: 'bg-orange-500/15 text-orange-500 border-orange-500/20',
		media: 'bg-primary/10 text-primary border-primary/20',
		bassa: 'bg-secondary text-secondary-foreground border-border'
	};

	let query = $state('');
	let filterStatus = $state('');

	const scopedReports = $derived(
		propertySelection.isAll
			? reports
			: reports.filter((r) => r.propertyId === propertySelection.selectedId)
	);

	const filtered = $derived(
		scopedReports.filter((r) => {
			const matchesSearch =
				query === '' ||
				r.title.toLowerCase().includes(query.toLowerCase()) ||
				r.description.toLowerCase().includes(query.toLowerCase());
			const matchesStatus = filterStatus === '' || r.status === filterStatus;

			return matchesSearch && matchesStatus;
		})
	);

	const hasLocalFilters = $derived(query !== '' || filterStatus !== '');
</script>

<div class="flex flex-col gap-6 p-6">
	<header class="flex items-center justify-between">
		<div class="space-y-1">
			<div class="flex items-center gap-2">
				<h1 class="text-2xl font-semibold tracking-tight">Segnalazioni Residenti</h1>
				<PropertyScopeChip />
			</div>
			<p class="text-sm text-muted-foreground">
				Gestisci le segnalazioni inviate dai residenti dei condomini.
			</p>
		</div>
	</header>

	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-4 md:flex-row md:items-center">
			<div class="relative flex-1">
				<HugeiconsIcon
					icon={Search01Icon}
					class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					placeholder="Cerca per titolo o descrizione..."
					bind:value={query}
					class="pl-9"
				/>
			</div>

			<select
				bind:value={filterStatus}
				class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
			>
				<option value="">Tutti gli stati</option>
				{#each Object.entries(statusLabels) as [val, label]}
					<option value={val}>{label}</option>
				{/each}
			</select>
		</div>

		{#if filtered.length > 0}
			<div class="grid gap-4">
				{#each filtered as report}
					{@const property = getPropertyById(report.propertyId)}
					{@const reporter = getUserById(report.reportedById)}
					<div
						class="flex flex-col gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/50 md:flex-row md:items-center md:justify-between"
					>
						<div class="flex flex-col gap-1">
							<div class="flex items-center gap-2">
								<Badge variant="outline" class={cn('font-medium', statusColors[report.status])}>
									{statusLabels[report.status]}
								</Badge>
								<span class="text-sm font-medium text-muted-foreground">
									{report.id}
								</span>
								{#if property}
									<span class="text-sm text-muted-foreground">• {property.name}</span>
								{/if}
							</div>
							<h3 class="font-semibold">{report.title}</h3>
							<p class="line-clamp-1 text-sm text-muted-foreground">
								{report.description}
							</p>
							{#if reporter}
								<span class="text-sm text-muted-foreground">Segnalata da {reporter.name}</span>
							{/if}
						</div>

						<div class="flex items-center gap-4 md:text-right">
							<div class="flex flex-col gap-1 md:items-end">
								<Badge variant="outline" class={cn('w-fit', priorityColors[report.priority])}>
									{priorityLabels[report.priority]}
								</Badge>
								<span class="text-xs text-muted-foreground">
									Inviata il {new Date(report.createdAt).toLocaleDateString('it-IT')}
								</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div
				class="flex min-h-unit-100 flex-col items-center justify-center rounded-xl border border-dashed text-center"
			>
				<EmptyState
					message={hasLocalFilters
						? 'Nessun risultato trovato. Prova a modificare i filtri di ricerca.'
						: 'Le segnalazioni inviate dai residenti appariranno qui.'}
				/>
			</div>
		{/if}
	</div>
</div>
