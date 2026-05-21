<!-- TODO: Importare anche "invoices.ts" e "quotas.ts" dalla chat con il fornitore. Per ora solo i documenti in document.ts -->

	<script lang="ts">
	import { ResidentDocumentCard, formatDocumentDate } from '$lib/components/view-resident/documents';
	import {
		ResidentEmptyCard
	} from '$lib/components/view-resident/resident';
	import { InfoTip } from '$lib/components/shared';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import { getCurrentUser } from '$lib/auth';
	import { getDocumentsByPropertyId } from '$lib/data/documents';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentById } from '$lib/data/residents';
	import { getUserById } from '$lib/data/users';

	const currentUser = getCurrentUser();
	const resident = currentUser ? getResidentById(currentUser.id) : undefined;
	const property = resident ? getPropertyById(resident.propertyId) : undefined;
	const documents = property ? getDocumentsByPropertyId(property.id) : [];
	const propertyAdmin = property ? getUserById(property.adminId) : undefined;

	const sortedDocuments = [...documents].sort((left, right) =>
		right.updatedAt.localeCompare(left.updatedAt)
	);
	const distinctCategories = [...new Set(sortedDocuments.map((document) => document.category))].length;
	let selectedDocumentCategory = $state('all');
	const categoryOptions = $derived([
		{ value: 'all', label: 'Tutte le categorie', copy: 'Stai visualizzando l archivio completo.' },
		...[...new Set(sortedDocuments.map((document) => document.category))]
			.sort((left, right) => left.localeCompare(right))
			.map((category) => {
				const total = sortedDocuments.filter((document) => document.category === category).length;
				return {
					value: category,
					label: category.charAt(0).toUpperCase() + category.slice(1),
					copy: `${total} documenti in questa categoria.`
				};
			})
	]);
	const selectedCategoryOption = $derived(
		categoryOptions.find((option) => option.value === selectedDocumentCategory) ?? categoryOptions[0]
	);
	const filteredDocuments = $derived(
		selectedDocumentCategory !== 'all'
			? sortedDocuments.filter((document) => document.category === selectedDocumentCategory)
			: sortedDocuments
	);

	const summaryCopy =
		property && resident
			? `${property.name}, ${resident.apartment}. Consulta regolamenti, ripartizioni e allegati disponibili per il tuo stabile.`
			: 'Profilo residente non disponibile.';

	const summaryStats = [
		{ label: 'Documenti disponibili', value: sortedDocuments.length },
		{ label: 'Documenti essenziali', value: sortedDocuments.filter((document) => document.status === 'Essenziale').length },
		{ label: 'Categorie presenti', value: distinctCategories }
	];

	const summaryChips = property
		? [
				property.address.street,
				propertyAdmin ? `Admin: ${propertyAdmin.name}` : 'Admin non disponibile',
				sortedDocuments[0]
					? `Ultimo aggiornamento ${formatDocumentDate(sortedDocuments[0].updatedAt)}`
					: 'Nessun aggiornamento'
			]
		: [];
</script>

<svelte:head>
	<title>Documenti - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="resident-module-stack">
		<section class="report-page-header">
			<div class="report-page-header__main">
				<p class="report-page-header__eyebrow">Area residente</p>
				<div class="resident-heading-with-tip">
					<h1 class="report-page-header__title">Documenti</h1>
					<InfoTip text="Qui trovi regolamenti, ripartizioni e allegati disponibili per il tuo stabile, sempre ordinati e facili da consultare." />
				</div>
				<p class="report-page-header__copy">{summaryCopy}</p>
			</div>

			<div class="report-page-header__stats" aria-label="Panoramica documenti">
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

		<section class="resident-module-section">
			<div class="resident-module-section__header">
				<div class="resident-heading-with-tip">
					<h2 class="resident-module-section__title">Archivio documenti</h2>
					<InfoTip text="Filtra rapidamente l archivio per categoria e poi apri il documento che ti serve." />
				</div>
				<p class="resident-module-section__copy">
					{selectedCategoryOption.copy}
				</p>
			</div>

			<div class="report-sorter">
				<p class="report-sorter__label">Categoria</p>
				<Select type="single" bind:value={selectedDocumentCategory}>
					<SelectTrigger class="report-sorter__trigger">
						{selectedCategoryOption.label}
					</SelectTrigger>
					<SelectContent>
						{#each categoryOptions as option}
							<SelectItem value={option.value} label={option.label} />
						{/each}
					</SelectContent>
				</Select>
			</div>
		</section>

		{#if filteredDocuments.length > 0}
			<section class="resident-module-section">
				<div class="resident-module-section__header">
					<div class="resident-heading-with-tip">
						<h2 class="resident-module-section__title">Documenti disponibili</h2>
						<InfoTip text="L archivio e ordinato dal piu recente al meno recente per rendere piu facile ritrovare gli aggiornamenti." />
					</div>
					<p class="resident-module-section__copy">
						Tutti i documenti disponibili per il tuo stabile, ordinati dal piu recente.
					</p>
				</div>

				<div class="document-cards-stack">
					{#each filteredDocuments as document}
						<ResidentDocumentCard
							document={document}
							uploadedByLabel={getUserById(document.uploadedBy)?.name ?? 'Operatore Svicom'}
							updatedAtLabel={formatDocumentDate(document.updatedAt)}
							href={`/resident/documents/${document.id}`}
							assistantHref={`/resident/documents/${document.id}?assistant=1`}
						/>
					{/each}
				</div>
			</section>
		{/if}

		{#if sortedDocuments.length === 0}
			<ResidentEmptyCard
				title="Nessun documento disponibile"
				copy="Quando saranno disponibili nuovi allegati del tuo stabile, li troverai qui."
			/>
		{/if}
	</div>
</div>
