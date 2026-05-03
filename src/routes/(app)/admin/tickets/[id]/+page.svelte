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
	import type { StatusVariant } from '$lib/types';
	import {
		getTicketById,
		getTicketAiSummary,
		getTicketNextStep,
		type TicketStatus
	} from '$lib/data/tickets';
	import { getPropertyById } from '$lib/data/properties';
	import { getUserById, type User } from '$lib/data/users';

	const ticket = $derived(getTicketById(page.params.id ?? ''));
	const property = $derived(ticket ? getPropertyById(ticket.propertyId) : undefined);
	const reporter = $derived(ticket ? getUserById(ticket.reportedById) : undefined);
	const internalOwner = $derived(property ? getUserById(property.adminId) : undefined);
	const assigned = $derived(ticket?.assignedToId ? getUserById(ticket.assignedToId) : undefined);
	const supplier = $derived(assigned?.role === 'supplier' ? assigned : undefined);
	const aiSummary = $derived(ticket ? getTicketAiSummary(ticket.id) : undefined);
	const aiNextStep = $derived(ticket ? getTicketNextStep(ticket.id) : undefined);

	const priorityColors: Record<string, string> = {
		critica: 'bg-destructive/15 text-destructive',
		alta: 'bg-warning/15 text-warning',
		media: 'bg-primary/10 text-primary',
		bassa: 'bg-secondary text-secondary-foreground'
	};

	const statusVariant: Record<TicketStatus, StatusVariant> = {
		nuovo: 'default',
		assegnato: 'default',
		'in-corso': 'warning',
		risolto: 'success',
		chiuso: 'muted'
	};

	const statusLabel: Record<TicketStatus, string> = {
		nuovo: 'Nuovo',
		assegnato: 'Assegnato',
		'in-corso': 'In corso',
		risolto: 'Risolto',
		chiuso: 'Chiuso'
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
				<p class="scheda__eyebrow">{ticket.id} · {ticket.type}</p>
				<h1 class="scheda__title">{ticket.title}</h1>
				<p class="scheda__lead">{ticket.description}</p>
				<div class="scheda__meta">
					<StatusBadge label={statusLabel[ticket.status]} variant={statusVariant[ticket.status]} />
					<span
						class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize {priorityColors[
							ticket.priority
						] ?? ''}"
					>
						Priorità {ticket.priority}
					</span>
					<span class="text-xs text-muted-foreground">
						Aperta {relativeDays(ticket.createdAt)} · ultima modifica {relativeDays(
							ticket.updatedAt
						)}
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
				</div>

				<!-- Sidebar -->
				<aside class="scheda__aside">
					<!-- Assegnata a -->
					<section class="block">
						<h2 class="block__title">Assegnata a</h2>
						<div class="mt-3 space-y-3">
							{#if internalOwner}
								<div class="party-row">
									<span
										class="avatar"
										style:background-color={avatarColor(internalOwner)}
										aria-hidden="true"
									>
										{initials(internalOwner.name)}
									</span>
									<div class="min-w-0 flex-1">
										<p class="party-row__name">{internalOwner.name}</p>
										<p class="party-row__role">Owner interno</p>
									</div>
								</div>
							{/if}

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
								<button type="button" class="assign-btn">
									<HugeiconsIcon icon={UserAdd01Icon} size={14} strokeWidth={2} />
									<span>
										<span class="block text-sm font-medium text-foreground">Assegna fornitore</span>
										<span class="block text-xs text-muted-foreground">
											Nessun fornitore assegnato
										</span>
									</span>
								</button>
							{/if}
						</div>
					</section>

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
							{#if ticket.location}
								<div class="detail-row">
									<dt>Posizione</dt>
									<dd>{ticket.location}</dd>
								</div>
							{/if}
							{#if ticket.metadata?.channel}
								<div class="detail-row">
									<dt>Canale</dt>
									<dd class="capitalize">{ticket.metadata.channel}</dd>
								</div>
							{/if}
							{#if ticket.metadata?.sla}
								<div class="detail-row">
									<dt>SLA</dt>
									<dd>{ticket.metadata.sla}</dd>
								</div>
							{/if}
							<div class="detail-row">
								<dt>Segnalata da</dt>
								<dd>{reporter?.name ?? '—'}</dd>
							</div>
							<div class="detail-row">
								<dt>Creata</dt>
								<dd>{formatDate(ticket.createdAt)}</dd>
							</div>
							<div class="detail-row">
								<dt>Aggiornata</dt>
								<dd>{formatDate(ticket.updatedAt)}</dd>
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

	/* ─── Assign CTA ──────────────────────────────────────────── */
	.assign-btn {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px dashed var(--input);
		background: transparent;
		text-align: left;
		cursor: pointer;
		transition:
			border-color 150ms ease,
			background 150ms ease;
	}

	.assign-btn :global(svg) {
		color: var(--muted-foreground);
		flex-shrink: 0;
	}

	.assign-btn:hover {
		border-color: var(--primary);
		background: color-mix(in oklch, var(--primary) 4%, transparent);
	}

	.assign-btn:hover :global(svg) {
		color: var(--primary);
	}
</style>
