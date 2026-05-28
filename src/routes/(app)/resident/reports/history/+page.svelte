<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import { ResidentEmptyCard } from '$lib/components/view-resident/resident';
	import {
		ResidentReportCard,
		formatTicketDate,
		getReportOperationalContext,
		getResidentVisibleTicketsByCreatorId,
		ticketStatusLabels
	} from '$lib/components/view-resident/reports';
	import { getCurrentUser } from '$lib/auth';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentById } from '$lib/data/residents';
	import {
		getReportCreatedAt,
		getReportUpdatedAt,
		inferReportStatus
	} from '$lib/data/ticket/reports';

	const currentUser = getCurrentUser();
	const resident = $derived(currentUser ? getResidentById(currentUser.id) : undefined);
	const property = $derived(resident ? getPropertyById(resident.propertyId) : undefined);
	const allReports = $derived(
		currentUser
			? getResidentVisibleTicketsByCreatorId(currentUser.id).sort(
					(a, b) =>
						new Date(getReportUpdatedAt(b) ?? 0).getTime() -
						new Date(getReportUpdatedAt(a) ?? 0).getTime()
				)
			: []
	);
	const operationalContexts = $derived(
		allReports.map((report) => ({
			report,
			operational: getReportOperationalContext(report)
		}))
	);

	let statusFilter = $state<'all' | 'open' | 'presa in carico' | 'chiusa'>('all');
	let sortMode = $state<'updated' | 'created' | 'priority' | 'title'>('updated');

	const filterStats = $derived([
		{
			key: 'all' as const,
			label: 'Tutte',
			value: allReports.length,
			copy: 'Tutte le pratiche inviate dal tuo profilo.'
		},
		{
			key: 'open' as const,
			label: 'Aperte',
			value: allReports.filter((report) => {
				const status = inferReportStatus(report);
				return status === 'nuova' || status === 'presa in carico';
			}).length,
			copy: 'Segnalazioni ancora aperte o in lavorazione.'
		},
		{
			key: 'presa in carico' as const,
			label: 'In carico',
			value: allReports.filter((report) => inferReportStatus(report) === 'presa in carico').length,
			copy: 'Pratiche gia prese in gestione.'
		},
		{
			key: 'chiusa' as const,
			label: 'Completate',
			value: allReports.filter((report) => inferReportStatus(report) === 'chiusa').length,
			copy: 'Segnalazioni concluse.'
		}
	]);
	const activeFilterSummary = $derived(
		filterStats.find((item) => item.key === statusFilter) ?? filterStats[0]
	);

	const filteredReportContexts = $derived.by(() => {
		let items = operationalContexts;

		if (statusFilter !== 'all') {
			items = items.filter(({ report }) => {
				const status = inferReportStatus(report);
				if (statusFilter === 'open') return status === 'nuova' || status === 'presa in carico';
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
				return (
					new Date(getReportCreatedAt(right.report) ?? 0).getTime() -
					new Date(getReportCreatedAt(left.report) ?? 0).getTime()
				);
			}

			if (sortMode === 'priority') {
				return priorityRank[left.report.priority] - priorityRank[right.report.priority];
			}

			if (sortMode === 'title') {
				return left.report.title.localeCompare(right.report.title, 'it');
			}

			return (
				new Date(getReportUpdatedAt(right.report) ?? 0).getTime() -
				new Date(getReportUpdatedAt(left.report) ?? 0).getTime()
			);
		});
	});

	const activeStatusFilterLabel = $derived(
		statusFilter === 'all'
			? 'tutti gli stati'
			: statusFilter === 'open'
				? 'solo pratiche aperte'
				: statusFilter === 'presa in carico'
					? 'solo pratiche in carico'
					: 'solo pratiche completate'
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
	const historyCopy = $derived(
		property && resident
			? `${property.name}, ${resident.apartment}. Qui trovi tutte le segnalazioni gia inviate dal tuo profilo.`
			: 'Qui trovi tutte le segnalazioni gia inviate dal tuo profilo.'
	);
	const reportListCopy = $derived(
		`Stai visualizzando ${filteredReportContexts.length} pratiche con filtro su ${activeStatusFilterLabel.toLowerCase()}, ordinate per ${selectedSortLabel.toLowerCase()}.`
	);
</script>

<svelte:head>
	<title>Storico segnalazioni - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="reports-page reports-page--detail">
	<Button href="/resident/reports" variant="link" class="report-back-button">
		&lt; Torna a Segnala
	</Button>

	{#if !currentUser || !resident || !property}
		<ResidentEmptyCard
			title="Profilo residente non disponibile"
			copy="Non e possibile consultare lo storico senza un profilo residente attivo."
		/>
	{:else}
		<div class="reports-stack">
			<section class="report-page-header report-page-header--compact">
				<div class="report-page-header__main">
					<p class="report-page-header__eyebrow">Area residente</p>
					<h1 class="report-page-header__title">Storico segnalazioni</h1>
					<p class="report-page-header__copy">{historyCopy}</p>
				</div>
			</section>

			<section class="report-list-shell">
				<div class="report-list-shell__header">
					<div class="report-list-shell__heading">
						<h2 class="report-list-shell__title">Le tue pratiche</h2>
						<p class="report-list-shell__copy">{reportListCopy}</p>
					</div>
				</div>

				<div class="report-list-shell__toolbar" aria-label="Filtri storico segnalazioni">
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

				<div class="report-cards-stack" aria-label="Storico segnalazioni">
					{#each filteredReportContexts as item}
						<ResidentReportCard
							ticket={item.report}
							href={`/resident/reports/${item.report.id}`}
							propertyName={property.name}
							apartment={resident.apartment}
							updatedAtLabel={formatTicketDate(getReportUpdatedAt(item.report))}
							operationalTicketId={item.operational?.ticket.id}
							operationalStatusLabel={item.operational ? ticketStatusLabels[item.operational.status] : undefined}
							operationalSupplierLabel={item.operational?.supplierLabel}
						/>
					{/each}

					{#if filteredReportContexts.length === 0}
						<div class="report-list-shell__empty">
							<p class="report-list-shell__empty-title">Nessuna segnalazione in questa vista</p>
							<p class="report-list-shell__empty-copy">
								Cambia filtro oppure torna a Segnala per aprire una nuova pratica.
							</p>
						</div>
					{/if}
				</div>
			</section>
		</div>
	{/if}
</div>
