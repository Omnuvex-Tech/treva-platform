export const endpoints = {
    auth: {
        login: "/auth/login",
        register: "/auth/register",
        logout: "/auth/logout",
        me: "/auth/me",
    },

    languages: {
        list: "/languages",
    },

    translations: {
        list: "/translations",
    },

    products: {
        list: "/products",
        detail: (slug: string) => `/products/${slug}`,
        categories: "/categories",
    },

    offPlan: {
        list: "/unit-layouts",
        detail: (id: string) => `/unit-layouts/${id}`,
        categories: "/categories",
    },

    roomOptions: {
        list: "/room-options",
    },

    viewOptions: {
        list: "/view-options",
    },

    statusOptions: {
        list: "/status-options",
    },

    currencies: {
        list: "/currencies",
    },

    locationOptions: {
        list: "/location-options",
    },

    resale: {
        apartments: {
            list: "/apartments",
            floors: "/apartments/floors",
            rooms: "/apartments/rooms",
            detail: (id: string) => `/apartments/${id}`,
            bySlug: (slug: string) => `/apartments/slug/${slug}`,
        },
        apartmentTypes: {
            list: "/apartment-types",
            detail: (id: string) => `/apartment-types/${id}`,
        },
        owners: {
            list: "/owners",
            detail: (id: string) => `/owners/${id}`,
        },
        attributes: {
            list: "/attributes",
            detail: (id: string) => `/attributes/${id}`,
        },
        requests: {
            list: "/requests",
            detail: (id: string) => `/requests/${id}`,
        },
    },
} as const;
