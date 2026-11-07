# Security Specification — Van Escolar SP

## 1. Data Invariants
1. **User Identity Invariant**: A user profile at `/users/{userId}` can only be created or modified by the authenticated user whose `request.auth.uid == userId`. Users cannot elevate their own role to admin (`role == 'a'`).
2. **Student Invariant**: A student document at `/students/{studentId}` must have valid `parentEmail` and `transporterEmail`. Only the enrolled parent, assigned transporter, or admin can read the student data.
3. **Contract Invariant**: A contract at `/contracts/{contractId}` cannot be created without valid `transporterEmail` and `parentEmail`. Modifications to signatures must be verified against the authenticated party.
4. **Support Ticket Invariant**: Support tickets at `/support_tickets/{ticketId}` can be created by any authenticated user for their own `userEmail`. Only support admins can change ticket status to `resolvido`.

## 2. The Dirty Dozen Payloads (Rejection Matrix)
1. **Payload 1 (Ghost Field in User)**: `{ email: "attacker@test.com", name: "Hacker", role: "c", isAdmin: true }` -> REJECTED: Ghost field `isAdmin` prohibited.
2. **Payload 2 (Role Escalation)**: User creating profile with `role: "a"` (Admin) -> REJECTED: Non-admins cannot self-assign role `a`.
3. **Payload 3 (ID Poisoning)**: Path variable `{userId}` with 2KB junk characters -> REJECTED: ID must match regex and `<= 128` chars.
4. **Payload 4 (Unauthenticated Write)**: Write to `/users/{userId}` without `request.auth` -> REJECTED: `request.auth != null` mandatory.
5. **Payload 5 (Cross-User Overwrite)**: User `uid_A` writing to `/users/uid_B` -> REJECTED: User can only write to `/users/$(request.auth.uid)`.
6. **Payload 6 (Student Impersonation)**: Creating student with arbitrary `parentEmail` not matching auth token -> REJECTED: `incoming().parentEmail == request.auth.token.email`.
7. **Payload 7 (Contract Value Tampering)**: Parent attempting to reduce `agreedMonthlyValue` on an already active contract -> REJECTED: Key not in allowed partial update diff.
8. **Payload 8 (Terminal Contract Resurrection)**: Updating contract whose status is already `cancelado` -> REJECTED: Terminal status is locked.
9. **Payload 9 (Oversized Message String)**: Submitting support ticket message of 200,000 characters -> REJECTED: Message capped at 1000 characters.
10. **Payload 10 (Blanket Read Scrape)**: Anonymous or cross-tenant query for all users with `role: "c"` -> REJECTED: Blanket listing forbidden without strict ownership filter.
11. **Payload 11 (Non-Numeric Payment Status)**: Updating student `pg` with a string `"paid"` -> REJECTED: `pg is number`.
12. **Payload 12 (Foreign Ticket Deletion)**: User `A` deleting support ticket created by user `B` -> REJECTED: Delete restricted to ticket owner or admin.
