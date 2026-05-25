<script lang="ts">
    import type { ReportEvent } from '$lib/data/ticket/reports';
    import ReportCreatedCard from './ReportCreatedCard.svelte';
    import ReportAcknowledgedCard from './ReportAcknowledgedCard.svelte';
    import ReportResolvedCard from './ReportResolvedCard.svelte';
    import ReportArchivedCard from './ReportArchivedCard.svelte';
    import ReportEscalatedCard from './ReportEscalatedCard.svelte';

    interface Props {
        event: ReportEvent;
    }

    let { event }: Props = $props();
</script>

{#if event.kind === 'reported'}
    <ReportCreatedCard {event} />
{:else if event.kind === 'acknowledged'}
    <ReportAcknowledgedCard {event} />
{:else if event.kind === 'resolved'}
    <ReportResolvedCard {event} />
{:else if event.kind === 'archived'}
    <ReportArchivedCard {event} />
{:else if event.kind === 'escalated'}
    <ReportEscalatedCard {event} />
{:else}
    <div class="flex justify-center my-4">
        <div class="rounded-3xl bg-slate-50 border border-slate-200 px-4 py-2 text-[11px] text-slate-500 uppercase font-bold tracking-wider">
            {event.kind}
        </div>
    </div>
{/if}
