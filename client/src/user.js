// File was created by Vladyslav Doroshenko

let pendingUser;

// Share the guest request when StrictMode runs the startup effect twice.
export function initializeUser() {
    if (!pendingUser) {
        pendingUser = createGuest().finally(() => {
            pendingUser = null;
        });
    }
    return pendingUser;
}

async function createGuest() {
    const response = await fetch('/api/createUser', {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to create a guest.');
    }

    return response.json();
}
