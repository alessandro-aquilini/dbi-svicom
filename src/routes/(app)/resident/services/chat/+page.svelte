<script lang="ts">
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { getCurrentUser } from '$lib/auth';
    import { getUserById } from '$lib/data/users';
    import { 
        getBookingById, 
        isBookingActive, 
        getBookingInfo, 
        updateBookingStatusAction 
    } from '$lib/data/ticket/booking';
    import { services } from '$lib/data/services';
    import { getQuoteById } from '$lib/data/embeds/quotes';
    import { getInvoiceById } from '$lib/data/embeds/invoices';
    import { getPaymentById } from '$lib/data/embeds/payments';
    import ChatBubble from '$lib/components/shared/chat-cards/ChatBubble.svelte';
    import ChatQuoteCard from '$lib/components/shared/chat-cards/ChatQuoteCard.svelte';
    import ChatInvoiceCard from '$lib/components/shared/chat-cards/ChatInvoiceCard.svelte';
    import ChatPaymentCard from '$lib/components/shared/chat-cards/ChatPaymentCard.svelte';
    import BookingTimelineEvent from '$lib/components/shared/booking/actions-cards/BookingTimelineEvent.svelte';
    import PaymentModal from '$lib/components/shared/chat-buttons/PaymentModal.svelte';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { ArrowLeft01Icon, SentIcon, Message01Icon, InformationCircleIcon, Cancel01Icon } from '@hugeicons/core-free-icons';
    import { Button } from '$lib/components/ui/button';

    const currentUser = getCurrentUser();
    const residentId = currentUser?.id ?? '';
    const bookingId = $derived(page.url.searchParams.get('id'));
    const booking = $derived.by(() => (bookingId ? getBookingById(bookingId) : undefined));
    const service = $derived.by(() => (booking?.serviceId ? services.find((item) => item.id === booking.serviceId) : undefined));
    const supplier = $derived.by(() => (service?.supplierId ? getUserById(service.supplierId) : undefined));
    const chatTitle = $derived.by(() => service?.name ?? 'Chat servizio');
    const chatSubtitle = $derived.by(() => (supplier?.name ? `Fornitore · ${supplier.name}` : 'Prenotazione in corso'));

    const bookingInfo = $derived(booking ? getBookingInfo(booking) : null);
    let accordionOpen = $state(false);
    let showPaymentModal = $state(false);

    const timelineItems = $derived.by(() => {
        const items: any[] = [];
        if (!booking) return items;

        booking.messageTimeline?.forEach((message) => {
            items.push({ type: 'message', date: new Date(message.timestamp), data: message });
        });

        booking.timeline?.forEach((event) => {
            items.push({ type: 'event', date: new Date(event.at), data: event });
        });

        booking.quoteIds?.forEach((id) => {
            const quote = getQuoteById(id);
            if (quote && quote.createdAt) items.push({ type: 'quote', date: new Date(quote.createdAt), data: quote });
        });

        booking.invoiceIds?.forEach((id) => {
            const invoice = getInvoiceById(id);
            if (invoice && invoice.createdAt) items.push({ type: 'invoice', date: new Date(invoice.createdAt), data: invoice });
        });

        booking.paymentIds?.forEach((id) => {
            const payment = getPaymentById(id);
            const dateStr = payment ? payment.createdAt ?? payment.paidAt : undefined;
            if (payment && dateStr) items.push({ type: 'payment', date: new Date(dateStr), data: payment });
        });

        return items.sort((a, b) => a.date.getTime() - b.date.getTime());
    });

    const isOwnMessage = (senderId: string) => senderId === residentId;

    function goBack() {
        goto('/resident/services');
    }

    function formatSlot(slot?: { start: string; end: string }) {
        if (!slot) return 'Orario da definire';
        const starts = new Date(slot.start).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const ends = new Date(slot.end).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const day = new Date(slot.start).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
        return `${day} · ${starts} – ${ends}`;
    }

    function handleCancelBooking() {
        if (!bookingId) return;
        updateBookingStatusAction(bookingId, 'cancelled', residentId);
    }
</script>

{#if booking && bookingInfo}
    <PaymentModal 
        bind:open={showPaymentModal} 
        bookingId={booking.id} 
        fromId={residentId} 
        toId={supplier?.id ?? ''} 
        propertyId={bookingInfo.propertyId ?? ''} 
    />
{/if}

<svelte:head>
    <title>Chat servizio — Residente — Svicom Living Hub</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur-md">
        <div class="flex items-center gap-3 px-4 py-3">
            <button type="button" onclick={goBack} class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white text-slate-700 transition hover:bg-slate-100">
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
            </button>
            <div class="min-w-0">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Chat</p>
                <h1 class="text-base font-semibold text-slate-900 truncate">{chatTitle}</h1>
                <p class="text-[11px] text-slate-500 truncate">{chatSubtitle}</p>
            </div>
            <button 
                type="button" 
                onclick={() => accordionOpen = !accordionOpen}
                class="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl transition md:flex {accordionOpen ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}"
            >
                <HugeiconsIcon icon={InformationCircleIcon} size={18} />
            </button>
        </div>
        {#if booking && bookingInfo && isBookingActive(booking) && accordionOpen}
            <div class="border-t border-border px-4 py-4 bg-slate-50 animate-in slide-in-from-top duration-200">
                <div class="max-w-4xl mx-auto">
                    <div class="flex flex-wrap justify-between items-start gap-4 mb-4">
                        <div>
                            <h3 class="font-bold text-slate-900 text-sm">{bookingInfo.serviceName}</h3>
                            <p class="text-xs text-slate-500 mt-1">{bookingInfo.place} • {bookingInfo.description}</p>
                        </div>
                        <div class="flex flex-col items-end gap-1">
                            <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Stato attuale</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                                {bookingInfo.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    
                    <div class="grid gap-2 sm:grid-cols-2 mb-4">
                        <div class="rounded-xl bg-white border border-border px-3 py-2 text-xs text-slate-600 shadow-sm flex items-center gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                            {formatSlot(booking.slot)}
                        </div>
                        {#if bookingInfo.place}
                            <div class="rounded-xl bg-white border border-border px-3 py-2 text-xs text-slate-600 shadow-sm flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                                {bookingInfo.place}
                            </div>
                        {/if}
                    </div>

                    <div class="flex justify-end">
                        <Button size="sm" variant="outline" class="text-red-600 border-red-200 hover:bg-red-50 h-8 text-xs px-3" onclick={handleCancelBooking}>
                            <HugeiconsIcon icon={Cancel01Icon} size={14} class="mr-1.5" />
                            Annulla Prenotazione
                        </Button>
                    </div>
                </div>
            </div>
        {:else if booking}
            <div class="border-t border-border px-4 py-3 bg-slate-50">
                <div class="grid gap-2 sm:grid-cols-2">
                    <div class="rounded-3xl bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">{formatSlot(booking.slot)}</div>
                    {#if booking.timeline?.[0]?.place}
                        <div class="rounded-3xl bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">{booking.timeline[0].place}</div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>

    {#if booking}
        <main class="flex min-h-[calc(100vh-164px)] flex-col overflow-hidden">
            <section class="flex-1 overflow-y-auto px-4 pb-32 pt-4 space-y-4">
                {#if timelineItems.length > 0}
                    {#each timelineItems as item}
                        {#if item.type === 'message'}
                            <ChatBubble message={item.data} isOwn={isOwnMessage(item.data.senderId)} />
                        {:else if item.type === 'event'}
                            <BookingTimelineEvent event={item.data} currentUserId={residentId} />
                        {:else if item.type === 'quote'}
                            <ChatQuoteCard quote={item.data} isOwn={item.data.supplierId === service?.supplierId} />
                        {:else if item.type === 'invoice'}
                            <ChatInvoiceCard invoice={item.data} isOwn={item.data.supplierId === service?.supplierId} />
                        {:else if item.type === 'payment'}
                            <ChatPaymentCard payment={item.data} />
                        {/if}
                    {/each}
                {:else}
                    <div class="flex flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-white px-5 py-8 text-center shadow-sm">
                        <HugeiconsIcon icon={Message01Icon} size={28} class="text-primary" />
                        <p class="text-sm font-semibold text-slate-900">Ancora nessun messaggio</p>
                        <p class="text-sm text-slate-500">Invia il primo messaggio per avviare la conversazione con il fornitore.</p>
                    </div>
                {/if}
            </section>

            <footer class="sticky bottom-0 z-10 border-t border-border bg-white px-4 py-4">
                <div class="max-w-4xl mx-auto flex flex-col gap-3">
                    {#if isBookingActive(booking)}
                        <div class="flex gap-2 px-1 overflow-x-auto no-scrollbar pb-1">
                            <Button variant="outline" size="sm" class="rounded-full bg-white border-slate-200 text-xs h-8 shadow-sm" onclick={() => showPaymentModal = true}>
                                💳 Nuovo Pagamento
                            </Button>
                        </div>
                    {/if}
                    <div class="flex items-center gap-3 rounded-2xl border border-border bg-slate-50 px-3 py-2 shadow-sm">
                        <input
                            type="text"
                            placeholder="Scrivi un messaggio..."
                            class="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        />
                        <button type="button" class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white transition hover:opacity-90">
                            <HugeiconsIcon icon={SentIcon} size={18} />
                        </button>
                    </div>
                </div>
            </footer>
        </main>
    {:else}
        <div class="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 text-center">
            <div class="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                <HugeiconsIcon icon={Message01Icon} size={32} />
            </div>
            <h2 class="text-xl font-semibold text-slate-900">Nessuna conversazione selezionata</h2>
            <p class="mt-2 max-w-sm text-sm text-slate-500">Torna alla schermata dei servizi e seleziona una prenotazione per aprire la chat con il fornitore.</p>
        </div>
    {/if}
</div>
