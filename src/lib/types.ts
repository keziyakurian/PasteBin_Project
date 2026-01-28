export interface Paste {
    content: string;
    ttl_seconds?: number;
    max_views?: number;
    remaining_views?: number | null; // Use null for unlimited
    created_at: number;
    expires_at?: number | null; // Use null for no expiry
}

export interface CreatePasteRequest {
    content: string;
    ttl_seconds?: number;
    max_views?: number;
}

export interface CreatePasteResponse {
    id: string;
    url: string;
}
