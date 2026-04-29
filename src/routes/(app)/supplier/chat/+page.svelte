<script lang="ts">
	import { getChatsByUserId } from '$lib/data/chats';
	import { getUserById } from '$lib/data/users';

	const supplierId = 'frn-idroclima-nord';
	const chats = getChatsByUserId(supplierId);
	let selectedChatId = $state(chats[0]?.id ?? '');
	const selectedChat = $derived(chats.find((c) => c.id === selectedChatId));
</script>

<svelte:head>
	<title>Chat — Fornitore — Svicom Living Hub</title>
</svelte:head>

<div class="flex h-[calc(100vh-3.5rem)] flex-col md:flex-row">
	<!-- Chat list (sidebar on desktop, hidden on mobile when chat selected) -->
	<div class="shrink-0 border-b border-border bg-card md:w-72 md:border-b-0 md:border-r">
		<div class="border-b border-border px-4 py-3">
			<h2 class="text-sm font-medium text-foreground">Conversazioni</h2>
		</div>
		<ul class="divide-y divide-border">
			{#each chats as chat}
				{@const otherUser = getUserById(chat.participantIds.find((id) => id !== supplierId) ?? '')}
				<li>
					<button
						onclick={() => (selectedChatId = chat.id)}
						class="w-full px-4 py-3 text-left hover:bg-muted/50 {chat.id === selectedChatId ? 'bg-accent' : ''}"
					>
						<p class="text-sm font-medium text-foreground">{otherUser?.name ?? 'Utente'}</p>
						<p class="mt-0.5 truncate text-xs text-muted-foreground">{chat.messages[chat.messages.length - 1]?.text ?? ''}</p>
					</button>
				</li>
			{/each}
		</ul>
	</div>

	<!-- Messages -->
	<div class="flex flex-1 flex-col">
		{#if selectedChat}
			{@const otherUser = getUserById(selectedChat.participantIds.find((id) => id !== supplierId) ?? '')}
			<div class="border-b border-border px-4 py-3">
				<p class="text-sm font-medium text-foreground">{otherUser?.name ?? 'Utente'}</p>
			</div>
			<div class="flex-1 space-y-3 overflow-y-auto p-4">
				{#each selectedChat.messages as msg}
					{@const isMine = msg.senderId === supplierId}
					<div class="flex {isMine ? 'justify-end' : 'justify-start'}">
						<div class="max-w-md rounded-lg px-3 py-2 text-sm {isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}">
							{msg.text}
						</div>
					</div>
				{/each}
			</div>
			<div class="border-t border-border p-3">
				<div class="rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground">Scrivi un messaggio...</div>
			</div>
		{:else}
			<div class="flex flex-1 items-center justify-center text-sm text-muted-foreground">Seleziona una conversazione</div>
		{/if}
	</div>
</div>
