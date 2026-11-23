# Firestore Security Specification — ReelSync

## 1. Data Invariants
1. **Owner-Only Admin Privilege**: Only an authenticated Google user with a verified email matching `alobli456@gmail.com` (case-insensitive) or registered in `/admins/{uid}` with `email_verified == true` satisfies `isAdmin()`.
2. **Public Settings Read / Admin Write**: `/workspace_config/public_settings` is readable via `get` by verified signed-in users (`isVerifiedUser()`) so creators can see configured channel URLs and support widgets, while `list`, `create`, `update`, and `delete` are strictly locked to `isAdmin()`.
3. **Private Credentials & PII Isolation**: `/workspace_private/{docId}` (OAuth client IDs / webhook URLs) and `/team_members/{memberId}` (member emails and roles) deny all access (`get`, `list`, `create`, `update`, `delete`) to unauthenticated visitors and non-admin users.
4. **User Account Self-Service (`/users/{uid}`)**: Authenticated users with verified email can create and update only their own `/users/{uid}` document (`request.auth.uid == uid`), with `email` matching their verified Firebase token email, `role` permanently locked to `'creator'`, `language` restricted to `['en', 'ur', 'roman-ur', 'ar', 'es', 'fr']`, and `uid`, `email`, `role`, and `createdAt` immutable after creation. Standard users cannot list other users; only `isOwnerEmail()` can list `/users`. Deletes are denied (`allow delete: if false;`).
5. **No Self-Promotion**: `/admins/{uid}` is never client-writable (`allow write: if false;`), preventing any user from granting themselves admin access.
6. **Strict Schema & Server Timestamps**: Every write validates required/allowed keys (`hasAll` + `hasOnly`), string length bounds, ID regex (`^[a-zA-Z0-9_\\-]+$`), `updatedBy == request.auth.uid` (on workspace docs), and `updatedAt` / `createdAt` typed as `timestamp` (populated via `serverTimestamp()`).

## 2. Adversarial "Dirty Dozen+" Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated `setDoc` on `/workspace_config/public_settings` attempting to hijack `whatsAppConfig.phoneNumber`.
2. Authenticated non-admin (`other@gmail.com`, `email_verified: true`) `updateDoc` on `/workspace_config/public_settings`.
3. Spoofed admin (`alobli456@gmail.com`, `email_verified: false`) attempting write on `/workspace_config/public_settings`.
4. Unauthenticated `getDoc` on `/workspace_private/api_credentials` attempting to read OAuth client IDs.
5. Authenticated non-admin `getDocs` (`list`) on `/team_members` attempting to scrape team emails.
6. Non-admin attempting `setDoc` on `/admins/{uid}` to escalate privileges.
7. Authenticated standard user attempting `setDoc` on `/users/{uid}` with `role: 'admin'`.
8. Authenticated user A attempting `getDoc` or `updateDoc` on `/users/{userB_uid}` (cross-user access / IDOR).
9. Authenticated standard user attempting `getDocs` (`list`) on `/users` to harvest other users' emails.
10. Authenticated user attempting `setDoc` on `/users/{uid}` with a forged `email` that differs from `request.auth.token.email`.
11. Authenticated user attempting `updateDoc` on `/users/{uid}` trying to mutate `role`, `uid`, `email`, or `createdAt`.
12. Admin attempting shadow-field injection (`isSuperAdmin: true`) on `/workspace_config/public_settings`.
13. Admin attempting `create` on `/team_members/bad!id` with invalid document ID characters.
14. Admin attempting `create` on `/workspace_config/public_settings` with `mediaChannels.size() > 25`.
15. Unauthenticated `list` query on `/workspace_config` attempting collection enumeration.
