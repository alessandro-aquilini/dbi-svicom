<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Building03Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import { propertySelection } from '$lib/state/property-selection.svelte';

	type Props = {
		/** Bottom margin in CSS (default: "1rem"). Pass "0" to control spacing externally. */
		gap?: string;
	};

	let { gap = '1rem' }: Props = $props();
</script>

{#if !propertySelection.isAll && propertySelection.selected}
	<div class="property-scope" style:margin-bottom={gap}>
		<span class="property-scope__icon" aria-hidden="true">
			<HugeiconsIcon icon={Building03Icon} size={14} strokeWidth={1.75} />
		</span>
		<span class="property-scope__text">
			Filtrato per condominio: <strong>{propertySelection.selected.name}</strong>
			<span class="property-scope__hint">— modifica dalla sidebar</span>
		</span>
		<button
			type="button"
			class="property-scope__reset"
			onclick={() => propertySelection.select(null)}
			aria-label="Mostra tutti i condomìni"
		>
			<HugeiconsIcon icon={Cancel01Icon} size={13} strokeWidth={2} />
			Tutti i condomìni
		</button>
	</div>
{/if}

<style>
	.property-scope {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid color-mix(in oklab, var(--primary) 25%, var(--border));
		background: color-mix(in oklab, var(--primary) 5%, var(--card));
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		color: var(--foreground);
	}

	.property-scope__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.375rem;
		background: var(--primary);
		color: var(--primary-foreground);
		flex-shrink: 0;
	}

	.property-scope__text {
		flex: 1;
		min-width: 0;
	}

	.property-scope__hint {
		color: var(--muted-foreground);
	}

	.property-scope__reset {
		display: inline-flex;
		align-items: center;
		gap: 0.3125rem;
		height: 1.875rem;
		padding: 0 0.625rem;
		border: 1px solid var(--border);
		background: var(--card);
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--foreground);
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
	}

	.property-scope__reset:hover {
		border-color: var(--primary);
		background: var(--accent);
	}
</style>
