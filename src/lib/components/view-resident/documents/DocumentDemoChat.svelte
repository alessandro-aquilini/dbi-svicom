<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import {
		answerDocumentPrompt,
		documentCategoryLabels,
		documentTypeLabels,
		formatDocumentDate,
		getDocumentDemoPrompts,
		type DocumentDemoCitation,
		type DocumentDemoContext
	} from './presentation';

	type ChatMessage = {
		id: string;
		role: 'assistant' | 'user';
		text: string;
		citations?: DocumentDemoCitation[];
	};

	let {
		context
	}: {
		context: DocumentDemoContext;
	} = $props();

	const prompts = $derived(getDocumentDemoPrompts(context));
	const overviewFacts = $derived([
		{ label: 'Categoria', value: documentCategoryLabels[context.document.category] },
		{ label: 'Formato', value: documentTypeLabels[context.document.type] },
		{ label: 'Aggiornato', value: formatDocumentDate(context.document.updatedAt) }
	]);
	let messages = $state<ChatMessage[]>([]);
	let isAnswering = $state(false);

	function getIntroMessage(): ChatMessage {
		return {
			id: 'assistant-intro',
			role: 'assistant',
			text: `Posso aiutarti a leggere "${context.document.title}". Scegli una domanda rapida per iniziare.`
		};
	}

	$effect(() => {
		messages = [getIntroMessage()];
		isAnswering = false;
	});

	function askQuestion(question: string) {
		if (isAnswering) return;

		messages = [
			...messages,
			{
				id: `user-${messages.length + 1}`,
				role: 'user',
				text: question
			}
		];

		isAnswering = true;
		const answer = answerDocumentPrompt(context, question);

		setTimeout(() => {
			messages = [
				...messages,
				{
					id: `assistant-${messages.length + 1}`,
					role: 'assistant',
					text: answer.text,
					citations: answer.citations
				}
			];
			isAnswering = false;
		}, 450);
	}

	function resetConversation() {
		messages = [getIntroMessage()];
		isAnswering = false;
	}

	function getMessageStep(index: number): string {
		return `${Math.floor(index / 2) + 1}`.padStart(2, '0');
	}
</script>

<div class="document-assistant-panel">
	<div class="document-assistant-overview">
		<div class="document-assistant-overview__main">
			<p class="document-assistant-overview__eyebrow">Lettura guidata</p>
			<p class="document-assistant-overview__title">{context.document.title}</p>
			<p class="document-assistant-overview__copy">{context.document.summary}</p>
		</div>

		<div class="document-assistant-overview__facts">
			{#each overviewFacts as fact}
				<div class="document-assistant-overview__fact">
					<p class="document-assistant-overview__fact-label">{fact.label}</p>
					<p class="document-assistant-overview__fact-value">{fact.value}</p>
				</div>
			{/each}
		</div>
	</div>

	<div class="document-assistant-panel__prompt-grid">
		{#each prompts as prompt}
			<Button
				variant="outline"
				size="sm"
				class="document-assistant-panel__prompt-button"
				disabled={isAnswering}
				onclick={() => askQuestion(prompt.question)}
			>
				{prompt.question}
			</Button>
		{/each}
	</div>

	<Separator class="document-assistant-panel__separator" />

	<div class="document-chat-thread" role="log" aria-live="polite">
		{#each messages as message, index}
			<div class={`document-chat-thread__message document-chat-thread__message--${message.role}`}>
				<div class="document-chat-thread__header">
					<p class="document-chat-thread__role">
						{message.role === 'assistant' ? 'Assistente documento' : 'Tu'}
					</p>
					<p class="document-chat-thread__step">Scambio {getMessageStep(index)}</p>
				</div>
				<p class="document-chat-thread__text">{message.text}</p>

				{#if message.citations?.length}
					<div class="document-chat-thread__citations">
						{#each message.citations as citation, citationIndex}
							<div class="document-chat-thread__citation">
								<div class="document-chat-thread__citation-header">
									<p class="document-chat-thread__citation-index">Fonte {citationIndex + 1}</p>
									<p class="document-chat-thread__citation-label">{citation.label}</p>
								</div>
								<p class="document-chat-thread__citation-text">{citation.text}</p>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}

		{#if isAnswering}
			<div class="document-chat-thread__message document-chat-thread__message--assistant">
				<div class="document-chat-thread__header">
					<p class="document-chat-thread__role">Assistente documento</p>
					<p class="document-chat-thread__step">Analisi</p>
				</div>
				<p class="document-chat-thread__text">Sto analizzando il documento...</p>
			</div>
		{/if}
	</div>

	<div class="document-assistant-panel__footer">
		<Button
			variant="ghost"
			class="document-assistant-panel__reset"
			disabled={isAnswering}
			onclick={resetConversation}
		>
			Nuova conversazione
		</Button>
	</div>
</div>
