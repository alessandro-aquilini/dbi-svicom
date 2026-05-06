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
	import { Separator } from '$lib/components/ui/separator';
	import type { SvicomDocument } from '$lib/data/documents';
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
		document: SvicomDocument;
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

		<div class="document-card-shell__facts">
			<div class="document-card-shell__fact">
				<p class="document-card-shell__fact-label">Caricato da</p>
				<p class="document-card-shell__fact-value">{uploadedByLabel}</p>
			</div>
			<div class="document-card-shell__fact">
				<p class="document-card-shell__fact-label">Formato</p>
				<p class="document-card-shell__fact-value">{document.type.toUpperCase()}</p>
			</div>
		</div>
	</CardContent>

	<Separator class="document-card-shell__separator" />

	<CardFooter class="document-card-shell__footer">
		<div class="document-card-shell__path">
			<p class="document-card-shell__path-label">Riferimento file</p>
			<p class="document-card-shell__path-value">{document.url}</p>
		</div>

		<div class="document-card-shell__actions">
			{#if assistantHref}
				<Button href={assistantHref} variant="outline" size="lg" class="document-card-shell__button">
					Apri assistente
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
