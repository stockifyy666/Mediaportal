# Media Team Tasks

Daily task platform for the media department. Built with Next.js 16, Tailwind CSS v4 and Supabase.

- **Admin** creates member accounts, assigns daily tasks (to one or many members), sees the team's day at a glance, and opens any member's month-by-month record.
- **Members** sign in to their own account, update the status of each task (Pending / In progress / Completed / Blocked) with a comment, and submit a **day closing note** describing what they did. Unfinished tasks from earlier days carry over until they're completed.
- **Monthly record**: every task, status and closing note is kept per day, so for any month (e.g. January) you can see exactly what each member did, with completion rate and missed notes.

## Setup

### 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the whole of [`supabase/schema.sql`](supabase/schema.sql) and run it. This creates the tables, triggers and row-level security policies.
3. **Authentication → Sign In / Providers → Email**: turn **off** "Allow new users to sign up". There is no sign-up page; only the admin creates accounts.

### 2. Accounts

- There is **no public sign-up**. Create the first account in **Supabase → Authentication → Users → Add user** (tick "Auto Confirm User"). **The very first account becomes the admin** automatically.
- The admin then creates every member account from **Team members → Add member**; those are active immediately.
- Deactivated members can't sign in until the admin activates them again.

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in values from **Project Settings → API**:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` / secret key — server-only, used to create member accounts |
| `APP_TIMEZONE` | IANA timezone that decides what "today" is, e.g. `Asia/Karachi`, `Asia/Kolkata`, `Asia/Dubai` |

### 4. Run

```bash
npm install
npm run dev
```

Open http://localhost:3000, sign in as the admin, then add your team from **Team members**.

## Pages

| Route | Who | What |
| --- | --- | --- |
| `/admin` | Admin | Today's overview per member: tasks, statuses, closing notes. Pick any date. |
| `/admin/tasks` | Admin | Assign tasks (multi-member), filter by date/member, delete. |
| `/admin/reports` | Admin | Monthly team summary; click a member for the day-by-day record. |
| `/admin/members` | Admin | Create accounts, reset passwords, deactivate/activate. |
| `/member` | Member | Today's tasks + carried-over tasks, status updates, day closing note. |
| `/member/history` | Member | Own monthly record. |

## Security model

- Row-level security: members can read only their own tasks and notes; admins can read everything.
- A database trigger only lets members change `status` and `member_comment` on their tasks — not the title, date, or assignee.
- New accounts always start as `member`; the admin role is granted only via SQL.
- Deactivating a member also bans their login in Supabase Auth.

## Deploy

Deploy to Vercel (or any Node host) and set the same four environment variables there.
