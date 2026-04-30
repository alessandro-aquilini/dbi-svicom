<script lang="ts">
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		SparklesIcon,
		ArrowUp01Icon,
		DropletIcon,
		LightbulbOffIcon,
		Wrench01Icon,
		File01Icon
	} from '@hugeicons/core-free-icons';

	type Example = { icon: typeof SparklesIcon; text: string };

	const examples: Example[] = [
		{
			icon: DropletIcon,
			text: "C'è una perdita d'acqua nel locale contatori di Via Marconi 14, segnalata da più residenti stamattina."
		},
		{
			icon: Wrench01Icon,
			text: "L'ascensore della scala B è fermo a intermittenza dalle 8, serve un intervento urgente."
		},
		{
			icon: LightbulbOffIcon,
			text: "Le luci delle scale al secondo piano non funzionano, sembra un problema ricorrente."
		},
		{
			icon: File01Icon,
			text: 'Devo aprire una pratica amministrativa per il rinnovo del contratto di pulizie.'
		}
	];

	let prompt = $state('');
	let textarea: HTMLTextAreaElement | undefined = $state();

	const canSubmit = $derived(prompt.trim().length > 0);

	function useExample(text: string) {
		prompt = text;
		textarea?.focus();
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!canSubmit) return;
		// Backend read-only: nessuna persistenza per ora.
		goto('/admin/tickets');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			if (canSubmit) goto('/admin/tickets');
		}
	}
</script>

<svelte:head>
	<title>Nuova pratica · Racconta — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="max-w-2xl space-y-6">
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
				<button
					type="button"
					onclick={() => useExample(example.text)}
					class="example-chip"
				>
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
</style>
