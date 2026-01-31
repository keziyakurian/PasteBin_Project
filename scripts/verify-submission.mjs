// import fetch from 'node-fetch'; // Built-in in Node 18+
import { spawn } from 'child_process';
import assert from 'assert';

const BASE_URL = 'http://localhost:3000';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log('Starting Verification Tests...');

    // 1. Health Check
    const health = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(health.status, 200, 'Health check failed');
    console.log('✅ Health Check Passed');

    // 2. Create Paste
    const createRes = await fetch(`${BASE_URL}/api/pastes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Test Content', ttl_seconds: 60 })
    });
    const createData = await createRes.json();
    assert.strictEqual(createRes.status, 201, 'Create paste failed');
    assert.ok(createData.id, 'No ID returned');
    console.log('✅ Create Paste Passed');

    // 3. View Limits (e.g. max_views=2)
    const viewLimitRes = await fetch(`${BASE_URL}/api/pastes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Limited View', max_views: 2 })
    });
    const { id: limitedId } = await viewLimitRes.json();

    // View 1
    const view1 = await fetch(`${BASE_URL}/api/pastes/${limitedId}`);
    assert.strictEqual(view1.status, 200, 'View 1 failed');

    // View 2
    const view2 = await fetch(`${BASE_URL}/api/pastes/${limitedId}`);
    assert.strictEqual(view2.status, 200, 'View 2 failed');

    // View 3 (Should fail)
    const view3 = await fetch(`${BASE_URL}/api/pastes/${limitedId}`);
    assert.strictEqual(view3.status, 404, 'View 3 should have failed (Max Views)');
    console.log('✅ View Limits Passed');

    // 4. Deterministic Time (TTL)
    const ttlRes = await fetch(`${BASE_URL}/api/pastes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'TTL Test', ttl_seconds: 60 })
    });
    const { id: ttlId } = await ttlRes.json();
    const now = Date.now();

    // Valid Time (now + 30s)
    const validTime = now + 30000;
    const viewValid = await fetch(`${BASE_URL}/api/pastes/${ttlId}`, {
        headers: { 'x-test-now-ms': validTime.toString() }
    });
    assert.strictEqual(viewValid.status, 200, 'Valid time fetch failed');

    // Expired Time (now + 61s)
    const expiredTime = now + 61000;
    const viewExpired = await fetch(`${BASE_URL}/api/pastes/${ttlId}`, {
        headers: { 'x-test-now-ms': expiredTime.toString() }
    });
    assert.strictEqual(viewExpired.status, 404, 'Expired time should have failed');
    console.log('✅ Deterministic TTL Passed');

    // 5. HTML Injection (/p/:id)
    const htmlRes = await fetch(`${BASE_URL}/p/${createData.id}`);
    const htmlText = await htmlRes.text();
    assert.ok(htmlText.includes('window.__INITIAL_PASTE__'), 'Initial paste data not injected');
    assert.ok(htmlText.includes('Test Content'), 'Paste content not found in HTML');
    console.log('✅ HTML Injection Passed');

    console.log('🎉 All Tests Passed!');
}

runTests().catch(e => {
    console.error('❌ Test Failed:', e);
    process.exit(1);
});
