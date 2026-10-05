# API DOCS

## File `users.js`:

@brief Stores users in memory and provides functions to create, read and remove them.

User structure:

```js
{
  id: "alice",
  name: "Alice"
}
```
___
Function `createUser(userId, userName)`:

@param `userId` Nonempty string ID for the new user.
@param `userName` Nonempty string containing the user's name.
@returns User copy.

Invalid fields throw `INVALID_USER_ID` or `INVALID_USER_NAME` before saving
anything. A duplicate ID throws `USER_ALREADY_EXISTS`. HTTP handlers return
these errors through the shared [error handler](errors.md).

Function `getUser(userId)`:

@param `userId` User ID.
@returns User copy or `undefined`.
___
Function `getUsers()`:

@returns Array of user copies. No arguments are required.
___
Function `removeUser(userId)`:

@param `userId` ID of the user to remove.
@returns `undefined`; removes the user entry.
___
User IDs are supplied by the caller. These functions do not create SQL accounts.
Removing a user does not remove their player object from existing games.

___
