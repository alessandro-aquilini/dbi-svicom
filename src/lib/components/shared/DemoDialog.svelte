<script lang="ts">
	import Dialog from './Dialog.svelte';

	type Props = {
		open: boolean;
		title?: string;
		description?: string;
		cancelLabel?: string;
		confirmLabel?: string;
		onConfirm?: () => void;
	};

	let {
		open = $bindable(false),
		title = 'Sei in un ambiente demo',
		description = 'Questo è un prototipo di Svicom Living Hub: i dati non vengono persistiti e nessuna azione viene realmente eseguita sul server.',
		cancelLabel = 'Annulla',
		confirmLabel,
		onConfirm
	}: Props = $props();

	// If no onConfirm action is provided, show a single acknowledge button.
	const hasAction = $derived(typeof onConfirm === 'function');
	const resolvedConfirmLabel = $derived(confirmLabel ?? (hasAction ? 'Conferma' : 'Ho capito'));
</script>

<Dialog
	bind:open
	{title}
	{description}
	{cancelLabel}
	confirmLabel={resolvedConfirmLabel}
	{onConfirm}
	hideCancel={!hasAction}
/>
