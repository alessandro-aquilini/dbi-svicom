<script lang="ts">
	import { page } from '$app/state';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Add01Icon } from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import { InfoTip } from '$lib/components/shared';
	import { getCurrentUser } from '$lib/auth';
	import {
		ResidentReportCard,
		formatTicketDate,
		getResidentVisibleTicketsByCreatorId,
		getCurrentStatus,
		getReportOperationalContext,
		ticketStatusLabels
	} from '$lib/components/reports';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentById } from '$lib/data/residents';

	const currentUser = getCurrentUser();
	const resident = $derived(currentUser ? getResidentById(currentUser.id) : undefined);
	const property = $derived(resident ? getPropertyById(resident.propertyId) : undefined);
	const sortedReports = $derived(
		currentUser
			? getResidentVisibleTicketsByCreatorId(currentUser.id).sort(
					(a, b) =>
						new Date(b.updatedAt ?? b.statusHistory.at(-1)?.at ?? 0).getTime() -
						new Date(a.updatedAt ?? a.statusHistory.at(-1)?.at ?? 0).getTime()
				)
			: []
	);
	const featuredReport = $derived(sortedReports[0]);
	const operationalContexts = $derived(
		sortedReports.map((report) => ({
			report,
			operational: getReportOperationalContext(report)
		}))
	);
	const linkedOperationalCount = $derived(
		operationalContexts.filter((item) => item.operational).length
	);
	let statusFilter = $state<'all' | 'open' | 'presa_in_carico' | 'completata'>('all');
	let sortMode = $state<'updated' | 'created' | 'priority' | 'title'>('updated');

	const summaryCopy = $derived(
		currentUser && resident && property
			? `${currentUser.name}, ${property.name}, ${resident.apartment}. Qui trovi lo stato delle segnalazioni aperte e concluse.`
			: 'Il profilo residente non disponibile.'
	);
	const summaryStats = $derived([
		{ label: 'Segnalazioni', value: sortedReports.length },
		{
			label: 'Aperte',
			value: sortedReports.filter((report) => getCurrentStatus(report) !== 'completata').length
		},
		{
			label: 'Pratiche operative',
			value: linkedOperationalCount
		}
	]);
	const summaryChips = $derived(
		property
			? [
					property.address.street,
					featuredReport ? `In evidenza ${featuredReport.id}` : 'Nessuna segnalazione in evidenza',
					linkedOperationalCount > 0
						? `${linkedOperationalCount} segnalazioni gia evolute in ticket`
						: 'Nessuna pratica operativa collegata'
				]
			: []
	);

	const createdReportId = $derived(page.url.searchParams.get('report') ?? '');
	const createdReport = $derived(
		createdReportId ? sortedReports.find((report) => report.id === createdReportId) : undefined
	);

	const filterStats = $derived([
		{
			key: 'all' as const,
			label: 'Tutte',
			value: sortedReports.length,
			copy: 'Storico completo delle segnalazioni inviate.'
		},
		{
			key: 'open' as const,
			label: 'Aperte',
			value: sortedReports.filter((report) => {
				const status = getCurrentStatus(report);
				return status === 'nuova' || status === 'presa_in_carico';
			}).length,
			copy: 'Pratiche ancora aperte o in lavorazione.'
		},
		{
			key: 'presa_in_carico' as const,
			label: 'In carico',
			value: sortedReports.filter((report) => getCurrentStatus(report) === 'presa_in_carico').length,
			copy: 'Segnalazioni gia prese in carico.'
		},
		{
			key: 'completata' as const,
			label: 'Completate',
			value: sortedReports.filter((report) => getCurrentStatus(report) === 'completata').length,
			copy: 'Pratiche chiuse con intervento completato.'
		}
	]);
	const activeFilterSummary = $derived(
		filterStats.find((item) => item.key === statusFilter) ?? filterStats[0]
	);

	const filteredReportContexts = $derived.by(() => {
		let items = operationalContexts;

		if (statusFilter !== 'all') {
			items = items.filter(({ report }) => {
				const status = getCurrentStatus(report);
				if (statusFilter === 'open') return status === 'nuova' || status === 'presa_in_carico';
				return status === statusFilter;
			});
		}

		const priorityRank: Record<string, number> = {
			critica: 0,
			alta: 1,
			media: 2,
			bassa: 3
		};

		return [...items].sort((left, right) => {
			if (sortMode === 'created') {
				return new Date(right.report.createdAt).getTime() - new Date(left.report.createdAt).getTime();
			}

			if (sortMode === 'priority') {
				return priorityRank[left.report.priority] - priorityRank[right.report.priority];
			}

			if (sortMode === 'title') {
				return left.report.title.localeCompare(right.report.title, 'it');
			}

			return (
				new Date(right.report.updatedAt ?? right.report.statusHistory.at(-1)?.at ?? 0).getTime() -
				new Date(left.report.updatedAt ?? left.report.statusHistory.at(-1)?.at ?? 0).getTime()
			);
		});
	});

	const activeStatusFilterLabel = $derived(
		statusFilter === 'all'
			? 'tutti gli stati'
			: statusFilter === 'open'
				? 'solo pratiche aperte'
				: statusFilter === 'presa_in_carico'
					? 'solo prese in carico'
					: 'solo completate'
	);
	const selectedSortLabel = $derived(
		sortMode === 'updated'
			? 'Ultimo aggiornamento'
			: sortMode === 'created'
				? 'Data di invio'
				: sortMode === 'priority'
					? 'Priorita alta prima'
					: 'Ordine alfabetico'
	);
	const reportListCopy = $derived(
		`Stai visualizzando ${filteredReportContexts.length} pratiche con filtro su ${activeStatusFilterLabel.toLowerCase()}, ordinate per ${selectedSortLabel.toLowerCase()}.`
	);
</script>

<svelte:head>
	<title>Segnalazioni - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="reports-page">
	<div class="reports-stack">
		<section class="report-page-header">
			<div class="report-page-header__main">
				<p class="report-page-header__eyebrow">Area residente</p>
				<div class="resident-heading-with-tip">
					<h1 class="report-page-header__title">Le mie segnalazioni</h1>
					<InfoTip text="Qui trovi le pratiche che hai aperto, il loro stato attuale e gli eventuali avanzamenti registrati." />
				</div>
				<p class="report-page-header__copy">{summaryCopy}</p>
			</div>

			<div class="report-page-header__stats" aria-label="Panoramica segnalazioni">
				{#each summaryStats as stat}
					<div class="report-page-header__stat">
						<p class="report-page-header__stat-label">{stat.label}</p>
						<p class="report-page-header__stat-value">{stat.value}</p>
					</div>
				{/each}
			</div>

			{#if summaryChips.length > 0}
				<div class="report-page-header__chips">
					{#each summaryChips as chip}
						<span class="report-page-header__chip">{chip}</span>
					{/each}
				</div>
			{/if}
		</section>

		{#if createdReport}
			<div class="report-created-banner">
				<div>
					<p class="report-created-banner__title">Segnalazione inviata correttamente</p>
					<p class="report-created-banner__copy">
						La nuova segnalazione {createdReport.id} e ora visibile nella tua lista. Puoi aprirla per controllare il riepilogo completo.
					</p>
				</div>
				<Button href={`/resident/reports/${createdReport.id}`} variant="secondary" size="lg">
					Apri segnalazione
				</Button>
			</div>
		{/if}

		<section class="report-list-shell">
			<div class="report-list-shell__header">
				<div class="report-list-shell__heading">
					<div class="resident-heading-with-tip">
						<h2 class="report-list-shell__title">Lista segnalazioni</h2>
						<InfoTip text="Ogni pratica raccoglie stato corrente, priorita e storico degli avanzamenti registrati." />
					</div>
					<p class="report-list-shell__copy">{reportListCopy}</p>
				</div>

				<Button href="/resident/reports/new" size="lg" class="report-list-shell__button">
					<HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2.25} />
					<span>Nuova segnalazione</span>
				</Button>
			</div>

			<div class="report-list-shell__toolbar" aria-label="Filtri segnalazioni">
				<div class="report-sorter">
					<p class="report-sorter__label">Stato</p>
					<Select type="single" bind:value={statusFilter}>
						<SelectTrigger class="report-sorter__trigger">
							{activeFilterSummary.label}
						</SelectTrigger>
						<SelectContent>
							{#each filterStats as item}
								<SelectItem value={item.key} label={`${item.label} (${item.value})`} />
							{/each}
						</SelectContent>
					</Select>
					<p class="report-sorter__hint">{activeFilterSummary.copy}</p>
				</div>

				<div class="report-sorter">
					<p class="report-sorter__label">Ordina per</p>
					<Select type="single" bind:value={sortMode}>
						<SelectTrigger class="report-sorter__trigger">
							{selectedSortLabel}
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="updated" label="Ultimo aggiornamento" />
							<SelectItem value="created" label="Data di invio" />
							<SelectItem value="priority" label="Priorita alta prima" />
							<SelectItem value="title" label="Ordine alfabetico" />
						</SelectContent>
					</Select>
				</div>
			</div>

			<div class="report-cards-stack" aria-label="Lista segnalazioni">
				{#each filteredReportContexts as item}
					<ResidentReportCard
						ticket={item.report}
						href={`/resident/reports/${item.report.id}`}
						propertyName={property?.name}
						apartment={resident?.apartment}
						updatedAtLabel={formatTicketDate(item.report.updatedAt ?? item.report.statusHistory.at(-1)?.at)}
						operationalTicketId={item.operational?.ticket.id}
						operationalStatusLabel={item.operational ? ticketStatusLabels[item.operational.status] : undefined}
						operationalSupplierLabel={item.operational?.supplierLabel}
					/>
				{/each}

				{#if filteredReportContexts.length === 0}
					<div class="report-list-shell__empty">
						<p class="report-list-shell__empty-title">Nessuna segnalazione in questa vista</p>
						<p class="report-list-shell__empty-copy">
							Cambia filtro oppure crea una nuova segnalazione.
						</p>
					</div>
				{/if}
			</div>
		</section>
	</div>
</div>
