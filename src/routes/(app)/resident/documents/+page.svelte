<script lang="ts">
	import { ResidentDocumentCard, formatDocumentDate } from '$lib/components/documents';
	import { ResidentEmptyCard, ResidentSummaryCard } from '$lib/components/resident';
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
	const featuredDocument = sortedDocuments[0];
	const essentialDocuments = sortedDocuments.filter(
		(document) => document.status === 'Essenziale' && document.id !== featuredDocument?.id
	);
	const archiveDocuments = sortedDocuments.filter(
		(document) => document.status !== 'Essenziale' && document.id !== featuredDocument?.id
	);
	const distinctCategories = [...new Set(sortedDocuments.map((document) => document.category))].length;

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
				featuredDocument ? `Ultimo aggiornamento ${formatDocumentDate(featuredDocument.updatedAt)}` : 'Nessun aggiornamento'
			]
		: [];
</script>

<svelte:head>
	<title>Documenti - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="resident-module-stack">
		<ResidentSummaryCard
			eyebrow="Area residente"
			title="Documenti"
			copy={summaryCopy}
			stats={summaryStats}
			chips={summaryChips}
		/>

		{#if featuredDocument}
			<section class="resident-module-section">
				<div class="resident-module-section__header">
					<h1 class="resident-module-section__title">In primo piano</h1>
					<p class="resident-module-section__copy">
						Il documento aggiornato piu di recente e pronto per la consultazione.
					</p>
				</div>

				<div class="document-cards-stack">
					<ResidentDocumentCard
						document={featuredDocument}
						uploadedByLabel={getUserById(featuredDocument.uploadedBy)?.name ?? 'Operatore Svicom'}
						updatedAtLabel={formatDocumentDate(featuredDocument.updatedAt)}
						href={`/resident/documents/${featuredDocument.id}`}
						assistantHref={`/resident/documents/${featuredDocument.id}?assistant=1`}
					/>
				</div>
			</section>
		{/if}

		{#if essentialDocuments.length > 0}
			<section class="resident-module-section">
				<div class="resident-module-section__header">
					<h2 class="resident-module-section__title">Documenti essenziali</h2>
					<p class="resident-module-section__copy">
						Regole e riferimenti da tenere sempre a portata di mano.
					</p>
				</div>

				<div class="document-cards-stack">
					{#each essentialDocuments as document}
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

		{#if archiveDocuments.length > 0}
			<section class="resident-module-section">
				<div class="resident-module-section__header">
					<h2 class="resident-module-section__title">Archivio documenti</h2>
					<p class="resident-module-section__copy">
						Tutti i documenti disponibili per il tuo stabile, ordinati dal piu recente.
					</p>
				</div>

				<div class="document-cards-stack">
					{#each archiveDocuments as document}
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
