<script lang="ts">
    import type { supplierTask } from "$lib/data/embeds/supplierTasks";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        Calendar03Icon,
        Clock01Icon,
        Location01Icon,
        WrenchIcon,
        ViewIcon,
    } from "@hugeicons/core-free-icons";
    import { Badge } from "$lib/components/ui/badge";
    import { formatChatTime } from "$lib/utils/dates";

    interface Props {
        task: supplierTask;
        isOwn?: boolean;
    }

    let { task, isOwn = false }: Props = $props();

    const isVisit = $derived(task.type === "sopralluogo");

    function getTaskTime() {
        if (task.createdAt) return formatChatTime(task.createdAt);
        return formatChatTime(`${task.date}T${task.startTime}`);
    }
</script>

<div class="flex flex-col {isOwn ? 'items-end' : 'items-start'} w-full mb-1">
    <div
        class="w-full max-w-85 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 {isOwn
            ? 'rounded-tr-none'
            : 'rounded-tl-none'}"
    >
        <div class="flex items-center gap-3 bg-slate-50/50 px-4 py-3">
            <div
                class="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700"
            >
                <HugeiconsIcon
                    icon={isVisit ? ViewIcon : WrenchIcon}
                    size={18}
                />
            </div>
            <div class="min-w-0">
                <span
                    class="text-[11px] font-bold uppercase tracking-wider text-slate-700"
                >
                    Intervento pianificato
                </span>
            </div>
        </div>

        <div class="px-4 py-4">
            <div class="items-start justify-between gap-3">
                <h4 class="text-sm font-semibold text-slate-900 leading-tight">
                    {task.title}
                </h4>
                <p
                    class="text-[11px] text-slate-500 uppercase tracking-[0.18em] mt-1"
                >
                    {task.type}
                </p>
            </div>

            <div class="mt-4 grid gap-3 text-sm text-slate-600">
                <div class="flex items-center gap-2.5 text-slate-700">
                    <div class="p-1.5 bg-slate-100 rounded-lg text-slate-400">
                        <HugeiconsIcon icon={Calendar03Icon} size={14} />
                    </div>
                    <span>{task.date}</span>
                </div>
                <div class="flex items-center gap-2.5 text-slate-700">
                    <div class="p-1.5 bg-slate-100 rounded-lg text-slate-400">
                        <HugeiconsIcon icon={Clock01Icon} size={14} />
                    </div>
                    <span>{task.startTime} - {task.endTime}</span>
                </div>
                <div class="flex items-center gap-2.5 text-slate-500">
                    <div class="p-1.5 bg-slate-100 rounded-lg text-slate-400">
                        <HugeiconsIcon icon={Location01Icon} size={14} />
                    </div>
                    <span class="line-clamp-1">{task.location}</span>
                </div>
            </div>
        </div>
    </div>
    <span class="mt-1 px-1 text-[10px] font-medium text-slate-400"
        >{getTaskTime()}</span
    >
</div>
