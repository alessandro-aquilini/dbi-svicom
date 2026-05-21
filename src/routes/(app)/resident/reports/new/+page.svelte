<script lang="ts">
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowUp01Icon,
		BubbleChatIcon,
		Building03Icon,
		DropletIcon,
		File01Icon,
		Flag03Icon,
		LightbulbOffIcon,
		Location01Icon,
		Note01Icon,
		SparklesIcon,
		Tag01Icon,
		Wrench01Icon
	} from '@hugeicons/core-free-icons';
	import { ResidentEmptyCard } from '$lib/components/view-resident/resident';
	import {
		buildResidentTicketAttachmentSummary,
		buildResidentTicketAiDraft,
		createResidentLocalTicketWithPresentation,
		getResidentTicketCategoryOption,
		getResidentTicketDynamicFields,
		getResidentTicketPriorityOption,
		residentTicketCategoryOptions,
		residentTicketPriorityOptions,
		sanitizeResidentTicketPriority,
		ticketStatusLabels,
		type ResidentTicketFieldAnswer
	} from '$lib/components/view-resident/reports';
	import { DemoDialog, InfoTip } from '$lib/components/shared';
	import { getCurrentUser } from '$lib/auth';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentById } from '$lib/data/residents';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';

	type ReportFormState = {
		title: string;
		category: string;
		priority: string;
		description: string;
	};

	type ReportFormErrors = Partial<Record<keyof ReportFormState, string>>;
	type ComposeMode = 'manual' | 'ai';
	type AiStage = 'idle' | 'thinking' | 'building' | 'done';

	type AiExample = {
		icon: typeof SparklesIcon;
		label: string;
		hint: string;
		text: string;
	};

	type AiFact = {
		icon: typeof Tag01Icon;
		label: string;
		value: string;
	};

	const currentUser = getCurrentUser();
	const resident = $derived(currentUser ? getResidentById(currentUser.id) : undefined);
	const property = $derived(resident ? getPropertyById(resident.propertyId) : undefined);

	let form = $state<ReportFormState>({
		title: '',
		category: residentTicketCategoryOptions[0]?.value ?? '',
		priority: 'media',
		description: ''
	});
	let dynamicAnswers = $state<Record<string, string>>({});
	let errors = $state<ReportFormErrors>({});
	let dynamicFieldErrors = $state<Record<string, string>>({});
	let attachmentSummaries = $state<ReturnType<typeof buildResidentTicketAttachmentSummary>>([]);
	let isSubmitting = $state(false);
	let composeMode = $state<ComposeMode>('manual');
	let aiPrompt = $state('');
	let aiStage = $state<AiStage>('idle');
	let aiFacts = $state<AiFact[]>([]);
	let aiRevealedFacts = $state(0);
	let aiApplied = $state(false);
	let aiLastPrompt = $state('');
	let demoOpen = $state(false);
	let aiThreadEndEl: HTMLDivElement | null = $state(null);

	const aiExamples: AiExample[] = [
		{
			icon: DropletIcon,
			label: "Perdita d'acqua",
			hint: 'Locale caldaia · da stamattina',
			text: "C'è una perdita d'acqua nel locale caldaia della scala B e da stamattina si sente odore di umido."
		},
		{
			icon: LightbulbOffIcon,
			label: 'Luce non funzionante',
			hint: 'Secondo piano · area buia',
			text: 'La lampadina del pianerottolo al secondo piano e spenta da ieri sera e la zona resta buia.'
		},
		{
			icon: Wrench01Icon,
			label: 'Portone da sistemare',
			hint: 'Ingresso principale',
			text: "Il portone d'ingresso principale non chiude bene e rimane spesso socchiuso."
		}
	];

	const selectedCategory = $derived(getResidentTicketCategoryOption(form.category));
	const selectedPriority = $derived(getResidentTicketPriorityOption(form.priority));
	const dynamicFields = $derived(getResidentTicketDynamicFields(form.category));

	function setField<K extends keyof ReportFormState>(field: K, value: ReportFormState[K]) {
		form[field] = value;

		if (errors[field]) {
			errors = { ...errors, [field]: undefined };
		}
	}

	function setDynamicAnswer(fieldId: string, value: string) {
		dynamicAnswers[fieldId] = value;
		if (dynamicFieldErrors[fieldId]) {
			const { [fieldId]: _removed, ...rest } = dynamicFieldErrors;
			dynamicFieldErrors = rest;
		}
	}

	function handleAttachmentsChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		attachmentSummaries = input.files ? buildResidentTicketAttachmentSummary(input.files) : [];
	}

	function useAiExample(text: string) {
		aiPrompt = text;
	}

	function resetAiFeedback() {
		aiStage = 'idle';
		aiFacts = [];
		aiRevealedFacts = 0;
		aiApplied = false;
		aiLastPrompt = '';
	}

	function scrollAiThreadIntoView() {
		setTimeout(() => {
			aiThreadEndEl?.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}, 0);
	}

	function buildAiFacts(): AiFact[] {
		const categoryLabel = getResidentTicketCategoryOption(form.category)?.label ?? form.category;
		const priorityLabel = getResidentTicketPriorityOption(form.priority)?.label ?? form.priority;
		const facts: AiFact[] = [
			{ icon: File01Icon, label: 'Titolo', value: form.title },
			{ icon: Tag01Icon, label: 'Categoria', value: categoryLabel },
			{ icon: Flag03Icon, label: 'Priorita', value: priorityLabel },
			{ icon: Note01Icon, label: 'Descrizione', value: form.description }
		];

		if (property) {
			facts.push({ icon: Building03Icon, label: 'Condominio', value: property.name });
		}

		const firstFilledDynamicField = dynamicFields.find((field) => dynamicAnswers[field.id]?.trim());
		if (firstFilledDynamicField) {
			facts.push({
				icon: Location01Icon,
				label: firstFilledDynamicField.label,
				value: dynamicAnswers[firstFilledDynamicField.id]
			});
		}

		return facts;
	}

	async function runAiCompilation() {
		if (!aiPrompt.trim()) return;

		const prompt = aiPrompt.trim();
		const draft = buildResidentTicketAiDraft(prompt);
		const nextDynamicAnswers = { ...draft.dynamicAnswers };

		errors = {};
		dynamicFieldErrors = {};
		aiStage = 'thinking';
		aiApplied = false;
		aiLastPrompt = prompt;
		aiFacts = [];
		aiRevealedFacts = 0;
		isSubmitting = false;
		await tick();
		scrollAiThreadIntoView();

		await new Promise((resolve) => setTimeout(resolve, 900));

		aiStage = 'building';
		form.title = '';
		form.category = residentTicketCategoryOptions[0]?.value ?? draft.category;
		form.priority = 'media';
		form.description = '';
		dynamicAnswers = {};
		await tick();

		const steps: Array<() => Promise<void> | void> = [
			() => setField('title', draft.title),
			async () => {
				setField('category', draft.category);
				await tick();
			},
			() => setField('priority', draft.priority),
			() => setField('description', draft.description),
			...Object.entries(nextDynamicAnswers).map(
				([fieldId, value]) => () => setDynamicAnswer(fieldId, value)
			)
		];

		for (const [index, step] of steps.entries()) {
			step();
			await tick();
			aiFacts = buildAiFacts();
			aiRevealedFacts = Math.min(index + 1, aiFacts.length);
			scrollAiThreadIntoView();
			const stepDelay = index < 4 ? 620 : 340;
			await new Promise((resolve) => setTimeout(resolve, stepDelay));
		}

		aiStage = 'done';
		aiFacts = buildAiFacts();
		aiRevealedFacts = aiFacts.length;
		aiApplied = true;
		await tick();
		scrollAiThreadIntoView();
	}

	function validateForm(): boolean {
		const nextErrors: ReportFormErrors = {};
		const nextDynamicFieldErrors: Record<string, string> = {};

		if (form.title.trim().length < 6) {
			nextErrors.title = 'Inserisci un titolo di almeno 6 caratteri.';
		}

		if (!form.category) {
			nextErrors.category = 'Seleziona una categoria disponibile.';
		}

		if (!form.priority) {
			nextErrors.priority = 'Seleziona una priorita.';
		}

		if (form.description.trim().length < 20) {
			nextErrors.description = 'Aggiungi una descrizione di almeno 20 caratteri.';
		}

		for (const field of dynamicFields) {
			if (!dynamicAnswers[field.id]?.trim()) {
				nextDynamicFieldErrors[field.id] = 'Completa questo campo prima di inviare la segnalazione.';
			}
		}

		errors = nextErrors;
		dynamicFieldErrors = nextDynamicFieldErrors;
		return Object.keys(nextErrors).length === 0 && Object.keys(nextDynamicFieldErrors).length === 0;
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (!currentUser || !resident || !property || !validateForm()) {
			return;
		}

		demoOpen = true;
	}

	async function handleDemoConfirm() {
		if (!currentUser || !resident || !property || isSubmitting) {
			return;
		}

		isSubmitting = true;

		const fieldAnswers: ResidentTicketFieldAnswer[] = dynamicFields.map((field) => ({
			id: field.id,
			label: field.label,
			value: dynamicAnswers[field.id]?.trim() ?? ''
		}));

		const ticket = createResidentLocalTicketWithPresentation(
			{
				title: form.title,
				description: form.description,
				priority: sanitizeResidentTicketPriority(form.priority),
				category: form.category,
				reportedById: currentUser.id,
				propertyId: property.id
			},
			{
				attachments: attachmentSummaries,
				fieldAnswers
			}
		);

		await goto(`/resident/reports?created=1&report=${ticket.id}`);
	}

	function handleAiPromptKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			runAiCompilation();
		}
	}
</script>

<svelte:head>
	<title>Nuova segnalazione - Residente - Svicom Living Hub</title>
</svelte:head>

<div class="reports-page reports-page--detail">
	<Button href="/resident/reports" variant="link" class="report-back-button">
		&lt; Tutte le segnalazioni
	</Button>

	{#if !currentUser || !resident || !property}
		<ResidentEmptyCard
			title="Profilo residente non disponibile"
			copy="Non e possibile creare una segnalazione senza un profilo residente attivo."
		/>
	{:else}
		<div class="report-detail-stack">
			<Card class="report-hero-card report-hero-card--compact">
				<CardHeader class="report-hero-card__header">
					<div class="report-hero-card__heading">
						<p class="report-hero-card__eyebrow">Nuova pratica</p>
						<CardTitle class="report-hero-card__title">Apri una segnalazione</CardTitle>
					</div>
				</CardHeader>

				<CardContent class="report-hero-card__content">
					<div class="report-create-brief">
						<div class="report-create-brief__item">
							<p class="report-create-brief__label">Cos e</p>
							<p class="report-create-brief__value">Una richiesta inviata all amministrazione</p>
							<p class="report-create-brief__copy">Serve per guasti, anomalie o richieste operative sul tuo stabile.</p>
						</div>
						<div class="report-create-brief__item">
							<p class="report-create-brief__label">Come si crea</p>
							<p class="report-create-brief__value">Compila i campi oppure racconta il problema</p>
							<p class="report-create-brief__copy">Puoi partire da zero oppure farti aiutare nella precompilazione.</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card class="report-form-card">
				<CardHeader class="report-section-card__header">
					<div class="report-form-card__header-row">
						<div>
							<CardTitle class="report-section-card__title">Dettagli della segnalazione</CardTitle>
							<CardDescription class="report-section-card__copy">
								Scegli come vuoi compilare la segnalazione, poi controlla i campi e invia.
							</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent class="report-form-card__content">
					<form class="report-form" onsubmit={handleSubmit}>
						<div class="report-mode-segmented-wrap">
							<div class="resident-heading-with-tip resident-heading-with-tip--compact">
								<p class="report-mode-segmented__label">Modalita di compilazione</p>
								<InfoTip text="Compila i campi a mano oppure racconta il problema e lascia che la segnalazione venga precompilata." />
							</div>

							<div class="report-mode-segmented" role="tablist" aria-label="Modalita di compilazione">
								<button
									type="button"
									role="tab"
									aria-selected={composeMode === 'manual'}
									class="report-mode-segmented__option"
									class:is-active={composeMode === 'manual'}
									onclick={() => {
										composeMode = 'manual';
										resetAiFeedback();
									}}
								>
									<HugeiconsIcon icon={File01Icon} size={14} strokeWidth={2} />
									<span>Compila</span>
								</button>
								<button
									type="button"
									role="tab"
									aria-selected={composeMode === 'ai'}
									class="report-mode-segmented__option"
									class:is-active={composeMode === 'ai'}
									onclick={() => (composeMode = 'ai')}
								>
									<HugeiconsIcon icon={BubbleChatIcon} size={14} strokeWidth={2} />
									<span>Racconta</span>
								</button>
							</div>
						</div>

						{#if composeMode === 'ai'}
							<div class="report-ai-composer">
								<div class="report-ai-composer__examples">
									<p class="report-ai-composer__label">Suggerimenti rapidi</p>
									<div class="report-ai-composer__chips">
										{#each aiExamples as example}
											<button
												type="button"
												class="report-ai-composer__chip"
												onclick={() => useAiExample(example.text)}
											>
												<span class="report-ai-composer__chip-icon" aria-hidden="true">
													<HugeiconsIcon icon={example.icon} size={14} strokeWidth={1.85} />
												</span>
												<span class="report-ai-composer__chip-text">
													<span class="report-ai-composer__chip-title">{example.label}</span>
													<span class="report-ai-composer__chip-copy">{example.hint}</span>
												</span>
											</button>
										{/each}
									</div>
								</div>

								<div class="report-ai-chat">
									<div class="report-ai-prompt-card">
										<textarea
											rows="5"
											value={aiPrompt}
											oninput={(event: Event) => (aiPrompt = (event.currentTarget as HTMLTextAreaElement).value)}
											onkeydown={handleAiPromptKeydown}
											placeholder="Es. C'e una perdita nel locale caldaia della scala B, da stamattina si vede acqua a terra e manca acqua calda in alcuni appartamenti."
											class="report-ai-prompt-card__input"
										></textarea>
										<div class="report-ai-prompt-card__footer">
											<span class="report-ai-prompt-card__hint">Ctrl/Cmd + Invio per inviare</span>
											<button
												type="button"
												class="report-ai-prompt-card__send"
												disabled={!aiPrompt.trim()}
												aria-label="Invia prompt"
												onclick={runAiCompilation}
											>
												<HugeiconsIcon icon={ArrowUp01Icon} size={16} strokeWidth={2.4} />
											</button>
										</div>
									</div>

									{#if aiStage !== 'idle'}
										<div class="report-ai-thread">
											<div class="report-ai-thread__bubble-wrap">
												<div class="report-ai-thread__user-bubble">{aiLastPrompt}</div>
											</div>

											<div class="report-ai-thread__assistant">
												<div class="report-ai-thread__avatar" aria-hidden="true">
													<HugeiconsIcon icon={SparklesIcon} size={14} strokeWidth={2} />
												</div>

												<div class="report-ai-thread__content">
													{#if aiStage === 'thinking'}
														<div class="report-ai-thinking" aria-label="Sto leggendo">
															<span></span><span></span><span></span>
														</div>
													{:else}
														<p class="report-ai-thread__intro">
															Sto compilando automaticamente la segnalazione con questi dati:
														</p>
														<div class="report-ai-fact-list">
															{#each aiFacts.slice(0, aiRevealedFacts) as fact}
																<div class="report-ai-fact-row">
																	<span class="report-ai-fact-row__icon" aria-hidden="true">
																		<HugeiconsIcon icon={fact.icon} size={14} strokeWidth={1.8} />
																	</span>
																	<div class="report-ai-fact-row__main">
																		<p class="report-ai-fact-row__label">{fact.label}</p>
																		<p class="report-ai-fact-row__value">{fact.value}</p>
																	</div>
																</div>
															{/each}
														</div>
														{#if aiStage === 'done'}
															<p class="report-ai-thread__done">
																Controlla qui sotto i campi compilati e invia la segnalazione quando vuoi.
															</p>
														{/if}
													{/if}
												</div>
											</div>
											<div bind:this={aiThreadEndEl}></div>
										</div>
									{/if}
								</div>
							</div>
						{/if}

						<div class="report-form__field">
							<Label for="report-title">Titolo</Label>
							<Input
								id="report-title"
								name="title"
								placeholder="Es. Ascensore scala B fermo"
								value={form.title}
								oninput={(event: Event) =>
									setField('title', (event.currentTarget as HTMLInputElement).value)}
								aria-invalid={errors.title ? 'true' : undefined}
								class="report-form__input"
							/>
							{#if errors.title}
								<p class="report-form__error">{errors.title}</p>
							{/if}
						</div>

						<div class="report-form__grid">
							<div class="report-form__field">
								<Label for="report-category-trigger">Categoria</Label>
								<Select type="single" bind:value={form.category}>
									<SelectTrigger
										id="report-category-trigger"
										class="report-form__select-trigger"
										aria-invalid={errors.category ? 'true' : undefined}
									>
										{selectedCategory?.label ?? 'Seleziona categoria'}
									</SelectTrigger>
									<SelectContent>
										{#each residentTicketCategoryOptions as option}
											<SelectItem value={option.value} label={option.label} />
										{/each}
									</SelectContent>
								</Select>
								<p class="report-form__hint">{selectedCategory?.copy}</p>
								{#if errors.category}
									<p class="report-form__error">{errors.category}</p>
								{/if}
							</div>

							<div class="report-form__field">
								<Label for="report-priority-trigger">Priorita</Label>
								<Select type="single" bind:value={form.priority}>
									<SelectTrigger
										id="report-priority-trigger"
										class="report-form__select-trigger"
										aria-invalid={errors.priority ? 'true' : undefined}
									>
										{selectedPriority?.label ?? 'Seleziona priorita'}
									</SelectTrigger>
									<SelectContent>
										{#each residentTicketPriorityOptions as option}
											<SelectItem value={option.value} label={option.label} />
										{/each}
									</SelectContent>
								</Select>
								<p class="report-form__hint">{selectedPriority?.copy}</p>
								{#if errors.priority}
									<p class="report-form__error">{errors.priority}</p>
								{/if}
							</div>
						</div>

						{#if dynamicFields.length > 0}
							<div class="report-dynamic-grid">
								{#each dynamicFields as field}
									<div class="report-form__field">
										<Label for={`dynamic-${field.id}`}>{field.label}</Label>
										{#if field.input === 'textarea'}
											<Textarea
												id={`dynamic-${field.id}`}
												rows={4}
												placeholder={field.placeholder}
												value={dynamicAnswers[field.id] ?? ''}
												oninput={(event: Event) =>
													setDynamicAnswer(field.id, (event.currentTarget as HTMLTextAreaElement).value)}
												aria-invalid={dynamicFieldErrors[field.id] ? 'true' : undefined}
												class="report-form__textarea"
											/>
										{:else}
											<Input
												id={`dynamic-${field.id}`}
												placeholder={field.placeholder}
												value={dynamicAnswers[field.id] ?? ''}
												oninput={(event: Event) =>
													setDynamicAnswer(field.id, (event.currentTarget as HTMLInputElement).value)}
												aria-invalid={dynamicFieldErrors[field.id] ? 'true' : undefined}
												class="report-form__input"
											/>
										{/if}
										<p class="report-form__hint">{field.copy}</p>
										{#if dynamicFieldErrors[field.id]}
											<p class="report-form__error">{dynamicFieldErrors[field.id]}</p>
										{/if}
									</div>
								{/each}
							</div>
						{/if}

						<div class="report-form__field">
							<Label for="report-description">Descrizione</Label>
							<Textarea
								id="report-description"
								name="description"
								rows={6}
								placeholder="Descrivi il problema, quando si presenta e che impatto ha nella vita quotidiana."
								value={form.description}
								oninput={(event: Event) =>
									setField('description', (event.currentTarget as HTMLTextAreaElement).value)}
								aria-invalid={errors.description ? 'true' : undefined}
								class="report-form__textarea"
							/>
							{#if errors.description}
								<p class="report-form__error">{errors.description}</p>
							{/if}
						</div>

						<div class="report-form__field">
							<Label for="report-attachments">Foto e allegati</Label>
							<Input
								id="report-attachments"
								type="file"
								accept="image/*"
								multiple
								onchange={handleAttachmentsChange}
								class="report-form__input"
							/>
							<p class="report-form__hint">
								Puoi allegare foto del problema per dare piu contesto alla segnalazione.
							</p>
							{#if attachmentSummaries.length > 0}
								<div class="report-attachments">
									{#each attachmentSummaries as attachment}
										<div class="report-attachments__item">
											<p class="report-attachments__name">{attachment.name}</p>
											<p class="report-attachments__meta">{attachment.typeLabel} · {attachment.sizeLabel}</p>
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<div class="report-form__actions">
							<Button
								type="submit"
								size="lg"
								class="report-form__submit"
								disabled={isSubmitting}
							>
								Invia segnalazione
							</Button>
							<Button
								href="/resident/reports"
								variant="outline"
								size="lg"
								class="report-form__cancel"
								disabled={isSubmitting}
							>
								Annulla
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	{/if}
</div>

<DemoDialog
	bind:open={demoOpen}
	title="Sei in un ambiente demo"
	description="La segnalazione verra aggiunta solo alla demo corrente: non viene inviata ad alcun backend reale e scomparira al refresh."
	cancelLabel="Torna ai campi"
	confirmLabel="Invia comunque"
	onConfirm={handleDemoConfirm}
/>
