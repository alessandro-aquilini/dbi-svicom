<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { getCurrentUser } from '$lib/auth';
	import {
		ResidentReportCard,
		formatTicketDate,
		getResidentVisibleTicketsByCreatorId
	} from '$lib/components/tickets';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentById } from '$lib/data/residents';

	const currentUser = getCurrentUser();
	const resident = $derived(currentUser ? getResidentById(currentUser.id) : undefined);
	const property = $derived(resident ? getPropertyById(resident.propertyId) : undefined);
	const myReports = $derived(getResidentVisibleTicketsByCreatorId(currentUser?.id));
	const sortedReports = $derived(
		[...myReports].sort((left, right) => {
			const leftAt = left.statusHistory.at(-1)?.at ?? '';
			const rightAt = right.statusHistory.at(-1)?.at ?? '';
			return rightAt.localeCompare(leftAt);
		})
	);
	const featuredReport = $derived(sortedReports[0]);
</script>

<svelte:head>
	<title>Segnalazioni - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="reports-page">
	<div class="reports-stack">
		<Card class="report-summary-card">
			<CardHeader class="report-summary-card__header">
				<p class="report-summary-card__eyebrow">Area residente</p>
				<CardTitle class="report-summary-card__title">Le mie segnalazioni</CardTitle>
				<p class="report-summary-card__copy">
					{#if currentUser && resident && property}
						{currentUser.name} - {property.name} - {resident.apartment}
					{:else}
						Il profilo residente non disponibile.
					{/if}
				</p>
			</CardHeader>

			<CardContent class="report-summary-card__content">
				<div class="report-summary-card__stats">
					<div class="report-summary-card__stat">
						<p class="report-summary-card__stat-label">Ticket collegati al profilo</p>
						<p class="report-summary-card__stat-value">{sortedReports.length}</p>
					</div>
					<div class="report-summary-card__stat">
						<p class="report-summary-card__stat-label">Ultimo aggiornamento</p>
						<p class="report-summary-card__stat-value">
							{featuredReport ? formatTicketDate(featuredReport.statusHistory.at(-1)?.at) : 'Nessun ticket'}
						</p>
					</div>
				</div>

				<div class="report-summary-card__meta">
					{#if property}
						<span class="report-chip">{property.address.street}</span>
					{/if}
					{#if featuredReport}
						<span class="report-chip">Pratica in evidenza: {featuredReport.id}</span>
					{/if}
				</div>

				<div class="report-summary-card__actions">
					<Button href="/resident/reports/new" size="lg" class="report-summary-card__button">
						Nuova segnalazione
					</Button>
				</div>
			</CardContent>
		</Card>

		<section class="report-cards-stack" aria-label="Lista segnalazioni">
			{#each sortedReports as report}
				<ResidentReportCard
					ticket={report}
					href={`/resident/reports/${report.id}`}
					propertyName={property?.name}
					apartment={resident?.apartment}
					updatedAtLabel={formatTicketDate(report.statusHistory.at(-1)?.at)}
				/>
			{/each}

			{#if sortedReports.length === 0}
				<Card class="report-empty-card">
					<CardContent class="report-empty-card__content">
						<p class="report-empty-card__title">Nessuna segnalazione disponibile</p>
						<p class="report-empty-card__copy">Quando invierai una pratica la vedrai comparire qui.</p>
					</CardContent>
				</Card>
			{/if}
		</section>
	</div>
</div>
