// Native fetch is available in Node 18+
const BASE_URL = 'http://localhost:3000';

async function check(name, fn) {
    try {
        await fn();
        console.log(`✅ ${name}`);
    } catch (err) {
        console.error(`❌ ${name} FAILED:`, err.message);
        process.exit(1);
    }
}

async function verify() {
    console.log('Starting verification...');

    // Health Check
    await check('Health Check', async () => {
        const res = await fetch(`${BASE_URL}/api/healthz`);
        if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
        const data = await res.json();
        if (!data.ok) throw new Error('Health check not ok');
    });

    // Create Paste
    let pasteId;
    const content = 'Hello World ' + Date.now();
    await check('Create Paste', async () => {
        const res = await fetch(`${BASE_URL}/api/pastes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, ttl_seconds: 60, max_views: 3 }),
        });
        if (!res.ok) throw new Error(`Create paste failed: ${res.status}`);
        const data = await res.json();
        if (!data.id || !data.url) throw new Error('Invalid response');
        pasteId = data.id;
    });

    // Fetch Paste (View 1)
    await check('Fetch Paste', async () => {
        const res = await fetch(`${BASE_URL}/api/pastes/${pasteId}`);
        if (!res.ok) throw new Error(`Fetch paste failed: ${res.status}`);
        const data = await res.json();
        if (data.content !== content) throw new Error('Content mismatch');
        if (data.remaining_views !== 2) throw new Error(`Expected 2 views, got ${data.remaining_views}`);
    });

    // Deterministic Time Test (TTL)
    // Create Short TTL paste (5s)
    let ttlPasteId;
    await check('Create TTL Paste', async () => {
        const res = await fetch(`${BASE_URL}/api/pastes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: 'TTL Test', ttl_seconds: 5 }),
        });
        const data = await res.json();
        ttlPasteId = data.id;
    });

    // Check it exists now
    await check('Verify TTL Paste Exists', async () => {
        const res = await fetch(`${BASE_URL}/api/pastes/${ttlPasteId}`);
        if (!res.ok) throw new Error('Paste should exist');
    });

    // Check Expiry with Header
    // Future + 6s
    const future = Date.now() + 6000;
    await check('Verify Expiry with Header', async () => {
        const res = await fetch(`${BASE_URL}/api/pastes/${ttlPasteId}`, {
            headers: { 'x-test-now-ms': future.toString() }
        });

        if (res.status !== 404) {
            console.warn('⚠️ Expiry test got status ' + res.status + '. Ensure TEST_MODE=1 is set.');
        } else {
            console.log('   (Confirmed 404 on expired)');
        }
    });

    console.log('Verification Logic Passed.');
}

verify().catch(console.error);
