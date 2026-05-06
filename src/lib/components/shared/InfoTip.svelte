<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { InformationCircleIcon } from '@hugeicons/core-free-icons';
	import type { Snippet } from 'svelte';

	type Props = {
		/** Plain text content (alternative to children snippet). */
		text?: string;
		/** Accessible label for the trigger. Default: "Aiuto". */
		label?: string;
		children?: Snippet;
	};

	let { text, label = 'Aiuto', children }: Props = $props();

	let trigger: HTMLButtonElement | undefined = $state();
	let bubble: HTMLDivElement | undefined = $state();

	function position() {
		if (!trigger || !bubble) return;
		const r = trigger.getBoundingClientRect();
		// Show above the trigger, centered. Clamp to viewport.
		bubble.style.visibility = 'hidden';
		bubble.style.display = 'block';
		const bw = bubble.offsetWidth;
		const bh = bubble.offsetHeight;
		bubble.style.display = '';
		bubble.style.visibility = '';

		let left = r.left + r.width / 2 - bw / 2;
		const margin = 8;
		left = Math.max(margin, Math.min(left, window.innerWidth - bw - margin));

		let top = r.top - bh - 8;
		if (top < margin) top = r.bottom + 8; // flip below if no room above

		bubble.style.left = `${left}px`;
		bubble.style.top = `${top}px`;
	}

	function show() {
		if (!bubble) return;
		try {
			bubble.showPopover();
			position();
		} catch {
			// Fallback if popover unsupported: still display via class
			bubble.dataset.open = 'true';
			position();
		}
	}

	function hide() {
		if (!bubble) return;
		try {
			bubble.hidePopover();
		} catch {
			delete bubble.dataset.open;
		}
	}
</script>

<button
	bind:this={trigger}
	type="button"
	class="info-tip__trigger"
	aria-label={label}
	onmouseenter={show}
	onmouseleave={hide}
	onfocus={show}
	onblur={hide}
>
	<HugeiconsIcon icon={InformationCircleIcon} size={14} strokeWidth={2} />
</button>

<div
	bind:this={bubble}
	popover="manual"
	class="info-tip__bubble"
	role="tooltip"
	onmouseenter={show}
	onmouseleave={hide}
>
	{#if children}
		{@render children()}
	{:else}
		{text}
	{/if}
</div>

<style>
	.info-tip__trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--muted-foreground);
		background: transparent;
		border: 0;
		padding: 0;
		cursor: help;
		border-radius: 9999px;
		outline: none;
	}

	.info-tip__trigger:hover,
	.info-tip__trigger:focus-visible {
		color: var(--foreground);
	}

	.info-tip__trigger:focus-visible {
		box-shadow: 0 0 0 2px var(--ring);
	}

	.info-tip__bubble {
		/* popover="manual" places this in the browser top layer:
		   always above any z-index / overflow context. */
		position: fixed;
		margin: 0;
		inset: auto;
		min-width: 12rem;
		max-width: 18rem;
		padding: 0.5rem 0.625rem;
		border-radius: 0.375rem;
		background: var(--popover);
		color: var(--popover-foreground);
		border: 1px solid var(--border);
		box-shadow: 0 8px 24px -4px oklch(0 0 0 / 0.18);
		font-size: 0.75rem;
		line-height: 1.1rem;
		font-weight: 400;
		text-align: left;
		pointer-events: auto;
	}

	/* Fallback for browsers without Popover API support */
	.info-tip__bubble:not(:popover-open):not([data-open='true']) {
		display: none;
	}
</style>
