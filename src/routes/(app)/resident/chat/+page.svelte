<script lang="ts">
	import { getChatsByUserId } from '$lib/data/chats';
	import { currentUser } from '$lib/data/users';
	import { getUserById } from '$lib/data/users';

	const userChats = getChatsByUserId(currentUser.id);
	let selectedChatId = $state(userChats[0]?.id ?? '');
	const selectedChat = $derived(userChats.find((c) => c.id === selectedChatId));
</script>

<svelte:head>
	<title>Chat — Residente — Svicom Living Hub</title>
</svelte:head>

<div class="flex h-[calc(100vh-7.5rem)] flex-col">
	{#if selectedChat}
		{@const otherUser = getUserById(selectedChat.participantIds.find((id) => id !== currentUser.id) ?? '')}
		<!-- Header -->
		<div class="border-b border-border px-4 py-3">
			<p class="text-sm font-medium text-foreground">{otherUser?.name ?? 'Amministrazione'}</p>
			<p class="text-xs text-muted-foreground">Conversazione attiva</p>
		</div>

		<!-- Messages -->
		<div class="flex-1 space-y-3 overflow-y-auto p-4">
			{#each selectedChat.messages as msg}
				{@const isMine = msg.senderId === currentUser.id}
				<div class="flex {isMine ? 'justify-end' : 'justify-start'}">
					<div class="max-w-[75%] rounded-lg px-3 py-2 text-sm {isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}">
						{msg.text}
						{#if msg.action}
							<a href="#" class="mt-1 block text-xs underline opacity-80">{msg.action.label}</a>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<!-- Input -->
		<div class="border-t border-border p-3">
			<div class="rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
				Scrivi un messaggio...
			</div>
		</div>
	{:else}
		<div class="flex flex-1 items-center justify-center text-sm text-muted-foreground">
			Nessuna conversazione attiva.
		</div>
	{/if}
</div>
