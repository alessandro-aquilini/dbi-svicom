<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		AiChat01Icon,
		ArrowUp01Icon,
		CircleIcon,
		CreditCardIcon,
		Exchange01Icon,
		File01Icon,
		Message01Icon,
		Tick01Icon,
		Wrench01Icon
	} from '@hugeicons/core-free-icons';
	import { getUserById } from '$lib/data/users';
	import type { TicketTimelineItem } from './types';

	const { item }: { item: TicketTimelineItem } = $props();

	const priorityClasses: Record<string, string> = {
		critica: 'bg-destructive/15 text-destructive',
		alta: 'bg-warning/15 text-warning',
		media: 'bg-primary/10 text-primary',
		bassa: 'bg-secondary text-secondary-foreground'
	};

	type Config = { icon: typeof CircleIcon; color: string; label: string };

	function getConfig(current: TicketTimelineItem): Config {
		switch (current.type) {
			case 'ticket-event':
				switch (current.data.kind) {
					case 'createTicket':
						return { icon: CircleIcon, color: 'text-primary', label: 'Ticket aperto' };
					case 'assignToSupplier':
						return { icon: Wrench01Icon, color: 'text-warning', label: 'Assegnazione' };
					case 'accepted':
						return { icon: Tick01Icon, color: 'text-emerald-500', label: 'Accettato' };
					case 'declined':
						return { icon: CircleIcon, color: 'text-destructive', label: 'Rifiutato' };
					case 'reportCompletion':
						return { icon: Tick01Icon, color: 'text-emerald-600', label: 'Lavoro completato' };
					case 'closeTicket':
					case 'validateAndClose':
						return { icon: Tick01Icon, color: 'text-emerald-600', label: 'Chiusura' };
					case 'archiveTicket':
						return { icon: CircleIcon, color: 'text-muted-foreground', label: 'Archiviazione' };
					case 'closed':
						return { icon: CircleIcon, color: 'text-muted-foreground', label: 'Chiuso' };
					default:
						return { icon: CircleIcon, color: 'text-muted-foreground', label: 'Evento' };
				}
			case 'admin-metadata':
				switch (current.data.kind) {
					case 'updatePriority':
						return { icon: ArrowUp01Icon, color: 'text-destructive', label: 'Priorità' };
					case 'ai':
						return { icon: AiChat01Icon, color: 'text-purple-500', label: 'Sintesi AI' };
					case 'addInternalNote':
					default:
						return { icon: Message01Icon, color: 'text-sky-500', label: 'Nota interna' };
				}
			case 'quote':
				return { icon: File01Icon, color: 'text-amber-500', label: 'Preventivo' };
			case 'invoice':
				return { icon: File01Icon, color: 'text-emerald-500', label: 'Fattura' };
			case 'payment':
				return { icon: CreditCardIcon, color: 'text-indigo-500', label: 'Pagamento' };
			case 'intervention':
				return { icon: Wrench01Icon, color: 'text-warning', label: 'Intervento' };
			default:
				return { icon: CircleIcon, color: 'text-muted-foreground', label: 'Attività' };
		}
	}

	const config = $derived(getConfig(item));

	function formatAbsolute(iso: string): string {
		return new Date(iso).toLocaleString('it-IT', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function relativeTime(iso: string): string {
		const ms = Date.now() - new Date(iso).getTime();
		if (ms < 60_000) return 'ora';
		const mins = Math.floor(ms / 60_000);
		if (mins < 60) return `${mins} min fa`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs} h fa`;
		const days = Math.floor(hrs / 24);
		return days === 1 ? 'ieri' : `${days} giorni fa`;
	}

	function getActorLabel(current: TicketTimelineItem): string {
		switch (current.type) {
			case 'ticket-event': {
				const user = current.data.authorId ? getUserById(current.data.authorId) : undefined;
				return user?.name ?? 'Sistema';
			}
			case 'admin-metadata': {
				const user = current.data.authorId ? getUserById(current.data.authorId) : undefined;
				return user?.name ?? 'Amministrazione';
			}
			case 'quote': {
				const user = getUserById(current.data.supplierId);
				return user?.name ?? 'Fornitore';
			}
			case 'invoice': {
				const user = getUserById(current.data.supplierId);
				return user?.name ?? 'Fornitore';
			}
			case 'payment': {
				const user = getUserById(current.data.fromId);
				return user?.name ?? 'Pagatore';
			}
			case 'intervention': {
				const user = getUserById(current.data.supplierId);
				return user?.name ?? 'Fornitore';
			}
			default:
				return 'Sistema';
		}
	}

	function getActionLabel(current: TicketTimelineItem): string {
		switch (current.type) {
			case 'ticket-event':
				switch (current.data.kind) {
					case 'assignToSupplier':
						return 'Assegnato al fornitore';

					case 'accepted':
						return 'Accettazione';
					case 'declined':
						return 'Rifiuto';
					case 'reportCompletion':
						return 'Completamento lavori';
					case 'closeTicket':
					case 'validateAndClose':
						return 'Chiusura';
					case 'archiveTicket':
						return 'Archiviazione';
					case 'closed':
						return 'Chiusura';
					case 'createTicket':
					default:
						return 'Apertura ticket';
				}
			case 'admin-metadata':
				return current.data.kind === 'updatePriority'
					? 'Cambio priorità'
					: current.data.kind === 'ai'
						? 'Sintesi automatica'
						: 'Nota interna';
			case 'quote':
				return 'Preventivo inviato';
			case 'invoice':
				return 'Fattura emessa';
			case 'payment':
				return 'Pagamento registrato';
			case 'intervention':
				return 'Intervento pianificato';
			default:
				return 'Aggiornamento';
		}
	}

	function formatCurrency(value: number, currency: string): string {
		return new Intl.NumberFormat('it-IT', {
			style: 'currency',
			currency,
			maximumFractionDigits: 2
		}).format(value);
	}

</script>

<li class="relative pl-10 after:absolute after:left-[0.65rem] after:top-7 after:bottom-0 after:w-px after:bg-border/80 last:after:hidden">
	<span class="absolute left-0 top-3 flex h-7 w-7 items-center justify-center rounded-full border bg-card shadow-sm">
		<HugeiconsIcon icon={config.icon} size={14} class={config.color} strokeWidth={2.25} />
	</span>

	<div class="rounded-xl border border-border/80 bg-card p-4 shadow-sm transition hover:shadow-md sm:p-5">
		<div class="flex flex-wrap items-start justify-between gap-3">
			<div class="min-w-0">
				<p class="text-sm font-semibold text-foreground">{getActorLabel(item)}</p>
				<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">{getActionLabel(item)}</p>
			</div>
			<time
				datetime={item.at}
				title={formatAbsolute(item.at)}
				class="text-xs font-medium text-muted-foreground"
			>
				{relativeTime(item.at)}
			</time>
		</div>

		{#if item.type === 'ticket-event' && item.data.body}
			<p class="mt-2 text-sm text-foreground/90 leading-relaxed">{item.data.body}</p>
		{/if}

		{#if item.type === 'ticket-event' && item.data.kind === 'assignToSupplier' && item.data.supplierId}
			{@const supplier = getUserById(item.data.supplierId)}
			<div class="mt-2 text-sm font-medium text-foreground">
				Assegnata a: <span class="font-semibold">{supplier?.name ?? 'Fornitore'}</span>
			</div>
		{/if}

		{#if item.type === 'admin-metadata'}
			{#if item.data.kind === 'updatePriority'}
				<div class="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
					<span class="rounded-full px-2 py-0.5 {priorityClasses[item.data.fromPriority ?? ''] ?? 'bg-muted text-muted-foreground'}">
						Da {item.data.fromPriority ?? '—'}
					</span>
					<span class="text-muted-foreground">→</span>
					<span class="rounded-full px-2 py-0.5 {priorityClasses[item.data.toPriority ?? ''] ?? 'bg-muted text-muted-foreground'}">
						A {item.data.toPriority ?? '—'}
					</span>
				</div>
			{:else if item.data.body}
				<p class="mt-2 text-sm text-foreground/90 leading-relaxed">{item.data.body}</p>
			{/if}
			{#if item.data.kind === 'ai'}
				<span class="mt-3 inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-purple-600">
					<HugeiconsIcon icon={AiChat01Icon} size={10} strokeWidth={2} />
					AI
				</span>
			{/if}
		{/if}

		{#if item.type === 'quote'}
			<div class="mt-2 flex flex-wrap items-center gap-2">
				<a
					href={`/admin/properties/${item.data.propertyId}/documents?focus=${item.data.id}`}
					class="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-foreground transition hover:bg-muted"
				>
					Preventivo {item.data.id}
				</a>
				<span class="text-xs font-medium text-muted-foreground">
					{formatCurrency(item.data.amount, item.data.currency)}
				</span>
			</div>
			<p class="mt-2 text-sm text-muted-foreground leading-relaxed">{item.data.description}</p>
		{/if}

		{#if item.type === 'invoice'}
			<div class="mt-2 flex flex-wrap items-center gap-2">
				<a
					href={`/admin/properties/${item.data.propertyId}/documents?focus=${item.data.id}`}
					class="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-foreground transition hover:bg-muted"
				>
					Fattura {item.data.number}
				</a>
				<span class="text-xs font-medium text-muted-foreground">
					{formatCurrency(item.data.amount, item.data.currency)}
				</span>
			</div>
			<p class="mt-2 text-sm text-muted-foreground leading-relaxed">{item.data.description}</p>
		{/if}

		{#if item.type === 'payment'}
			<div class="mt-2 flex flex-wrap items-center gap-2">
				<a
					href={`/admin/payments?focus=${item.data.id}`}
					class="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-foreground transition hover:bg-muted"
				>
					Pagamento {item.data.id}
				</a>
				<span class="text-xs font-medium text-muted-foreground">
					{formatCurrency(item.data.amount, item.data.currency)}
				</span>
			</div>
			<p class="mt-2 text-sm text-muted-foreground leading-relaxed">{item.data.description}</p>
		{/if}

		{#if item.type === 'intervention'}
			<div class="mt-2 flex flex-wrap items-center gap-2">
				<a
					href={`/admin/calendar?focus=${item.data.id}`}
					class="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-foreground transition hover:bg-muted"
				>
					Intervento {item.data.id}
				</a>
				<span class="text-xs font-medium text-muted-foreground">
					{item.data.date} · {item.data.startTime}-{item.data.endTime}
				</span>
			</div>
			<p class="mt-2 text-sm text-muted-foreground leading-relaxed">{item.data.title}</p>
			<p class="text-xs text-muted-foreground">{item.data.location}</p>
		{/if}
	</div>
</li>
