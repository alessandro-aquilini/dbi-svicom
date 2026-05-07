<script lang="ts">
	import { page } from '$app/state';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowLeft01Icon,
		SparklesIcon,
		Wrench01Icon,
		UserAdd01Icon,
		File01Icon,
		Exchange01Icon
	} from '@hugeicons/core-free-icons';
	import { StatusBadge } from '$lib/components/shared';
	import type { StatusVariant } from '$lib/types';
	import {
		getTicketById,
		getTicketNextStep,
		getCurrentStatus,
		type TicketEvent,
		type TicketStatus
	} from '$lib/data/ticket/tickets';
	import { getPropertyById } from '$lib/data/properties';
	import { getUserById, type User } from '$lib/data/users';
	import { getQuoteById } from '$lib/data/embeds/quotes';
	import { getInvoiceById } from '$lib/data/embeds/invoices';
	import { getPaymentById } from '$lib/data/embeds/payments';
	import { getSupplierTasksByTicketId } from '$lib/data/events/supplierTasks';

	const ticket = $derived(getTicketById(page.params.id ?? ''));
	const property = $derived(ticket ? getPropertyById(ticket.propertyId) : undefined);
	const reporter = $derived(ticket ? getUserById(ticket.creatorId) : undefined); // creatorId is always Admin
	const internalOwner = $derived(property ? getUserById(property.adminId) : undefined);
	const supplier = $derived(ticket?.supplierId ? getUserById(ticket.supplierId) : undefined);
	const aiSummary = $derived(ticket?.eventTimeline.find(ev => ev.kind === 'ai')?.body);
	const aiNextStep = $derived(ticket ? getTicketNextStep(ticket.id) : undefined);
	const timeline = $derived<TicketEvent[]>(ticket ? ticket.eventTimeline : []);
	const currentStatus = $derived(ticket ? getCurrentStatus(ticket) : 'opened');
	const firstEvent = $derived(ticket?.eventTimeline[0]);
	const lastEvent = $derived(ticket?.eventTimeline[ticket.eventTimeline.length - 1]);

	type UnifiedEvent = 
		| { type: 'ticket-event'; data: TicketEvent; at: string }
		| { type: 'quote'; data: any; at: string }
		| { type: 'invoice'; data: any; at: string }
		| { type: 'payment'; data: any; at: string }
		| { type: 'supplier-task'; data: any; at: string };

	const unifiedTimeline = $derived.by<UnifiedEvent[]>(() => {
		if (!ticket) return [];
		
		const items: UnifiedEvent[] = ticket.eventTimeline.map(ev => ({
			type: 'ticket-event',
			data: ev,
			at: ev.at
		}));

		if (ticket.quoteIds) {
			ticket.quoteIds.forEach(id => {
				const q = getQuoteById(id);
				if (q) items.push({ type: 'quote', data: q, at: q.sentAt });
			});
		}

		if (ticket.invoiceIds) {
			ticket.invoiceIds.forEach(id => {
				const i = getInvoiceById(id);
				if (i) items.push({ type: 'invoice', data: i, at: i.issueDate });
			});
		}

		if (ticket.paymentIds) {
			ticket.paymentIds.forEach(id => {
				const p = getPaymentById(id);
				if (p) items.push({ type: 'payment', data: p, at: p.paidAt || p.dueDate });
			});
		}

		const tasks = getSupplierTasksByTicketId(ticket.id);
		tasks.forEach(t => {
			items.push({ type: 'supplier-task' as any, data: t, at: `${t.date}T${t.startTime}:00Z` });
		});

		return items.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
	});

	let newNote = $state('');

	function submitNote(e: SubmitEvent) {
		e.preventDefault();
		const body = newNote.trim();
		if (!body || !ticket) return;
		newNote = '';
	}

	const priorityColors: Record<string, string> = {
		critica: 'bg-destructive/15 text-destructive',
		alta: 'bg-warning/15 text-warning',
		media: 'bg-primary/10 text-primary',
		bassa: 'bg-secondary text-secondary-foreground'
	};

	const statusVariant: Record<TicketStatus, StatusVariant> = {
		opened: 'default',
		estimating: 'default',
		approved: 'default',
		in_progress: 'warning',
		completed: 'success',
		paid: 'success',
		closed: 'muted'
	};

	const statusLabel: Record<TicketStatus, string> = {
		opened: 'Aperto',
		estimating: 'In preventivazione',
		approved: 'Approvato',
		in_progress: 'In corso',
		completed: 'Completato',
		paid: 'Pagato',
		closed: 'Chiuso'
	};

	const dateFmt = new Intl.DateTimeFormat('it-IT', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});

	function formatDate(iso: string): string {
		return dateFmt.format(new Date(iso));
	}

	function relativeDays(iso: string): string {
		const ms = Date.now() - new Date(iso).getTime();
		const days = Math.floor(ms / (1000 * 60 * 60 * 24));
		if (days <= 0) return 'oggi';
		if (days === 1) return 'ieri';
		if (days < 30) return `${days} giorni fa`;
		const months = Math.floor(days / 30);
		return months === 1 ? '1 mese fa' : `${months} mesi fa`;
	}

	function relativeTime(iso: string): string {
		const ms = Date.now() - new Date(iso).getTime();
		if (ms < 60_000) return 'ora';
		const mins = Math.floor(ms / 60_000);
		if (mins < 60) return `${mins} min fa`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs} h fa`;
		return relativeDays(iso);
	}

	function initials(name: string): string {
		return name
			.split(/\s+/)
			.slice(0, 2)
			.map((s) => s[0]?.toUpperCase() ?? '')
			.join('');
	}

	function avatarColor(user: User): string {
		const palette = ['#5D7D94', '#7B8C76', '#A07A55', '#7B6D8C', '#6E8E8C'];
		let h = 0;
		for (let i = 0; i < user.id.length; i++) h = (h * 31 + user.id.charCodeAt(i)) | 0;
		return palette[Math.abs(h) % palette.length];
	}
</script>

<svelte:head>
	<title>{ticket ? `${ticket.id} · ${ticket.title}` : 'Pratica'} — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="mx-auto max-w-6xl p-6 lg:p-8">
	{#if !ticket}
		<a href="/admin/tickets" class="text-sm text-muted-foreground hover:text-foreground">
			← Pratiche
		</a>
		<p class="mt-6 text-muted-foreground">Pratica non trovata.</p>
	{:else}
		<a
			href="/admin/tickets"
			class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
		>
			<HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} />
			Pratiche
		</a>

		<!-- Scheda pratica -->
		<article class="scheda mt-4">
			<!-- Header zone -->
			<header class="scheda__header">
				<p class="scheda__eyebrow">{ticket.id} · {ticket.category}</p>
				<h1 class="scheda__title">{ticket.title}</h1>
				<p class="scheda__lead">{ticket.description}</p>
				<div class="scheda__meta">
					<StatusBadge label={statusLabel[currentStatus]} variant={statusVariant[currentStatus]} />
					<span
						class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize {priorityColors[
							ticket.priority
						] ?? ''}"
					>
						Priorità {ticket.priority}
					</span>
					<span class="text-xs text-muted-foreground">
						{#if firstEvent}
							Aperta {relativeDays(firstEvent.at)}
						{/if}
						{#if lastEvent}
							· ultima modifica {relativeDays(lastEvent.at)}
						{/if}
					</span>
				</div>
			</header>

			<!-- Body: main column + sidebar separati da divider verticale -->
			<div class="scheda__body">
				<!-- Main column -->
				<div class="scheda__main">
					<!-- Sintesi -->
					<section class="block">
						<div class="block__head">
							<span class="ai-pill" aria-hidden="true">
								<HugeiconsIcon icon={SparklesIcon} size={11} strokeWidth={2} />
								AI
							</span>
							<h2 class="block__title">Sintesi</h2>
						</div>
						{#if aiSummary}
						<p class="mt-3 text-[0.9375rem] leading-relaxed text-foreground">{aiSummary}</p>
					{/if}
					</section>

					<!-- Prossimo passo -->
					<section class="block">
						<div class="block__head">
							<span class="ai-pill" aria-hidden="true">
								<HugeiconsIcon icon={SparklesIcon} size={11} strokeWidth={2} />
								AI
							</span>
							<h2 class="block__title">Prossimo passo</h2>
						</div>
						{#if aiNextStep}
							<p class="mt-3 text-[0.9375rem] font-medium leading-snug text-foreground">
								{aiNextStep.title}
							</p>
							<p class="mt-1.5 text-sm leading-relaxed text-muted-foreground">
								{aiNextStep.detail}
							</p>
						{/if}
					</section>

					<!-- Cronologia -->
					<section class="block">
						<h2 class="block__title">Cronologia</h2>
						<ol class="timeline mt-5">
							{#each unifiedTimeline as item}
								{#if item.type === 'ticket-event'}
									{@const ev = item.data}
									{@const actor = reporter}
									{#if ev.kind === 'note'}
										<li class="tl-item tl-item--comment">
											<span class="tl-node">
												{#if actor}
													<span
														class="avatar avatar--sm"
														style:background-color={avatarColor(actor)}
														aria-hidden="true"
													>
														{initials(actor.name)}
													</span>
												{:else}
													<span class="tl-dot"></span>
												{/if}
											</span>
											<div class="tl-card">
												<header class="tl-card__head">
													<span class="tl-card__author">{actor?.name ?? 'Amministratore'}</span>
													<span class="tl-card__time">{relativeTime(ev.at)}</span>
												</header>
												<p class="tl-card__body">{ev.body}</p>
											</div>
										</li>
									{:else}
										<li class="tl-item tl-item--inline">
											<span class="tl-node">
												<span class="tl-dot tl-dot--{ev.kind}" aria-hidden="true">
													{#if ev.kind === 'created'}
														<HugeiconsIcon icon={File01Icon} size={11} strokeWidth={2} />
													{:else if ev.kind === 'assigned'}
														<HugeiconsIcon icon={UserAdd01Icon} size={11} strokeWidth={2} />
													{:else if ev.kind === 'status'}
														<HugeiconsIcon icon={Exchange01Icon} size={11} strokeWidth={2} />
													{:else if ev.kind === 'ai'}
														<HugeiconsIcon icon={SparklesIcon} size={11} strokeWidth={2} />
													{/if}
												</span>
											</span>
											<div class="tl-inline-group">
												<p class="tl-inline">
													{#if ev.kind === 'created'}
														<strong>{actor?.name ?? 'Amministratore'}</strong>
														<span class="tl-inline__verb">ha aperto la pratica</span>
													{:else if ev.kind === 'assigned' || ev.kind === 'reassigned'}
														{@const target = ev.supplierId ? getUserById(ev.supplierId) : undefined}
														<span class="tl-inline__verb"
															>{ev.kind === 'assigned' ? 'Pratica assegnata a' : 'Pratica riassegnata a'}</span
														>
														<strong>{target?.name ?? '—'}</strong>
													{:else if ev.kind === 'status' || ev.kind === 'closed'}
														<span class="tl-inline__verb">Stato cambiato in</span>
														<strong>{ev.toStatus ? statusLabel[ev.toStatus as TicketStatus] : '—'}</strong>
													{:else if ev.kind === 'ai'}
														<strong>Assistente</strong>
														<span class="tl-inline__verb">{ev.body}</span>
													{/if}
													<span class="tl-inline__time">· {relativeTime(ev.at)}</span>
												</p>
											</div>
										</li>
									{/if}
								{:else if item.type === 'quote'}
									{@const q = item.data}
									<li class="tl-item tl-item--inline">
										<span class="tl-node">
											<span class="tl-dot" aria-hidden="true">
												<HugeiconsIcon icon={File01Icon} size={11} strokeWidth={2} />
											</span>
										</span>
										<div class="tl-inline-group">
											<p class="tl-inline">
												<strong>Documento ricevuto</strong>
												<span class="tl-inline__verb">· {relativeTime(item.at)}</span>
											</p>
											<div class="mt-2">
												<div class="embed-pill embed-pill--quote">
													<span class="embed-pill__label">Preventivo</span>
													<span class="embed-pill__value">{q.title} ({q.amount} {q.currency})</span>
												</div>
											</div>
										</div>
									</li>
								{:else if item.type === 'invoice'}
									{@const i = item.data}
									<li class="tl-item tl-item--inline">
										<span class="tl-node">
											<span class="tl-dot" aria-hidden="true">
												<HugeiconsIcon icon={File01Icon} size={11} strokeWidth={2} />
											</span>
										</span>
										<div class="tl-inline-group">
											<p class="tl-inline">
												<strong>Fattura emessa</strong>
												<span class="tl-inline__verb">· {relativeTime(item.at)}</span>
											</p>
											<div class="mt-2">
												<div class="embed-pill embed-pill--invoice">
													<span class="embed-pill__label">Fattura</span>
													<span class="embed-pill__value">N. {i.number} ({i.amount} {i.currency})</span>
												</div>
											</div>
										</div>
									</li>
								{:else if item.type === 'payment'}
									{@const p = item.data}
									<li class="tl-item tl-item--inline">
										<span class="tl-node">
											<span class="tl-dot" aria-hidden="true">
												<HugeiconsIcon icon={File01Icon} size={11} strokeWidth={2} />
											</span>
										</span>
										<div class="tl-inline-group">
											<p class="tl-inline">
												<strong>Transazione finanziaria</strong>
												<span class="tl-inline__verb">· {relativeTime(item.at)}</span>
											</p>
											<div class="mt-2">
												<div class="embed-pill embed-pill--payment">
													<span class="embed-pill__label">Pagamento</span>
													<span class="embed-pill__value">{p.paidAt ? 'Eseguito' : 'In attesa'} ({p.amount} {p.currency})</span>
												</div>
											</div>
										</div>
									</li>
								{:else if (item as any).type === 'supplier-task'}
									{@const task = item.data}
									<li class="tl-item tl-item--inline">
										<span class="tl-node">
											<span class="tl-dot" aria-hidden="true">
												<HugeiconsIcon icon={Wrench01Icon} size={11} strokeWidth={2} />
											</span>
										</span>
										<div class="tl-inline-group">
											<p class="tl-inline">
												{#if task.type === 'intervento'}
													<strong>Intervento sul posto</strong>
												{:else if task.type === 'sopralluogo'}
													<strong>Sopralluogo</strong>
												{:else}
													<strong>Attività fornitore</strong>
												{/if}
												<span class="tl-inline__verb">· {relativeTime(item.at)}</span>
											</p>
											<div class="mt-2">
												<div class="embed-pill embed-pill--supplier-task">
													<span class="embed-pill__label">Appuntamento</span>
													<span class="embed-pill__value">{task.title} ({task.startTime} - {task.endTime})</span>
												</div>
											</div>
										</div>
									</li>
								{/if}
							{/each}

							<!-- Add-note form integrata nella timeline -->
							<li class="tl-item tl-item--form">
								<span class="tl-node">
									{#if internalOwner}
										<span
											class="avatar avatar--sm"
											style:background-color={avatarColor(internalOwner)}
											aria-hidden="true"
										>
											{initials(internalOwner.name)}
										</span>
									{:else}
										<span class="tl-dot"></span>
									{/if}
								</span>
								<form class="tl-card tl-form" onsubmit={submitNote}>
									<textarea
										bind:value={newNote}
										rows="2"
										placeholder="Aggiungi una nota interna…"
										class="tl-form__input"
										aria-label="Aggiungi nota"
									></textarea>
									<div class="tl-form__footer">
										<span class="tl-form__hint">Le note sono visibili solo al team.</span>
										<button
											type="submit"
											disabled={!newNote.trim()}
											class="tl-form__submit"
										>
											Aggiungi nota
										</button>
									</div>
								</form>
							</li>
						</ol>
					</section>
				</div>

				<!-- Sidebar -->
				<aside class="scheda__aside">
					<!-- Assegnata a (Fornitore) -->
					<section class="block">
						<h2 class="block__title">Assegnata a</h2>
						<div class="mt-3">
							{#if supplier}
								<div class="party-row">
									<span
										class="avatar avatar--icon"
										style:background-color={avatarColor(supplier)}
										aria-hidden="true"
									>
										<HugeiconsIcon icon={Wrench01Icon} size={14} strokeWidth={2} />
									</span>
									<div class="min-w-0 flex-1">
										<p class="party-row__name">{supplier.name}</p>
										<p class="party-row__role">
											Fornitore · {supplier.phone ?? supplier.email}
										</p>
									</div>
								</div>
							{:else}
								<button type="button" class="party-row party-row--empty">
									<span class="avatar avatar--placeholder" aria-hidden="true">
										<HugeiconsIcon icon={UserAdd01Icon} size={14} strokeWidth={1.75} />
									</span>
									<span class="party-row__empty-label">Assegna fornitore</span>
								</button>
							{/if}
						</div>
					</section>

					<!-- Residenti in CC -->
					{#if ticket.cc.length > 0}
						<section class="block">
							<h2 class="block__title">Residenti in CC</h2>
							<div class="mt-3 space-y-3">
								{#each ticket.cc as rid}
									{@const r = getUserById(rid)}
									{#if r}
										<div class="party-row">
											<span
												class="avatar"
												style:background-color={avatarColor(r)}
												aria-hidden="true"
											>
												{initials(r.name)}
											</span>
											<div class="min-w-0 flex-1">
												<p class="party-row__name">{r.name}</p>
												<p class="party-row__role">Osservatore</p>
											</div>
										</div>
									{/if}
								{/each}
							</div>
						</section>
					{/if}

					<!-- Dettagli -->
					<section class="block">
						<h2 class="block__title">Dettagli</h2>
						<dl class="mt-3 divide-y divide-border">
							<div class="detail-row">
								<dt>Condominio</dt>
								<dd>
									{#if property}
										<a href="/admin/properties/{property.id}" class="hover:underline">
											{property.name}
										</a>
									{:else}
										—
									{/if}
								</dd>
							</div>
							<div class="detail-row">
								<dt>Categoria</dt>
								<dd class="capitalize">{ticket.category}</dd>
							</div>
							<div class="detail-row">
								<dt>Creata da</dt>
								<dd>{reporter?.name ?? '—'}</dd>
							</div>
							<div class="detail-row">
								<dt>Creata</dt>
								<dd>{firstEvent ? formatDate(firstEvent.at) : '—'}</dd>
							</div>
							<div class="detail-row">
								<dt>Aggiornata</dt>
								<dd>{lastEvent ? formatDate(lastEvent.at) : '—'}</dd>
							</div>
						</dl>
					</section>
				</aside>
			</div>
		</article>
	{/if}
</div>

<style>
	/* ─── Scheda container ─────────────────────────────────────── */
	.scheda {
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		background: var(--card);
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.04);
		overflow: hidden;
	}

	.scheda__header {
		padding: 1.75rem 1.75rem 1.5rem;
	}

	.scheda__eyebrow {
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.scheda__title {
		margin-top: 0.5rem;
		font-size: 1.625rem;
		line-height: 1.2;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--foreground);
	}

	.scheda__lead {
		margin-top: 0.75rem;
		max-width: 56rem;
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--muted-foreground);
	}

	.scheda__meta {
		margin-top: 1.25rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	/* ─── Body grid ────────────────────────────────────────────── */
	.scheda__body {
		display: grid;
		grid-template-columns: 1fr;
		border-top: 1px solid var(--border);
	}

	@media (min-width: 1024px) {
		.scheda__body {
			grid-template-columns: minmax(0, 1fr) 20rem;
		}
	}

	.scheda__main > .block + .block,
	.scheda__aside > .block + .block {
		border-top: 1px solid var(--border);
	}

	.scheda__main {
		padding: 0;
	}

	.scheda__aside {
		background: color-mix(in oklch, var(--muted) 35%, var(--card));
		border-top: 1px solid var(--border);
	}

	@media (min-width: 1024px) {
		.scheda__aside {
			border-top: 0;
			border-left: 1px solid var(--border);
		}
	}

	/* ─── Block (uniform spacing inside both columns) ─────────── */
	.block {
		padding: 1.5rem 1.75rem;
	}

	.block__head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.block__title {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--muted-foreground);
	}

	/* AI marker — sottile chip che firma i blocchi generati dall'assistente */
	.ai-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		height: 1.125rem;
		padding: 0 0.375rem;
		border-radius: 9999px;
		background: color-mix(in oklch, var(--primary) 12%, var(--card));
		color: var(--primary);
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	/* ─── People rows ─────────────────────────────────────────── */
	.party-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 9999px;
		color: #fff;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		flex-shrink: 0;
	}

	.avatar--icon {
		font-size: 0;
	}

	.party-row__name {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--foreground);
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.party-row__role {
		margin-top: 0.125rem;
		font-size: 0.75rem;
		color: var(--muted-foreground);
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* ─── Detail rows ─────────────────────────────────────────── */
	.detail-row {
		display: grid;
		grid-template-columns: 6.5rem 1fr;
		gap: 0.75rem;
		padding: 0.5rem 0;
		font-size: 0.8125rem;
		align-items: baseline;
	}

	.detail-row:first-child {
		padding-top: 0;
	}

	.detail-row:last-child {
		padding-bottom: 0;
	}

	.detail-row dt {
		color: var(--muted-foreground);
	}

	.detail-row dd {
		color: var(--foreground);
		min-width: 0;
		word-break: break-word;
	}

	/* ─── Timeline ────────────────────────────────────────────── */
	.timeline {
		position: relative;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.timeline::before {
		content: '';
		position: absolute;
		left: 0.875rem; /* center of 1.75rem node column */
		top: 0.5rem;
		bottom: 0.5rem;
		width: 1px;
		background: var(--border);
	}

	.tl-item {
		position: relative;
		display: grid;
		grid-template-columns: 1.75rem 1fr;
		gap: 0.875rem;
		align-items: start;
	}

	.tl-item + .tl-item {
		margin-top: 1rem;
	}

	.tl-item--comment + .tl-item,
	.tl-item--form {
		margin-top: 1.25rem;
	}

	.tl-node {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-top: 0.125rem;
	}

	.tl-dot {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 9999px;
		background: var(--card);
		border: 1px solid var(--border);
		color: var(--muted-foreground);
	}

	.tl-dot--ai {
		background: color-mix(in oklch, var(--primary) 12%, var(--card));
		border-color: color-mix(in oklch, var(--primary) 30%, var(--border));
		color: var(--primary);
	}

	.avatar--sm {
		width: 1.75rem;
		height: 1.75rem;
		font-size: 0.625rem;
		border: 2px solid var(--card);
	}

	/* Inline events */
	.tl-inline {
		font-size: 0.8125rem;
		line-height: 1.5;
		color: var(--foreground);
		padding-top: 0.25rem;
	}

	.tl-inline strong {
		font-weight: 600;
		color: var(--foreground);
	}

	.tl-inline__verb {
		color: var(--muted-foreground);
		font-weight: 400;
	}

	.tl-inline__time {
		color: var(--muted-foreground);
		font-weight: 400;
		margin-left: 0.125rem;
	}

	/* Comment cards */
	.tl-card {
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		background: var(--card);
		overflow: hidden;
	}

	.tl-card__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0.875rem;
		background: color-mix(in oklch, var(--muted) 35%, var(--card));
		border-bottom: 1px solid var(--border);
	}

	.tl-card__author {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--foreground);
	}

	.tl-card__time {
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}

	.tl-card__body {
		padding: 0.75rem 0.875rem;
		font-size: 0.8125rem;
		line-height: 1.55;
		color: var(--foreground);
		white-space: pre-wrap;
	}

	/* Add-note form */
	.tl-form__input {
		width: 100%;
		display: block;
		border: 0;
		background: transparent;
		padding: 0.625rem 0.875rem;
		font-size: 0.8125rem;
		line-height: 1.55;
		color: var(--foreground);
		resize: vertical;
		min-height: 2.75rem;
		outline: none;
		font-family: inherit;
	}

	.tl-form__input::placeholder {
		color: var(--muted-foreground);
	}

	.tl-form__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0.875rem;
		background: color-mix(in oklch, var(--muted) 35%, var(--card));
		border-top: 1px solid var(--border);
	}

	.tl-form__hint {
		font-size: 0.6875rem;
		color: var(--muted-foreground);
	}

	.tl-form__submit {
		height: 1.875rem;
		padding: 0 0.75rem;
		border-radius: 0.375rem;
		border: 0;
		background: var(--primary);
		color: var(--primary-foreground);
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 150ms ease;
	}

	.tl-form__submit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.tl-form__submit:not(:disabled):hover {
		opacity: 0.92;
	}

	/* ─── Embed Pills ─────────────────────────────────────────── */
	.embed-pill {
		display: inline-flex;
		flex-direction: column;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid var(--border);
		background: var(--card);
		min-width: 8rem;
	}

	.embed-pill--quote {
		border-left: 3px solid #a07a55;
	}
	.embed-pill--invoice {
		border-left: 3px solid #5d7d94;
	}
	.embed-pill--payment {
		border-left: 3px solid #7b8c76;
	}

	.embed-pill--intervention {
		border-left: 3px solid #7b6d8c;
	}

	.embed-pill--supplier-task {
		border-left: 3px solid #7b6d8c;
	}

	/* sopralluogo could share the same visual or be overridden where data is available */

	.embed-pill__label {
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted-foreground);
	}

	.embed-pill__value {
		margin-top: 0.125rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--foreground);
	}

	/* ─── Assign CTA (empty supplier slot) ────────────────────── */
	.party-row--empty {
		width: 100%;
		padding: 0;
		border: 0;
		background: transparent;
		text-align: left;
		cursor: pointer;
	}

	.party-row__empty-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--muted-foreground);
		transition: color 150ms ease;
	}

	.avatar--placeholder {
		background: transparent;
		border: 1px dashed var(--input);
		color: var(--muted-foreground);
		transition:
			border-color 150ms ease,
			color 150ms ease;
	}

	.party-row--empty:hover .party-row__empty-label {
		color: var(--foreground);
	}

	.party-row--empty:hover .avatar--placeholder {
		border-color: var(--primary);
		color: var(--primary);
	}
</style>
