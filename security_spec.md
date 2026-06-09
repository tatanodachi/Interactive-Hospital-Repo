# Security Specification: Healthcare pre-feasibility & Capital Cascade Model

This document outlines the security architecture, data invariants, and hostile payloads designed to test our Firestore ruleset.

## 1. Data Invariants

1. **Identity Integrity**: A user can only access (`get`, `list`, `create`, `update`, `delete`) documents under their own UID in `/opcoConfigs/{userId}` and `/propcoConfigs/{userId}`. Blanket reads or queries outside their exact UID are strictly disallowed.
2. **Static Schema Validation**: Custom assumptions must exist within a nested `assumptions` map. The payload must have the correct required parameters.
3. **Temporal Integrity**: Every document write (`create` or `update`) MUST set the `updatedAt` timestamp to exactly the server timestamp (`request.time`).
4. **Email Verification**: Access is restricted to users whose email addresses have been verified (`request.auth.token.email_verified == true`), preventing malicious unverified accounts from exhausting database resources.

---

## 2. The Dirty Dozen Payloads

Each of the following payloads violates security boundaries and MUST return `PERMISSION_DENIED`.

### Payload 1: Zero-State Identity Theft (Impersonation)
Attacking `/opcoConfigs/user_victim_123` while authenticated as `user_attacker_999`.
```json
{
  "userId": "user_victim_123",
  "userEmail": "attacker@example.com",
  "updatedAt": "request.time",
  "assumptions": {}
}
```

### Payload 2: Hostile Administrative Injection (Privilege Escalation)
Injecting a fake role parameter to bypass rules.
```json
{
  "userId": "user_attacker_999",
  "userEmail": "attacker@example.com",
  "updatedAt": "request.time",
  "isAdmin": true,
  "assumptions": {}
}
```

### Payload 3: Shadow Ghost Fields
Attempting to save undocumented root fields to lock up standard indexing and create orphan metadata.
```json
{
  "userId": "user_attacker_999",
  "userEmail": "attacker@example.com",
  "updatedAt": "request.time",
  "assumptions": {},
  "maliciousSecretField": "unauthorized_data"
}
```

### Payload 4: Invalid Temporal Signature
Sending a hardcoded client-provided clock string to bypass tracking or simulate historical snapshots.
```json
{
  "userId": "user_attacker_999",
  "userEmail": "attacker@example.com",
  "updatedAt": "2020-01-01T00:00:00Z",
  "assumptions": {}
}
```

### Payload 5: Resource Poisoning (Denial-of-Wallet String)
Saving of massive descriptions or high-overhead key values to exhaust memory/disk budget.
```json
{
  "userId": "user_attacker_999",
  "userEmail": "attacker@example.com",
  "updatedAt": "request.time",
  "assumptions": {
    "maliciousLongString": "[REPEATED AAAAA... (1MB)]"
  }
}
```

### Payload 6: Unverified Email Write
Authenticating as `user_attacker_999` with `email_verified == false` and attempting to create/update.
```json
{
  "userId": "user_attacker_999",
  "userEmail": "unverified@example.com",
  "updatedAt": "request.time",
  "assumptions": {}
}
```

### Payload 7: Path Poisoning ID injection
Attempting to create a config with a document ID that includes special characters to bypass nested paths.
Path: `/opcoConfigs/user_attacker_999/nested/poison`
```json
{
  "userId": "user_attacker_999",
  "userEmail": "attacker@example.com",
  "updatedAt": "request.time",
  "assumptions": {}
}
```

### Payload 8: Immutable Field Update
Attempting to change the core `userId` field to a different UID on update.
```json
{
  "userId": "user_other_user_888",
  "userEmail": "attacker@example.com",
  "updatedAt": "request.time",
  "assumptions": {}
}
```

### Payload 9: Root-level Query / Scraping
Client attempts to fetch `/opcoConfigs` collection globally without query restrictions.
*Expected outcome: Rejection of global listing queries.*

### Payload 10: Null / Undefined Assumptions Nesting
Attempting to omit the mandatory `assumptions` map or setting it to a primitive.
```json
{
  "userId": "user_attacker_999",
  "userEmail": "attacker@example.com",
  "updatedAt": "request.time",
  "assumptions": "not_an_object"
}
```

### Payload 11: Hostile Admin Document Creation
Exerting write controls on high-privilege paths (e.g. `/admins/user_attacker_999`):
```json
{
  "isAdmin": true
}
```

### Payload 12: Bad Email Formatting / Spoofing
Writing configs with non-matching emails.
```json
{
  "userId": "user_attacker_999",
  "userEmail": "spoofed_admin@example.com",
  "updatedAt": "request.time",
  "assumptions": {}
}
```
