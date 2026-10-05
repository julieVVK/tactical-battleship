// File was created by Vladyslav Doroshenko

export default function fail(code, message) {
    const error = new Error(message);

    error.code = code;

    throw error;
}