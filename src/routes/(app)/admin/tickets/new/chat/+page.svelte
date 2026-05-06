<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { DemoDialog } from '$lib/components/shared';
	import { getPropertyById } from '$lib/data/properties';
	import type { TicketPriority } from '$lib/data/ticket/tickets-admin';
	import {
		SparklesIcon,
		ArrowUp01Icon,
		DropletIcon,
		LightbulbOffIcon,
		Wrench01Icon,
		File01Icon,
		Tag01Icon,
		Location01Icon,
		Building03Icon,
		Flag03Icon,
		Note01Icon
	} from '@hugeicons/core-free-icons';

	type Extract = {
		category: string;
		title: string;
		description: string;
		propertyId: string;
		location?: string;
		priority: TicketPriority;
	};

	type Example = { icon: typeof SparklesIcon; text: string; extracted: Extract };

	const examples: Example[] = [
		{
			icon: DropletIcon,
			text: "C'è una perdita d'acqua nel locale contatori di Via Marconi 14, segnalata da più residenti stamattina.",
			extracted: {
				category: 'impianti',
				title: "Perdita d'acqua nel locale contatori",
				description:
					"Segnalazione multipla da residenti, ricevuta stamattina. Da verificare l'entità del danno.",
				propertyId: 'cnd-marconi-14',
				location: 'Locale contatori',
				priority: 'alta'
			}
		},
		{
			icon: Wrench01Icon,
			text: "L'ascensore della scala B è fermo a intermittenza dalle 8, serve un intervento urgente.",
			extracted: {
				category: 'impianti',
				title: 'Ascensore scala B fermo a intermittenza',
				description: 'Guasto ricorrente dalle ore 8. Richiesto intervento urgente.',
				propertyId: 'cnd-marconi-14',
				location: 'Scala B',
				priority: 'alta'
			}
		},
		{
			icon: LightbulbOffIcon,
			text: 'Le luci delle scale al secondo piano non funzionano, sembra un problema ricorrente.',
			extracted: {
				category: 'impianti',
				title: 'Luci scale non funzionanti al 2° piano',
				description:
					'Problema ricorrente in zona scale, possibile duplicato di richieste precedenti.',
				propertyId: 'cnd-marconi-14',
				location: 'Scala A · 2° piano',
				priority: 'media'
			}
		},
		{
			icon: File01Icon,
			text: 'Devo aprire una pratica amministrativa per il rinnovo del contratto di pulizie.',
			extracted: {
				category: 'amministrativo',
				title: 'Rinnovo contratto pulizie',
				description:
					'Pratica amministrativa per il rinnovo del contratto con il fornitore pulizie.',
				propertyId: 'cnd-marconi-14',
				priority: 'bassa'
			}
		}
	];

	let prompt = $state('');
	let textarea: HTMLTextAreaElement | undefined = $state();
	let stage = $state<'idle' | 'thinking' | 'building' | 'done'>('idle');
	let revealed = $state(0);
	let sentPrompt = $state('');
	let extract = $state<Extract | null>(null);
	let reducedMotion = $state(false);
	let demoOpen = $state(false);

	$effect(() => {
		const m = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = m.matches;
		const onChange = () => (reducedMotion = m.matches);
		m.addEventListener('change', onChange);
		return () => m.removeEventListener('change', onChange);
	});

	$effect(() => {
		return () => {
			if (revealTimer) clearInterval(revealTimer);
		};
	});

	const canSubmit = $derived(prompt.trim().length > 0);
	const factsList = $derived(extract ? buildFacts(extract) : []);
	const flyDuration = $derived(reducedMotion ? 0 : 220);

	let revealTimer: ReturnType<typeof setInterval> | null = null;

	function buildFacts(e: Extract) {
		const property = getPropertyById(e.propertyId);
		const list: { icon: typeof Tag01Icon; label: string; value: string }[] = [
			{ icon: Tag01Icon, label: 'Categoria', value: capitalize(e.category) },
			{ icon: File01Icon, label: 'Titolo', value: e.title },
			{ icon: Note01Icon, label: 'Descrizione', value: e.description },
			{ icon: Building03Icon, label: 'Condominio', value: property?.name ?? '—' }
		];
		if (e.location) list.push({ icon: Location01Icon, label: 'Punto', value: e.location });
		list.push({ icon: Flag03Icon, label: 'Priorità', value: capitalize(e.priority) });
		return list;
	}

	function capitalize(s: string) {
		return s.charAt(0).toUpperCase() + s.slice(1);
	}

	function reset() {
		if (revealTimer) clearInterval(revealTimer);
		revealTimer = null;
		stage = 'idle';
		revealed = 0;
		sentPrompt = '';
		extract = null;
		prompt = '';
	}

	function submit() {
		if (!canSubmit) return;
		const text = prompt.trim();
		sentPrompt = text;
		prompt = '';
		const match = examples.find((e) => e.text === text);
		extract = match?.extracted ?? null;
		stage = 'thinking';
		const thinkDelay = reducedMotion ? 250 : 800;
		setTimeout(() => {
			if (!extract) {
				stage = 'done';
				return;
			}
			stage = 'building';
			revealed = 0;
			const target = buildFacts(extract).length;
			const step = reducedMotion ? 50 : 240;
			revealTimer = setInterval(() => {
				revealed += 1;
				if (revealed >= target) {
					if (revealTimer) clearInterval(revealTimer);
					revealTimer = null;
					stage = 'done';
				}
			}, step);
		}, thinkDelay);
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submit();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			submit();
		}
	}

	function useExample(text: string) {
		prompt = text;
		textarea?.focus();
	}
</script>

<svelte:head>
	<title>Nuova pratica · Racconta — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="max-w-2xl space-y-6">
	{#if stage === 'idle'}
		<div in:fade={{ duration: flyDuration }} class="space-y-6">
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<HugeiconsIcon icon={SparklesIcon} size={16} strokeWidth={2} class="text-primary" />
				<span>Descrivi la pratica in linguaggio naturale, ai campi pensiamo noi.</span>
			</div>

			<form onsubmit={handleSubmit} class="prompt-card">
				<textarea
					bind:this={textarea}
					bind:value={prompt}
					onkeydown={handleKeydown}
					rows="5"
					placeholder="Es. Perdita d'acqua nel locale contatori di Via Marconi 14, segnalata stamattina da più residenti…"
					class="prompt-card__input"
				></textarea>
				<div class="prompt-card__footer">
					<span class="text-xs text-muted-foreground">⌘ + Invio per inviare</span>
					<button
						type="submit"
						disabled={!canSubmit}
						class="prompt-card__send"
						aria-label="Crea pratica"
					>
						<HugeiconsIcon icon={ArrowUp01Icon} size={16} strokeWidth={2.5} />
					</button>
				</div>
			</form>

			<div class="space-y-3">
				<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Esempi</p>
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					{#each examples as example, i (i)}
						<button type="button" onclick={() => useExample(example.text)} class="example-chip">
							<HugeiconsIcon
								icon={example.icon}
								size={16}
								strokeWidth={1.75}
								class="text-muted-foreground shrink-0 mt-0.5"
							/>
							<span class="text-left">{example.text}</span>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{:else}
		<div in:fade={{ duration: flyDuration }} class="space-y-5">
			<!-- User message bubble -->
			<div class="flex justify-end">
				<div class="user-bubble">{sentPrompt}</div>
			</div>

			<!-- AI block -->
			<div class="flex items-start gap-3">
				<div class="ai-avatar" aria-hidden="true">
					<HugeiconsIcon icon={SparklesIcon} size={14} strokeWidth={2} />
				</div>

				<div class="min-w-0 flex-1 space-y-3">
					{#if stage === 'thinking'}
						<div in:fade={{ duration: flyDuration }} class="thinking-dots" aria-label="Sto leggendo">
							<span></span><span></span><span></span>
						</div>
					{:else if extract}
						<p
							in:fade={{ duration: flyDuration }}
							class="text-xs text-muted-foreground"
						>
							Ho ricavato questi campi dalla tua descrizione:
						</p>
						<div class="fact-list">
							{#each factsList as fact, i (i)}
								{#if i < revealed}
									<div in:fly={{ y: 6, duration: flyDuration }} class="fact-row">
										<HugeiconsIcon
											icon={fact.icon}
											size={14}
											strokeWidth={1.75}
											class="fact-row__icon"
										/>
										<div class="min-w-0 flex-1">
											<div class="fact-row__label">{fact.label}</div>
											<div class="fact-row__value">{fact.value}</div>
										</div>
									</div>
								{/if}
							{/each}
						</div>
					{:else}
						<p in:fade={{ duration: flyDuration }} class="text-sm text-muted-foreground">
							L'integrazione con l'assistente AI è in arrivo. Per provare la demo, scegli uno
							degli esempi.
						</p>
					{/if}
				</div>
			</div>

			{#if stage === 'done'}
				<div
					in:fade={{ duration: flyDuration, delay: reducedMotion ? 0 : 80 }}
					class="flex items-center justify-end gap-3 border-t border-border pt-5"
				>
					<button
						type="button"
						onclick={reset}
						class="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium text-muted-foreground hover:text-foreground"
					>
						Ricomincia
					</button>
					{#if extract}
						<button
							type="button"
							onclick={() => (demoOpen = true)}
							class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
						>
							Crea pratica
						</button>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<DemoDialog bind:open={demoOpen} />

<style>
	.prompt-card {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		background: var(--card);
		border-radius: var(--radius);
		box-shadow: 0 1px 2px oklch(0 0 0 / 0.04);
		transition: border-color 150ms ease, box-shadow 150ms ease;
	}

	.prompt-card:focus-within {
		border-color: var(--ring);
		box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 18%, transparent);
	}

	.prompt-card__input {
		width: 100%;
		resize: none;
		background: transparent;
		border: 0;
		outline: 0;
		padding: 0.875rem 1rem;
		font-size: 0.9375rem;
		line-height: 1.5;
		color: var(--foreground);
		font-family: inherit;
	}

	.prompt-card__input::placeholder {
		color: var(--muted-foreground);
	}

	/* Wrapper handles focus ring; suppress the textarea's own. */
	.prompt-card__input:focus {
		outline: 0;
		box-shadow: none;
		border-color: transparent;
	}

	.prompt-card__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.625rem 0.625rem 1rem;
	}

	.prompt-card__send {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 9999px;
		background: var(--primary);
		color: var(--primary-foreground);
		border: 0;
		cursor: pointer;
		transition: background-color 150ms ease, opacity 150ms ease;
	}

	.prompt-card__send:hover:not(:disabled) {
		background: color-mix(in oklch, var(--primary) 88%, black);
	}

	.prompt-card__send:disabled {
		background: var(--muted);
		color: var(--muted-foreground);
		cursor: not-allowed;
	}

	.example-chip {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.625rem 0.75rem;
		border: 1px solid var(--border);
		background: var(--card);
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		line-height: 1.25rem;
		color: var(--muted-foreground);
		text-align: left;
		cursor: pointer;
		transition: border-color 150ms ease, background-color 150ms ease, color 150ms ease;
	}

	.example-chip:hover {
		border-color: color-mix(in oklch, var(--primary) 35%, var(--border));
		background: color-mix(in oklch, var(--primary) 4%, var(--card));
		color: var(--foreground);
	}

	/* ─── Conversation view ─── */
	.user-bubble {
		max-width: 85%;
		padding: 0.625rem 0.875rem;
		border-radius: 1rem 1rem 0.25rem 1rem;
		background: var(--primary);
		color: var(--primary-foreground);
		font-size: 0.875rem;
		line-height: 1.4;
		word-wrap: break-word;
	}

	.ai-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 9999px;
		background: color-mix(in oklch, var(--primary) 10%, var(--card));
		color: var(--primary);
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.thinking-dots {
		display: inline-flex;
		gap: 4px;
		align-items: center;
		padding: 0.625rem 0.75rem;
		border-radius: 1rem;
		background: var(--muted);
	}

	.thinking-dots span {
		width: 6px;
		height: 6px;
		border-radius: 9999px;
		background: var(--muted-foreground);
		animation: dot-pulse 1.2s infinite ease-in-out;
		opacity: 0.4;
	}

	.thinking-dots span:nth-child(2) {
		animation-delay: 0.15s;
	}
	.thinking-dots span:nth-child(3) {
		animation-delay: 0.3s;
	}

	@keyframes dot-pulse {
		0%,
		80%,
		100% {
			opacity: 0.3;
			transform: scale(0.85);
		}
		40% {
			opacity: 1;
			transform: scale(1);
		}
	}

	.fact-list {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		background: var(--card);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.fact-row {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.75rem 0.875rem;
		border-bottom: 1px solid var(--border);
	}

	.fact-row:last-child {
		border-bottom: 0;
	}

	.fact-row :global(.fact-row__icon) {
		color: var(--muted-foreground);
		margin-top: 0.25rem;
		flex-shrink: 0;
	}

	.fact-row__label {
		font-size: 0.6875rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted-foreground);
	}

	.fact-row__value {
		font-size: 0.875rem;
		color: var(--foreground);
		margin-top: 0.125rem;
		line-height: 1.4;
		word-wrap: break-word;
	}

	@media (prefers-reduced-motion: reduce) {
		.thinking-dots span {
			animation: none;
			opacity: 0.6;
		}
	}
</style>
