<script lang="ts">
	import {
		bookings,
		inferBookingStatus,
		getBookingById,
		lastBookingEvent,
		addBookingEvent,
	} from "$lib/data/ticket/booking";
	import {
		tickets,
		getCurrentSupplier,
		getCurrentStatus,
		getSupplierRelevantTimeline,
		getTicketById,
		addTicketEvent,
	} from "$lib/data/ticket/tickets";
	import { services } from "$lib/data/services";
	import { residents } from "$lib/data/residents";
	import { users } from "$lib/data/users";
	import { getQuoteById } from "$lib/data/embeds/quotes";
	import { getInvoiceById } from "$lib/data/embeds/invoices";
	import { getPaymentById } from "$lib/data/embeds/payments";
	import { getSupplierTaskById } from "$lib/data/embeds/supplierTasks";
	import { getCurrentUser } from "$lib/auth";
	import { HugeiconsIcon } from "@hugeicons/svelte";
	import {
		ArrowLeft01Icon,
		InformationCircleIcon,
		Search01Icon,
		Message01Icon,
		UserCircleIcon,
		CustomerServiceIcon,
		SentIcon,
		ArrowDown01Icon,
		Invoice01Icon,
		File01Icon,
		WrenchIcon,
		Add01Icon,
	} from "@hugeicons/core-free-icons";
	import { formatChatDateLabel, formatChatTime, formatChatTooltip, isSameChatDay } from "$lib/utils/dates";
	import { format } from "date-fns";
	import { it } from "date-fns/locale";
	import ChatBubble from "$lib/components/shared/chat-cards/ChatBubble.svelte";
	import ChatQuoteCard from "$lib/components/shared/chat-cards/ChatQuoteCard.svelte";
	import ChatInvoiceCard from "$lib/components/shared/chat-cards/ChatInvoiceCard.svelte";
	import ChatPaymentCard from "$lib/components/shared/chat-cards/ChatPaymentCard.svelte";
	import ChatInterventionCard from "$lib/components/shared/chat-cards/ChatInterventionCard.svelte";
	import ChatTimelineEvent from "$lib/components/shared/chat-cards/ChatTimelineEvent.svelte";
	import BookingTimelineEvent from "$lib/components/shared/booking/actions-cards/BookingTimelineEvent.svelte";
	import {
		isBookingActive,
		getBookingInfo,
		updateBookingStatusAction,
		type BookingStatus,
	} from "$lib/data/ticket/booking";
	import InvoiceModal from "$lib/components/shared/chat-buttons/InvoiceModal.svelte";
	import QuoteModal from "$lib/components/shared/chat-buttons/QuoteModal.svelte";
	import TaskModal from "$lib/components/shared/chat-buttons/TaskModal.svelte";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import { tick } from "svelte";

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? "frn-idroclima-nord";

	// Grouped Chats: either with administration (tickets) or with residents (bookings)
	type ChatType = "admin" | "resident";
	let activeTab = $state<ChatType>("resident");
	const selectedId = $derived(page.url.searchParams.get("id"));

	let showInvoiceModal = $state(false);
	let showQuoteModal = $state(false);
	let showTaskModal = $state(false);
	let accordionOpen = $state(false);
	let showPlusMenu = $state(false);
	let refreshTrigger = $state(0);
	let isProcessingStatus = $state(false);
	let newMessageValue = $state("");
	let scrollContainer = $state<HTMLElement | null>(null);

	function getLastSupplierResponse(ticket: any) {
		return [...ticket.eventTimeline]
			.reverse()
			.find((event: any) => event.kind === 'accepted' || event.kind === 'declined');
	}

	function canSupplierAccept(ticket: any) {
		return getCurrentStatus(ticket) === 'in_progress';
	}

	function canSupplierReportCompletion(ticket: any) {
		const lastResponse = getLastSupplierResponse(ticket);
		return (
			getCurrentStatus(ticket) === 'estimating' &&
			lastResponse?.kind === 'accepted'
		);
	}

	function handleSupplierTicketAction(kind: 'accepted' | 'declined' | 'reportCompletion') {
		if (!activeTicket || isProcessingStatus) return;
		isProcessingStatus = true;
		addTicketEvent(activeTicket.id, kind, supplierId);
		refreshTrigger++;
		setTimeout(() => {
			isProcessingStatus = false;
		}, 100);
	}

	async function scrollToBottom() {
		await tick();
		if (scrollContainer) {
			scrollContainer.scrollTo({
				top: scrollContainer.scrollHeight,
				behavior: "smooth",
			});
		}
	}

	$effect(() => {
		if (selectedId) {
			scrollToBottom();
		}
	});

	$effect(() => {
		if (timelineItems.length > 0) {
			scrollToBottom();
		}
	});

	function sendMessage() {
		if (!newMessageValue.trim() || !activeChat) return;

		const chat = activeChat as any;
		const msg = {
			id: `msg-${Date.now()}`,
			senderId: supplierId,
			text: newMessageValue.trim(),
			timestamp: new Date().toISOString(),
		};

		if (activeTab === "resident") {
			// Find the active booking to attach the message to
			if (activeBooking) {
				if (!activeBooking.messageTimeline) {
					activeBooking.messageTimeline = [];
				}
				activeBooking.messageTimeline.push(msg);
			}
		} else {
			// Find the active ticket to attach the message to
			if (activeTicket) {
				if (!activeTicket.messageTimeline) {
					activeTicket.messageTimeline = [];
				}
				activeTicket.messageTimeline.push(msg);
			}
		}

		newMessageValue = "";
		refreshTrigger++;
		scrollToBottom();
	}

	// Resident Chats: group bookings by residentId
	const residentChats = $derived.by(() => {
		refreshTrigger;
		const groups = new Map<
			string,
			{ userId: string; lastDate: Date; bookings: any[] }
		>();

		bookings.forEach((b) => {
			const service = services.find((s) => s.id === b.serviceId);
			if (service?.supplierId !== supplierId) return;

			if (!groups.has(b.residentId)) {
				groups.set(b.residentId, {
					userId: b.residentId,
					lastDate: new Date(0),
					bookings: [],
				});
			}
			const g = groups.get(b.residentId)!;
			g.bookings.push(b);

			const lastEv = lastBookingEvent(b);
			const updatedAt = new Date(lastEv?.at || 0);
			if (updatedAt > g.lastDate) g.lastDate = updatedAt;
		});

		return Array.from(groups.values()).sort(
			(a, b) => b.lastDate.getTime() - a.lastDate.getTime(),
		);
	});

	// Admin Chats: group tickets by adminId (usually only one admin per property, but we group by adminId for consistency)
	const adminChats = $derived.by(() => {
		refreshTrigger;
		const groups = new Map<
			string,
			{ adminId: string; lastDate: Date; tickets: any[] }
		>();

		tickets
			.filter((t) => getCurrentSupplier(t) === supplierId)
			.forEach((t) => {
				const aid = t.creatorId || "adm-giorgio-01"; // Fallback
				if (!groups.has(aid)) {
					groups.set(aid, {
						adminId: aid,
						lastDate: new Date(0),
						tickets: [],
					});
				}
				const g = groups.get(aid)!;
				g.tickets.push(t);

				const rel = getSupplierRelevantTimeline(t, supplierId);
				const msgs = (t.messageTimeline ?? []).filter(
					(m) => m.senderId === supplierId || m.senderId === aid,
				);
				let lastActivity = new Date(0);
				if (msgs.length)
					lastActivity = new Date(msgs[msgs.length - 1].timestamp);
				else if (rel.length)
					lastActivity = new Date(rel[rel.length - 1].at);

				if (lastActivity > g.lastDate) g.lastDate = lastActivity;
			});

		return Array.from(groups.values()).sort(
			(a, b) => b.lastDate.getTime() - a.lastDate.getTime(),
		);
	});

	function selectChat(id: string, type: ChatType) {
		activeTab = type;
		goto(`?id=${id}`, { replaceState: true });
	}

	const activeChat = $derived.by(() => {
		if (!selectedId) return null;
		if (activeTab === "resident")
			return residentChats.find((c) => c.userId === selectedId);
		return adminChats.find((c) => c.adminId === selectedId);
	});

	const counterparty = $derived(
		activeChat
			? activeTab === "resident"
				? getResidentInfo((activeChat as any).userId)
				: getResidentInfo((activeChat as any).adminId)
			: null,
	);

	const activeBooking = $derived(
		activeTab === "resident" && activeChat
			? (activeChat as any).bookings[
					(activeChat as any).bookings.length - 1
				]
			: null,
	);

	const activeTicket = $derived(
		activeTab === "admin" && activeChat
			? (activeChat as any).tickets[
					(activeChat as any).tickets.length - 1
				]
			: null,
	);

	const bookingInfo = $derived.by(() => {
		refreshTrigger; // Force dependency
		return activeBooking ? getBookingInfo(activeBooking) : null;
	});

	const timelineItems = $derived.by(() => {
		refreshTrigger;
		const items: any[] = [];
		if (!activeChat) return [];

		if (activeTab === "resident") {
			const chat = activeChat as any;
			chat.bookings.forEach((b: any) => {
				if (b.messageTimeline) {
					b.messageTimeline.forEach((msg: any) => {
						items.push({
							type: "message",
							date: new Date(msg.timestamp),
							data: msg,
						});
					});
				}
				if (b.timeline) {
					b.timeline.forEach((event: any) => {
						items.push({
							type: "event",
							date: new Date(event.at),
							data: event,
						});
					});
				}
				// Embeds
				if (b.quoteIds)
					b.quoteIds.forEach((id: string) => {
						const quote = getQuoteById(id);
						if (quote && quote.createdAt)
							items.push({
								type: "quote",
								date: new Date(quote.createdAt),
								data: quote,
							});
					});
				if (b.invoiceIds)
					b.invoiceIds.forEach((id: string) => {
						const invoice = getInvoiceById(id);
						if (invoice && invoice.createdAt)
							items.push({
								type: "invoice",
								date: new Date(invoice.createdAt),
								data: invoice,
							});
					});
				if (b.paymentIds)
					b.paymentIds.forEach((id: string) => {
						const payment = getPaymentById(id);
						const dateStr = payment
							? (payment.createdAt ?? payment.paidAt)
							: undefined;
						if (payment && dateStr)
							items.push({
								type: "payment",
								date: new Date(dateStr),
								data: payment,
							});
					});
				if (b.interventionIds)
					b.interventionIds.forEach((id: string) => {
						const task = getSupplierTaskById(id);
						if (task && task.createdAt)
							items.push({
								type: "intervention",
								date: new Date(task.createdAt),
								data: task,
							});
					});
			});
		} else {
			const chat = activeChat as any;
			const aid = chat.adminId;
			chat.tickets.forEach((t: any) => {
				if (t.messageTimeline) {
					t.messageTimeline
						.filter(
							(m: any) =>
								m.senderId === supplierId || m.senderId === aid,
						)
						.forEach((msg: any) => {
							items.push({
								type: "message",
								date: new Date(msg.timestamp),
								data: msg,
							});
						});
				}
				const rel = getSupplierRelevantTimeline(t, supplierId);
				rel.forEach((event: any) => {
					items.push({
						type: "event",
						date: new Date(event.at),
						data: event,
					});
				});
				// Embeds
				if (t.quoteIds)
					t.quoteIds.forEach((id: string) => {
						const quote = getQuoteById(id);
						if (quote && quote.createdAt)
							items.push({
								type: "quote",
								date: new Date(quote.createdAt),
								data: quote,
							});
					});
				if (t.invoiceIds)
					t.invoiceIds.forEach((id: string) => {
						const invoice = getInvoiceById(id);
						if (invoice && invoice.createdAt)
							items.push({
								type: "invoice",
								date: new Date(invoice.createdAt),
								data: invoice,
							});
					});
				if (t.paymentIds)
					t.paymentIds.forEach((id: string) => {
						const payment = getPaymentById(id);
						const dateStr = payment
							? (payment.createdAt ?? payment.paidAt)
							: undefined;
						if (payment && dateStr)
							items.push({
								type: "payment",
								date: new Date(dateStr),
								data: payment,
							});
					});
				if (t.interventionIds)
					t.interventionIds.forEach((id: string) => {
						const task = getSupplierTaskById(id);
						if (task && task.createdAt)
							items.push({
								type: "intervention",
								date: new Date(task.createdAt),
								data: task,
							});
					});
			});
		}

		return items.sort((a, b) => a.date.getTime() - b.date.getTime());
	});

	function getResidentInfo(userId: string) {
		return users.find((u) => u.id === userId);
	}

	function getChatDayLabel(date: Date) {
		return formatChatDateLabel(date);
	}

	function shouldRenderDateSeparator(current: Date, previous?: Date) {
		return !previous || !isSameChatDay(current, previous);
	}

	const statusColors: Record<string, string> = {
		requested: "bg-amber-100 text-amber-700",
		confirmed: "bg-emerald-100 text-emerald-700",
		cancelled: "bg-red-100 text-red-700",
		closed: "bg-slate-100 text-slate-500",
		declined: "bg-red-100 text-red-700",
		unknown: "bg-slate-100 text-slate-400",
		opened: "bg-amber-100 text-amber-700",
		estimating: "bg-blue-100 text-blue-700",
		approved: "bg-emerald-100 text-emerald-700",
		in_progress: "bg-indigo-100 text-indigo-700",
		completed: "bg-emerald-100 text-emerald-700",
		paid: "bg-slate-100 text-slate-700",
	};

	function handleUpdateStatus(kind: any) {
		if (!activeBooking || isProcessingStatus) return;
		
		const currentStatus = bookingInfo?.status;
		
		// Map kinds to end-state statuses to check if already reached
		const statusMap: Record<string, string> = {
			'confirmed': 'confirmed',
			'declined': 'declined',
			'cancelled': 'cancelled',
			'closed': 'closed'
		};

		if (currentStatus === statusMap[kind]) return;
		
		// Logic to prevent invalid state transitions or repetitions
		if (currentStatus === 'closed' || currentStatus === 'cancelled' || currentStatus === 'declined') {
			return; // Final states
		}

		isProcessingStatus = true;
		updateBookingStatusAction(activeBooking.id, kind, supplierId);
		
		// Trigger immediate UI refresh
		refreshTrigger++;

		// Reset processing flag so buttons unlock
		setTimeout(() => {
			isProcessingStatus = false;
		}, 100);
	}

	function handleCreated() {
		refreshTrigger++;
	}
</script>

<InvoiceModal
	bind:open={showInvoiceModal}
	bookingId={activeBooking?.id}
	ticketId={activeTicket?.id}
	{supplierId}
	customerId={activeBooking?.residentId ?? activeTicket?.creatorId ?? ""}
	propertyId={bookingInfo?.propertyId ?? activeTicket?.propertyId ?? ""}
	onCreated={handleCreated}
/>
<QuoteModal
	bind:open={showQuoteModal}
	bookingId={activeBooking?.id}
	ticketId={activeTicket?.id}
	{supplierId}
	customerId={activeBooking?.residentId ?? activeTicket?.creatorId ?? ""}
	propertyId={bookingInfo?.propertyId ?? activeTicket?.propertyId ?? ""}
	onCreated={handleCreated}
/>
<TaskModal
	bind:open={showTaskModal}
	bookingId={activeBooking?.id}
	ticketId={activeTicket?.id}
	{supplierId}
	customerId={activeBooking?.residentId ?? activeTicket?.creatorId ?? ""}
	propertyId={bookingInfo?.propertyId ?? activeTicket?.propertyId ?? ""}
	onCreated={handleCreated}
/>

<div class="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
	<!-- Sidebar: Chat List -->
	<aside
		class="w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-slate-50/30 {selectedId
			? 'hidden md:flex'
			: 'flex'}"
	>
		<div class="p-4 bg-white border-b border-border">
			<h1 class="text-xl font-bold text-slate-900 mb-4">Messaggi</h1>

			<div class="flex p-1 bg-slate-200/50 rounded-xl mb-4">
				<button
					onclick={() => {
						activeTab = "resident";
						if (selectedId) goto("?", { replaceState: true });
					}}
					class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all {activeTab ===
					'resident'
						? 'bg-white shadow-sm text-slate-900'
						: 'text-slate-500 hover:text-slate-700'}"
				>
					Residenti
				</button>
				<button
					onclick={() => {
						activeTab = "admin";
						if (selectedId) goto("?", { replaceState: true });
					}}
					class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all {activeTab ===
					'admin'
						? 'bg-white shadow-sm text-slate-900'
						: 'text-slate-500 hover:text-slate-700'}"
				>
					Amministrazione
				</button>
			</div>

			<div class="relative">
				<HugeiconsIcon
					icon={Search01Icon}
					size={16}
					class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
				/>
				<input
					type="text"
					placeholder="Cerca conversazioni..."
					class="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs focus:ring-2 focus:ring-slate-200 transition-all text-slate-900 placeholder:text-slate-400/80"
				/>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto bg-white">
			{#if activeTab === "resident"}
				{#each residentChats as group}
					{@const resident = getResidentInfo(group.userId)}
					{@const lastBkg = group.bookings[group.bookings.length - 1]}
					{@const lastMsg =
						lastBkg?.messageTimeline?.[
							lastBkg.messageTimeline.length - 1
						]}
					<button
						onclick={() => selectChat(group.userId, "resident")}
						class="w-full px-4 py-3.5 flex gap-3.5 hover:bg-slate-50 border-b border-slate-50 transition-colors text-left {selectedId ===
						group.userId
							? 'bg-slate-100/80'
							: ''}"
					>
						<div
							class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 ring-1 ring-slate-200/20"
						>
							<HugeiconsIcon icon={UserCircleIcon} size={28} />
						</div>
						<div class="flex-1 min-w-0 py-0.5">
							<div class="flex justify-between items-baseline mb-0.5">
								<span class="font-bold text-[14px] text-slate-900 truncate"
									>{resident?.name || "Residente"}</span
								>
								{#if group.lastDate.getTime() > 0}
									<span class="text-[10px] font-medium text-slate-400" title={formatChatTooltip(group.lastDate)}>
										{formatChatTime(group.lastDate)}
									</span>
								{/if}
							</div>
							<p class="text-[12px] text-slate-500 line-clamp-1 leading-snug">
								{lastMsg?.text || "Inizia la conversazione..."}
							</p>
						</div>
					</button>
				{/each}
			{:else}
				{#each adminChats as group}
					{@const admin = getResidentInfo(group.adminId)}
					{@const lastTkt = group.tickets[group.tickets.length - 1]}
					{@const lastMsg =
						lastTkt?.messageTimeline?.[
							lastTkt.messageTimeline.length - 1
						]}
					<button
						onclick={() => selectChat(group.adminId, "admin")}
						class="w-full px-4 py-3.5 flex gap-3.5 hover:bg-slate-50 border-b border-slate-50 transition-colors text-left {selectedId ===
						group.adminId
							? 'bg-slate-100/80'
							: ''}"
					>
						<div
							class="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 ring-1 ring-amber-100/20"
						>
							<HugeiconsIcon
								icon={CustomerServiceIcon}
								size={28}
							/>
						</div>
						<div class="flex-1 min-w-0 py-0.5">
							<div
								class="flex justify-between items-baseline mb-0.5"
							>
								<span
									class="font-bold text-[14px] text-slate-900 truncate"
									>{admin?.name || "Amministrazione"}</span
								>
								{#if group.lastDate.getTime() > 0}
									<span class="text-[10px] font-medium text-slate-400" title={formatChatTooltip(group.lastDate)}>
										{formatChatTime(group.lastDate)}
									</span>
								{/if}
							</div>
							<p class="text-[12px] text-slate-500 line-clamp-1 leading-snug">
								{lastMsg?.text || "Vedi cronologia..."}
							</p>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	</aside>

	<!-- Main: Chat Conversation -->
	<main
		class="flex-1 flex flex-col bg-white {selectedId
			? 'flex'
			: 'hidden md:flex'}"
	>
		{#if activeChat && counterparty}
			<header
				class="h-16 shrink-0 bg-white border-b border-slate-100 px-4 flex items-center gap-3 relative z-10"
			>
				<button
					onclick={() => goto("?", { replaceState: true })}
					class="p-2 -ml-2 rounded-full hover:bg-slate-200/50 md:hidden transition-colors"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
				</button>

				<div
					class="w-10 h-10 rounded-full {activeTab === 'resident'
						? 'bg-white text-slate-400'
						: 'bg-amber-50 text-amber-600'} flex items-center justify-center ring-1 ring-black/5 shrink-0 ml-1"
				>
					<HugeiconsIcon
						icon={activeTab === "resident"
							? UserCircleIcon
							: CustomerServiceIcon}
						size={24}
					/>
				</div>

				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<h2 class="font-bold text-slate-900 text-[15px] truncate leading-tight">
							{counterparty.name}
						</h2>
					</div>
					<p class="text-[11px] text-slate-500 font-medium truncate uppercase tracking-wider">
						{activeTab === "resident"
							? "Residente"
							: "Amministratore"}
					</p>
				</div>
			</header>

			<div 
				bind:this={scrollContainer}
				class="flex-1 overflow-y-auto p-4 md:p-6 bg-white"
			>
				<div class="w-full h-full flex flex-col space-y-4">
					{#each timelineItems as item, index}
						{#if shouldRenderDateSeparator(item.date, index > 0 ? timelineItems[index - 1].date : undefined)}
							<div class="flex justify-center my-6 sticky top-2 z-10">
								<div class="bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-slate-200/50 px-4 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 uppercase tracking-widest">
									{getChatDayLabel(item.date)}
								</div>
							</div>
						{/if}
						
						{#if item.type === "message"}
							<ChatBubble
								message={item.data}
								isOwn={item.data.senderId === supplierId}
							/>
						{:else if item.type === "event"}
							<div class="flex justify-center w-full my-2">
								{#if ["booking_created", "confirmed", "declined", "booking_updated", "cancelled", "closed"].includes(item.data.kind)}
									<BookingTimelineEvent
										event={item.data}
										currentUserId={supplierId}
										serviceName={bookingInfo?.serviceName}
										servicePlace={bookingInfo?.place}
									/>
								{:else}
									<ChatTimelineEvent event={item.data} />
								{/if}
							</div>
						{:else if item.type === "quote"}
							<ChatQuoteCard
								quote={item.data}
								isOwn={item.data.supplierId === supplierId}
							/>
						{:else if item.type === "invoice"}
							<ChatInvoiceCard
								invoice={item.data}
								isOwn={item.data.supplierId === supplierId}
							/>
						{:else if item.type === "payment"}
							<ChatPaymentCard payment={item.data} isOwn={item.data.fromId === supplierId} />
						{:else if item.type === "intervention"}
							<ChatInterventionCard task={item.data} isOwn={item.data.supplierId === supplierId} />
						{/if}
					{/each}
				</div>
			</div>

			<footer class="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-20">
				<div class="w-full flex flex-col gap-3 relative">
					<!-- Active Booking Info Popup -->
					{#if accordionOpen}
						<div class="absolute bottom-full left-0 mb-4 w-full md:max-w-md bg-white rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] ring-1 ring-black/5 p-6 animate-in slide-in-from-bottom-2 duration-200">
							{#if activeTab === 'resident' && activeBooking && isBookingActive(activeBooking)}
								<div class="space-y-5">
									<div class="flex items-start justify-between">
										<div class="space-y-1">
											<p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#5D7D94]">Servizio Prenotato</p>
											<h3 class="text-lg font-bold text-slate-900 leading-tight">
												{bookingInfo?.serviceName}
											</h3>
										</div>
										<div class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider ring-1 ring-emerald-100">
											{bookingInfo?.status}
										</div>
									</div>

									<div class="space-y-4">
										{#if bookingInfo?.notes}
											<div class="space-y-1.5">
												<p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Note Residente</p>
												<p class="text-[14px] text-slate-600 leading-relaxed font-medium italic px-1">
													"{bookingInfo.notes}"
												</p>
											</div>
										{/if}

										<div class="flex gap-4 pt-1 border-t border-slate-50 mt-2">
											<div class="flex-1">
												<p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 px-1">Ubicazione</p>
												<p class="text-[13px] font-semibold text-slate-800 px-1 truncate">{bookingInfo?.place || 'Complesso Condominiale'}</p>
											</div>
										</div>
									</div>

									<div class="pt-4 flex items-center gap-2">
										{#if bookingInfo?.status === "requested"}
											<Button
												size="sm"
												variant="default"
												disabled={isProcessingStatus}
												class="flex-1 h-11 text-[11px] font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200"
												onclick={() => { handleUpdateStatus("confirmed"); accordionOpen = false; }}
											>
												Approva
											</Button>
											<Button
												size="sm"
												variant="ghost"
												disabled={isProcessingStatus}
												class="flex-1 h-11 text-[11px] font-bold uppercase tracking-widest text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-2xl"
												onclick={() => { handleUpdateStatus("declined"); accordionOpen = false; }}
											>
												Rifiuta
											</Button>
										{:else if ["confirmed", "booking_updated"].includes(bookingInfo?.status ?? "")}
											<Button
												size="sm"
												variant="default"
												class="w-full h-11 text-[11px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-50"
												onclick={() => { handleUpdateStatus("closed"); accordionOpen = false; }}
											>
												Concludi Intervento
											</Button>
										{/if}
									</div>
								</div>
							{:else if activeTab === 'admin' && activeTicket}
								<div class="space-y-5">
									<div class="flex items-start justify-between">
										<div class="space-y-1">
											<p class="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Ticket Amministrativo</p>
											<h3 class="text-lg font-bold text-slate-900 leading-tight">{activeTicket.title}</h3>
										</div>
										<div class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider ring-1 ring-amber-100">
											{getCurrentStatus(activeTicket).replace('_', ' ')}
										</div>
									</div>

									<div class="space-y-4">
										<div class="space-y-1.5">
											<p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Descrizione</p>
											<p class="text-[14px] text-slate-600 leading-relaxed font-medium px-1">
												{activeTicket.description || 'Nessuna descrizione fornita.'}
											</p>
										</div>

										{#if activeTicket.location || activeTicket.category}
											<div class="flex gap-4 pt-1 border-t border-slate-50 mt-2">
												{#if activeTicket.category}
													<div class="flex-1">
														<p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 px-1">Categoria</p>
														<p class="text-[13px] font-semibold text-slate-800 px-1">{activeTicket.category}</p>
													</div>
												{/if}
												{#if activeTicket.location}
													<div class="flex-1">
														<p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 px-1">Posizione</p>
														<p class="text-[13px] font-semibold text-slate-800 px-1">{activeTicket.location}</p>
													</div>
												{/if}
											</div>
										{/if}
									</div>

									<div class="pt-4 grid gap-2">
										{#if canSupplierAccept(activeTicket)}
											<div class="flex gap-2">
												<Button size="sm" variant="default" class="flex-1 h-11 text-[11px] font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200" onclick={() => { handleSupplierTicketAction('accepted'); accordionOpen = false; }}>
													Accetta
												</Button>
												<Button size="sm" variant="ghost" class="flex-1 h-11 text-[11px] font-bold uppercase tracking-widest text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-2xl" onclick={() => { handleSupplierTicketAction('declined'); accordionOpen = false; }}>
													Rifiuta
												</Button>
											</div>
										{:else if canSupplierReportCompletion(activeTicket)}
											<Button size="sm" variant="default" class="h-11 text-[11px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-50" onclick={() => { handleSupplierTicketAction('reportCompletion'); accordionOpen = false; }}>
												Segnala completamento
											</Button>
										{/if}
									</div>
								</div>
							{/if}
						</div>
					{/if}

					<!-- Plus Menu Popup -->
					{#if showPlusMenu}
						<div 
							class="absolute bottom-full left-0 mb-4 w-56 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-2 flex flex-col gap-1 animate-in slide-in-from-bottom-2 duration-200"
						>
							<button 
								onclick={() => { showInvoiceModal = true; showPlusMenu = false; }}
								class="flex items-center gap-3 w-full p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left"
							>
								<div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
									<HugeiconsIcon icon={Invoice01Icon} size={18} />
								</div>
								<div>
									<p class="text-[13px] font-bold text-slate-900">Nuova Fattura</p>
								</div>
							</button>
							<button 
								onclick={() => { showQuoteModal = true; showPlusMenu = false; }}
								class="flex items-center gap-3 w-full p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left"
							>
								<div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
									<HugeiconsIcon icon={File01Icon} size={18} />
								</div>
								<div>
									<p class="text-[13px] font-bold text-slate-900">Nuovo Preventivo</p>
								</div>
							</button>
							<button 
								onclick={() => { showTaskModal = true; showPlusMenu = false; }}
								class="flex items-center gap-3 w-full p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left"
							>
								<div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
									<HugeiconsIcon icon={WrenchIcon} size={18} />
								</div>
								<div>
									<p class="text-[13px] font-bold text-slate-900">Nuovo Intervento</p>
								</div>
							</button>
						</div>
					{/if}

					<div class="flex items-center gap-1 w-full">
						<div class="flex items-center shrink-0">
							<button 
								onclick={() => { showPlusMenu = !showPlusMenu; accordionOpen = false; }}
								class="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 {showPlusMenu ? 'bg-[#5D7D94]/10 text-[#5D7D94]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}"
							>
								<HugeiconsIcon icon={Add01Icon} size={24} />
							</button>

							{#if (activeTab === "resident" && activeBooking && isBookingActive(activeBooking)) || (activeTab === "admin" && activeTicket && getCurrentStatus(activeTicket) !== "closed")}
								<button
									onclick={() => {
										accordionOpen = !accordionOpen;
										showPlusMenu = false;
									}}
									class="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 {accordionOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'} {accordionOpen ? 'rotate-180' : ''}"
								>
									<HugeiconsIcon icon={InformationCircleIcon} size={22} />
								</button>
							{/if}
						</div>
						
						<form
							onsubmit={(e) => { e.preventDefault(); sendMessage(); }}
							class="flex items-center gap-2 flex-1 ml-1"
						>
							<div
								class="bg-white flex items-center gap-2 border border-slate-200 shadow-sm rounded-2xl p-1 flex-1 ring-1 ring-black/5 focus-within:ring-primary/20 transition-all"
							>
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
		{:else}
			<div
				class="flex-1 flex flex-col items-center justify-center text-center p-8"
			>
				<div
					class="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-300 mb-4"
				>
					<HugeiconsIcon icon={Message01Icon} size={32} />
				</div>
				<h3 class="text-lg font-bold text-slate-900">
					Seleziona una conversazione
				</h3>
				<p class="text-sm text-slate-500 max-w-xs mt-1">
					Scegli una pratica dalla lista a sinistra per visualizzare
					la cronologia e rispondere.
				</p>
			</div>
		{/if}
	</main>
</div>
