import { Paste } from './types';
import { prisma } from './prisma';

export interface PasteStore {
    createPaste(paste: Paste): Promise<string>;
    getPaste(id: string, effectiveTime?: number): Promise<Paste | null>;
    healthCheck(): Promise<boolean>;
}

export class PrismaPasteStore implements PasteStore {
    async createPaste(paste: Paste): Promise<string> {
        // Prisma's create returns the created object, including the generated ID
        const created = await prisma.paste.create({
            data: {
                content: paste.content,
                createdAt: new Date(paste.created_at),
                // Only set these if they are present
                expiresAt: paste.expires_at ? new Date(paste.expires_at) : null,
                maxViews: paste.max_views || null,
                remainingViews: paste.remaining_views || null,
            },
        });
        return created.id;
    }

    async getPaste(id: string, effectiveTime: number = Date.now()): Promise<Paste | null> {
        // Transaction to ensure we atomically check and decrement views
        return await prisma.$transaction(async (tx) => {
            const paste = await tx.paste.findUnique({
                where: { id },
            });

            if (!paste) return null;

            // Check Expiry
            if (paste.expiresAt && paste.expiresAt.getTime() < effectiveTime) {
                // Return null if expired
                return null;
            }

            // Check Views
            if (paste.remainingViews !== null) {
                if (paste.remainingViews <= 0) {
                    return null;
                }

                // Decrement views atomically
                // We use updateMany here with a 'where' clause that checks remainingViews > 0
                // to prevent race conditions where multiple requests might decrement below 0
                // however, findUnique + update in transaction is also decent but update with where is safer.
                // Since we are in a transaction with default isolation, let's use a specific update approach.

                // Refetch or rely on transaction isolation?
                // Safest approach for high concurrency without strict isolation level knowledge:
                // Try to update where id=id AND remainingViews > 0.

                const result = await tx.paste.updateMany({
                    where: {
                        id: id,
                        remainingViews: { gt: 0 }
                    },
                    data: {
                        remainingViews: { decrement: 1 }
                    }
                });

                if (result.count === 0) {
                    // Update failed, likely because remainingViews was 0 (race condition handled)
                    return null;
                }

                // Fetch the updated record to return
                const updated = await tx.paste.findUnique({ where: { id } });
                return updated ? this.mapToPaste(updated) : null;
            }

            return this.mapToPaste(paste);
        });
    }

    async healthCheck(): Promise<boolean> {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (e) {
            return false;
        }
    }

    private mapToPaste(record: any): Paste {
        return {
            content: record.content,
            created_at: record.createdAt.getTime(),
            expires_at: record.expiresAt ? record.expiresAt.getTime() : undefined,
            max_views: record.maxViews || undefined,
            remaining_views: record.remainingViews,
        };
    }
}

// In-Memory Implementation (kept for local dev without DB)
class MemoryPasteStore implements PasteStore {
    private store = new Map<string, string>(); // ID -> JSON string

    async createPaste(paste: Paste): Promise<string> {
        const { v4: uuidv4 } = await import('uuid');
        const id = uuidv4();
        // Mimic Prisma behavior by setting ID before storage if needed, 
        // but here we just store the paste object as is.
        this.store.set(id, JSON.stringify(paste));
        return id;
    }

    async getPaste(id: string, effectiveTime: number = Date.now()): Promise<Paste | null> {
        const data = this.store.get(id);
        if (!data) return null;

        const paste = JSON.parse(data) as Paste;
        // Check Expiry
        if (paste.expires_at && paste.expires_at < effectiveTime) {
            this.store.delete(id);
            return null;
        }

        // Check Views
        if (paste.remaining_views !== null && paste.remaining_views !== undefined) {
            if (paste.remaining_views <= 0) {
                this.store.delete(id);
                return null;
            }

            paste.remaining_views -= 1;
            this.store.set(id, JSON.stringify(paste));
        }

        return paste;
    }

    async healthCheck(): Promise<boolean> {
        return true;
    }
}

// Factory to choose store
export function getStore(): PasteStore {
    if (process.env.USE_MEMORY_STORE === '1') {
        if (!(global as any).memoryStore) {
            (global as any).memoryStore = new MemoryPasteStore();
        }
        return (global as any).memoryStore;
    }
    return new PrismaPasteStore();
}
