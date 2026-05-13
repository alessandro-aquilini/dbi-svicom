<script lang="ts">
	import { tick } from 'svelte';
	import { marked } from 'marked';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		AiChat02Icon,
		ArrowUp01Icon,
		Building03Icon,
		Calendar03Icon,
		CheckmarkCircle02Icon,
		CreditCardIcon,
		DatabaseIcon,
		Mail01Icon,
		Note01Icon,
		Search01Icon
	} from '@hugeicons/core-free-icons';
	import { getCurrentUser } from '$lib/auth';

	marked.setOptions({ gfm: true, breaks: true });

	function renderMarkdown(text: string): string {
		return marked.parse(text, { async: false }) as string;
	}

	type Role = 'user' | 'assistant';

	type ToolBlock = {
		kind: 'tool';
		label: string;
		icon: typeof Search01Icon;
		status: 'running' | 'done';
		rows?: string[];
		summary?: string;
	};

	type DraftBlock = {
		kind: 'draft';
		subject: string;
		recipients: string;
		body: string;
	};

	type EventBlock = {
		kind: 'event';
		title: string;
		when: string;
		where: string;
		invitees: number;
	};

	type StatusBlock = {
		kind: 'status';
		tone: 'success' | 'info' | 'warning';
		label: string;
	};

	type TextBlock = {
		kind: 'text';
		markdown: string;
	};

	type Block = TextBlock | ToolBlock | DraftBlock | EventBlock | StatusBlock;

	type Message =
		| { id: string; role: 'user'; text: string }
		| { id: string; role: 'assistant'; blocks: Block[]; pending: boolean };

	type Step = { delay: number; run: (blocks: Block[]) => Block[] };

	const currentUser = getCurrentUser();
	const firstName = currentUser?.name?.split(' ')[0] ?? 'amministratore';

	const suggestions = [
		{
			icon: Mail01Icon,
			title: 'Sollecita i morosi',
			prompt: 'Manda una mail di sollecito a tutti i residenti morosi oltre 30 giorni.'
		},
		{
			icon: Calendar03Icon,
			title: 'Programma un\'assemblea',
			prompt: 'Programma l\'assemblea ordinaria di Via Marconi 14 per il prossimo mese.'
		},
		{
			icon: Note01Icon,
			title: 'Pratiche aperte',
			prompt: 'Riepiloga le pratiche aperte questa settimana, raggruppate per priorità.'
		},
		{
			icon: Building03Icon,
			title: 'Report condominio',
			prompt: 'Genera il report mensile per il condominio Solari 30.'
		}
	];

	let messages = $state<Message[]>([]);
	let draft = $state('');
	let isSending = $state(false);
	let scrollEl: HTMLDivElement | undefined = $state();
	let textareaEl: HTMLTextAreaElement | undefined = $state();

	const isEmpty = $derived(messages.length === 0);
	const canSend = $derived(draft.trim().length > 0 && !isSending);

	function newId(): string {
		return Math.random().toString(36).slice(2, 11);
	}

	function autoGrow() {
		if (!textareaEl) return;
		textareaEl.style.height = 'auto';
		textareaEl.style.height = `${Math.min(textareaEl.scrollHeight, 200)}px`;
	}

	async function scrollToBottom() {
		await tick();
		if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
	}

	function sleep(ms: number): Promise<void> {
		return new Promise((r) => setTimeout(r, ms));
	}

	function pickScript(prompt: string): Step[] {
		const p = prompt.toLowerCase();
		if (/(mais|mail|sollecit|moros|in ritardo)/.test(p)) return scriptMorosi;
		if (/(assemblea|riunione|convoca|programm)/.test(p)) return scriptAssemblea;
		if (/(pratich|priorit|aperte)/.test(p)) return scriptPratiche;
		if (/(report|riepilog|solari|mensile)/.test(p)) return scriptReport;
		if (/(agenda|settimana|appuntament|scadenz)/.test(p)) return scriptAgenda;
		return scriptDefault(prompt);
	}

	const scriptMorosi: Step[] = [
		{
			delay: 350,
			run: (b) => [
				...b,
				{
					kind: 'text',
					markdown:
						"Ok, procedo a contattare i residenti con pagamenti scaduti da più di **30 giorni**. Prima li identifico nel sistema."
				}
			]
		},
		{
			delay: 450,
			run: (b) => [
				...b,
				{
					kind: 'tool',
					label: 'cerca_morosi · soglia: 30gg',
					icon: Search01Icon,
					status: 'running'
				}
			]
		},
		{
			delay: 1100,
			run: (b) => {
				const last = b[b.length - 1] as ToolBlock;
				return [
					...b.slice(0, -1),
					{
						...last,
						status: 'done',
						summary: '4 residenti trovati · €3.420 totali',
						rows: [
							'M. Rossi · Via Marconi 14 · €420 · 47 gg',
							'L. Conti · Corso Europa 7 · €860 · 38 gg',
							'A. Greco · Via Carducci 21 · €1.240 · 62 gg',
							'S. Bruno · Via Tortona 12 · €900 · 33 gg'
						]
					}
				];
			}
		},
		{
			delay: 550,
			run: (b) => [
				...b,
				{
					kind: 'text',
					markdown:
						'Ho preparato una bozza personalizzata per ciascun destinatario. Eccone l\'anteprima:'
				}
			]
		},
		{
			delay: 500,
			run: (b) => [
				...b,
				{
					kind: 'draft',
					subject: 'Promemoria pagamento quote condominiali',
					recipients: '4 destinatari · personalizzata per nome, importo e giorni di ritardo',
					body: `Gentile {{nome}},\n\nle ricordiamo che risulta in sospeso il pagamento di €{{importo}}, scaduto da {{giorni}} giorni. La invitiamo a regolarizzare entro 7 giorni lavorativi tramite l'area Pagamenti del portale, oppure contattando lo studio per concordare un piano di rientro.\n\nCordiali saluti,\nStudio Svicom Milano`
				}
			]
		},
		{
			delay: 600,
			run: (b) => [
				...b,
				{
					kind: 'tool',
					label: 'invia_email · 4 destinatari',
					icon: Mail01Icon,
					status: 'running'
				}
			]
		},
		{
			delay: 1200,
			run: (b) => {
				const last = b[b.length - 1] as ToolBlock;
				return [
					...b.slice(0, -1),
					{
						...last,
						status: 'done',
						summary: '4/4 mail consegnate · 0 errori'
					}
				];
			}
		},
		{
			delay: 350,
			run: (b) => [
				...b,
				{
					kind: 'status',
					tone: 'success',
					label: 'Solleciti inviati e registrati nel log comunicazioni di ciascun residente.'
				}
			]
		}
	];

	const scriptAssemblea: Step[] = [
		{
			delay: 350,
			run: (b) => [
				...b,
				{
					kind: 'text',
					markdown:
						'Procedo a verificare la disponibilità della sala e a notificare i residenti di **Via Marconi 14**.'
				}
			]
		},
		{
			delay: 450,
			run: (b) => [
				...b,
				{
					kind: 'tool',
					label: 'verifica_disponibilita · sala condominiale',
					icon: Calendar03Icon,
					status: 'running'
				}
			]
		},
		{
			delay: 900,
			run: (b) => {
				const last = b[b.length - 1] as ToolBlock;
				return [
					...b.slice(0, -1),
					{
						...last,
						status: 'done',
						summary: 'Prima data utile: martedì 9 giugno · ore 18:30'
					}
				];
			}
		},
		{
			delay: 500,
			run: (b) => [
				...b,
				{
					kind: 'event',
					title: 'Assemblea ordinaria — Via Marconi 14',
					when: 'Mar 9 giugno 2026 · 18:30 (durata stimata 90 min)',
					where: 'Sala condominiale, Via Marconi 14',
					invitees: 24
				}
			]
		},
		{
			delay: 500,
			run: (b) => [
				...b,
				{
					kind: 'tool',
					label: 'invia_convocazione · 24 condomini',
					icon: Mail01Icon,
					status: 'running'
				}
			]
		},
		{
			delay: 1000,
			run: (b) => {
				const last = b[b.length - 1] as ToolBlock;
				return [
					...b.slice(0, -1),
					{
						...last,
						status: 'done',
						summary: 'Convocazioni inviate · 24/24'
					}
				];
			}
		},
		{
			delay: 350,
			run: (b) => [
				...b,
				{
					kind: 'status',
					tone: 'success',
					label: 'Evento pubblicato in calendario e aggiunto alla bacheca del condominio.'
				}
			]
		}
	];

	const scriptPratiche: Step[] = [
		{
			delay: 350,
			run: (b) => [
				...b,
				{
					kind: 'text',
					markdown: 'Recupero le pratiche aperte e le organizzo per priorità.'
				}
			]
		},
		{
			delay: 400,
			run: (b) => [
				...b,
				{
					kind: 'tool',
					label: 'query_pratiche · stato: aperta',
					icon: DatabaseIcon,
					status: 'running'
				}
			]
		},
		{
			delay: 900,
			run: (b) => {
				const last = b[b.length - 1] as ToolBlock;
				return [
					...b.slice(0, -1),
					{
						...last,
						status: 'done',
						summary: '7 pratiche aperte questa settimana',
						rows: [
							'Alta · perdita locale caldaia · Via Marconi 14',
							'Alta · ascensore fuori uso · Corso Europa 7',
							'Media · sostituzione luci scale · Solari 30',
							'Media · revisione antincendio · Pacini 44',
							'Media · ripristino citofono · Verdi 3',
							'Bassa · pulizia parti comuni · Tortona 12',
							'Bassa · richiesta info polizza · Carducci 21'
						]
					}
				];
			}
		},
		{
			delay: 450,
			run: (b) => [
				...b,
				{
					kind: 'text',
					markdown:
						'**Sintesi:**\n\n- 2 pratiche **ad alta priorità** richiedono il tuo intervento.\n- 3 pratiche **medie** sono in attesa preventivo.\n- 2 pratiche **basse** possono essere chiuse a fine settimana.\n\nVuoi che programmi un sollecito al fornitore dell\'ascensore?'
				}
			]
		}
	];

	const scriptReport: Step[] = [
		{
			delay: 350,
			run: (b) => [
				...b,
				{
					kind: 'text',
					markdown: 'Raccolgo i dati operativi del mese per **Solari 30**.'
				}
			]
		},
		{
			delay: 400,
			run: (b) => [
				...b,
				{
					kind: 'tool',
					label: 'aggrega_metriche · Solari 30 · 30gg',
					icon: DatabaseIcon,
					status: 'running'
				}
			]
		},
		{
			delay: 1000,
			run: (b) => {
				const last = b[b.length - 1] as ToolBlock;
				return [
					...b.slice(0, -1),
					{
						...last,
						status: 'done',
						summary: 'Dati raccolti da 4 fonti',
						rows: [
							'Pratiche chiuse: 6 (+2 vs mese scorso)',
							'Tempo medio risoluzione: 3.4 gg',
							'Spesa straordinaria: €1.840',
							'Soddisfazione residenti: 4.6 / 5'
						]
					}
				];
			}
		},
		{
			delay: 500,
			run: (b) => [
				...b,
				{
					kind: 'text',
					markdown:
						'**Report mensile — Solari 30** pronto. Andamento positivo: tempi di risoluzione in calo del 18% e nessuna pratica critica aperta a fine mese.\n\nLo invio anche al referente del condominio?'
				}
			]
		}
	];

	const scriptAgenda: Step[] = [
		{
			delay: 350,
			run: (b) => [
				...b,
				{
					kind: 'text',
					markdown: 'Ecco gli impegni dei prossimi 7 giorni.'
				}
			]
		},
		{
			delay: 400,
			run: (b) => [
				...b,
				{
					kind: 'tool',
					label: 'leggi_calendario · 7gg',
					icon: Calendar03Icon,
					status: 'running'
				}
			]
		},
		{
			delay: 800,
			run: (b) => {
				const last = b[b.length - 1] as ToolBlock;
				return [
					...b.slice(0, -1),
					{
						...last,
						status: 'done',
						summary: '3 eventi pianificati',
						rows: [
							'Mar 14 · 09:30 · Sopralluogo Solari 30',
							'Mer 15 · 18:00 · Assemblea Corso Europa 7',
							'Ven 17 · scadenza preventivo Pacini 44'
						]
					}
				];
			}
		}
	];

	function scriptDefault(prompt: string): Step[] {
		return [
			{
				delay: 500,
				run: (b) => [
					...b,
					{
						kind: 'text',
						markdown: `Sto simulando una risposta a: "${prompt}". Quando l'integrazione LLM sarà attiva, qui arriverà una risposta in streaming da un modello configurato per Svicom Living Hub.`
					}
				]
			}
		];
	}

	async function send(promptOverride?: string) {
		const content = (promptOverride ?? draft).trim();
		if (!content || isSending) return;

		messages.push({ id: newId(), role: 'user', text: content });
		draft = '';
		autoGrow();
		isSending = true;
		await scrollToBottom();

		const assistantId = newId();
		messages.push({ id: assistantId, role: 'assistant', blocks: [], pending: true });
		await scrollToBottom();

		const steps = pickScript(content);

		for (const step of steps) {
			await sleep(step.delay);
			const idx = messages.findIndex((m) => m.id === assistantId);
			if (idx === -1) break;
			const current = messages[idx];
			if (current.role !== 'assistant') break;
			messages[idx] = {
				...current,
				blocks: step.run(current.blocks),
				pending: false
			};
			await scrollToBottom();
		}

		isSending = false;
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			send();
		}
	}

	function resetConversation() {
		messages = [];
		draft = '';
		autoGrow();
		textareaEl?.focus();
	}
</script>

<svelte:head>
	<title>Assistente AI — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="ai-chat">
	<header class="ai-chat__header">
		<div class="ai-chat__header-title">
			<span class="ai-chat__brand" aria-hidden="true">
				<HugeiconsIcon icon={AiChat02Icon} size={18} strokeWidth={1.75} />
			</span>
			<div>
				<h1>Assistente AI</h1>
				<p>Conversa con l'assistente operativo di Svicom Living Hub.</p>
			</div>
		</div>
		{#if !isEmpty}
			<button type="button" class="ai-chat__reset" onclick={resetConversation}>
				Nuova conversazione
			</button>
		{/if}
	</header>

	<div class="ai-chat__scroll" bind:this={scrollEl}>
		{#if isEmpty}
			<div class="ai-chat__empty">
				<div class="ai-chat__empty-mark" aria-hidden="true">
					<HugeiconsIcon icon={AiChat02Icon} size={28} strokeWidth={1.6} />
				</div>
				<h2 class="ai-chat__empty-title">Ciao {firstName}, come posso aiutarti?</h2>
				<p class="ai-chat__empty-copy">
					Chiedi all'assistente di eseguire un'azione, raccogliere dati o preparare comunicazioni.
				</p>
				<div class="ai-chat__suggestions">
					{#each suggestions as s}
						<button type="button" class="ai-chat__suggestion" onclick={() => send(s.prompt)}>
							<span class="ai-chat__suggestion-icon" aria-hidden="true">
								<HugeiconsIcon icon={s.icon} size={16} strokeWidth={1.7} />
							</span>
							<span class="ai-chat__suggestion-text">
								<span class="ai-chat__suggestion-title">{s.title}</span>
								<span class="ai-chat__suggestion-prompt">{s.prompt}</span>
							</span>
						</button>
					{/each}
				</div>
			</div>
		{:else}
			<div class="ai-chat__messages">
				{#each messages as m (m.id)}
					<div class="ai-chat__message ai-chat__message--{m.role}">
						{#if m.role === 'assistant'}
							<span class="ai-chat__avatar" aria-hidden="true">
								<HugeiconsIcon icon={AiChat02Icon} size={14} strokeWidth={1.8} />
							</span>
							<div class="ai-chat__assistant">
								{#if m.pending && m.blocks.length === 0}
									<span class="ai-chat__typing" aria-label="L'assistente sta scrivendo">
										<span></span><span></span><span></span>
									</span>
								{/if}
								{#each m.blocks as block, i (i)}
									{#if block.kind === 'text'}
										<div class="ai-chat__markdown">{@html renderMarkdown(block.markdown)}</div>
									{:else if block.kind === 'tool'}
										<div class="ai-tool" data-status={block.status}>
											<div class="ai-tool__head">
												<span class="ai-tool__icon" aria-hidden="true">
													<HugeiconsIcon icon={block.icon} size={14} strokeWidth={1.8} />
												</span>
												<code class="ai-tool__label">{block.label}</code>
												{#if block.status === 'running'}
													<span class="ai-tool__spinner" aria-hidden="true"></span>
													<span class="ai-tool__state">in esecuzione…</span>
												{:else}
													<span class="ai-tool__check" aria-hidden="true">
														<HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} strokeWidth={2} />
													</span>
													<span class="ai-tool__state">completato</span>
												{/if}
											</div>
											{#if block.status === 'done' && (block.summary || block.rows)}
												<div class="ai-tool__body">
													{#if block.summary}
														<p class="ai-tool__summary">{block.summary}</p>
													{/if}
													{#if block.rows && block.rows.length > 0}
														<ul class="ai-tool__rows">
															{#each block.rows as row}
																<li>{row}</li>
															{/each}
														</ul>
													{/if}
												</div>
											{/if}
										</div>
									{:else if block.kind === 'draft'}
										<div class="ai-draft">
											<div class="ai-draft__head">
												<span class="ai-draft__icon" aria-hidden="true">
													<HugeiconsIcon icon={Mail01Icon} size={14} strokeWidth={1.8} />
												</span>
												<span class="ai-draft__label">Bozza email</span>
											</div>
											<dl class="ai-draft__meta">
												<dt>Oggetto</dt>
												<dd>{block.subject}</dd>
												<dt>Destinatari</dt>
												<dd>{block.recipients}</dd>
											</dl>
											<pre class="ai-draft__body">{block.body}</pre>
										</div>
									{:else if block.kind === 'event'}
										<div class="ai-event">
											<div class="ai-event__head">
												<span class="ai-event__icon" aria-hidden="true">
													<HugeiconsIcon icon={Calendar03Icon} size={14} strokeWidth={1.8} />
												</span>
												<span class="ai-event__label">Evento programmato</span>
											</div>
											<p class="ai-event__title">{block.title}</p>
											<dl class="ai-event__meta">
												<dt>Quando</dt>
												<dd>{block.when}</dd>
												<dt>Dove</dt>
												<dd>{block.where}</dd>
												<dt>Invitati</dt>
												<dd>{block.invitees} condomini</dd>
											</dl>
										</div>
									{:else if block.kind === 'status'}
										<div class="ai-status ai-status--{block.tone}">
											<span class="ai-status__icon" aria-hidden="true">
												<HugeiconsIcon
													icon={CheckmarkCircle02Icon}
													size={14}
													strokeWidth={2}
												/>
											</span>
											<span>{block.label}</span>
										</div>
									{/if}
								{/each}
							</div>
						{:else}
							<div class="ai-chat__bubble">
								{#each m.text.split('\n') as line, i (i)}
									<p>{line}</p>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<div class="ai-chat__composer">
		<form
			class="ai-chat__form"
			onsubmit={(e) => {
				e.preventDefault();
				send();
			}}
		>
			<textarea
				bind:this={textareaEl}
				bind:value={draft}
				oninput={autoGrow}
				onkeydown={onKeydown}
				rows="1"
				placeholder="Scrivi un messaggio all'assistente…"
				aria-label="Messaggio per l'assistente AI"
			></textarea>
			<button
				type="submit"
				class="ai-chat__send"
				disabled={!canSend}
				aria-label="Invia messaggio"
			>
				<HugeiconsIcon icon={ArrowUp01Icon} size={16} strokeWidth={2.2} />
			</button>
		</form>
		<p class="ai-chat__disclaimer">
			Le risposte sono simulate. L'integrazione con il modello LLM è in arrivo.
		</p>
	</div>
</div>

<style>
	.ai-chat {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 100%;
		background: var(--background);
	}

	.ai-chat__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
		background: var(--card);
	}

	.ai-chat__header-title {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.ai-chat__brand {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: color-mix(in oklch, var(--primary) 12%, transparent);
		color: var(--primary);
	}

	.ai-chat__header h1 {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--foreground);
		line-height: 1.2;
	}

	.ai-chat__header p {
		font-size: 0.75rem;
		color: var(--muted-foreground);
		margin-top: 2px;
	}

	.ai-chat__reset {
		font-size: 0.75rem;
		color: var(--muted-foreground);
		padding: 0.4rem 0.75rem;
		border-radius: 9999px;
		border: 1px solid var(--border);
		background: var(--card);
		transition: background 140ms ease, color 140ms ease;
	}

	.ai-chat__reset:hover {
		background: var(--muted);
		color: var(--foreground);
	}

	.ai-chat__scroll {
		flex: 1;
		overflow-y: auto;
		scroll-behavior: smooth;
	}

	/* Empty state */
	.ai-chat__empty {
		max-width: 720px;
		margin: 0 auto;
		padding: 4rem 1.5rem 3rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.ai-chat__empty-mark {
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		border-radius: 16px;
		background: color-mix(in oklch, var(--primary) 14%, transparent);
		color: var(--primary);
		margin-bottom: 1.25rem;
	}

	.ai-chat__empty-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--foreground);
		letter-spacing: -0.01em;
	}

	.ai-chat__empty-copy {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: var(--muted-foreground);
		max-width: 480px;
	}

	.ai-chat__suggestions {
		margin-top: 2rem;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
		width: 100%;
	}

	@media (max-width: 720px) {
		.ai-chat__suggestions {
			grid-template-columns: 1fr;
		}
	}

	.ai-chat__suggestion {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.85rem 1rem;
		border-radius: calc(var(--radius) - 2px);
		border: 1px solid var(--border);
		background: var(--card);
		text-align: left;
		transition: background 140ms ease, border-color 140ms ease, transform 140ms ease;
	}

	.ai-chat__suggestion:hover {
		background: var(--muted);
		border-color: color-mix(in oklch, var(--primary) 30%, var(--border));
	}

	.ai-chat__suggestion:active {
		transform: translateY(1px);
	}

	.ai-chat__suggestion-icon {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 8px;
		background: var(--muted);
		color: var(--foreground);
		flex-shrink: 0;
	}

	.ai-chat__suggestion-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.ai-chat__suggestion-title {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--foreground);
	}

	.ai-chat__suggestion-prompt {
		font-size: 0.75rem;
		color: var(--muted-foreground);
		line-height: 1.4;
	}

	/* Messages */
	.ai-chat__messages {
		max-width: 760px;
		margin: 0 auto;
		padding: 1.5rem 1.5rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.ai-chat__message {
		display: flex;
		gap: 0.625rem;
		align-items: flex-start;
	}

	.ai-chat__message--user {
		justify-content: flex-end;
	}

	.ai-chat__avatar {
		display: grid;
		place-items: center;
		width: 26px;
		height: 26px;
		border-radius: 9999px;
		background: color-mix(in oklch, var(--primary) 14%, transparent);
		color: var(--primary);
		flex-shrink: 0;
		margin-top: 2px;
	}

	.ai-chat__assistant {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		font-size: 0.9rem;
		line-height: 1.55;
		color: var(--foreground);
		animation: ai-chat-fade 220ms ease;
	}

	.ai-chat__bubble {
		max-width: min(85%, 640px);
		font-size: 0.9rem;
		line-height: 1.55;
		color: var(--foreground);
		background: var(--muted);
		border: 1px solid var(--border);
		border-radius: 18px 18px 4px 18px;
		padding: 0.7rem 0.95rem;
	}

	.ai-chat__bubble p + p {
		margin-top: 0.4rem;
	}

	.ai-chat__markdown :global(p) {
		margin: 0;
	}

	.ai-chat__markdown :global(p + p),
	.ai-chat__markdown :global(p + ul),
	.ai-chat__markdown :global(p + ol),
	.ai-chat__markdown :global(ul + p),
	.ai-chat__markdown :global(ol + p) {
		margin-top: 0.55rem;
	}

	.ai-chat__markdown :global(strong) {
		font-weight: 600;
		color: var(--foreground);
	}

	.ai-chat__markdown :global(em) {
		font-style: italic;
	}

	.ai-chat__markdown :global(a) {
		color: var(--primary);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.ai-chat__markdown :global(code) {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.82em;
		padding: 1px 5px;
		border-radius: 4px;
		background: var(--muted);
		border: 1px solid var(--border);
	}

	.ai-chat__markdown :global(ul),
	.ai-chat__markdown :global(ol) {
		margin: 0;
		padding-left: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.ai-chat__markdown :global(li) {
		line-height: 1.5;
	}

	.ai-chat__typing {
		display: inline-flex;
		gap: 4px;
		padding: 4px 0;
	}

	.ai-chat__typing span {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 9999px;
		background: var(--muted-foreground);
		opacity: 0.6;
		animation: ai-chat-bounce 1.1s infinite ease-in-out;
	}

	.ai-chat__typing span:nth-child(2) {
		animation-delay: 0.15s;
	}

	.ai-chat__typing span:nth-child(3) {
		animation-delay: 0.3s;
	}

	@keyframes ai-chat-bounce {
		0%, 80%, 100% {
			transform: translateY(0);
			opacity: 0.4;
		}
		40% {
			transform: translateY(-3px);
			opacity: 1;
		}
	}

	@keyframes ai-chat-fade {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Tool block */
	.ai-tool {
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--card);
		overflow: hidden;
		animation: ai-chat-fade 220ms ease;
	}

	.ai-tool[data-status='running'] {
		border-color: color-mix(in oklch, var(--primary) 35%, var(--border));
		background: color-mix(in oklch, var(--primary) 4%, var(--card));
	}

	.ai-tool__head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 0.75rem;
		font-size: 0.78rem;
	}

	.ai-tool__icon {
		display: grid;
		place-items: center;
		width: 22px;
		height: 22px;
		border-radius: 6px;
		background: var(--muted);
		color: var(--foreground);
	}

	.ai-tool__label {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.75rem;
		color: var(--foreground);
		background: transparent;
		border: 0;
		padding: 0;
	}

	.ai-tool__state {
		font-size: 0.7rem;
		color: var(--muted-foreground);
		margin-left: auto;
	}

	.ai-tool__spinner {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 9999px;
		border: 1.5px solid color-mix(in oklch, var(--primary) 25%, transparent);
		border-top-color: var(--primary);
		animation: ai-chat-spin 0.8s linear infinite;
		margin-left: auto;
	}

	.ai-tool__check {
		color: oklch(0.65 0.15 145);
		display: inline-flex;
		margin-left: auto;
	}

	.ai-tool__check + .ai-tool__state {
		margin-left: 0;
	}

	.ai-tool__spinner + .ai-tool__state {
		margin-left: 0;
	}

	@keyframes ai-chat-spin {
		to { transform: rotate(360deg); }
	}

	.ai-tool__body {
		padding: 0.5rem 0.75rem 0.7rem;
		border-top: 1px solid var(--border);
		background: var(--card);
	}

	.ai-tool__summary {
		font-size: 0.78rem;
		color: var(--muted-foreground);
		margin: 0 0 0.4rem;
	}

	.ai-tool__rows {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.ai-tool__rows li {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.74rem;
		color: var(--foreground);
		padding: 0.3rem 0.55rem;
		background: var(--muted);
		border-radius: 6px;
	}

	/* Draft email */
	.ai-draft {
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--card);
		animation: ai-chat-fade 220ms ease;
		overflow: hidden;
	}

	.ai-draft__head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 0.75rem;
		border-bottom: 1px solid var(--border);
		background: color-mix(in oklch, var(--primary) 5%, var(--card));
	}

	.ai-draft__icon {
		display: grid;
		place-items: center;
		width: 22px;
		height: 22px;
		border-radius: 6px;
		background: color-mix(in oklch, var(--primary) 12%, transparent);
		color: var(--primary);
	}

	.ai-draft__label {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--foreground);
	}

	.ai-draft__meta {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.25rem 0.75rem;
		padding: 0.6rem 0.75rem 0.4rem;
		margin: 0;
	}

	.ai-draft__meta dt {
		font-size: 0.7rem;
		color: var(--muted-foreground);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 500;
	}

	.ai-draft__meta dd {
		font-size: 0.8rem;
		color: var(--foreground);
		margin: 0;
	}

	.ai-draft__body {
		margin: 0;
		padding: 0.65rem 0.75rem 0.85rem;
		font-family: var(--font-sans);
		font-size: 0.8rem;
		line-height: 1.5;
		color: var(--foreground);
		white-space: pre-wrap;
		word-break: break-word;
		border-top: 1px solid var(--border);
		background: var(--background);
	}

	/* Event card */
	.ai-event {
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--card);
		padding: 0.6rem 0.75rem 0.75rem;
		animation: ai-chat-fade 220ms ease;
	}

	.ai-event__head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.4rem;
	}

	.ai-event__icon {
		display: grid;
		place-items: center;
		width: 22px;
		height: 22px;
		border-radius: 6px;
		background: color-mix(in oklch, var(--primary) 12%, transparent);
		color: var(--primary);
	}

	.ai-event__label {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted-foreground);
		font-weight: 500;
	}

	.ai-event__title {
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--foreground);
		margin: 0 0 0.4rem;
	}

	.ai-event__meta {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.2rem 0.65rem;
		margin: 0;
	}

	.ai-event__meta dt {
		font-size: 0.7rem;
		color: var(--muted-foreground);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 500;
	}

	.ai-event__meta dd {
		font-size: 0.78rem;
		color: var(--foreground);
		margin: 0;
	}

	/* Status */
	.ai-status {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.7rem;
		border-radius: 9999px;
		font-size: 0.78rem;
		font-weight: 500;
		align-self: flex-start;
		animation: ai-chat-fade 220ms ease;
	}

	.ai-status--success {
		background: color-mix(in oklch, oklch(0.7 0.18 145) 15%, transparent);
		color: oklch(0.42 0.13 145);
		border: 1px solid color-mix(in oklch, oklch(0.7 0.18 145) 30%, transparent);
	}

	.ai-status--info {
		background: color-mix(in oklch, var(--primary) 14%, transparent);
		color: var(--primary);
		border: 1px solid color-mix(in oklch, var(--primary) 30%, transparent);
	}

	.ai-status--warning {
		background: color-mix(in oklch, oklch(0.78 0.15 75) 18%, transparent);
		color: oklch(0.48 0.13 65);
		border: 1px solid color-mix(in oklch, oklch(0.78 0.15 75) 35%, transparent);
	}

	.ai-status__icon {
		display: inline-flex;
	}

	/* Composer */
	.ai-chat__composer {
		padding: 0.75rem 1.5rem 1.25rem;
		background: linear-gradient(
			to top,
			var(--background) 60%,
			color-mix(in oklch, var(--background) 0%, transparent)
		);
	}

	.ai-chat__form {
		max-width: 760px;
		margin: 0 auto;
		display: flex;
		align-items: flex-end;
		gap: 0.5rem;
		padding: 0.5rem 0.5rem 0.5rem 0.85rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 18px;
		box-shadow: 0 6px 20px -10px rgb(0 0 0 / 0.18);
		transition: border-color 140ms ease, box-shadow 140ms ease;
	}

	.ai-chat__form:focus-within {
		border-color: color-mix(in oklch, var(--primary) 50%, var(--border));
		box-shadow: 0 6px 20px -8px color-mix(in oklch, var(--primary) 30%, transparent);
	}

	.ai-chat__form textarea {
		flex: 1;
		resize: none;
		border: 0;
		outline: 0;
		background: transparent;
		font: inherit;
		font-size: 0.9rem;
		line-height: 1.45;
		color: var(--foreground);
		padding: 0.55rem 0;
		max-height: 200px;
		box-shadow: none;
		--tw-ring-shadow: 0 0 #0000;
		--tw-ring-offset-shadow: 0 0 #0000;
	}

	.ai-chat__form textarea:focus,
	.ai-chat__form textarea:focus-visible {
		outline: 0;
		border: 0;
		box-shadow: none;
		--tw-ring-shadow: 0 0 #0000;
		--tw-ring-offset-shadow: 0 0 #0000;
		--tw-ring-color: transparent;
	}

	.ai-chat__form textarea::placeholder {
		color: var(--muted-foreground);
	}

	.ai-chat__send {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 9999px;
		background: var(--primary);
		color: var(--primary-foreground);
		transition: opacity 140ms ease, transform 140ms ease;
	}

	.ai-chat__send:hover:not(:disabled) {
		opacity: 0.9;
	}

	.ai-chat__send:active:not(:disabled) {
		transform: translateY(1px);
	}

	.ai-chat__send:disabled {
		background: var(--muted);
		color: var(--muted-foreground);
		cursor: not-allowed;
	}

	.ai-chat__disclaimer {
		max-width: 760px;
		margin: 0.5rem auto 0;
		font-size: 0.7rem;
		color: var(--muted-foreground);
		text-align: center;
	}
</style>
