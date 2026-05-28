<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { ResidentProBadge } from '$lib/components/view-resident/resident';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import DocumentDemoChat from './DocumentDemoChat.svelte';
	import type { DocumentDemoContext } from './presentation';

	let {
		context,
		initiallyOpen = false
	}: {
		context: DocumentDemoContext;
		initiallyOpen?: boolean;
	} = $props();

	let isOpen = $state(false);

	$effect(() => {
		if (initiallyOpen) {
			isOpen = true;
		}
	});
</script>

<Card class="document-assistant-launcher">
	<CardContent class="document-assistant-launcher__content">
		<div class="document-assistant-launcher__main">
			<p class="document-assistant-launcher__eyebrow">Assistente documento</p>
			<h2 class="document-assistant-launcher__title">Fai una domanda sul contenuto</h2>
			<p class="document-assistant-launcher__copy">
				Apri l'assistente per consultare i punti chiave del documento in pochi tocchi.
			</p>
		</div>

		<Button size="lg" class="document-assistant-launcher__button" onclick={() => (isOpen = true)}>
			<span>Apri assistente</span>
			<ResidentProBadge class="document-assistant-launcher__button-badge" />
		</Button>
	</CardContent>
</Card>

<Dialog bind:open={isOpen}>
	<DialogContent class="document-assistant-dialog">
		<DialogHeader class="document-assistant-dialog__header">
			<div class="document-assistant-dialog__title-row">
				<DialogTitle class="document-assistant-dialog__title">Assistente documento</DialogTitle>
				<ResidentProBadge />
			</div>
			<DialogDescription class="document-assistant-dialog__copy">
				Consulta i punti chiave del documento, la cronologia delle risposte e le fonti richiamate durante la conversazione.
			</DialogDescription>
		</DialogHeader>

		<div class="document-assistant-dialog__body">
			<DocumentDemoChat {context} />
		</div>
	</DialogContent>
</Dialog>
