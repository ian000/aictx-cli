---
name: "aictx-element-plus"
description: "Expert guide for Vue 3 + Element Plus + Tailwind + SCSS development. invoke when developing UI components, styling, or needing Element Plus API references to avoid hallucinations."
---

# Element Plus Expert

This skill provides comprehensive guidance for developing UI components using the **Vue 3 + Element Plus + Tailwind CSS + SCSS** stack. It maps the official Element Plus documentation structure to ensure accurate API usage and styling.

## 1. Tech Stack & Configuration
- **Core**: Vue 3 (Composition API, `<script setup lang="ts">`)
- **UI Library**: Element Plus (Auto-import enabled)
- **Styling**: 
  - **Tailwind CSS**: Utility-first classes for layout, spacing, colors.
  - **SCSS**: Custom component styling, overrides, and complex logic.
- **Icons**: `@element-plus/icons-vue` (Auto-import or manual import as needed).

## 2. Component Development Guide

### 2.1 Basic Component Structure
Always use the following template for new components:

```vue
<template>
  <div class="component-name">
    <!-- Use Element Plus components with Tailwind utility classes -->
    <el-card class="w-full max-w-4xl mx-auto" shadow="hover">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg font-bold">Title</span>
          <el-button type="primary" :icon="Plus">Add Item</el-button>
        </div>
      </template>
      
      <!-- Content -->
      <slot />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'

// Props & Emits
interface Props {
  modelValue?: string
}
const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

// Logic
</script>

<style scoped lang="scss">
.component-name {
  // Use SCSS for complex overrides that Tailwind cannot handle easily
  :deep(.el-card__header) {
    padding: 1rem;
  }
}
```

### 2.2 Common Components & API Mapping

#### Form Components
- **Input**: `<el-input v-model="val" placeholder="..." clearable />`
- **Select**: `<el-select v-model="val"><el-option ... /></el-select>`
- **DatePicker**: `<el-date-picker v-model="date" type="date" />`
- **Form**: `<el-form :model="form" :rules="rules" ref="formRef">`
  - Use `ref<FormInstance>` for type safety.

#### Data Display
- **Table**: `<el-table :data="tableData" stripe border>`
  - Columns: `<el-table-column prop="date" label="Date" width="180" />`
  - Custom Slot: `<template #default="scope">`
- **Pagination**: `<el-pagination v-model:current-page="page" :page-size="size" layout="total, prev, pager, next" />`

#### Feedback
- **Message**: `import { ElMessage } from 'element-plus'; ElMessage.success('Success')`
- **Dialog**: `<el-dialog v-model="visible" title="Title">`

### 2.3 Internationalization (i18n)
- Element Plus provides built-in i18n.
- Ensure `ElConfigProvider` wraps the app (usually in `App.vue`) with the correct locale.
- Usage: `import zhCn from 'element-plus/dist/locale/zh-cn.mjs'`

### 2.4 Dark Mode
- Element Plus supports dark mode via the `dark` class on the `html` tag.
- Tailwind's `dark:` variant works seamlessly with this.
- Custom SCSS should use CSS variables (e.g., `var(--el-bg-color)`) to adapt automatically.

## 3. Best Practices & Anti-Hallucination Rules

1.  **Check API Existence**: Before using a prop or event, verify it exists in the Element Plus version being used.
    - *Wrong*: `<el-button size="huge">` (Size 'huge' does not exist)
    - *Right*: `<el-button size="large">`
2.  **Tailwind vs Element**: 
    - Use **Tailwind** for margins (`m-4`), padding (`p-4`), width/height (`w-full`), flexbox (`flex`), and colors (`text-blue-500`).
    - Use **Element Plus props** for component-specific behavior (e.g., `type="primary"`, `disabled`, `loading`).
3.  **Icon Usage**: 
    - Icons are separate components. Import them from `@element-plus/icons-vue`.
    - Usage: `<el-icon><Edit /></el-icon>` or directly in buttons `<el-button :icon="Edit" />`.

## 4. Implementation Steps for UI Tasks
1.  **Analyze Requirement**: Identify necessary components (e.g., "Login Form" -> `el-form`, `el-input`, `el-button`).
2.  **Scaffold**: Create Vue file with `<script setup lang="ts">`.
3.  **Layout**: Use Tailwind grid/flex classes for structure.
4.  **Components**: Insert Element Plus components.
5.  **Bind Data**: Setup `ref`/`reactive` state.
6.  **Style Refinement**: Apply Tailwind utility classes for fine-tuning; use SCSS only if necessary for deep overrides.
