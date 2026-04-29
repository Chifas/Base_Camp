# Messaging Systems

GuidePath has two distinct messaging systems serving different purposes. They do not share data models or UI components.

---

## 1. Session Chat (`Message` model)

**Purpose**: In-session communication between a client and a professional, tied to a specific booked session.

**When it's used**:
- Before a session: the client can send pre-session notes or questions.
- During a session: in-call text chat via the video call room.
- After a session (non-cancelled): reviewing notes or follow-ups.

**Key files**:
| File | Role |
|------|------|
| `prisma/schema.prisma` → `Message` | DB model. Fields: `sessionId`, `userId`, `content`, `type`, `fileUrl`, `read`. |
| `src/app/api/messages/route.ts` | `GET` (paginated history) + `POST` (send message). |
| `src/app/api/messages/unread/route.ts` | Returns unread count for the bell icon. |
| `src/components/shared/session-chat.tsx` | Client-side chat widget embedded in session pages. |
| `src/app/session/[id]/page.tsx` | Video call room — includes `SessionChat`. |

**Access control**: Only the session's client and the professional can read/send messages for that session. Cancelled sessions block new messages.

**Data flow**:
```
POST /api/messages → validate session participant → create Message → notify recipient (fire-and-forget)
GET  /api/messages?sessionId=xxx → verify participant → return paginated messages → mark others' messages as read
```

---

## 2. Direct Messaging (`Conversation` + `DirectMessage` models)

**Purpose**: Asynchronous inbox between a client and a professional, outside of any specific session. Similar to a DM inbox on a social platform.

**When it's used**:
- A client wants to ask a professional something before booking.
- A professional wants to follow up with a past client.

**Key files**:
| File | Role |
|------|------|
| `prisma/schema.prisma` → `Conversation`, `DirectMessage` | DB models. `Conversation` is the thread (one per client–professional pair). `DirectMessage` is each individual message. |
| `src/app/api/conversations/route.ts` | `GET` (list conversations) + `POST` (create or find existing conversation). |
| `src/app/api/conversations/[id]/messages/route.ts` | `GET` (message history) + `POST` (send message in thread). |
| `src/components/shared/conversation-list.tsx` | Sidebar list of open conversations. |
| `src/components/shared/conversation-chat.tsx` | Message thread view for a specific conversation. |

**Access control**: Only the client and professional parties of a conversation can access it.

**Data flow**:
```
POST /api/conversations → upsert Conversation (unique [clientId, professionalId]) → return conversation
POST /api/conversations/:id/messages → create DirectMessage → update Conversation.lastMessageAt
GET  /api/conversations/:id/messages → verify participant → return messages
```

---

## Key Differences

| Aspect | Session Chat | Direct Messages |
|--------|-------------|-----------------|
| Scope | Tied to one session | Between two users (no session required) |
| Model | `Message` | `DirectMessage` inside `Conversation` |
| API | `/api/messages` | `/api/conversations` + `/api/conversations/[id]/messages` |
| Lifetime | Deleted with session (cascade) | Persists independently |
| Use case | Pre/in/post-session comms | General async inbox |
