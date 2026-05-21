<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { residentPaymentStatusLabels, type ResidentPaymentStatus } from './presentation';

	let { status }: { status: ResidentPaymentStatus } = $props();

	const badgeClassName = $derived(`payment-status-badge payment-status-badge--${status}`);
</script>

<Badge class={badgeClassName}>
	{residentPaymentStatusLabels[status]}
</Badge>
