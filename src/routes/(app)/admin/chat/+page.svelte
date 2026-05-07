<script lang="ts">
	import { tick } from 'svelte';
	import { getCurrentUser } from '$lib/auth';
	import { chats, type Message } from '$lib/data/chats';
	import { getUserById, type User } from '$lib/data/users';
	import { propertySelection } from '$lib/state/property-selection.svelte';
	import { PropertyScopeChip } from '$lib/components/shared';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Search01Icon,
		MessageAdd01Icon,
		MoreVerticalIcon,
		Archive01Icon,
		InformationCircleIcon,
		Attachment01Icon,
		SmileIcon,
		Sent02Icon,
		Note01Icon,
		InvoiceIcon,
		CreditCardIcon,
		Calendar03Icon
	} from '@hugeicons/core-free-icons';

	const currentUser = getCurrentUser();
	const adminId = currentUser?.id ?? 'adm-giorgio-01';

	let selectedChatId = $state(chats[0]?.id ?? '');
	let listQuery = $state('');
	let composerText = $state('');
	let messagesEl: HTMLDivElement | undefined = $state();

	// UI-only: messages typed in this session. The data layer stays read-only.
	let localMessages = $state<Record<string, Message[]>>({});

	function getCounterpart(participantIds: string[]): User | undefined {
		const otherId = participantIds.find((id) => id !== adminId);
		return otherId ? getUserById(otherId) : undefined;
	}

	function getInitials(name: string | undefined): string {
		if (!name) return '?';
		const parts = name.trim().split(/\s+/).slice(0, 2);
		return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
	}

	const roleLabel: Record<string, string> = {
		admin: 'Amministratore',
		resident: 'Residente',
		supplier: 'Fornitore',
		svicom: 'Svicom'
	};

	const timeFmt = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' });
	const dayFmt = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

	function formatTime(iso: string): string {
		return timeFmt.format(new Date(iso));
	}

	function formatRelativeOrTime(iso: string): string {
		const d = new Date(iso);
		const now = new Date();
		const sameDay =
			d.getFullYear() === now.getFullYear() &&
			d.getMonth() === now.getMonth() &&
			d.getDate() === now.getDate();
		if (sameDay) return formatTime(iso);
		const diffMs = now.getTime() - d.getTime();
		const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		if (days <= 6) {
			return new Intl.DateTimeFormat('it-IT', { weekday: 'short' }).format(d);
		}
		return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit' }).format(d);
	}

	function formatDayLabel(iso: string): string {
		const d = new Date(iso);
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);

		const sameDay = (a: Date, b: Date) =>
			a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate();

		if (sameDay(d, today)) return 'Oggi';
		if (sameDay(d, yesterday)) return 'Ieri';
		return dayFmt.format(d);
	}

	function dateKey(iso: string): string {
		return iso.slice(0, 10);
	}

	// Combine static messages with locally-sent ones for the active chat.
	const selectedChat = $derived(chats.find((c) => c.id === selectedChatId));
	const allMessages = $derived.by(() => {
		if (!selectedChat) return [] as Message[];
		const local = localMessages[selectedChat.id] ?? [];
		return [...selectedChat.messages, ...local];
	});

	type DayGroup = { dayKey: string; label: string; messages: Message[] };
	const groupedMessages = $derived.by<DayGroup[]>(() => {
		const groups: DayGroup[] = [];
		for (const m of allMessages) {
			const key = dateKey(m.timestamp);
			const last = groups[groups.length - 1];
			if (last && last.dayKey === key) {
				last.messages.push(m);
			} else {
				groups.push({ dayKey: key, label: formatDayLabel(m.timestamp), messages: [m] });
			}
		}
		return groups;
	});

	// Chats scoped to the active property: only conversations whose counterpart
	// is a resident or supplier of that condominium are kept. With "Tutti" the
	// full list is returned. Relationship is read from properties.ts —
	// no schema change required.
	const scopedChats = $derived.by(() => {
		const property = propertySelection.selected;
		if (!property) return chats;
		const allowed = new Set<string>([...property.residentIds, ...property.supplierIds]);
		return chats.filter((c) => {
			const otherId = c.participantIds.find((id) => id !== adminId);
			return otherId ? allowed.has(otherId) : false;
		});
	});

	// Filter the (already-scoped) conversation list against the search box.
	const filteredChats = $derived.by(() => {
		const q = listQuery.trim().toLowerCase();
		if (!q) return scopedChats;
		return scopedChats.filter((c) => {
			const u = getCounterpart(c.participantIds);
			const last = c.messages[c.messages.length - 1]?.text ?? '';
			return (
				(u?.name ?? '').toLowerCase().includes(q) ||
				last.toLowerCase().includes(q) ||
				(u?.role && roleLabel[u.role]?.toLowerCase().includes(q))
			);
		});
	});

	function selectChat(id: string) {
		selectedChatId = id;
		composerText = '';
		queueMicrotask(scrollToBottom);
	}

	async function scrollToBottom() {
		await tick();
		if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
	}

	function send() {
		const text = composerText.trim();
		if (!text || !selectedChat) return;
		const msg: Message = {
			id: `local-${Date.now()}`,
			senderId: adminId,
			text,
			timestamp: new Date().toISOString()
		};
		const id = selectedChat.id;
		localMessages[id] = [...(localMessages[id] ?? []), msg];
		composerText = '';
		scrollToBottom();
	}

	function onComposerKey(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	const actionIcon = {
		ticket: Note01Icon,
		quote: InvoiceIcon,
		payment: CreditCardIcon,
		invoice: InvoiceIcon,
		event: Calendar03Icon
	} as const;

	$effect(() => {
		// Re-scroll when the active chat changes.
		selectedChatId;
		scrollToBottom();
	});

	// When the property scope changes, ensure the selected chat is still in
	// scope. If not, fall back to the first scoped chat (or empty string).
	$effect(() => {
		const list = scopedChats;
		if (selectedChatId && !list.some((c) => c.id === selectedChatId)) {
			selectedChatId = list[0]?.id ?? '';
			composerText = '';
		} else if (!selectedChatId && list.length > 0) {
			selectedChatId = list[0].id;
		}
	});
</script>

<svelte:head>
	<title>Chat — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="chat-shell">
	<!-- Sidebar: conversation list -->
	<aside class="chat-list">
		<div class="chat-list__header">
			<div class="chat-list__title-row">
				<h2 class="chat-list__title">Conversazioni</h2>
				<button
					type="button"
					class="chat-list__new"
					aria-label="Nuova conversazione"
					title="Nuova conversazione"
				>
					<HugeiconsIcon icon={MessageAdd01Icon} size={16} strokeWidth={1.75} />
				</button>
			</div>
			<div class="chat-list__search">
				<HugeiconsIcon
					icon={Search01Icon}
					size={14}
					strokeWidth={2}
					class="chat-list__search-icon"
				/>
				<input
					type="search"
					bind:value={listQuery}
					placeholder="Cerca per nome o messaggio…"
					aria-label="Cerca conversazioni"
				/>
			</div>
			<p class="chat-list__count">
				{filteredChats.length}
				{filteredChats.length === 1 ? 'conversazione' : 'conversazioni'}
				{#if listQuery.trim()}
					su {scopedChats.length}
				{:else if !propertySelection.isAll}
					su {chats.length} totali
				{/if}
			</p>
			<div class="chat-list__scope">
				<PropertyScopeChip gap="0" size="compact" />
			</div>
		</div>

		{#if filteredChats.length === 0}
			<div class="chat-list__empty">
				{#if !propertySelection.isAll && propertySelection.selected && scopedChats.length === 0}
					<p class="text-sm font-medium text-foreground">Nessuna chat per questo condominio</p>
					<p class="mt-1 text-xs text-muted-foreground">
						Non ci sono conversazioni con residenti o fornitori di
						<strong>{propertySelection.selected.name}</strong>.
					</p>
				{:else}
					<p class="text-sm font-medium text-foreground">Nessun risultato</p>
					<p class="mt-1 text-xs text-muted-foreground">Prova con un altro termine.</p>
				{/if}
			</div>
		{:else}
			<ul class="chat-list__items">
				{#each filteredChats as chat (chat.id)}
					{@const counterpart = getCounterpart(chat.participantIds)}
					{@const last = chat.messages[chat.messages.length - 1]}
					{@const active = chat.id === selectedChatId}
					<li>
						<button
							type="button"
							onclick={() => selectChat(chat.id)}
							class="chat-row"
							class:is-active={active}
						>
							<span class="avatar" aria-hidden="true">
								{getInitials(counterpart?.name)}
							</span>
							<span class="chat-row__body">
								<span class="chat-row__top">
									<span class="chat-row__name">{counterpart?.name ?? 'Utente'}</span>
									<span class="chat-row__time">{formatRelativeOrTime(chat.lastMessageAt)}</span>
								</span>
								<span class="chat-row__sub">
									{#if counterpart?.role}
										<span class="chat-row__role">{roleLabel[counterpart.role] ?? counterpart.role}</span>
										<span class="chat-row__dot" aria-hidden="true">·</span>
									{/if}
									<span class="chat-row__preview">{last?.text ?? ''}</span>
								</span>
							</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</aside>

	<!-- Conversation pane -->
	<section class="chat-pane">
		{#if selectedChat}
			{@const counterpart = getCounterpart(selectedChat.participantIds)}
			<header class="chat-header">
				<span class="avatar avatar--lg" aria-hidden="true">
					{getInitials(counterpart?.name)}
				</span>
				<div class="chat-header__meta">
					<p class="chat-header__name">{counterpart?.name ?? 'Utente'}</p>
					{#if counterpart?.role}
						<p class="chat-header__role">{roleLabel[counterpart.role] ?? counterpart.role}</p>
					{/if}
				</div>
				<div class="chat-header__actions">
					<button type="button" class="icon-btn" aria-label="Cerca nella conversazione" title="Cerca nella conversazione">
						<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.75} />
					</button>
					<button type="button" class="icon-btn" aria-label="Informazioni" title="Informazioni">
						<HugeiconsIcon icon={InformationCircleIcon} size={16} strokeWidth={1.75} />
					</button>
					<button type="button" class="icon-btn" aria-label="Archivia conversazione" title="Archivia">
						<HugeiconsIcon icon={Archive01Icon} size={16} strokeWidth={1.75} />
					</button>
					<button type="button" class="icon-btn" aria-label="Altre opzioni" title="Altre opzioni">
						<HugeiconsIcon icon={MoreVerticalIcon} size={16} strokeWidth={1.75} />
					</button>
				</div>
			</header>

			<div bind:this={messagesEl} class="chat-messages">
				{#each groupedMessages as group (group.dayKey)}
					<div class="day-divider" role="separator">
						<span>{group.label}</span>
					</div>
					{#each group.messages as msg (msg.id)}
						{@const isAdmin = msg.senderId === adminId}
						<div class="msg-row" class:is-admin={isAdmin}>
							<div class="msg-bubble" class:is-admin={isAdmin}>
								<p class="msg-bubble__text">{msg.text}</p>
								{#if msg.action}
									<a
										href={msg.action.type === 'ticket' ? '/admin/tickets' : '#'}
										class="msg-action"
										class:is-admin={isAdmin}
									>
										<span class="msg-action__icon" aria-hidden="true">
											<HugeiconsIcon
												icon={actionIcon[msg.action.type]}
												size={13}
												strokeWidth={1.75}
											/>
										</span>
										<span class="msg-action__label">{msg.action.label}</span>
										<span class="msg-action__ref">{msg.action.referenceId}</span>
									</a>
								{/if}
								<span class="msg-bubble__time">{formatTime(msg.timestamp)}</span>
							</div>
						</div>
					{/each}
				{/each}
			</div>

			<footer class="composer">
				<button type="button" class="icon-btn" aria-label="Allega file" title="Allega file">
					<HugeiconsIcon icon={Attachment01Icon} size={18} strokeWidth={1.75} />
				</button>
				<button type="button" class="icon-btn" aria-label="Inserisci emoji" title="Emoji">
					<HugeiconsIcon icon={SmileIcon} size={18} strokeWidth={1.75} />
				</button>
				<textarea
					bind:value={composerText}
					onkeydown={onComposerKey}
					rows="1"
					placeholder="Scrivi un messaggio…"
					class="composer__input"
					aria-label="Messaggio"
				></textarea>
				<button
					type="button"
					onclick={send}
					disabled={!composerText.trim()}
					class="composer__send"
					aria-label="Invia messaggio"
				>
					<HugeiconsIcon icon={Sent02Icon} size={16} strokeWidth={2} />
					<span>Invia</span>
				</button>
			</footer>
		{:else}
			<div class="chat-empty">
				<p class="text-sm font-medium text-foreground">
					{#if !propertySelection.isAll && propertySelection.selected && scopedChats.length === 0}
						Nessuna conversazione su {propertySelection.selected.name}
					{:else}
						Seleziona una conversazione
					{/if}
				</p>
				<p class="mt-1 text-xs text-muted-foreground">
					{#if !propertySelection.isAll && propertySelection.selected && scopedChats.length === 0}
						Non ci sono ancora chat con residenti o fornitori di questo condominio.
					{:else}
						Scegli una chat dall'elenco a sinistra per iniziare.
					{/if}
				</p>
			</div>
		{/if}
	</section>
</div>

<style>
	.chat-shell {
		display: flex;
		height: 100vh;
	}

	/* ─── Conversation list ─── */
	.chat-list {
		width: 19rem;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--border);
		background: var(--card);
	}

	.chat-list__header {
		padding: 1rem 1rem 0.75rem;
		border-bottom: 1px solid var(--border);
	}

	.chat-list__title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.625rem;
	}

	.chat-list__title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--foreground);
	}

	.chat-list__new {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.875rem;
		height: 1.875rem;
		border: 1px solid var(--border);
		background: var(--card);
		border-radius: 0.5rem;
		color: var(--foreground);
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s, color 0.15s;
	}

	.chat-list__new:hover {
		border-color: var(--primary);
		color: var(--primary);
		background: var(--accent);
	}

	.chat-list__search {
		position: relative;
	}

	.chat-list__search :global(.chat-list__search-icon) {
		position: absolute;
		left: 0.625rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--muted-foreground);
		pointer-events: none;
	}

	.chat-list__search input {
		width: 100%;
		height: 2rem;
		padding: 0 0.625rem 0 2rem;
		border-radius: 0.5rem;
		border: 1px solid var(--input);
		background: var(--background);
		font-size: 0.8125rem;
		color: var(--foreground);
	}

	.chat-list__search input::placeholder {
		color: var(--muted-foreground);
	}

	.chat-list__search input::-webkit-search-cancel-button {
		appearance: none;
	}

	.chat-list__count {
		margin-top: 0.625rem;
		font-size: 0.6875rem;
		color: var(--muted-foreground);
	}

	.chat-list__scope {
		margin-top: 0.75rem;
	}

	.chat-list__items {
		flex: 1;
		overflow-y: auto;
	}

	.chat-list__empty {
		padding: 2rem 1rem;
		text-align: center;
	}

	.chat-row {
		display: flex;
		gap: 0.625rem;
		width: 100%;
		padding: 0.75rem 1rem;
		border: 0;
		background: transparent;
		text-align: left;
		cursor: pointer;
		transition: background 0.12s;
	}

	.chat-row:hover {
		background: var(--muted);
	}

	.chat-row.is-active {
		background: var(--accent);
	}

	.chat-row.is-active .chat-row__name {
		color: var(--accent-foreground);
	}

	.chat-row__body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.1875rem;
	}

	.chat-row__top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.chat-row__name {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.chat-row__time {
		font-size: 0.6875rem;
		color: var(--muted-foreground);
		flex-shrink: 0;
	}

	.chat-row__sub {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: var(--muted-foreground);
		min-width: 0;
	}

	.chat-row__role {
		display: inline-block;
		padding: 0.0625rem 0.375rem;
		border-radius: 9999px;
		background: color-mix(in oklab, var(--primary) 10%, transparent);
		color: var(--primary);
		font-size: 0.6875rem;
		font-weight: 500;
		line-height: 1.1;
		flex-shrink: 0;
	}

	.chat-row__dot {
		flex-shrink: 0;
	}

	.chat-row__preview {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
		flex: 1;
	}

	/* ─── Avatar ─── */
	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 9999px;
		background: color-mix(in oklab, var(--primary) 18%, transparent);
		color: var(--primary);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	.avatar--lg {
		width: 2.5rem;
		height: 2.5rem;
		font-size: 0.8125rem;
	}

	/* ─── Conversation pane ─── */
	.chat-pane {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.chat-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1.25rem;
		border-bottom: 1px solid var(--border);
		background: var(--card);
	}

	.chat-header__meta {
		flex: 1;
		min-width: 0;
	}

	.chat-header__name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--foreground);
	}

	.chat-header__role {
		margin-top: 0.0625rem;
		font-size: 0.6875rem;
		color: var(--muted-foreground);
	}

	.chat-header__actions {
		display: flex;
		gap: 0.25rem;
	}

	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: 0;
		background: transparent;
		border-radius: 0.375rem;
		color: var(--muted-foreground);
		cursor: pointer;
		transition: background 0.12s, color 0.12s;
	}

	.icon-btn:hover {
		background: var(--muted);
		color: var(--foreground);
	}

	/* ─── Messages ─── */
	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 1.25rem;
		background: var(--background);
	}

	.day-divider {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0.5rem 0 1rem;
	}

	.day-divider span {
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--muted-foreground);
		background: var(--card);
		border: 1px solid var(--border);
		padding: 0.1875rem 0.5rem;
		border-radius: 9999px;
		text-transform: capitalize;
	}

	.msg-row {
		display: flex;
		justify-content: flex-start;
		margin-bottom: 0.5rem;
	}

	.msg-row.is-admin {
		justify-content: flex-end;
	}

	.msg-bubble {
		max-width: min(28rem, 70%);
		padding: 0.5rem 0.75rem 0.4rem;
		border-radius: 0.875rem;
		background: var(--muted);
		color: var(--foreground);
		display: flex;
		flex-direction: column;
		gap: 0.3125rem;
	}

	.msg-bubble.is-admin {
		background: var(--primary);
		color: var(--primary-foreground);
		border-bottom-right-radius: 0.25rem;
	}

	.msg-bubble:not(.is-admin) {
		border-bottom-left-radius: 0.25rem;
	}

	.msg-bubble__text {
		margin: 0;
		font-size: 0.8125rem;
		line-height: 1.35;
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.msg-bubble__time {
		align-self: flex-end;
		font-size: 0.625rem;
		opacity: 0.7;
		margin-top: -0.125rem;
	}

	/* ─── Inline action chip ─── */
	.msg-action {
		display: inline-flex;
		align-items: center;
		gap: 0.4375rem;
		padding: 0.3125rem 0.5rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		color: var(--foreground);
		text-decoration: none;
		font-size: 0.75rem;
		transition: border-color 0.15s, background 0.15s;
	}

	.msg-action.is-admin {
		background: color-mix(in oklab, var(--primary-foreground) 18%, transparent);
		border-color: color-mix(in oklab, var(--primary-foreground) 30%, transparent);
		color: var(--primary-foreground);
	}

	.msg-action:hover {
		border-color: var(--primary);
	}

	.msg-action__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.125rem;
		height: 1.125rem;
		border-radius: 0.25rem;
		background: color-mix(in oklab, var(--primary) 12%, transparent);
		color: var(--primary);
	}

	.msg-action.is-admin .msg-action__icon {
		background: color-mix(in oklab, var(--primary-foreground) 24%, transparent);
		color: var(--primary-foreground);
	}

	.msg-action__label {
		font-weight: 500;
	}

	.msg-action__ref {
		font-family: ui-monospace, SFMono-Regular, monospace;
		font-size: 0.6875rem;
		opacity: 0.75;
	}

	/* ─── Composer ─── */
	.composer {
		display: flex;
		align-items: flex-end;
		gap: 0.375rem;
		padding: 0.75rem 1.25rem;
		border-top: 1px solid var(--border);
		background: var(--card);
	}

	.composer .icon-btn {
		flex-shrink: 0;
	}

	.composer__input {
		flex: 1;
		min-height: 2.25rem;
		max-height: 8rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--input);
		background: var(--background);
		border-radius: 0.625rem;
		font-size: 0.875rem;
		color: var(--foreground);
		resize: none;
		font-family: inherit;
	}

	.composer__input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 18%, transparent);
	}

	.composer__send {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		height: 2.25rem;
		padding: 0 0.875rem;
		border: 0;
		background: var(--primary);
		color: var(--primary-foreground);
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.15s, opacity 0.15s;
	}

	.composer__send:hover:not(:disabled) {
		background: color-mix(in oklab, var(--primary) 92%, black);
	}

	.composer__send:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	/* ─── Empty pane ─── */
	.chat-empty {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 2rem;
	}
</style>
