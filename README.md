# DSA Pulse

A multi-user tracker for DSA, System Design and MySQL interview prep. Built with Next.js 16 (App Router) and MongoDB.

- **3 new questions a day** (you can change this), picked from that weekday's patterns. There are 349 questions from `Prac_84 -New.pdf`.
- **Spaced revision**: each solved question comes back after 1, 4, 6, 10, 15 and 21 days. One review clears every round that has piled up.
- **Backlog**: questions you were given on earlier days but didn't solve stay on your list.
- **One System Design topic and one MySQL topic a day.** The MySQL topics come with LeetCode SQL practice links.
- **Dashboard**: today's progress bar, a stock-market style candlestick chart ($DSAX prep index), a 14-day stacked bar chart, and per-pattern and per-difficulty progress.
- **Revision plan**: the next 14 days of revisions and any that are overdue.
- **Settings**: daily target, revision days, timezone, and which patterns go on which weekday.

## Default weekly rotation

| Day | Patterns |
|-----|----------|
| Mon | Arrays & Hashing, Two Pointers, *Strings* |
| Tue | Binary Search, Sliding Window, *Bit Manipulation* |
| Wed | Stack & Queue, Linked List, *Math* |
| Thu | Trees, *Trie* |
| Fri | Heap, Greedy, Intervals, *Design (OOD)* |
| Sat | Graphs |
| Sun | Backtracking, DP 1D, DP 2D |

The patterns in *italics* are in the PDF but weren't in the original plan. Each user can move them in Settings.

## Run locally

```bash
cp .env.example .env.local            # then set AUTH_SECRET: openssl rand -base64 48
docker compose up -d mongo            # MongoDB on localhost:27017
npm install
npm run dev                           # http://localhost:3000
```

To run the whole app in Docker (production build):

```bash
docker compose --profile app up -d --build   # app on :3000, reads AUTH_SECRET from .env.local
```

## Deploy to Vercel (Hobby)

Vercel can't reach the MongoDB running in Docker on your machine, so production needs a hosted database:

1. Create a free **MongoDB Atlas** M0 cluster. Add a database user and allow `0.0.0.0/0` under Network Access, because Vercel's IP addresses change.
2. Push this folder to GitHub and import it in Vercel. If the repo root is the parent folder, set **Root Directory** to `dsa-tracker`.
3. Add these environment variables:
   - `MONGODB_URI`: the Atlas connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/dsa_tracker`
   - `AUTH_SECRET`: a random string of 32 or more characters
4. Deploy. Indexes are created automatically on first use.

## Layout

```
src/data/        questions.json (parsed from the PDF), catalog.ts (groups/schedule), topics.ts (SD + MySQL tracks)
src/lib/         db, models, session (JWT cookie), auth (data access layer), plan.ts (daily plan, revisions, stats)
src/app/actions  server actions: auth, progress, settings
src/app/(auth)   login / signup
src/app/(app)    dashboard, questions, schedule (revision plan), tracks, settings
src/proxy.ts     redirects logged-out users to /login
```
