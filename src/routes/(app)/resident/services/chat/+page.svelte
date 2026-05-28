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
    import { formatChatDateLabel, isSameChatDay } from '$lib/utils/dates';
    import ChatBubble from '$lib/components/shared/chat-cards/ChatBubble.svelte';
    import ChatQuoteCard from '$lib/components/shared/chat-cards/ChatQuoteCard.svelte';
    import ChatInvoiceCard from '$lib/components/shared/chat-cards/ChatInvoiceCard.svelte';
    import ChatPaymentCard from '$lib/components/shared/chat-cards/ChatPaymentCard.svelte';
    import BookingTimelineEvent from '$lib/components/shared/booking/actions-cards/BookingTimelineEvent.svelte';
    import BookingChatInfo from '$lib/components/shared/chat-cards/BookingChatInfo.svelte';
    import PaymentModal from '$lib/components/shared/chat-buttons/PaymentModal.svelte';
    import { HugeiconsIcon } from '@hugeicons/svelte';
    import { ArrowLeft01Icon, SentIcon, Message01Icon, InformationCircleIcon, Cancel01Icon, Add01Icon, Invoice01Icon } from '@hugeicons/core-free-icons';
    import { Button } from '$lib/components/ui/button';
    import { tick } from 'svelte';

    const currentUser = getCurrentUser();
    const residentId = currentUser?.id ?? '';
    const bookingId = $derived(page.url.searchParams.get('id') ?? '');
    const booking = $derived.by(() => (bookingId ? getBookingById(bookingId) : undefined));
    const service = $derived.by(() => (booking?.serviceId ? services.find((item) => item.id === booking.serviceId) : undefined));
    const supplier = $derived.by(() => (service?.supplierId ? getUserById(service.supplierId) : undefined));
    const chatTitle = $derived.by(() => service?.name ?? 'Chat servizio');
    const chatSubtitle = $derived.by(() => (supplier?.name ? `Fornitore · ${supplier.name}` : 'Prenotazione in corso'));

    const bookingInfo = $derived(booking ? getBookingInfo(booking) : null);
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
    let accordionOpen = $state(false);
    let showPaymentModal = $state(false);
    let showPlusMenu = $state(false);
    let newMessageValue = $state('');
    let scrollContainer = $state<HTMLElement | null>(null);

    async function scrollToBottom() {
        await tick();
        if (scrollContainer) {
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: 'smooth',
            });
        }
    }

    $effect(() => {
        scrollToBottom();
    });

    function sendMessage() {
        if (!newMessageValue.trim() || !booking) return;

        const msg = {
            id: `msg-${Date.now()}`,
            senderId: residentId,
            text: newMessageValue.trim(),
            timestamp: new Date().toISOString(),
        };

        if (!booking.messageTimeline) booking.messageTimeline = [];
        booking.messageTimeline.push(msg);

        newMessageValue = '';
        showPlusMenu = false;
        scrollToBottom();
    }

    const isOwnMessage = (senderId: string) => senderId === residentId;

    function goBack() {
        goto('/resident/services');
    }

    function getChatDayLabel(date: Date) {
        return formatChatDateLabel(date);
    }

    function shouldRenderDateSeparator(current: Date, previous?: Date) {
        return !previous || !isSameChatDay(current, previous);
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
        </div>
    </div>

    {#if booking}
        <main class="flex h-[calc(100vh-64px)] flex-col bg-white overflow-hidden">
            <div 
                bind:this={scrollContainer}
                class="flex-1 overflow-y-auto p-4 md:p-6 bg-white"
            >
                <div class="w-full h-full flex flex-col space-y-4">
                {#if timelineItems.length > 0}
                    {#each timelineItems as item, index}
                        {#if shouldRenderDateSeparator(item.date, index > 0 ? timelineItems[index - 1].date : undefined)}
                            <div class="flex justify-center my-6 sticky top-2 z-10">
                                <div class="bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-slate-200/50 px-4 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                    {getChatDayLabel(item.date)}
                                </div>
                            </div>
                        {/if}

                        {#if item.type === 'message'}
                            <ChatBubble message={item.data} isOwn={isOwnMessage(item.data.senderId)} />
                        {:else if item.type === 'event'}
                            <div class="flex justify-center w-full my-2">
                                <BookingTimelineEvent
                                    event={item.data}
                                    currentUserId={residentId}
                                    serviceName={bookingInfo?.serviceName}
                                    servicePlace={bookingInfo?.place}
                                />
                            </div>
                        {:else if item.type === 'quote'}
                            <ChatQuoteCard quote={item.data} isOwn={false} />
                        {:else if item.type === 'invoice'}
                            <ChatInvoiceCard invoice={item.data} isOwn={false} />
                        {:else if item.type === 'payment'}
                            <ChatPaymentCard payment={item.data} isOwn={item.data.fromId === residentId} />
                        {/if}
                    {/each}
                {:else}
                    <div class="flex flex-col items-center justify-center text-center p-8 h-full">
                        <div class="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-300 mb-4">
                            <HugeiconsIcon icon={Message01Icon} size={32} />
                        </div>
                        <h3 class="text-lg font-bold text-slate-900">Ancora nessun messaggio</h3>
                        <p class="text-sm text-slate-500 max-w-xs mt-1">Invia il primo messaggio per avviare la conversazione con il fornitore.</p>
                    </div>
                {/if}
                </div>
            </div>

            <footer class="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-20">
                <div class="w-full flex flex-col gap-3 relative">
                    <!-- Active Booking Info Popup -->
                    {#if booking && accordionOpen}
                        <div class="absolute bottom-full left-0 mb-4 w-full md:max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-4 animate-in slide-in-from-bottom-2 duration-200">
                            <BookingChatInfo
                                bookingInfo={bookingInfo}
                                serviceName={bookingInfo?.serviceName ?? ''}
                                place={bookingInfo?.place ?? ''}
                                onCancel={isBookingActive(booking) ? () => { handleCancelBooking(); accordionOpen = false; } : undefined}
                            />
                        </div>
                    {/if}

                    <!-- Plus Menu Popup -->
                    {#if showPlusMenu}
                        <div 
                            class="absolute bottom-full left-0 mb-4 w-56 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-2 flex flex-col gap-1 animate-in slide-in-from-bottom-2 duration-200"
                        >
                            <button 
                                onclick={() => { showPaymentModal = true; showPlusMenu = false; }}
                                class="flex items-center gap-3 w-full p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left"
                            >
                                <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <HugeiconsIcon icon={Invoice01Icon} size={18} />
                                </div>
                                <div>
                                    <p class="text-[13px] font-bold text-slate-900">Nuovo pagamento</p>
                                    <p class="text-[10px] text-slate-500">Invia una richiesta di incasso</p>
                                </div>
                            </button>
                        </div>
                    {/if}

                    <div class="flex gap-2 items-center">
                        <div class="flex items-center">
                            <button 
                                onclick={() => { showPlusMenu = !showPlusMenu; accordionOpen = false; }}
                                class="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all shrink-0 {showPlusMenu ? 'rotate-45' : ''}"
                                type="button"
                            >
                                <HugeiconsIcon icon={Add01Icon} size={24} />
                            </button>

                            {#if booking}
                                <button 
                                    onclick={() => { accordionOpen = !accordionOpen; showPlusMenu = false; }}
                                    class="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all shrink-0 {accordionOpen ? 'rotate-180 text-[#5D7D94]' : ''}"
                                    type="button"
                                >
                                    <HugeiconsIcon icon={InformationCircleIcon} size={22} />
                                </button>
                            {/if}
                        </div>
                        
                        <form
                            onsubmit={(e) => { e.preventDefault(); sendMessage(); }}
                            class="flex items-center gap-2 w-full"
                        >
                            <div class="bg-white flex items-center gap-2 border border-slate-200 shadow-sm rounded-2xl p-1.5 flex-1 ring-1 ring-black/5">
                                <input
                                    type="text"
                                    placeholder="Scrivi un messaggio..."
                                    bind:value={newMessageValue}
                                    onfocus={() => { showPlusMenu = false; accordionOpen = false; }}
                                    class="flex-1 bg-transparent border-none px-3 py-1.5 text-sm focus:ring-0 text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                            <button
                                type="submit"
                                class="bg-[#5D7D94] text-white w-10 h-10 rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center shrink-0 shadow-sm"
                            >
                                <HugeiconsIcon icon={SentIcon} size={18} />
                            </button>
                        </form>
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
