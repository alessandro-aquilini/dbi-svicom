<script lang="ts">
    import type { TicketEvent } from '$lib/data/ticket/tickets';
    import TicketTimelineEvent from '$lib/components/shared/ticket/action-cards/TicketTimelineEvent.svelte';

    interface Props {
        event: TicketEvent;
    }

    let { event }: Props = $props();
</script>

<TicketTimelineEvent {event} />
