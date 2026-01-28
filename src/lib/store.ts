import { Paste } from './types';
import { v4 as uuidv4 } from 'uuid';
import { getEffectiveTime } from './time';
import { redis } from './redis';

export interface PasteStore {
    createPaste(paste: Paste): Promise<string>;
    getPaste(id: string): Promise<Paste | null>;
    healthCheck(): Promise<boolean>;
}

// Redis Implementation with Lua Script
const GET_PASTE_SCRIPT = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local data = redis.call("GET", key)

  if not data then
    return nil
  end

  local paste = cjson.decode(data)

  if paste.expires_at and paste.expires_at < now then
    redis.call("DEL", key)
    return nil
  end

  if paste.remaining_views then
    local views = tonumber(paste.remaining_views)
    if views <= 0 then
      redis.call("DEL", key)
      return nil
    end
    
    paste.remaining_views = views - 1
    
    redis.call("SET", key, cjson.encode(paste))
    
    if paste.expires_at then
       local remaining_ms = paste.expires_at - now
       if remaining_ms > 0 then
           redis.call("PEXPIRE", key, remaining_ms)
       end
    end
  end

  return cjson.encode(paste)
`;

export class RedisPasteStore implements PasteStore {
    async createPaste(paste: Paste): Promise<string> {
        const id = uuidv4();
        const pipeline = redis.pipeline();
        pipeline.set(`paste:${id}`, JSON.stringify(paste));
        if (paste.ttl_seconds) {
            pipeline.expire(`paste:${id}`, paste.ttl_seconds);
        }
        await pipeline.exec();
        return id;
    }

    async getPaste(id: string): Promise<Paste | null> {
        const now = await getEffectiveTime();
        const result = await redis.eval(GET_PASTE_SCRIPT, 1, `paste:${id}`, now);
        if (!result) return null;
        return JSON.parse(result as string) as Paste;
    }

    async healthCheck(): Promise<boolean> {
        try {
            await redis.ping();
            return true;
        } catch (e) {
            return false;
        }
    }
}

// In-Memory Implementation
class MemoryPasteStore implements PasteStore {
    private store = new Map<string, string>(); // ID -> JSON string

    async createPaste(paste: Paste): Promise<string> {
        const id = uuidv4();
        this.store.set(id, JSON.stringify(paste));
        return id;
    }

    async getPaste(id: string): Promise<Paste | null> {
        const data = this.store.get(id);
        if (!data) return null;

        const paste = JSON.parse(data) as Paste;
        const now = await getEffectiveTime();

        // Check Expiry
        if (paste.expires_at && paste.expires_at < now) {
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
        // Singleton for memory store to persist across hot reloads in dev (mostly)
        if (!(global as any).memoryStore) {
            (global as any).memoryStore = new MemoryPasteStore();
        }
        return (global as any).memoryStore;
    }
    return new RedisPasteStore();
}
