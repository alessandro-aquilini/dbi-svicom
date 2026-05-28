<script lang="ts">
	import { page } from '$app/state';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Add01Icon, Building03Icon, Home01Icon } from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { getCurrentUser } from '$lib/auth';
	import { getResidentVisibleTicketsByCreatorId } from '$lib/components/view-resident/reports';
	import { getReportUpdatedAt } from '$lib/data/ticket/reports';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentById } from '$lib/data/residents';

	const currentUser = getCurrentUser();
	const resident = $derived(currentUser ? getResidentById(currentUser.id) : undefined);
	const property = $derived(resident ? getPropertyById(resident.propertyId) : undefined);
	const visibleReports = $derived(
		currentUser
			? getResidentVisibleTicketsByCreatorId(currentUser.id).sort(
					(a, b) =>
						new Date(getReportUpdatedAt(b) ?? 0).getTime() -
						new Date(getReportUpdatedAt(a) ?? 0).getTime()
				)
			: []
	);
	const createdReportId = $derived(page.url.searchParams.get('report') ?? '');
	const createdReport = $derived(
		createdReportId ? visibleReports.find((report) => report.id === createdReportId) : undefined
	);
</script>

<svelte:head>
	<title>Segnala - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="reports-page">
	<div class="reports-stack">
		<section class="report-page-header report-page-header--compact">
			<div class="report-page-header__main">
				<p class="report-page-header__eyebrow">Area residente</p>
				<h1 class="report-page-header__title">Segnala</h1>
				<p class="report-page-header__copy">
					Apri una nuova segnalazione per guasti, anomalie o richieste operative del tuo
					stabile.
				</p>
			</div>
		</section>

		{#if createdReport}
			<div class="report-created-banner">
				<div>
					<p class="report-created-banner__title">Segnalazione inviata correttamente</p>
					<p class="report-created-banner__copy">
						La pratica {createdReport.id} e pronta. Puoi aprirla subito per controllare il
						riepilogo completo.
					</p>
				</div>
				<Button href={`/resident/reports/${createdReport.id}`} variant="secondary" size="lg">
					Apri dettaglio
				</Button>
			</div>
		{/if}

		<Card class="report-entry-card">
			<CardHeader class="report-entry-card__header">
				<div class="report-entry-card__heading">
					<p class="report-entry-card__eyebrow">Nuova segnalazione</p>
					<CardTitle class="report-entry-card__title">Racconta cosa non va</CardTitle>
					<CardDescription class="report-entry-card__copy">
						Descrivi il problema, aggiungi eventuali foto e invia la pratica in pochi passaggi.
					</CardDescription>
				</div>
			</CardHeader>

			<CardContent class="report-entry-card__content">
				<div class="report-entry-card__facts">
					{#if property}
						<div class="report-entry-card__fact">
							<div class="report-entry-card__fact-icon" aria-hidden="true">
								<HugeiconsIcon icon={Building03Icon} size={16} strokeWidth={1.9} />
							</div>
							<div>
								<p class="report-entry-card__fact-label">Condominio</p>
								<p class="report-entry-card__fact-value">{property.name}</p>
							</div>
						</div>
					{/if}

					{#if resident}
						<div class="report-entry-card__fact">
							<div class="report-entry-card__fact-icon" aria-hidden="true">
								<HugeiconsIcon icon={Home01Icon} size={16} strokeWidth={1.9} />
							</div>
							<div>
								<p class="report-entry-card__fact-label">Unita</p>
								<p class="report-entry-card__fact-value">{resident.apartment}</p>
							</div>
						</div>
					{/if}
				</div>

				<div class="report-entry-card__actions">
					<Button href="/resident/reports/new" size="lg" class="report-entry-card__button">
						<HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2.25} />
						<span>Nuova segnalazione</span>
					</Button>
					<Button
						href="/resident/reports/history"
						variant="outline"
						size="lg"
						class="report-entry-card__button report-entry-card__button--secondary"
					>
						Storico segnalazioni
					</Button>
					<p class="report-entry-card__hint">
						Puoi compilare i campi a mano oppure raccontare il problema per farti aiutare nella
						precompilazione.
					</p>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
