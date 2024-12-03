<script setup>
const { $pb } = useNuxtApp();
const currentPart = ref(1);
const perPart = 10;
const isLoading = ref(false);
const searchQuery = ref("");
const showCreateForm = ref(false);
const newPart = ref({
  title: '',
  name: '/',
  content: '',
  excerpt: '',
  type: 'part',
  status: 'publish'
})
let searchTimeout = null;

// Custom debounced search
const handleSearch = () => {
  // Clear existing timeout
  if (searchTimeout) clearTimeout(searchTimeout);

  // Set new timeout
  searchTimeout = setTimeout(() => {
    currentPart.value = 1;
    fetchParts(1);
  }, 300);
};

// Watch search changes
watch(searchQuery, () => {
  handleSearch();
});

// Update fetchParts to include search
const fetchParts = async (part) => {
  isLoading.value = true;
  try {
    const filter = searchQuery.value
      ? `type='part' && (title ~ '${searchQuery.value}' || name ~ '${searchQuery.value}')`
      : "type='part'";

    const result = await $pb.collection("posts").getList(part, perPart, {
      expand: "author",
      filter,
      sort: "-created",
    });
    parts.value = result;
  } finally {
    isLoading.value = false;
  }
};

// Initialize parts data
const parts = ref(
  await $pb.collection("posts").getList(1, perPart, {
    expand: "author",
    filter: "type='part'",
    sort: "-created",
  })
);

// Handle part changes
const changePart = async (newPart) => {
  currentPart.value = newPart;
  await fetchParts(newPart);
};

const domain = computed(() => {
  if (process.client) {
    return window.location.origin;
  }
  return config.public.siteUrl || "";
});

// Add delete handler
const handleDelete = async (partId) => {
  if (confirm("Are you sure you want to delete this part?")) {
    try {
      await $pb.collection("posts").delete(partId);
      await fetchParts(currentPart.value);
    } catch (error) {
      console.error("Error deleting part:", error);
    }
  }
};

// Add edit handler
const handleEdit = (partId) => {
  navigateTo(`/admin/edit/part/?id=${partId}`);
};

// Add validation function
const validatePart = (part) => {
  if (!part.title) throw new Error('Title is required')
  if (!part.name) throw new Error('Path is required')
  if (!part.name.startsWith('/')) throw new Error('Path must start with /')
  return true
}

// Updated create handler with validation
const handleCreate = async () => {
  try {
    isLoading.value = true
    
    // Validate form
    validatePart(newPart.value)
    
    // Add required fields
    const partData = {
      ...newPart.value,
      type: 'part',
      status: 'publish',
      author: [$pb.authStore.model.id] // Add current user as author
    }
    
    await $pb.collection('posts').create(partData)
    showCreateForm.value = false
    await fetchParts(currentPart.value)
  } catch (error) {
    console.error('Error creating part:', error)
    alert(error.message || 'Failed to create part')
  } finally {
    isLoading.value = false
  }
}

</script>
<template>
  <NuxtLayout name="admin">
    <div class="parts-container">
      <div class="header">
        <h1>Parts</h1>
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search parts..."
            class="search-input"
          />
        </div>
        <button @click="showCreateForm = true" class="btn-create">📄 Create Part</button>
      </div>
      <hr class="divider" />

      <div v-if="isLoading">Loading...</div>

      <div v-else>
        <!-- Create Part Form -->
        <div v-if="showCreateForm" class="create-form">
          <h2>Create New Part</h2>
          <div class="form-group">
            <label>Title</label>
            <input v-model="newPart.title" type="text" />
          </div>
          <div class="form-group">
            <label>Path</label>
            <input v-model="newPart.name" type="text" />
          </div>
          <div class="form-group">
            <label>Tag</label>
            <textarea v-model="newPart.excerpt"></textarea>
          </div>
          <div class="form-group">
            <label>Content</label>
            <textarea v-model="newPart.content"></textarea>
          </div>
          <button @click="handleCreate" class="btn-save">Save</button>
          <button @click="showCreateForm = false" class="btn-cancel">
            Cancel
          </button>
        </div>
        <!-- Table Header -->
        <div class="table-header">
          <div>Title</div>
          <div class="hide-mobile">Tag</div>
          <div class="hide-mobile">Author</div>
          <div class="hide-mobile">Created</div>
          <div>Actions</div>
        </div>

        <!-- Table Rows -->
        <div class="table-rows">
          <div v-for="part in parts.items" :key="part.id" class="table-row">
            <div>
              <NuxtLink :to="`${domain}${part.name}`" class="title-link">
                {{ part.title }}
              </NuxtLink>
            </div>
            <div class="hide-mobile">{{ part.excerpt || "-" }}</div>
            <div class="hide-mobile">
              {{ part.expand?.author?.[0]?.name || "Unknown" }}
            </div>
            <div class="hide-mobile">
              {{ new Date(part.created).toLocaleDateString() }}
            </div>
            <div class="actions">
              <button
                @click="handleEdit(part.id)"
                class="btn-edit"
                title="Edit"
              >
                ✏️ Edit
              </button>
              <button
                @click="handleDelete(part.id)"
                class="btn-delete"
                title="Delete"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div class="pagination">
          <button
            :disabled="currentPart === 1"
            @click="changePart(currentPart - 1)"
          >
            Previous
          </button>
          <span
            >Part {{ currentPart }} of
            {{ Math.ceil(parts.totalItems / perPart) }}</span
          >
          <button
            :disabled="currentPart >= Math.ceil(parts.totalItems / perPart)"
            @click="changePart(currentPart + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.parts-container {
}

.divider {
  margin: 1rem 0;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr) 150px;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  font-weight: bold;
  border-bottom: 2px solid #dee2e6;
}

.table-rows {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr) 150px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  align-items: center;
}

.table-row:hover {
  background: #f8f9fa;
}

.title-link {
  color: #0d6efd;
  text-decoration: none;
}

.title-link:hover {
  text-decoration: underline;
}

.pagination {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 2rem;
  justify-content: center;
}

.actions {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

@media (max-width: 768px) {
  .hide-mobile {
    display: none;
  }

  .table-header {
    grid-template-columns: 2fr 1fr 1fr;
  }

  .table-row {
    grid-template-columns: 2fr 1fr 1fr;
  }
}
</style>
