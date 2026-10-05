// File was created by Vladyslav Doroshenko

import fail from "./error.js"

const users = new Map();

/* ==========- USER OBJECT -========== */
// const user = {
//     id: userId,
//     name: userName
// };
/* ==========- USER OBJECT -========== */


export const createUser = (userId, userName) => {
    if (typeof userId !== "string" || userId.trim().length === 0)
        fail("INVALID_USER_ID", "User ID must be a non-empty string.")

    if (typeof userName !== "string" || userName.trim().length === 0)
        fail("INVALID_USER_NAME", "User name must be a non-empty string.")

    if (users.has(userId))
        fail("USER_ALREADY_EXISTS", "User already exists. Try another id.")

    const user = {
        id: userId,
        name: userName
    }

    users.set(user.id, user)
    return {...user}
}


export const getUser = (userId) => {
    const user = users.get(userId)
    if (!user) return undefined
    return {...user}
}


export const getUsers = () => {
    return structuredClone(Array.from(users.values()))
}


export const removeUser = (userId) => {
    users.delete(userId)
}
