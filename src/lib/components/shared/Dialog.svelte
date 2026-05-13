<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { SparklesIcon } from '@hugeicons/core-free-icons';
	import type { Snippet } from 'svelte';

	type Props = {
		open: boolean;
		title: string;
		description?: string;
		cancelLabel?: string;
		confirmLabel?: string;
		onConfirm?: () => void;
		onCancel?: () => void;
		hideCancel?: boolean;
		icon?: typeof SparklesIcon;
		children?: Snippet;
	};

	let {
		open = $bindable(false),
		title,
		description,
		cancelLabel = 'Chiudi',
		confirmLabel = 'Conferma',
		onConfirm,
		onCancel,
		hideCancel = false,
		icon = SparklesIcon,
		children
	}: Props = $props();

	let dialog: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});

	function close() {
		open = false;
		onCancel?.();
	}

	function confirm() {
		open = false;
		onConfirm?.();
	}

	function handleBackdrop(event: MouseEvent) {
		if (event.target === dialog) close();
	}
</script>

<dialog bind:this={dialog} onclose={close} onclick={handleBackdrop} class="dialog">
	<div class="dialog__inner">
		<div class="dialog__head">
			<div class="min-w-0 flex-1">
				{#if title}
					<h2 class="dialog__title">{title}</h2>
				{/if}
				{#if description}
					<p class="dialog__desc">{description}</p>
				{/if}
				{#if children}
					<div class="dialog__body">{@render children()}</div>
				{/if}
			</div>
		</div>

		<div class="dialog__actions">
			{#if !hideCancel}
				<button type="button" onclick={close} class="dialog__btn dialog__btn--ghost">
					{cancelLabel}
				</button>
			{/if}
			<button type="button" onclick={confirm} class="dialog__btn dialog__btn--primary">
				{confirmLabel}
			</button>
		</div>
	</div>
</dialog>

<style>
	.dialog {
		/* Center on screen — Tailwind preflight zeroes margins, so we
		   restore the UA's auto-centering for <dialog>:modal explicitly. */
		position: fixed;
		inset: 0;
		margin: auto;

		padding: 0;
		border: 1px solid var(--border);
		background: var(--card);
		color: var(--foreground);
		border-radius: var(--radius);
		max-width: min(55rem, calc(100% - 2rem));
		width: min(100%, 55rem);
		max-height: calc(100dvh - 2rem);
		overflow-y: auto;
		box-shadow:
			0 1px 2px oklch(0 0 0 / 0.06),
			0 16px 40px -12px oklch(0 0 0 / 0.22);

		/* Animated entry/exit (modern browsers with @starting-style support) */
		opacity: 0;
		transform: translateY(-6px) scale(0.98);
		transition:
			opacity 180ms ease,
			transform 180ms ease,
			overlay 180ms ease allow-discrete,
			display 180ms ease allow-discrete;
	}

	.dialog[open] {
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	@starting-style {
		.dialog[open] {
			opacity: 0;
			transform: translateY(-6px) scale(0.98);
		}
	}

	.dialog::backdrop {
		background: oklch(0 0 0 / 0);
		backdrop-filter: blur(0px);
		transition:
			background 180ms ease,
			backdrop-filter 180ms ease,
			overlay 180ms ease allow-discrete,
			display 180ms ease allow-discrete;
	}

	.dialog[open]::backdrop {
		background: oklch(0 0 0 / 0.35);
		backdrop-filter: blur(2px);
	}

	@starting-style {
		.dialog[open]::backdrop {
			background: oklch(0 0 0 / 0);
			backdrop-filter: blur(0px);
		}
	}

	.dialog__inner {
		display: flex;
		flex-direction: column;
		min-height: 0;
		max-height: 100%;
	}

	.dialog__head {
		display: flex;
		gap: 0.875rem;
		padding: 1.25rem 1.25rem 1rem;
	}

	.dialog__title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--foreground);
		line-height: 1.3;
	}

	.dialog__desc {
		font-size: 0.8125rem;
		color: var(--muted-foreground);
		margin-top: 0.25rem;
		line-height: 1.45;
	}

	.dialog__body {
		font-size: 0.8125rem;
		color: var(--muted-foreground);
		margin-top: 0.5rem;
		padding-top: 0.25rem;
	}

	.dialog__actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 0.875rem 1.25rem 1.25rem;
		border-top: 1px solid var(--border);
		background: color-mix(in oklch, var(--muted) 60%, transparent);
	}

	.dialog__btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 2.25rem;
		padding: 0 0.875rem;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		border: 0;
		transition: background-color 150ms ease, color 150ms ease;
	}

	.dialog__btn--ghost {
		background: transparent;
		color: var(--muted-foreground);
	}

	.dialog__btn--ghost:hover {
		background: var(--muted);
		color: var(--foreground);
	}

	.dialog__btn--primary {
		background: var(--primary);
		color: var(--primary-foreground);
		box-shadow: 0 1px 2px oklch(0 0 0 / 0.06);
	}

	.dialog__btn--primary:hover {
		background: color-mix(in oklch, var(--primary) 88%, black);
	}

	@media (prefers-reduced-motion: reduce) {
		.dialog,
		.dialog::backdrop {
			transition-duration: 0ms !important;
		}
	}

	@media (min-width: 768px) {
		.dialog {
			max-width: min(68rem, calc(100% - 2rem));
		}
	}
</style>
