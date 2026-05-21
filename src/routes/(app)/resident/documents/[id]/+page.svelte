<script lang="ts">
	import {
		DocumentAssistantDialog,
		DocumentStatusBadge,
		DocumentTypeBadge,
		ResidentDocumentCard,
		documentCategoryLabels,
		documentTypeLabels,
		formatDocumentDate
	} from '$lib/components/view-resident/documents';
	import { ResidentEmptyCard } from '$lib/components/view-resident/resident';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { getCurrentUser } from '$lib/auth';
	import { getAnnouncementsByPropertyId } from '$lib/data/announcements';
	import { getAssembliesByPropertyId } from '$lib/data/events/assemblies';
	import { getDocumentById, getDocumentsByPropertyId } from '$lib/data/documents';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentById } from '$lib/data/residents';
	import { getUserById } from '$lib/data/users';
	import { page } from '$app/state';

	const currentUser = getCurrentUser();
	const resident = currentUser ? getResidentById(currentUser.id) : undefined;
	const property = resident ? getPropertyById(resident.propertyId) : undefined;
	const propertyDocuments = property ? getDocumentsByPropertyId(property.id) : [];
	const announcements = property ? getAnnouncementsByPropertyId(property.id) : [];
	const assemblies = property ? getAssembliesByPropertyId(property.id) : [];
	const propertyAdmin = property ? getUserById(property.adminId) : undefined;

	const documentId = $derived(page.params.id ?? '');
	const openAssistant = $derived(page.url.searchParams.get('assistant') === '1');
	const document = $derived(getDocumentById(documentId));
	const isAccessibleDocument = $derived(Boolean(property && document && document.propertyId === property.id));
	const uploader = $derived(document ? getUserById(document.uploadedBy) : undefined);
	const relatedDocuments = $derived(
		isAccessibleDocument && document
			? propertyDocuments.filter((item) => item.id !== document.id)
			: []
	);

	const documentFacts = $derived(
		document
			? [
					{ label: 'Categoria', value: documentCategoryLabels[document.category] },
					{ label: 'Formato', value: documentTypeLabels[document.type] },
					{ label: 'Aggiornato il', value: formatDocumentDate(document.updatedAt) },
					{ label: 'Caricato da', value: uploader?.name ?? 'Operatore Svicom' },
					{ label: 'Stato', value: document.status },
					{ label: 'Riferimento file', value: document.url }
				]
			: []
	);

	const residentFacts = $derived(
		property && resident
			? [
					{ label: 'Condominio', value: property.name },
					{ label: 'Unita abitativa', value: resident.apartment },
					{ label: 'Indirizzo', value: property.address.street },
					{ label: 'Amministratore', value: propertyAdmin?.name ?? 'Non disponibile' }
				]
			: []
	);
</script>

<svelte:head>
	<title>{document?.title ?? 'Dettaglio documento'} - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="resident-module-page">
	<div class="resident-module-stack">
		<div class="document-detail-actions">
			<Button href="/resident/documents" variant="ghost" class="document-detail-actions__back">
				&lt; Tutti i documenti
			</Button>
		</div>

		{#if !isAccessibleDocument || !document || !property}
			<ResidentEmptyCard
				title="Documento non disponibile"
				copy="Il documento richiesto non appartiene al profilo residente attivo o non e disponibile."
			/>
		{:else}
			<Card class="document-detail-card">
				<CardHeader class="document-detail-card__header">
					<div class="document-detail-card__heading">
						<p class="document-detail-card__eyebrow">{property.name}</p>
						<CardTitle class="document-detail-card__title">{document.title}</CardTitle>
						<CardDescription class="document-detail-card__copy">{document.summary}</CardDescription>
					</div>

					<div class="document-detail-card__badge-row">
						<DocumentTypeBadge type={document.type} />
						<DocumentStatusBadge status={document.status} />
					</div>
				</CardHeader>
			</Card>

			<div class="document-detail-panels">
				<Card class="document-detail-context-card">
					<CardHeader>
						<CardTitle>Dettagli file</CardTitle>
						<CardDescription>
							Informazioni principali per identificare il documento e la sua versione.
						</CardDescription>
					</CardHeader>

					<CardContent class="document-detail-context-card__content">
						<div class="document-detail-context-card__facts">
							{#each documentFacts as fact}
								<div class="document-detail-context-card__fact">
									<p class="document-detail-context-card__fact-label">{fact.label}</p>
									<p class="document-detail-context-card__fact-value">{fact.value}</p>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>

				<Card class="document-detail-context-card">
					<CardHeader>
						<CardTitle>Riferimenti residenti</CardTitle>
						<CardDescription>
							Contesto essenziale per leggere il documento all'interno del tuo stabile.
						</CardDescription>
					</CardHeader>

					<CardContent class="document-detail-context-card__content">
						<div class="document-detail-context-card__facts">
							{#each residentFacts as fact}
								<div class="document-detail-context-card__fact">
									<p class="document-detail-context-card__fact-label">{fact.label}</p>
									<p class="document-detail-context-card__fact-value">{fact.value}</p>
								</div>
							{/each}
						</div>

						<div class="document-detail-context-card__chips">
							<Badge variant="outline" class="document-detail-context-card__chip">
								{documentCategoryLabels[document.category]}
							</Badge>
							<Badge variant="outline" class="document-detail-context-card__chip">
								{documentTypeLabels[document.type]}
							</Badge>
							{#each property.tags as tag}
								<Badge variant="secondary" class="document-detail-context-card__chip">{tag}</Badge>
							{/each}
						</div>
					</CardContent>
				</Card>
			</div>

			<DocumentAssistantDialog
				context={{
					document,
					property,
					uploader,
					admin: propertyAdmin,
					announcements,
					assemblies
				}}
				initiallyOpen={openAssistant}
			/>

			{#if relatedDocuments.length > 0}
				<Card class="document-detail-context-card">
					<CardHeader>
						<CardTitle>Altri documenti disponibili</CardTitle>
						<CardDescription>
							Altri allegati utili presenti per il tuo stesso stabile.
						</CardDescription>
					</CardHeader>

					<CardContent class="document-detail-context-card__content">
						<div class="document-cards-stack">
							{#each relatedDocuments as relatedDocument}
								<ResidentDocumentCard
									document={relatedDocument}
									uploadedByLabel={getUserById(relatedDocument.uploadedBy)?.name ?? 'Operatore Svicom'}
									updatedAtLabel={formatDocumentDate(relatedDocument.updatedAt)}
									href={`/resident/documents/${relatedDocument.id}`}
									assistantHref={`/resident/documents/${relatedDocument.id}?assistant=1`}
								/>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/if}
		{/if}
	</div>
</div>
