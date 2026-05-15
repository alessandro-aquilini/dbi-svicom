<script lang="ts">
	import { page } from '$app/state';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowLeft01Icon,
		SparklesIcon,
		Wrench01Icon,
		UserAdd01Icon
	} from '@hugeicons/core-free-icons';
	import { StatusBadge } from '$lib/components/shared';
	import TicketTimeline from '$lib/components/ticket/TicketTimeline.svelte';
	import type { TicketTimelineItem } from '$lib/components/ticket/types';
	import type { StatusVariant } from '$lib/types';
	import {
		getTicketById,
		getTicketNextStep,
		getCurrentStatus,
		getCurrentSupplier,
		type TicketStatus
	} from '$lib/data/ticket/tickets';
	import { getPropertyById } from '$lib/data/properties';
	import { getUserById, type User } from '$lib/data/users';
	import { getQuoteById } from '$lib/data/embeds/quotes';
	import { getInvoiceById } from '$lib/data/embeds/invoices';
	import { getPaymentById } from '$lib/data/embeds/payments';
	import { getSupplierTaskById } from '$lib/data/embeds/supplierTasks';

	const ticket = $derived(getTicketById(page.params.id ?? ''));
	const property = $derived(ticket ? getPropertyById(ticket.propertyId) : undefined);
	const reporter = $derived(ticket ? getUserById(ticket.creatorId) : undefined); // creatorId is always Admin
	const currentSupplierId = $derived(ticket ? getCurrentSupplier(ticket) : undefined);
	const supplier = $derived(currentSupplierId ? getUserById(currentSupplierId) : undefined);
	// Prefer explicit ticket.aiSummary, fallback to adminMetadata.ai body
	const aiSummary = $derived(ticket ? (ticket.aiSummary ?? ticket.adminMetadata.find((ev) => ev.kind === 'ai')?.body) : undefined);
	const aiNextStep = $derived(ticket ? getTicketNextStep(ticket.id) : undefined);
	const currentStatus = $derived(ticket ? getCurrentStatus(ticket) : 'opened');
	const firstEvent = $derived(ticket?.eventTimeline[0]);
	const timelineItems = $derived.by<TicketTimelineItem[]>(() => {
		if (!ticket) return [];

		const items: TicketTimelineItem[] = [];

		for (const ev of ticket.eventTimeline ?? []) {
			items.push({ type: 'ticket-event', id: ev.id, data: ev, at: ev.at });
		}

		for (const meta of ticket.adminMetadata ?? []) {
			items.push({ type: 'admin-metadata', id: meta.id, data: meta, at: meta.at });
		}

		for (const id of ticket.quoteIds ?? []) {
			const q = getQuoteById(id);
				if (q && q.createdAt) items.push({ type: 'quote', id: q.id, data: q, at: q.createdAt });
		}

		for (const id of ticket.invoiceIds ?? []) {
			const i = getInvoiceById(id);
				if (i && i.createdAt) items.push({ type: 'invoice', id: i.id, data: i, at: i.createdAt });
		}

		for (const id of ticket.paymentIds ?? []) {
			const p = getPaymentById(id);
				if (p) items.push({ type: 'payment', id: p.id, data: p, at: (p.createdAt || p.paidAt) as string });
		}

		for (const intId of ticket.interventionIds ?? []) {
			const task = getSupplierTaskById(intId);
			if (task) {
				items.push({
					type: 'intervention',
					id: task.id,
					data: task,
					at: `${task.date}T${task.startTime}:00Z`
				});
			}
		}

		return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
	});

	const lastUpdateAt = $derived(timelineItems[0]?.at);

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

// Typing animation helpers for short AI text blocks.
// Renders text one char at a time at a fast rate.
let typedSintesi = $state('');
let typedNextTitle = $state('');
let typedNextDetail = $state('');
let typingSpeed = 14; // milliseconds per character (fast)

function typeInto(source: string | undefined, setter: (v: string) => void) {
	if (!source) {
		setter('');
		return () => {};
	}
	setter('');
	let i = 0;
	const id = setInterval(() => {
		i++;
		setter(source.slice(0, i));
		if (i >= source.length) clearInterval(id);
	}, typingSpeed);
	return () => clearInterval(id);
}

// Svelte 5 rune: effect when aiSummary changes
$effect(() => {
	let stop: () => void = () => {};
	if (aiSummary) {
		stop = typeInto(aiSummary, (v) => (typedSintesi = v));
	} else {
		typedSintesi = '';
	}
	return () => stop();
});

$effect(() => {
	let stop1: () => void = () => {};
	let stop2: () => void = () => {};
	if (aiNextStep) {
		stop1 = typeInto(aiNextStep.title ?? '', (v) => (typedNextTitle = v));
		stop2 = typeInto(aiNextStep.detail ?? '', (v) => (typedNextDetail = v));
	} else {
		typedNextTitle = '';
		typedNextDetail = '';
	}
	return () => {
		stop1();
		stop2();
	};
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
						{#if lastUpdateAt}
							· ultima modifica {relativeDays(lastUpdateAt)}
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
						<p class="mt-1.5 text-sm leading-relaxed text-muted-foreground">{typedSintesi}</p>
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
								{typedNextTitle}
							</p>
							<p class="mt-1.5 text-sm leading-relaxed text-muted-foreground">
								{typedNextDetail}
							</p>
						{/if}
					</section>

					<section class="block">
						<div class="block__head">
							<h2 class="block__title">Cronologia</h2>
						</div>
						<div class="mt-4">
							<TicketTimeline items={timelineItems} />
						</div>
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
								<dd>{lastUpdateAt ? formatDate(lastUpdateAt) : '—'}</dd>
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
