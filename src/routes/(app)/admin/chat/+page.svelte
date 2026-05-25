<script lang="ts">
	import { 
		reports, 
		inferReportStatus, 
		acknowledgeReport, 
		resolveReport
	} from '$lib/data/ticket/reports';
	import { tickets, getCurrentStatus, getCurrentSupplier, getSupplierRelevantTimeline, addTicketEvent } from '$lib/data/ticket/tickets';
	import { users } from '$lib/data/users';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { services } from '$lib/data/services';
	import { getQuoteById } from '$lib/data/embeds/quotes';
	import { getInvoiceById } from '$lib/data/embeds/invoices';
	import { getPaymentById } from '$lib/data/embeds/payments';
	import { getSupplierTaskById } from '$lib/data/embeds/supplierTasks';
	import { getCurrentUser } from '$lib/auth';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		ArrowLeft01Icon, 
		InformationCircleIcon,
		Search01Icon,
		Message01Icon,
		UserCircleIcon,
		CustomerServiceIcon,
		Settings02Icon,
		SentIcon,
		Add01Icon,
		CreditCardIcon,
		Upload01Icon,
		File01Icon
	} from '@hugeicons/core-free-icons';
	import { format } from 'date-fns';
	import { it } from 'date-fns/locale';
	import { formatChatDateLabel, isSameChatDay } from '$lib/utils/dates';
	
	import ChatBubble from '$lib/components/shared/chat-cards/ChatBubble.svelte';
	import ChatQuoteCard from '$lib/components/shared/chat-cards/ChatQuoteCard.svelte';
	import ChatInvoiceCard from '$lib/components/shared/chat-cards/ChatInvoiceCard.svelte';
	import ChatPaymentCard from '$lib/components/shared/chat-cards/ChatPaymentCard.svelte';
	import ChatInterventionCard from '$lib/components/shared/chat-cards/ChatInterventionCard.svelte';
	import ChatTimelineEvent from '$lib/components/shared/chat-cards/ChatTimelineEvent.svelte';
	import PaymentModal from '$lib/components/shared/chat-buttons/PaymentModal.svelte';
	import { tick } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	const currentUser = getCurrentUser();
	const adminId = currentUser?.id ?? 'adm-giorgio-01';

	// State for active view and selection
	type ChatType = 'resident' | 'supplier';
	let activeTab = $state<ChatType>('resident');
	let showPaymentModal = $state(false);
	let showPlusMenu = $state(false);
	let refreshTrigger = $state(0);
	let newMessageValue = $state("");
	
	// Synchronization with URL
	const selectedId = $derived(page.url.searchParams.get('id'));

	// Grouped Resident Chats: all reports and tickets for a resident
	const residentChats = $derived.by(() => {
		refreshTrigger;
		const groups = new Map<string, { userId: string, lastDate: Date, reports: any[] }>();
		
		reports.filter(r => r.adminId === adminId).forEach(r => {
			const userId = r.reportedById;
			if (!groups.has(userId)) {
				groups.set(userId, { userId, lastDate: new Date(0), reports: [] });
			}
			const g = groups.get(userId)!;
			g.reports.push(r);
			const updatedAt = new Date(r.timeline?.[r.timeline.length - 1]?.at || 0);
			if (updatedAt > g.lastDate) g.lastDate = updatedAt;
		});

		return Array.from(groups.values()).sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime());
	});

	// Grouped Supplier Chats: all tickets for a supplier
	const supplierChats = $derived.by(() => {
		refreshTrigger;
		const groups = new Map<string, { supplierId: string, lastDate: Date, tickets: any[] }>();
		
		for (const t of tickets) {
			const sid = getCurrentSupplier(t);
			if (!sid) continue;
			
			if (!groups.has(sid)) {
				groups.set(sid, { supplierId: sid, lastDate: new Date(0), tickets: [] });
			}
			const g = groups.get(sid)!;
			g.tickets.push(t);
			
			const rel = getSupplierRelevantTimeline(t, sid);
			const msgs = (t.messageTimeline ?? []).filter(m => m.senderId === sid || m.senderId === adminId);
			let lastActivity = new Date(0);
			if (msgs.length) lastActivity = new Date(msgs[msgs.length - 1].timestamp);
			else if (rel.length) lastActivity = new Date(rel[rel.length - 1].at);
			
			if (lastActivity > g.lastDate) g.lastDate = lastActivity;
		}

		return Array.from(groups.values()).sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime());
	});

	function selectChat(id: string, type: ChatType) {
		activeTab = type;
		goto(`?id=${id}`, { replaceState: true });
	}

	// Derived selection
	const activeChat = $derived.by(() => {
		if (!selectedId) return null;
		if (activeTab === 'resident') return residentChats.find(c => c.userId === selectedId);
		return supplierChats.find(c => c.supplierId === selectedId);
	});

	const counterparty = $derived(activeChat 
		? getUserInfo(activeTab === 'resident' ? (activeChat as any).userId : (activeChat as any).supplierId) 
		: null);

	// Unified timeline for the selected conversation
	const timelineItems = $derived.by(() => {
		refreshTrigger;
		const items: any[] = [];
		if (!activeChat) return [];

		if (activeTab === 'resident') {
			const chat = activeChat as any;
			chat.reports.forEach((r: any) => {
				if (r.messageTimeline) {
					r.messageTimeline.forEach((msg: any) => {
						items.push({ type: 'message', date: new Date(msg.timestamp), data: msg });
					});
				}
				if (r.timeline) {
					r.timeline.forEach((event: any) => {
						items.push({ type: 'event', date: new Date(event.at), data: event });
					});
				}
			});
		} else {
			const chat = activeChat as any;
			const sid = chat.supplierId;
			chat.tickets.forEach((t: any) => {
				if (t.messageTimeline) {
					t.messageTimeline.filter((m: any) => m.senderId === sid || m.senderId === adminId).forEach((msg: any) => {
						items.push({ type: 'message', date: new Date(msg.timestamp), data: msg });
					});
				}
				// Events
				const rel = getSupplierRelevantTimeline(t, sid);
				rel.forEach((event: any) => {
					items.push({ type: 'event', date: new Date(event.at), data: event });
				});
				// Embeds
				if (t.quoteIds) t.quoteIds.forEach((id: string) => {
					const quote = getQuoteById(id);
					if (quote && quote.createdAt) items.push({ type: 'quote', date: new Date(quote.createdAt), data: quote });
				});
				if (t.invoiceIds) t.invoiceIds.forEach((id: string) => {
					const invoice = getInvoiceById(id);
					if (invoice && invoice.createdAt) items.push({ type: 'invoice', date: new Date(invoice.createdAt), data: invoice });
				});
				if (t.paymentIds) t.paymentIds.forEach((id: string) => {
					const payment = getPaymentById(id);
					const dateStr = payment ? (payment.createdAt ?? payment.paidAt) : undefined;
					if (payment && dateStr) items.push({ type: 'payment', date: new Date(dateStr), data: payment });
				});
				if (t.interventionIds) t.interventionIds.forEach((id: string) => {
					const task = getSupplierTaskById(id);
					if (task) items.push({ type: 'intervention', date: new Date(`${task.date}T${task.startTime}`), data: task });
				});
			});
		}
		return items.sort((a, b) => a.date.getTime() - b.date.getTime());
	});

	function getUserInfo(userId: string) {
		return users.find(u => u.id === userId);
	}

	const statusColors: Record<string, string> = {
		nuova: 'bg-amber-100 text-amber-700',
		presa_in_carico: 'bg-blue-100 text-blue-700',
		completata: 'bg-emerald-100 text-emerald-700',
		archiviata: 'bg-slate-100 text-slate-500',
		opened: 'bg-amber-100 text-amber-700',
		estimating: 'bg-blue-100 text-blue-700',
		approved: 'bg-emerald-100 text-emerald-700',
		in_progress: 'bg-indigo-100 text-indigo-700',
		completed: 'bg-emerald-100 text-emerald-700',
		paid: 'bg-slate-100 text-slate-700',
		closed: 'bg-slate-100 text-slate-500'
	};

	const activeTicket = $derived(
		activeTab === 'supplier' && activeChat
			? (activeChat as any).tickets[(activeChat as any).tickets.length - 1]
			: null,
	);

	const activeReport = $derived(
		activeTab === 'resident' && activeChat
			? (activeChat as any).reports[(activeChat as any).reports.length - 1]
			: null,
	);

	function handleAdminAcknowledgeReport() {
		if (!activeReport) return;
		acknowledgeReport(activeReport.id, adminId);
		refreshTrigger++;
	}

	function handleAdminResolveReport() {
		if (!activeReport) return;
		resolveReport(activeReport.id, adminId);
		refreshTrigger++;
	}

	let actionOpen = $state(false);

	function handleAdminAssignToSupplier() {
		if (!activeTicket || !activeChat) return;
		const supplierId = (activeChat as any).supplierId;
		addTicketEvent(activeTicket.id, 'assignToSupplier', adminId, supplierId);
		refreshTrigger++;
	}

	function handleAdminCloseTicket() {
		if (!activeTicket) return;
		addTicketEvent(activeTicket.id, 'closeTicket', adminId);
		refreshTrigger++;
	}

	function sendMessage() {
		if (!newMessageValue.trim() || !activeChat) return;

		const msg = {
			id: `msg-${Date.now()}`,
			senderId: adminId,
			text: newMessageValue.trim(),
			timestamp: new Date().toISOString(),
		};

		if (activeTab === "resident") {
			if (activeReport) {
				if (!activeReport.messageTimeline) activeReport.messageTimeline = [];
				activeReport.messageTimeline.push(msg);
			}
		} else {
			if (activeTicket) {
				if (!activeTicket.messageTimeline) activeTicket.messageTimeline = [];
				activeTicket.messageTimeline.push(msg);
			}
		}

		newMessageValue = "";
		refreshTrigger++;
		scrollToBottom();
	}

	let scrollContainer = $state<HTMLElement | null>(null);

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
</script>

<PaymentModal
	bind:open={showPaymentModal}
	bookingId=""
	ticketId={activeTicket?.id}
	fromId={adminId}
	toId={activeTab === 'supplier' ? selectedId ?? '' : ''}
	propertyId={activeTicket?.propertyId ?? ''}
/>

<div class="flex h-full min-h-full bg-white overflow-hidden">
	<!-- Sidebar: Conversation List -->
	<aside class="w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-slate-50/30 min-h-0 {selectedId ? 'hidden md:flex' : 'flex'}">
		<div class="p-4 bg-white border-b border-border">
			<div class="flex items-center justify-between mb-4">
				<h1 class="text-xl font-bold text-slate-900">Messaggi</h1>
				<button class="p-2 rounded-full hover:bg-slate-100 text-slate-500">
					<HugeiconsIcon icon={Settings02Icon} size={20} />
				</button>
			</div>
			
			<div class="flex p-1 bg-slate-100 rounded-xl mb-4">
				<button 
					onclick={() => { activeTab = 'resident'; goto('?', { replaceState: true }); }}
					class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all {activeTab === 'resident' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}"
				>
					Residenti
				</button>
				<button 
					onclick={() => { activeTab = 'supplier'; goto('?', { replaceState: true }); }}
					class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all {activeTab === 'supplier' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}"
				>
					Fornitori
				</button>
			</div>

			<div class="relative">
				<HugeiconsIcon icon={Search01Icon} size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
				<Input 
					type="text" 
					placeholder="Cerca conversazioni..." 
					class="pl-10 bg-slate-100 border-none rounded-xl"
				/>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto">
			{#if activeTab === 'resident'}
				{#each residentChats as group}
					{@const resident = getUserInfo(group.userId)}
					{@const lastReport = group.reports[group.reports.length - 1]}
					{@const lastMsg = lastReport?.messageTimeline?.[lastReport.messageTimeline.length - 1]}
					<button 
						onclick={() => selectChat(group.userId, 'resident')}
						class="w-full p-4 flex gap-3 hover:bg-white border-b border-slate-100 transition-colors text-left {selectedId === group.userId ? 'bg-white shadow-sm' : ''}"
					>
						<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
							<HugeiconsIcon icon={UserCircleIcon} size={28} />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex justify-between items-baseline mb-0.5">
								<span class="font-bold text-slate-900 truncate">{resident?.name || 'Residente'}</span>
								{#if group.lastDate.getTime() > 0}
									<span class="text-[10px] text-slate-400">{format(group.lastDate, "HH:mm")}</span>
								{/if}
							</div>
							<p class="text-xs text-slate-500 line-clamp-1">
								{lastMsg?.text || 'Vedi cronologia...'}
							</p>
						</div>
					</button>
				{/each}
			{:else}
				{#each supplierChats as group}
					{@const supplier = getUserInfo(group.supplierId)}
					{@const lastTicket = group.tickets[group.tickets.length - 1]}
					{@const lastMsg = lastTicket?.messageTimeline?.[lastTicket.messageTimeline.length - 1]}
					<button 
						onclick={() => selectChat(group.supplierId, 'supplier')}
						class="w-full p-4 flex gap-3 hover:bg-white border-b border-slate-100 transition-colors text-left {selectedId === group.supplierId ? 'bg-white shadow-sm' : ''}"
					>
						<div class="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
							<HugeiconsIcon icon={CustomerServiceIcon} size={28} />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex justify-between items-baseline mb-0.5">
								<span class="font-bold text-slate-900 truncate">{supplier?.name || 'Fornitore'}</span>
								{#if group.lastDate.getTime() > 0}
									<span class="text-[10px] text-slate-400">{format(group.lastDate, "HH:mm")}</span>
								{/if}
							</div>
							<p class="text-xs text-slate-500 line-clamp-1">
								{lastMsg?.text || 'Vedi cronologia...'}
							</p>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	</aside>

	<!-- Main Chat Area -->
	<main class="relative flex-1 min-h-0 flex flex-col bg-slate-50/50 {selectedId ? 'flex' : 'hidden md:flex'}">
		{#if selectedId && counterparty}
			<header class="h-16 shrink-0 bg-white border-b border-border px-4 flex items-center gap-3 relative z-10">
				<button 
					onclick={() => goto('?', { replaceState: true })}
					class="p-2 -ml-2 rounded-full hover:bg-slate-100 md:hidden"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
				</button>
				
				<div class="w-10 h-10 rounded-full {activeTab === 'resident' ? 'bg-primary/10 text-primary' : 'bg-amber-50 text-amber-600'} flex items-center justify-center shrink-0">
					<HugeiconsIcon icon={activeTab === 'resident' ? UserCircleIcon : CustomerServiceIcon} size={24} />
				</div>
				
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<h2 class="font-bold text-slate-900 truncate">{counterparty.name}</h2>
					</div>
					<p class="text-[11px] text-slate-500 truncate">
						{activeTab === 'resident' ? 'Residente' : 'Fornitore'}
					</p>
				</div>

				<div class="flex items-center gap-1">
					<!-- Removed header info button per user request to move it to footer -->
				</div>
			</header>

			<div 
				bind:this={scrollContainer}
				class="flex-1 overflow-y-auto p-4 md:p-6 bg-white shrink-0 scroll-smooth"
			>
				<div class="w-full h-full flex flex-col space-y-4">
					{#each timelineItems as item, index}
						{#if index === 0 || !isSameChatDay(item.date, timelineItems[index - 1].date)}
							<div class="flex justify-center my-6 sticky top-2 z-10">
								<div class="bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-slate-200/50 px-4 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 uppercase tracking-widest">
									{formatChatDateLabel(item.date)}
								</div>
							</div>
						{/if}

						{#if item.type === 'message'}
							<ChatBubble 
								message={item.data} 
								isOwn={item.data.senderId === adminId}
							/>
						{:else if item.type === 'event'}
							<div class="flex justify-center w-full my-2">
								<ChatTimelineEvent event={item.data} />
							</div>
						{:else if item.type === 'quote'}
							<ChatQuoteCard 
								quote={item.data} 
								isOwn={false} 
							/>
						{:else if item.type === 'invoice'}
							<ChatInvoiceCard 
								invoice={item.data} 
								isOwn={false} 
							/>
						{:else if item.type === 'payment'}
							<ChatPaymentCard payment={item.data} isOwn={item.data.fromId === adminId} />
						{:else if item.type === 'intervention'}
							<ChatInterventionCard task={item.data} isOwn={false} />
						{/if}
					{/each}
				</div>
			</div>

			<footer class="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-20">
				<div class="w-full flex items-center gap-1 relative">
					<!-- Ticket Actions Popup -->
					{#if actionOpen && activeTab === 'supplier' && activeTicket}
						<div class="absolute bottom-full left-0 mb-4 w-full md:max-w-md bg-white rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] ring-1 ring-black/5 p-6 animate-in slide-in-from-bottom-2 duration-200">
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
								</div>

								<div class="pt-4 grid gap-2">
									{#if !getCurrentSupplier(activeTicket)}
										<Button variant="default" class="h-11 text-[11px] font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800 rounded-4xl shadow-lg shadow-slate-200" onclick={() => { handleAdminAssignToSupplier(); actionOpen = false; }}>
											Assegna a {counterparty.name}
										</Button>
									{/if}
									{#if getCurrentStatus(activeTicket) !== 'closed'}
										<Button variant="ghost" class="h-10 text-[11px] font-bold uppercase tracking-widest text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-4xl" onclick={() => { handleAdminCloseTicket(); actionOpen = false; }}>
											Chiudi ticket
										</Button>
									{/if}
								</div>
							</div>
						</div>
					{:else if actionOpen && activeTab === 'resident' && activeReport}
						<div class="absolute bottom-full left-0 mb-4 w-full md:max-w-md bg-white rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] ring-1 ring-black/5 p-6 animate-in slide-in-from-bottom-2 duration-200">
							<div class="space-y-5">
								<div class="flex items-start justify-between">
									<div class="space-y-1">
										<p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Segnalazione Residente</p>
										<h3 class="text-lg font-bold text-slate-900 leading-tight">{activeReport.title}</h3>
									</div>
									<div class="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider ring-1 ring-blue-100">
										{inferReportStatus(activeReport).replace('_', ' ')}
									</div>
								</div>

								<div class="space-y-4">
									<div class="space-y-1.5">
										<p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Descrizione</p>
										<p class="text-[14px] text-slate-600 leading-relaxed font-medium px-1">
											{activeReport.description || 'Nessuna descrizione fornita.'}
										</p>
									</div>

									<div class="flex gap-4 pt-1 border-t border-slate-50 mt-2">
										<div class="flex-1">
											<p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 px-1">Priorità</p>
											<p class="text-[13px] font-bold {activeReport.priority === 'alta' || activeReport.priority === 'critica' ? 'text-rose-600' : 'text-slate-800'} capitalize px-1">
												{activeReport.priority}
											</p>
										</div>
										{#if activeReport.category}
											<div class="flex-1">
												<p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 px-1">Categoria</p>
												<p class="text-[13px] font-semibold text-slate-800 px-1">{activeReport.category}</p>
											</div>
										{/if}
									</div>
								</div>

								<div class="pt-4 grid gap-2">
									{#if inferReportStatus(activeReport) === 'nuova'}
										<Button variant="default" class="h-11 text-[11px] font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800 rounded-4xl shadow-lg shadow-slate-200" onclick={() => { handleAdminAcknowledgeReport(); actionOpen = false; }}>
											Prendi in carico
										</Button>
									{:else if inferReportStatus(activeReport) === 'presa_in_carico'}
										<Button variant="default" class="h-11 text-[11px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 rounded-4xl shadow-lg shadow-emerald-50" onclick={() => { handleAdminResolveReport(); actionOpen = false; }}>
											Risolvi segnalazione
										</Button>
									{/if}
								</div>
							</div>
						</div>
					{/if}

					<div class="flex items-center relative">
						<button 
							onclick={() => { showPlusMenu = !showPlusMenu; actionOpen = false; }}
							class="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 {showPlusMenu ? 'bg-[#5D7D94]/10 text-[#5D7D94]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}"
						>
							<HugeiconsIcon icon={Add01Icon} size={24} />
						</button>

						{#if showPlusMenu}
							<div class="absolute left-0 bottom-full mb-3 w-64 rounded-[1.75rem] bg-white shadow-xl ring-1 ring-black/5 p-2 space-y-1">
								<button
									type="button"
									class="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-slate-50 transition-colors"
									onclick={() => { showPaymentModal = true; showPlusMenu = false; }}
								>
									<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
										<HugeiconsIcon icon={CreditCardIcon} size={18} />
									</div>
									<div class="text-left">
										<p class="text-sm font-semibold text-slate-900">Nuovo pagamento</p>
									</div>
								</button>

								<button
									type="button"
									class="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-slate-50 transition-colors"
									onclick={() => { showPlusMenu = false; }}
								>
									<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
										<HugeiconsIcon icon={Upload01Icon} size={18} />
									</div>
									<div class="text-left">
										<p class="text-sm font-semibold text-slate-900">Nuova immagine</p>
									</div>
								</button>

								<button
									type="button"
									class="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-slate-50 transition-colors"
									onclick={() => { showPlusMenu = false; }}
								>
									<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
										<HugeiconsIcon icon={File01Icon} size={18} />
									</div>
									<div class="text-left">
										<p class="text-sm font-semibold text-slate-900">Nuovo file</p>
									</div>
								</button>
							</div>
						{/if}
					</div>

					{#if (activeTab === 'supplier' && activeTicket && getCurrentStatus(activeTicket) !== 'closed') || (activeTab === 'resident' && activeReport && inferReportStatus(activeReport) !== 'completata')}
						<button 
							onclick={() => { actionOpen = !actionOpen; showPlusMenu = false; }}
							class="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 {actionOpen ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'} {actionOpen ? 'rotate-180' : ''}"
						>
							<HugeiconsIcon icon={InformationCircleIcon} size={22} />
						</button>
					{/if}

					<form 
						onsubmit={(e) => { e.preventDefault(); sendMessage(); }}
						class="flex items-center gap-2 flex-1 ml-1"
					>
						<div class="bg-white flex items-center gap-2 border border-slate-200 shadow-sm rounded-2xl p-1 flex-1 ring-1 ring-black/5 focus-within:ring-primary/20 transition-all">
							<input 
								type="text" 
								placeholder="Scrivi a {counterparty.name}..." 
								bind:value={newMessageValue}
								onfocus={() => { showPlusMenu = false; actionOpen = false; }}
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
			</footer>
		{:else}
			<div class="flex-1 flex flex-col items-center justify-center text-center p-8">
				<div class="w-16 h-16 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-300 mb-6">
					<HugeiconsIcon icon={Message01Icon} size={32} />
				</div>
				<h3 class="text-lg font-bold text-slate-900">Centro Messaggi Amministratore</h3>
				<p class="text-sm text-slate-500 max-w-xs mt-2">
					Seleziona una segnalazione residente o un ticket fornitore per visualizzare la cronologia e rispondere.
				</p>
			</div>
		{/if}
	</main>
</div>
