// auth-service.js

// Initialize PocketBase and make it globally available
window.pb = new PocketBase('https://dev-1.pockethost.io/');

// Global functions
window.pbFunctions = {
    // Direct access to PocketBase instance
    pb: window.pb,

    // Auth related functions
    auth: {
        login: async (email, password) => {
            try {
                await window.pb.collection('users').authWithPassword(email, password);
                return true;
            } catch (err) {
                console.error('Login failed:', err);
                return false;
            }
        },
        
        logout: () => {
            window.pb.authStore.clear();
            htmx.ajax('GET', '/pages/login.html', '#content');
        },
        
        isAuthenticated: () => {
            const token = window.pb.authStore.token;
            return token && token.trim().length > 0;
        },
        
        getToken: () => window.pb.authStore.token,
        getCurrentUser: () => window.pb.authStore.model,
    },

    // Collection operations
    collections: {
        // Generic CRUD operations
        get: async (collectionName, recordId) => {
            return await window.pb.collection(collectionName).getOne(recordId);
        },

        getFirstListItem: async (collectionName, filters = {}) => {
            return await window.pb.collection(collectionName).getFirstListItem(filters);
        },

        getList: async (collectionName, page, perPage, filters = {}) => {
            return await window.pb.collection(collectionName).getList(page, perPage, filters);
        },

        getFullList: async (collectionName, filters = {}) => {
            return await window.pb.collection(collectionName).getFullList(filters);
        },

        create: async (collectionName, data) => {
            return await window.pb.collection(collectionName).create(data);
        },

        update: async (collectionName, recordId, data) => {
            return await window.pb.collection(collectionName).update(recordId, data);
        },

        delete: async (collectionName, recordId) => {
            return await window.pb.collection(collectionName).delete(recordId);
        }
    },

    // File operations
    files: {
        getUrl: (record, filename, queryParams = {}) => {
            return window.pb.getFileUrl(record, filename, queryParams);
        },

        upload: async (collectionName, recordId, file, fieldName) => {
            const formData = new FormData();
            formData.append(fieldName, file);
            return await window.pb.collection(collectionName).update(recordId, formData);
        }
    },

    // Realtime subscriptions
    realtime: {
        subscribe: (topic, callback) => {
            return window.pb.realtime.subscribe(topic, callback);
        },
        unsubscribe: (topic) => {
            window.pb.realtime.unsubscribe(topic);
        }
    }
};

window.utils = {

    urlParams: new URLSearchParams(window.location.search),
};