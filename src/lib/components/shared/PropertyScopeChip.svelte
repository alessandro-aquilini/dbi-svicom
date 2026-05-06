<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Building03Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import { propertySelection } from '$lib/state/property-selection.svelte';

	type Props = {
		/** Bottom margin in CSS (default: "1rem"). Pass "0" to control spacing externally. */
		gap?: string;
		/**
		 * Visual variant.
		 * - `default`: full chip with description and labelled reset button.
		 * - `compact`: condensed for narrow containers (sidebars). Shows only the
		 *   property name and a small icon-only reset.
		 */
		size?: 'default' | 'compact';
	};

	let { gap = '1rem', size = 'default' }: Props = $props();
</script>

{#if !propertySelection.isAll && propertySelection.selected}
	<div class="property-scope is-{size}" style:margin-bottom={gap}>
		<span class="property-scope__icon" aria-hidden="true">
			<HugeiconsIcon
				icon={Building03Icon}
				size={size === 'compact' ? 12 : 14}
				strokeWidth={1.75}
			/>
		</span>
		{#if size === 'compact'}
			<span class="property-scope__text" title={propertySelection.selected.name}>
				{propertySelection.selected.name}
			</span>
			<button
				type="button"
				class="property-scope__reset property-scope__reset--icon"
				onclick={() => propertySelection.select(null)}
				aria-label="Mostra tutti i condomìni"
				title="Mostra tutti i condomìni"
			>
				<HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
			</button>
		{:else}
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
		{/if}
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

	.property-scope.is-compact {
		gap: 0.375rem;
		padding: 0.3125rem 0.4375rem 0.3125rem 0.5rem;
		border-radius: 0.4375rem;
		font-size: 0.75rem;
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

	.property-scope.is-compact .property-scope__icon {
		width: 1.125rem;
		height: 1.125rem;
		border-radius: 0.25rem;
	}

	.property-scope__text {
		flex: 1;
		min-width: 0;
	}

	.property-scope.is-compact .property-scope__text {
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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

	.property-scope__reset--icon {
		width: 1.375rem;
		height: 1.375rem;
		padding: 0;
		gap: 0;
		justify-content: center;
		border-radius: 9999px;
		color: var(--muted-foreground);
		flex-shrink: 0;
		line-height: 0;
	}

	.property-scope__reset--icon:hover {
		color: var(--foreground);
	}
</style>
