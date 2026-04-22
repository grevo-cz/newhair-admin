<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { ComponentItem, ComponentType, TimeOfDay } from '@/types';
import { COMPONENT_TYPE_LABELS, TIME_OF_DAY_LABELS } from '@/types';
import { PICKER_ICONS } from '@/composables/useIcon';
import AppInput from '@/components/shared/AppInput.vue';
import AppSelect from '@/components/shared/AppSelect.vue';
import AppTextarea from '@/components/shared/AppTextarea.vue';
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue';
import IconPicker from '@/components/shared/IconPicker.vue';
import { useVideosStore } from '@/stores/videosStore';
import { X } from 'lucide-vue-next';

const props = defineProps<{ modelValue: ComponentItem }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: ComponentItem): void }>();

const videos = useVideosStore();

const form = reactive<ComponentItem>({ ...props.modelValue, dangerItems: props.modelValue.dangerItems ? [...props.modelValue.dangerItems] : undefined, notification: props.modelValue.notification ? { ...props.modelValue.notification } : undefined });

watch(
  form,
  (v) => emit('update:modelValue', { ...v, dangerItems: v.dangerItems ? [...v.dangerItems] : undefined }),
  { deep: true },
);

const typeOptions: { value: ComponentType; label: string; className: string }[] = [
  { value: 'info', label: 'Info', className: 'bg-[#EFF8FE] text-[#0E6EA0]' },
  { value: 'instrukce', label: 'Instrukce', className: 'bg-white border-border-subtle text-brand-dark' },
  { value: 'varovani', label: 'Varování', className: 'bg-[#FFFBEB] text-brand-amber' },
  { value: 'nebezpeci', label: 'Nebezpečí', className: 'bg-[#FEF2F2] text-brand-red' },
  { value: 'uspech', label: 'Úspěch', className: 'bg-[#F0FCF5] text-[#159344]' },
];

function addDanger() {
  const text = prompt('Text zákazu:');
  if (!text) return;
  form.dangerItems = [...(form.dangerItems ?? []), { id: crypto.randomUUID(), text, order: (form.dangerItems?.length ?? 0) }];
}
function removeDanger(id: string) {
  form.dangerItems = (form.dangerItems ?? []).filter((d) => d.id !== id);
}

function toggleNotification(v: boolean) {
  if (v) {
    form.notification = form.notification ?? { enabled: true, time: '09:00', actionType: 'dashboard' };
    form.notification.enabled = true;
  } else {
    if (form.notification) form.notification.enabled = false;
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Type selector -->
    <div>
      <span class="block text-sm font-medium text-slate-700 mb-2">Typ komponenty</span>
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="opt in typeOptions"
          :key="opt.value"
          type="button"
          :class="[
            'text-sm font-medium rounded-xl border px-3 py-2 transition-colors',
            opt.className,
            form.type === opt.value ? 'ring-2 ring-brand-orange ring-offset-1' : 'opacity-70 hover:opacity-100',
          ]"
          @click="form.type = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="grid grid-cols-2 gap-4">
      <AppInput v-model="form.name" label="Název" required />
      <IconPicker v-model="form.icon" label="Ikona" />
    </div>

    <AppInput v-model="form.shortDescription" label="Krátký popis (v přehledu)" />

    <div class="flex items-center gap-3 pt-1">
      <ToggleSwitch v-model="form.hasDetail" label="Má detail stránku" />
    </div>
    <AppTextarea
      v-if="form.hasDetail"
      v-model="form.detailRichtext"
      label="Obsah detailu (markdown)"
      :rows="5"
      hint="Podporuje # nadpis, **tučné**, seznamy."
    />

    <!-- Completion -->
    <div class="bg-slate-50 rounded-xl p-4 space-y-3">
      <div class="flex items-center gap-4 flex-wrap">
        <ToggleSwitch v-model="form.requiresCompletion" label="Vyžaduje splnění (checkbox)" />
        <ToggleSwitch v-model="form.requiresPhoto" label="Vyžaduje nahrání fotky" :disabled="!form.requiresCompletion" />
      </div>
      <div class="grid grid-cols-3 gap-3">
        <AppSelect
          v-model="form.timeOfDay as unknown as string"
          label="Čas dne"
          :options="Object.entries(TIME_OF_DAY_LABELS).map(([value, label]) => ({ value, label }))"
          placeholder="—"
        />
        <AppInput
          v-model.number="form.pointsForCompletion"
          type="number"
          label="Body za splnění"
        />
        <AppSelect
          :model-value="form.videoId ?? ''"
          label="Doporučené video"
          placeholder="Žádné"
          :options="[{ value: '', label: '— Žádné —' }, ...videos.list.map((v) => ({ value: v.id, label: v.name }))]"
          @update:model-value="(v) => (form.videoId = v || undefined)"
        />
      </div>
    </div>

    <!-- Danger list -->
    <div v-if="form.type === 'nebezpeci'" class="bg-[#FEF2F2] rounded-xl p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-semibold text-brand-red">Seznam zákazů</span>
        <button type="button" class="text-sm text-brand-red underline" @click="addDanger">+ Přidat položku</button>
      </div>
      <ul class="flex flex-wrap gap-2">
        <li
          v-for="d in form.dangerItems ?? []"
          :key="d.id"
          class="inline-flex items-center gap-1.5 bg-white rounded-full text-sm text-brand-red pl-3 pr-1 py-1 border border-red-200"
        >
          ❌ {{ d.text }}
          <button type="button" class="p-0.5 rounded-full hover:bg-red-100" @click="removeDanger(d.id)">
            <X :size="12" />
          </button>
        </li>
        <li v-if="!form.dangerItems?.length" class="text-xs text-brand-red/70">Zatím žádné.</li>
      </ul>
    </div>

    <!-- Notification -->
    <div class="bg-slate-50 rounded-xl p-4">
      <ToggleSwitch
        :model-value="!!form.notification?.enabled"
        label="Poslat notifikaci v určitý čas"
        @update:model-value="toggleNotification"
      />
      <div v-if="form.notification?.enabled" class="grid grid-cols-3 gap-3 mt-3">
        <AppInput v-model="form.notification.time" type="time" label="Čas odeslání" required />
        <AppInput
          v-model="form.notification.text"
          label="Text (fallback = název)"
        />
        <AppSelect
          v-model="form.notification.actionType"
          label="Akce po kliknutí"
          :options="[
            { value: 'detail', label: 'Otevřít detail' },
            { value: 'dashboard', label: 'Dashboard' },
          ]"
        />
      </div>
    </div>
  </div>
</template>
