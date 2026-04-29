<!--
	StatusBadge — Displays a status label with semantic coloring.
	Usage: <StatusBadge label="Attivo" variant="success" />
-->
<script lang="ts">
	import type { StatusVariant } from '$lib/types';

	let { label, variant = 'default' }: { label: string; variant?: StatusVariant } = $props();

	const variantClasses: Record<StatusVariant, string> = {
		default: 'bg-secondary text-secondary-foreground',
		success: 'bg-success/15 text-success',
		warning: 'bg-warning/15 text-warning',
		destructive: 'bg-destructive/15 text-destructive',
		muted: 'bg-muted text-muted-foreground'
	};
</script>

<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium {variantClasses[variant]}">
	{label}
</span>
