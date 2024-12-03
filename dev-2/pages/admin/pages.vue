<script setup>
const { $pb } = useNuxtApp();
const currentPage = ref(1);
const perPage = 10;
const isLoading = ref(false);
const searchQuery = ref("");
const showCreateForm = ref(false);
const newPage = ref({
  title: '',
  name: '/',
  content: '',
  excerpt: '',
  type: 'page',
  status: 'publish'
})
let searchTimeout = null;

// Custom debounced search
const handleSearch = () => {
  // Clear existing timeout
  if (searchTimeout) clearTimeout(searchTimeout);

  // Set new timeout
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchPages(1);
  }, 300);
};

// Watch search changes
watch(searchQuery, () => {
  handleSearch();
});

// Update fetchPages to include search
const fetchPages = async (page) => {
  isLoading.value = true;
  try {
    const filter = searchQuery.value
      ? `type='page' && (title ~ '${searchQuery.value}' || name ~ '${searchQuery.value}')`
      : "type='page'";

    const result = await $pb.collection("posts").getList(page, perPage, {
      expand: "author",
      filter,
      sort: "-created",
    });
    pages.value = result;
  } finally {
    isLoading.value = false;
  }
};

// Initialize pages data
const pages = ref(
  await $pb.collection("posts").getList(1, perPage, {
    expand: "author",
    filter: "type='page'",
    sort: "-created",
  })
);

// Handle page changes
const changePage = async (newPage) => {
  currentPage.value = newPage;
  await fetchPages(newPage);
};

const domain = computed(() => {
  if (process.client) {
    return window.location.origin;
  }
  return config.public.siteUrl || "";
});

// Add delete handler
const handleDelete = async (pageId) => {
  if (confirm("Are you sure you want to delete this page?")) {
    try {
      await $pb.collection("posts").delete(pageId);
      await fetchPages(currentPage.value);
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  }
};

// Add edit handler
const handleEdit = (pageId) => {
  navigateTo(`/admin/edit/page/?id=${pageId}`);
};

// Add validation function
const validatePage = (page) => {
  if (!page.title) throw new Error('Title is required')
  if (!page.name) throw new Error('Path is required')
  if (!page.name.startsWith('/')) throw new Error('Path must start with /')
  return true
}

// Updated create handler with validation
const handleCreate = async () => {
  try {
    isLoading.value = true
    
    // Validate form
    validatePage(newPage.value)
    
    // Add required fields
    const pageData = {
      ...newPage.value,
      type: 'page',
      status: 'publish',
      author: [$pb.authStore.model.id] // Add current user as author
    }
    
    await $pb.collection('posts').create(pageData)
    showCreateForm.value = false
    await fetchPages(currentPage.value)
  } catch (error) {
    console.error('Error creating page:', error)
    alert(error.message || 'Failed to create page')
  } finally {
    isLoading.value = false
  }
}

</script>
<template>
  <NuxtLayout name="admin">
    <div class="pages-container">
      <div class="header">
        <h1>Pages</h1>
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search pages..."
            class="search-input"
          />
        </div>
        <button @click="showCreateForm = true" class="btn-create">📄 Create Page</button>
      </div>
      <hr class="divider" />

      <div v-if="isLoading">Loading...</div>

      <div v-else>
        <!-- Create Page Form -->
        <div v-if="showCreateForm" class="create-form">
          <h2>Create New Page</h2>
          <div class="form-group">
            <label>Title</label>
            <input v-model="newPage.title" type="text" />
          </div>
          <div class="form-group">
            <label>Path</label>
            <input v-model="newPage.name" type="text" />
          </div>
          <div class="form-group">
            <label>Excerpt</label>
            <textarea v-model="newPage.excerpt"></textarea>
          </div>
          <div class="form-group">
            <label>Content</label>
            <textarea v-model="newPage.content"></textarea>
          </div>
          <button @click="handleCreate" class="btn-save">Save</button>
          <button @click="showCreateForm = false" class="btn-cancel">
            Cancel
          </button>
        </div>
        <!-- Table Header -->
        <div class="table-header">
          <div>Title</div>
          <div class="hide-mobile">Excerpt</div>
          <div class="hide-mobile">Path</div>
          <div class="hide-mobile">Author</div>
          <div class="hide-mobile">Created</div>
          <div>Actions</div>
        </div>

        <!-- Table Rows -->
        <div class="table-rows">
          <div v-for="page in pages.items" :key="page.id" class="table-row">
            <div>
              <NuxtLink :to="`${domain}${page.name}`" class="title-link">
                {{ page.title }}
              </NuxtLink>
            </div>
            <div class="hide-mobile">{{ page.excerpt || "-" }}</div>
            <div class="hide-mobile">{{ page.name }}</div>
            <div class="hide-mobile">
              {{ page.expand?.author?.[0]?.name || "Unknown" }}
            </div>
            <div class="hide-mobile">
              {{ new Date(page.created).toLocaleDateString() }}
            </div>
            <div class="actions">
              <button
                @click="handleEdit(page.id)"
                class="btn-edit"
                title="Edit"
              >
                ✏️ Edit
              </button>
              <button
                @click="handleDelete(page.id)"
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
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            Previous
          </button>
          <span
            >Page {{ currentPage }} of
            {{ Math.ceil(pages.totalItems / perPage) }}</span
          >
          <button
            :disabled="currentPage >= Math.ceil(pages.totalItems / perPage)"
            @click="changePage(currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.pages-container {
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
