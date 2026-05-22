<script lang="ts">
    import type { BookingEvent } from '$lib/data/ticket/booking';
    import BookingCreatedCard from './BookingCreatedCard.svelte';
    import BookingUpdatedCard from './BookingUpdatedCard.svelte';
    import BookingConfirmedCard from './BookingConfirmedCard.svelte';
    import BookingCancelledCard from './BookingCancelledCard.svelte';
    import BookingDeclinedCard from './BookingDeclinedCard.svelte';
    import BookingClosedCard from './BookingClosedCard.svelte';

    interface Props {
        event: BookingEvent;
        currentUserId?: string;
    }

    let { event, currentUserId = '' }: Props = $props();
</script>

{#if event.kind === 'booking_created'}
    <BookingCreatedCard event={event} isOwn={event.authorId === currentUserId} />
{:else if event.kind === 'booking_updated'}
    <BookingUpdatedCard event={event} isOwn={event.authorId === currentUserId} />
{:else if event.kind === 'confirmed'}
    <BookingConfirmedCard event={event} isOwn={event.authorId === currentUserId} />
{:else if event.kind === 'cancelled'}
    <BookingCancelledCard event={event} isOwn={event.authorId === currentUserId} />
{:else if event.kind === 'declined'}
    <BookingDeclinedCard event={event} isOwn={event.authorId === currentUserId} />
{:else if event.kind === 'closed'}
    <BookingClosedCard event={event} isOwn={event.authorId === currentUserId} />
{:else}
    <div class="flex justify-center">
        <div class="rounded-3xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600">
            Stato prenotazione: {event.kind}
        </div>
    </div>
{/if}
