<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardAction,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { ResidentProBadge } from '$lib/components/view-resident/resident';
	import type { PropertyDocument } from '$lib/data/documents';
	import { documentCategoryLabels } from './presentation';
	import DocumentStatusBadge from './DocumentStatusBadge.svelte';
	import DocumentTypeBadge from './DocumentTypeBadge.svelte';

	let {
		document,
		uploadedByLabel,
		updatedAtLabel,
		href,
		assistantHref
	}: {
		document: PropertyDocument;
		uploadedByLabel: string;
		updatedAtLabel: string;
		href?: string;
		assistantHref?: string;
	} = $props();
</script>

<Card class="document-card-shell">
	<CardHeader class="document-card-shell__header">
		<div class="document-card-shell__header-main">
			<p class="document-card-shell__eyebrow">{documentCategoryLabels[document.category]}</p>
			<CardTitle class="document-card-shell__title">{document.title}</CardTitle>
			<CardDescription class="document-card-shell__description">{document.summary}</CardDescription>
		</div>
		<CardAction>
			<DocumentTypeBadge type={document.type} />
		</CardAction>
	</CardHeader>

	<CardContent class="document-card-shell__content">
		<div class="document-card-shell__meta">
			<DocumentStatusBadge status={document.status} />
			<span class="document-card-shell__chip">Aggiornato {updatedAtLabel}</span>
		</div>

		<dl class="document-card-shell__facts">
			<div class="document-card-shell__fact">
				<dt class="document-card-shell__fact-label">Caricato da</dt>
				<dd class="document-card-shell__fact-value">{uploadedByLabel}</dd>
			</div>
			<div class="document-card-shell__fact">
				<dt class="document-card-shell__fact-label">Formato</dt>
				<dd class="document-card-shell__fact-value">{document.type.toUpperCase()}</dd>
			</div>
		</dl>

		<div class="document-card-shell__path">
			<p class="document-card-shell__path-label">Riferimento file</p>
			<p class="document-card-shell__path-value">{document.url}</p>
		</div>
	</CardContent>

	<CardFooter class="document-card-shell__footer">
		<div class="document-card-shell__actions">
			{#if assistantHref}
				<Button href={assistantHref} variant="outline" size="lg" class="document-card-shell__button">
					<span>Apri assistente</span>
					<ResidentProBadge class="document-card-shell__pro-badge" />
				</Button>
			{/if}
			{#if href}
				<Button href={href} size="lg" class="document-card-shell__button">
					Apri scheda
				</Button>
			{/if}
		</div>
	</CardFooter>
</Card>
