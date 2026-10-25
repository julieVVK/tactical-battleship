// File was created by Vladyslav Doroshenko

let pendingSession = null;

export function initializeSession() {
    // StrictMode can mount App twice while the first request is still pending.
    if (!pendingSession) {
        pendingSession = loadSession().finally(() => {
            pendingSession = null;
        });
    }
    return pendingSession;
}

async function loadSession() {
    const savedToken = localStorage.getItem('token');

    if (savedToken) {
        const response = await fetch('/api/session', {
            headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (response.ok)
            return savedToken;
        if (response.status !== 401) {
            throw new Error('Failed to check your session.');
        }
    }

    // Create random user.
    const response = await fetch('/api/createUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: crypto.randomUUID(),
            userName: 'Guest',
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to create a guest session.');
    }

    const user = await response.json();
    localStorage.setItem('token', user.token);
    return user.token;
}
