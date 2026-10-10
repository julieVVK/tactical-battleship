export default async function request(path, { token, signal, ...options } = {}) {
    const controller = new AbortController();
    const abort = () => controller.abort();
    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, 10000);

    if (signal?.aborted) abort();
    else signal?.addEventListener("abort", abort, { once: true });

    try {
        const response = await fetch(`/api${path}`, {
            ...options,
            signal: controller.signal,
            headers: {
                ...options.headers,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        const data = await response.json().catch(error => {
            if (controller.signal.aborted) throw error;
            throw new Error("The server returned an invalid response. Try again.");
        });

        if (!response.ok) {
            const error = new Error(data.error?.message || "The request failed. Try again.");
            error.code = data.error?.code;
            throw error;
        }

        return data;
    } catch (error) {
        if (timedOut) throw new Error("The request timed out. Try again.");
        if (error instanceof TypeError) throw new Error("Couldn't reach the server. Try again.");
        throw error;
    } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
    }
}
