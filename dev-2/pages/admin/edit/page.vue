<!-- pages/admin/edit/page.vue -->
<script setup lang="ts">
import type { ViewUpdate } from "@codemirror/view";
import { html } from "@codemirror/lang-html";
import { basicSetup } from "codemirror";

// Code

const route = useRoute();
const { $pb } = useNuxtApp();
const pageId = route.query.id;
const page = ref(null);
const activeTab = ref("Content");
const isLoading = ref(true);

// Editor state
const content = ref("");
const title = ref("");
const path = ref("");
const excerpt = ref("");
const codemirror = ref<CodeMirrorRef>();

// Editor configuration
const extensions = [basicSetup, html()];
const theme = ref<"light" | "dark">("light");

// Editor options
const editorOptions = {
  autofocus: true,
  tabSize: 2,
  lineNumbers: true,
  mode: "html",
};

// Editor event handlers
const handleChange = (value: string, viewUpdate: ViewUpdate) => {
  content.value = value;
};

const handleStatistics = (stats: Statistics) => {
  console.log("Editor statistics:", stats);
};

const handleUpdate = (viewUpdate: ViewUpdate) => {
  console.log("Editor updated:", viewUpdate);
};

// Preview URL
const previewUrl = computed(() => {
  if (!page.value?.name) return "";
  return process.client ? `${window.location.origin}${page.value.name}` : "";
});

// Add parts state
const parts = ref<string[]>([]);
const availableParts = ref([]);

// Load available parts
const loadParts = async () => {
  try {
    const result = await $pb.collection("posts").getList(1, 50, {
      filter: "type='part'",
      sort: "name",
    });
    availableParts.value = result.items;
    console.log("Loaded parts:", availableParts.value);
  } catch (error) {
    console.error("Failed to load parts:", error);
  }
};

// Load page data
const loadPage = async () => {
  try {
    isLoading.value = true;
    const result = await $pb.collection("posts").getOne(pageId, {
      expand: "objects",
    });

    page.value = result;
    content.value = result.content;
    title.value = result.title;
    path.value = result.name;
    excerpt.value = result.excerpt;
    parts.value = result.objects || [];

    await loadParts();
  } catch (error) {
    console.error("Failed to load page:", error);
  } finally {
    isLoading.value = false;
  }
};

// Save page data
const handleSave = async () => {
  try {
    isLoading.value = true;
    await $pb.collection("posts").update(page.value.id, {
      content: content.value,
      title: title.value,
      name: path.value,
      excerpt: excerpt.value,
      objects: parts.value,
    });
    alert("Saved successfully");
  } catch (error) {
    console.error("Failed to save:", error);
    alert("Failed to save");
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadPage);
</script>

<template>
  <NuxtLayout name="admin">
    <div v-if="isLoading">Loading...</div>
    <div v-else class="editor-layout">
      <!-- Editor Panel -->
      <div class="editor-panel">
        <div class="tab-buttons">
          <button
            v-for="tab in ['Content', 'Settings', 'Parts']"
            :key="tab"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Content Editor -->
        <div v-if="activeTab === 'Content'" class="editor-container">
          <ClientOnly>
            <NuxtCodeMirror
              ref="codemirror"
              v-model="content"
              class="code-editor"
              :extensions="extensions"
              :theme="theme"
              placeholder="Enter HTML content..."
              :auto-focus="true"
              :basic-setup="true"
              :indent-with-tab="true"
              :editable="true"
              @on-change="handleChange"
              @statistics="handleStatistics"
              @on-update="handleUpdate"
            />
          </ClientOnly>
        </div>

        <!-- Settings Form -->
        <div v-if="activeTab === 'Settings'" class="settings-form">
          <div class="form-group">
            <label>Title</label>
            <input v-model="title" type="text" />
          </div>
          <div class="form-group">
            <label>Path</label>
            <input v-model="path" type="text" />
          </div>
          <div class="form-group">
            <label>Excerpt</label>
            <textarea v-model="excerpt"></textarea>
          </div>
        </div>

        <!-- Parts Form -->
        <div v-if="activeTab === 'Parts'" class="parts-form">
          <h3>Page Parts</h3>
          <div class="parts-list">
            <div
              v-for="part in availableParts"
              :key="part.id"
              class="part-item"
            >
              <label>
                <input type="checkbox" :value="part.id" v-model="parts" />
                {{ part.title }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="preview-panel">
        <iframe
          v-if="previewUrl"
          :src="previewUrl"
          class="preview-iframe"
        ></iframe>
      </div>

      <!-- Controls -->
      <div class="button-controls">
        <button @click="navigateTo('/admin/pages')" class="btn-back">
          ← Back
        </button>
        <button @click="handleSave" class="btn-save" :disabled="isLoading">
          💾 Save
        </button>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.editor-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  height: calc(100vh - 100px);
  padding: 1rem;
}

.editor-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid gray;
}

.tab-buttons {
  display: flex;
  border-bottom: 1px solid gray;
}

.tab-buttons button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
}

.tab-buttons button.active {
  border-bottom: 2px solid black;
}

.editor-container,
.settings-form {
  flex: 1;
  padding: 1rem;
}

.code-editor {
  width: 100%;
  height: 100%;
  font-family: monospace;
  border: none;
  resize: none;
}

.parts-form {
  padding: 1rem;
}

.parts-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.part-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.part-item:hover {
  background: #f8f9fa;
}

.part-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.preview-panel {
  border: 1px solid gray;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }
}

.button-controls {
  top: 1rem;
  display: flex;
  height: fit-content;
  gap: 1rem;
  padding: 0rem 1rem;
}

.btn-save,
.btn-back {
  cursor: pointer;
}

.btn-save {
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
