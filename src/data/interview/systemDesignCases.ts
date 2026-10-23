import type { InterviewQA } from "./index";

// Interview Q&A for the System Design case studies, keyed by topic title (see src/data/topics.ts).
export const SYSTEM_DESIGN_CASE_STUDIES_QA: Record<string, InterviewQA[]> = {
  "Design a URL shortener (TinyURL)": [
    {
      q: "What are the requirements and scale estimates?",
      a: `Functional: shorten a long URL, redirect short → long, optional custom alias and expiry, click analytics.
      Non-functional: very low redirect latency, high availability, short links must not be guessable in sequence (optional).

      Estimates: 100M new URLs/month ≈ 40 writes/s; read:write ≈ 100:1 → ~4k redirects/s. 5 years ≈ 6B URLs × ~500 bytes ≈ 3 TB. A 7-char base62 code gives 62^7 ≈ 3.5 trillion combinations — plenty.`,
    },
    {
      q: "How do you generate the short code?",
      a: `- Counter + base62: a unique ID (DB sequence, Snowflake, or ranges handed out by a key-generation service) is base62-encoded. No collisions; but sequential codes are guessable (can shuffle bits).
      - Hash (MD5/SHA of the URL) take first 7 chars: same URL maps to same code, but collisions need checking and retry with a salt.
      - Pre-generated keys: a Key Generation Service pre-creates random unused codes and hands batches to app servers — fast, no collision check at write time.
      Counter ranges or KGS are the usual interview answer.`,
    },
    {
      q: "Describe the high-level design.",
      a: `Client → LB → stateless app servers.
      - POST /shorten: get a code, store (code, long_url, user, created_at, expires_at) in a key-value store (DynamoDB/Cassandra) or sharded SQL keyed by code.
      - GET /{code}: check Redis cache, else DB; respond with HTTP redirect.
      - Async: publish click events to Kafka → analytics pipeline.
      Caching the hottest ~20% of URLs serves most traffic since reads are heavily skewed.`,
    },
    {
      q: "301 or 302 redirect?",
      a: `301 (permanent) lets browsers cache the redirect, reducing load on your servers but you lose analytics on repeat clicks and can't change the target. 302 (temporary) sends every click through you, enabling analytics and edits. Choose 302 if analytics matter (most shorteners), 301 to minimise load.`,
    },
  ],

  "Design a rate limiter": [
    {
      q: "Where should the rate limiter be placed?",
      a: `Options: client side (unreliable, can be bypassed), at the API gateway / reverse proxy (most common — central, protects all services), or as middleware inside each service (fine-grained per endpoint). Usually the gateway enforces global limits and services can add specific ones. It must be fast — it's on every request.`,
    },
    {
      q: "Describe the design of a distributed rate limiter.",
      a: `- Rules (e.g. 100 req/min per API key for /search) stored in config, cached in each limiter.
      - Counters in Redis, keyed like rl:{apiKey}:{endpoint}:{window}.
      - Algorithm: token bucket or sliding window counter.
      - Atomic check-and-update with a Lua script to avoid race conditions between concurrent requests.
      - On limit: return 429 with Retry-After and X-RateLimit-Remaining headers; optionally queue the request instead of dropping.`,
    },
    {
      q: "What race condition can occur and how do you fix it?",
      a: `Two servers read the counter (99), both see it's under 100, both increment — 101 requests allowed. Fixes: atomic INCR then compare, or Lua scripts that read-check-write atomically in Redis, or sorted-set operations inside MULTI. Avoid application-level locks — they add too much latency.`,
    },
    {
      q: "How do you handle multiple data centers and Redis failures?",
      a: `Per-region limiters with eventual sync of counts (slightly over-permissive) avoid cross-region latency. Shard Redis by key for scale. If Redis is unavailable, fail open (allow requests, maybe with a local in-memory limiter) so the limiter doesn't become an outage source, and alert.`,
    },
  ],

  "Design a key-value store (Dynamo)": [
    {
      q: "How do you partition and replicate data?",
      a: `Partition with consistent hashing using virtual nodes so data spreads evenly and only a fraction moves when nodes change. Replicate each key to the N next distinct nodes on the ring (the preference list), across racks/zones. Any node can act as coordinator for a request.`,
    },
    {
      q: "How are reads and writes made consistent?",
      a: `Tunable quorums: write to W replicas, read from R; R + W > N gives strong-ish consistency (N=3, R=2, W=2). Lower values give lower latency and higher availability. On reads, the coordinator returns the newest version and repairs stale replicas (read repair).`,
    },
    {
      q: "How are conflicting writes detected and resolved?",
      a: `Each value carries a vector clock. If one clock descends from another, the older is discarded; if neither does, the writes were concurrent — keep both siblings and let the client merge (e.g. union of shopping carts), or use last-write-wins with timestamps (simpler, can lose data), or CRDTs.`,
    },
    {
      q: "How does the system handle failures?",
      a: `- Temporary failure: sloppy quorum + hinted handoff — another node accepts the write with a hint and passes it back when the owner recovers.
      - Permanent divergence: anti-entropy using Merkle trees — replicas compare tree hashes and sync only differing ranges.
      - Membership/failure detection: gossip protocol.
      - Storage engine: commit log + memtable + SSTables (LSM), Bloom filters to skip files.`,
    },
  ],

  "Design a unique ID generator": [
    {
      q: "What are the requirements and options?",
      a: `Requirements: unique across many machines, 64-bit numeric, roughly time-sortable, 10k+ IDs/s per node, no single point of failure.
      Options:
      - DB auto-increment: simple but a bottleneck/SPOF; multi-master with step N works but is hard to scale.
      - UUID: no coordination but 128-bit and not sortable.
      - Ticket server (Flickr): central counter — SPOF.
      - Snowflake: best fit.`,
    },
    {
      q: "Explain the Snowflake bit layout.",
      a: `64 bits: 1 sign bit (0) | 41-bit timestamp in ms since a custom epoch (~69 years) | 5-bit datacenter ID | 5-bit machine ID (1024 machines total) | 12-bit sequence (4096 IDs per ms per machine). IDs are generated locally with no coordination and sort by time.`,
    },
    {
      q: "What problems must you handle with Snowflake?",
      a: `- Clock moving backwards (NTP): refuse to generate or wait until the clock catches up past the last timestamp.
      - Sequence exhausted in a millisecond: block until the next millisecond.
      - Assigning machine IDs uniquely: via config, ZooKeeper/etcd leases.
      - IDs are only roughly ordered across machines (clock skew).`,
    },
  ],

  "Design a notification system": [
    {
      q: "What are the requirements?",
      a: `Send push (APNs/FCM), SMS (Twilio), email (SES/SendGrid) and in-app notifications; triggered by services or scheduled; respect user preferences, opt-outs and quiet hours; rate limit per user; templates; tracking (delivered/opened). Scale: millions/day with spikes for marketing campaigns. Soft real-time; must not lose or duplicate notifications.`,
    },
    {
      q: "Describe the high-level design.",
      a: `- Notification service API receives requests (user_id, template, params, channels).
      - Validate, check user preferences/settings DB, rate limits, render templates.
      - Enqueue into a queue per channel (push, SMS, email) — isolates slow or failing providers.
      - Channel workers call third-party providers; retry with backoff; move to DLQ after N attempts.
      - Notification log DB stores status; device tokens and contact info in a user DB; cache preferences.`,
    },
    {
      q: "How do you avoid duplicates and lost notifications?",
      a: `Persist the notification before enqueueing (or outbox pattern) so nothing is lost; queues give at-least-once delivery. Assign each notification an ID and have workers check a dedup store (Redis SET NX with TTL) before sending, since providers can't un-send. Retries only on transient errors.`,
    },
    {
      q: "How do you handle a campaign to 50M users?",
      a: `Don't fan out synchronously. A scheduler splits the audience into batches, enqueues them gradually with throttling that respects provider rate limits, prioritises transactional notifications (OTP, payment) on separate high-priority queues so campaigns don't delay them, and autoscales workers on queue depth.`,
    },
  ],

  "Design a news feed (Facebook / Twitter)": [
    {
      q: "Fan-out on write vs fan-out on read?",
      a: `Fan-out on write (push): when a user posts, insert the post ID into every follower's precomputed feed (Redis list). Reads are very fast; writes are expensive for users with many followers and wasted on inactive users.

      Fan-out on read (pull): build the feed at read time by fetching recent posts from everyone you follow and merging. Cheap writes; slow reads.`,
    },
    {
      q: "How do you handle celebrities with millions of followers?",
      a: `Hybrid approach: push posts from normal users into followers' feeds; don't fan out for celebrities. At read time, merge the precomputed feed with recent posts pulled from the few celebrities the user follows. Also skip fan-out to inactive users and build their feed on demand when they return.`,
    },
    {
      q: "Describe the high-level architecture.",
      a: `- Post service: stores posts (sharded by post ID / user ID), media in S3 + CDN.
      - Graph service: follower relationships.
      - Fan-out workers consume post events from Kafka and write post IDs into feed caches.
      - Feed service: reads feed IDs from cache, hydrates posts/users from caches, applies ranking, paginates with cursors.
      Store only IDs in feeds (small, ~hundreds per user), hydrate details separately.`,
    },
    {
      q: "How does ranking and pagination work?",
      a: `Candidates (recent posts) are scored by an ML model using engagement probability, affinity with the author, recency and content type, then re-ranked for diversity. Use cursor-based pagination (last seen score/ID), not offsets, because the feed changes while the user scrolls.`,
    },
  ],

  "Design a chat system (WhatsApp)": [
    {
      q: "What are the requirements and how do clients connect?",
      a: `1:1 and group chat, online presence, delivery/read receipts, offline delivery, multi-device, media. Low latency and high reliability; billions of messages/day.

      Clients keep a persistent WebSocket to a chat gateway server. A session store (Redis) maps user_id → gateway server so messages can be routed to the right connection.`,
    },
    {
      q: "What is the flow when user A sends a message to B?",
      a: `- A sends the message over its WebSocket with a client-generated message ID.
      - Chat service assigns a sequence number per conversation, persists it, acks A (single tick).
      - Looks up B's gateway; if online, pushes it; B acks → delivered (double tick).
      - If offline, it stays in storage and a push notification is sent; B syncs from its last sequence number on reconnect.
      - Client message IDs make retries idempotent.`,
    },
    {
      q: "How do you store messages and keep ordering?",
      a: `Use a wide-column store (Cassandra/HBase) partitioned by conversation_id, clustered by a sequence/time-ordered ID — fetching recent messages is one partition scan. Ordering: a per-conversation sequence number (from the chat server owning that conversation, or Snowflake IDs) rather than client timestamps.`,
    },
    {
      q: "How do group chats and presence work?",
      a: `Group: store once per group, fan out delivery to each online member's gateway (for small groups, ~up to a few hundred); very large groups/channels use pull. Presence: clients send heartbeats; a presence service marks users offline after a timeout and publishes changes only to interested contacts (not all followers) to limit fan-out.`,
    },
  ],

  "Design search autocomplete": [
    {
      q: "What are the requirements?",
      a: `Return top 5-10 suggestions for a prefix as the user types, ranked by popularity (and personalization); response < 100 ms; high QPS (each keystroke is a request). Suggestions don't need to be real-time fresh — updating hourly/daily is fine.`,
    },
    {
      q: "How does the trie-based design work?",
      a: `Store queries in a trie. Searching all descendants for top-k at query time is slow, so each node caches the top-k completions for its prefix. Lookup is O(prefix length). Limit prefix length (e.g. 50 chars). The trie is serialized and replicated to in-memory serving nodes, sharded by prefix range if too large.`,
    },
    {
      q: "How is the trie built and updated?",
      a: `Query logs → aggregation job (Spark) computing frequencies per query, often weighted by recency → build a new trie offline → swap in atomically on serving nodes. Real-time trending queries can be merged from a separate streaming counter. Filter offensive or banned suggestions before building.`,
    },
    {
      q: "How do you reduce load from keystrokes?",
      a: `Client debouncing (wait ~100-200 ms of no typing), browser caching of prefix responses (Cache-Control), CDN/edge caching of popular short prefixes, and client-side filtering when extending a prefix already fetched. A Redis cache of prefix → results in front of the trie servers.`,
    },
  ],

  "Design YouTube / Netflix": [
    {
      q: "Describe the upload and processing pipeline.",
      a: `- Client gets a pre-signed URL and uploads the raw video directly to object storage (multipart, resumable).
      - An upload-complete event goes to a queue.
      - Transcoding workers split the video into chunks and transcode them in parallel (a DAG): multiple resolutions/bitrates, codecs (H.264, VP9, AV1), thumbnails, captions, content checks.
      - Output segments go to object storage and CDN; metadata DB marks the video ready.`,
    },
    {
      q: "What is adaptive bitrate streaming?",
      a: `Videos are encoded at several bitrates and cut into small segments (2-10 s) with a manifest (HLS .m3u8 / DASH .mpd). The player measures bandwidth and buffer level and picks the quality per segment, switching up or down seamlessly — avoiding buffering on poor networks.`,
    },
    {
      q: "What's the CDN strategy?",
      a: `Video bandwidth dominates cost, so serve almost everything from CDN edges close to users. Popular content is pre-positioned (Netflix Open Connect puts appliances inside ISPs and fills them overnight based on predicted popularity). Long-tail content can be served from regional caches or origin on demand.`,
    },
    {
      q: "How is metadata stored and how are views counted?",
      a: `Metadata (title, owner, status, segment locations) in a sharded SQL/NoSQL DB with heavy caching; blobs in object storage. View counts: don't update a DB row per view — send events to Kafka, aggregate in a stream processor, and periodically update counters (approximate in real time, exact via batch).`,
    },
  ],

  "Design Google Drive / Dropbox": [
    {
      q: "Why split files into chunks?",
      a: `Files are split into blocks (e.g. 4 MB), each identified by its content hash. Benefits: only changed blocks are uploaded on edits (delta sync), interrupted uploads resume per block, parallel transfers, and deduplication — identical blocks across files or users are stored once.`,
    },
    {
      q: "Describe the high-level design.",
      a: `- Client: watches the local folder, chunks/hashes files, keeps a local metadata DB.
      - Block service: uploads blocks to object storage (S3) if their hash isn't already stored.
      - Metadata service + DB (SQL, strong consistency): files, versions, ordered block lists, folders, sharing permissions.
      - Notification service: long polling/WebSocket tells other devices a file changed; they fetch new metadata and missing blocks.`,
    },
    {
      q: "How do you handle sync conflicts?",
      a: `Each file has a version. A client uploads with the base version it edited; if the server's version has moved on (another device edited), it's a conflict. Typical resolution: keep both — save the second as "file (conflicted copy)" — and let the user merge. The first write wins on the server.`,
    },
    {
      q: "Why does metadata need strong consistency?",
      a: `If devices see different block lists or folder trees, files get corrupted or lost. So metadata lives in an ACID database (sharded by user/namespace), while blocks are immutable, content-addressed objects — which makes caching and replication of blocks trivial.`,
    },
  ],

  "Design a web crawler": [
    {
      q: "Describe the crawler's main components.",
      a: `Seed URLs → URL frontier (prioritized queues) → fetchers (download pages, with DNS cache) → parser (extract links and content) → content dedup → store pages in object storage / Bigtable → extracted URLs are normalized, filtered, deduplicated against seen URLs and added back to the frontier.`,
    },
    {
      q: "How does the URL frontier enforce politeness and priority?",
      a: `Two-level queues: front queues by priority (PageRank, freshness, domain importance); back queues one per host, each served by a single worker with a delay between requests to the same host. This avoids overloading any site while prioritising important pages. Always respect robots.txt (cached per host) and crawl-delay.`,
    },
    {
      q: "How do you avoid crawling duplicates?",
      a: `- URL dedup: normalize URLs (lowercase host, remove fragments, sort params), then check a seen set — a Bloom filter or distributed hash set for billions of URLs.
      - Content dedup: exact duplicates via hash (MD5); near-duplicates via SimHash/MinHash fingerprints.
      - Avoid spider traps: limit URL length/depth per domain.`,
    },
    {
      q: "How do you scale it to billions of pages?",
      a: `Partition the frontier and seen-URL set by hostname hash across many crawler nodes so each host is handled by one node (keeps politeness local). Fetchers are async I/O heavy. Recrawl based on how often a page changes. Make everything resumable by checkpointing the frontier.`,
    },
  ],

  "Design Uber / ride sharing": [
    {
      q: "How do you handle driver location updates at scale?",
      a: `Drivers send location every ~4 seconds. With 1M active drivers that's 250k writes/s — too much for a SQL DB. Keep only the latest location in memory in a geospatial index (Redis GEO or in-memory H3/geohash cells sharded by region/city). Stream location events to Kafka for trip tracking and analytics.`,
    },
    {
      q: "How does rider-driver matching work?",
      a: `Find the rider's cell (H3/geohash), query nearby cells for available drivers, rank by ETA (road distance, not straight line) and other factors, then offer the trip to the best driver with a timeout before trying the next. Lock the driver (atomic status change available → offered) so two riders can't be matched to the same driver.`,
    },
    {
      q: "How do you model the trip lifecycle?",
      a: `A state machine: requested → driver_assigned → driver_arrived → in_progress → completed (or cancelled). Transitions are persisted in a strongly consistent DB with conditional updates to prevent invalid jumps; each transition emits an event (notifications, billing, ETA updates). Payment happens asynchronously after completion.`,
    },
    {
      q: "How does surge pricing work?",
      a: `Per geographic cell, compare demand (ride requests) to supply (available drivers) over a sliding window using a stream processor. When the ratio is high, apply a multiplier. The price shown is locked into a quote with an expiry so the rider pays what they agreed to.`,
    },
  ],

  "Design a payment system": [
    {
      q: "Describe the payment flow.",
      a: `- Client checks out; payment service creates a payment record (status PENDING) with an idempotency key.
      - Card details go directly to a PSP (Stripe/Adyen) via their hosted page/SDK — you never store raw card numbers (PCI).
      - Payment service calls the PSP; PSP responds or later sends a webhook with the final status.
      - Update status (SUCCEEDED/FAILED), write ledger entries, notify the order service via events.`,
    },
    {
      q: "How do you guarantee a customer is never charged twice?",
      a: `Idempotency at every hop: the client sends an idempotency key per checkout; the payment service stores it with a unique constraint and returns the existing result on retries; the same key is forwarded to the PSP, which also dedups. Webhook handlers are idempotent too (dedup by event ID). Retries only after timeouts with status checks.`,
    },
    {
      q: "What is a double-entry ledger and why use it?",
      a: `Every money movement is recorded as at least two entries — a debit to one account and a credit to another — that sum to zero. Entries are immutable (append-only); corrections are new entries. Balances are derived from entries. It makes errors detectable (books must balance) and gives a complete audit trail.`,
    },
    {
      q: "What is reconciliation?",
      a: `A periodic (daily) batch job comparing your internal ledger/payment records with the PSP's and bank's settlement reports. Mismatches (missed webhooks, partial failures, fees) are flagged and fixed automatically or manually. It's the safety net for the distributed, eventually consistent payment flow.`,
    },
  ],

  "Design an e-commerce checkout (Amazon)": [
    {
      q: "What services are involved in checkout?",
      a: `Cart service (Redis/DynamoDB per user), catalog/pricing, inventory service, order service, payment service, shipping, notification. Checkout orchestrates: validate cart and prices → reserve inventory → create order → take payment → confirm order → trigger fulfillment and email.`,
    },
    {
      q: "How do you prevent overselling?",
      a: `Reserve stock atomically at checkout: UPDATE inventory SET available = available - 1 WHERE sku = ? AND available >= 1 (0 rows updated means out of stock), or a Redis DECR with a check. Reservations have a TTL — if payment isn't completed within e.g. 10 minutes, stock is released. Decrement permanently on order confirmation.`,
    },
    {
      q: "How do you keep the order consistent across services?",
      a: `Use an orchestrated saga: reserve inventory → charge payment → confirm order. If payment fails, compensate by releasing inventory and marking the order failed. Each step is idempotent and its state is persisted so the orchestrator can resume after crashes. Communicate via events with the outbox pattern.`,
    },
    {
      q: "How do you handle a flash sale?",
      a: `- Put a virtual waiting room/queue in front to admit users at a controlled rate.
      - Keep hot inventory counters in Redis (atomic decrements), sync to DB asynchronously.
      - Serve product pages from CDN/cache; rate limit per user; bot detection.
      - Process orders asynchronously from a queue and tell the user the result.`,
    },
  ],

  "Design a distributed message queue": [
    {
      q: "How is the data stored?",
      a: `Like Kafka: topics split into partitions; each partition is an append-only log on disk in segment files with an offset index. Producers append sequentially (fast); consumers read sequentially from an offset. Messages are retained by time/size rather than deleted on consume, so multiple consumer groups and replay are possible.`,
    },
    {
      q: "How is replication done?",
      a: `Each partition has a leader broker and follower replicas on other brokers. Producers write to the leader; followers fetch from it. The in-sync replica (ISR) set holds caught-up followers. With acks=all the leader acknowledges once all ISR replicas have the message. On leader failure, a controller (via ZooKeeper/KRaft consensus) elects a new leader from the ISR.`,
    },
    {
      q: "How are consumer offsets and delivery semantics handled?",
      a: `Consumers commit offsets per partition (stored in an internal topic). Commit after processing → at-least-once (duplicates on crash); commit before → at-most-once. Exactly-once needs idempotent producers plus transactions that atomically write output and commit offsets, or idempotent consumers.`,
    },
    {
      q: "How do producers choose a partition?",
      a: `By key hash (same key → same partition → ordered), round-robin/sticky for keyless messages, or a custom partitioner. Producers batch messages per partition and compress them to increase throughput, trading a few ms of latency (linger.ms).`,
    },
  ],

  "Design a hotel / ticket booking system (BookMyShow)": [
    {
      q: "How do you prevent double booking of a seat?",
      a: `Seat holds must be atomic. Options:
      - DB row lock: SELECT … FOR UPDATE on the seats, or a conditional UPDATE seats SET status='HELD', held_by=?, hold_until=? WHERE id IN (...) AND status='AVAILABLE' — succeed only if all rows updated.
      - Unique constraint on (show_id, seat_id) in a bookings table.
      - Redis SET NX with TTL as a fast hold layer, with the DB as source of truth.`,
    },
    {
      q: "How does the temporary seat lock work?",
      a: `When a user selects seats, they're held for ~10 minutes (hold_until timestamp or Redis TTL). Other users see them as unavailable. On payment success they become BOOKED; on timeout or failure a background job (or lazy check of hold_until) releases them. This prevents users holding seats forever.`,
    },
    {
      q: "What if payment succeeds after the hold expired?",
      a: `Confirm the booking with a conditional update that checks the hold is still owned by this user. If the seats were released and taken, automatically refund the payment and notify the user. Set the payment timeout shorter than the hold, and track the state in a saga so this edge case is handled deterministically.`,
    },
    {
      q: "How do you handle a hugely popular show going on sale?",
      a: `Virtual waiting room admitting users in batches, cached seat maps with short TTL, seat holds in Redis for speed, rate limiting and bot protection, and showing availability optimistically while the hold step enforces correctness.`,
    },
  ],

  "Design a metrics & monitoring system": [
    {
      q: "Push vs pull collection?",
      a: `Pull (Prometheus): the server scrapes /metrics endpoints of discovered targets — it controls load and easily detects targets that are down; needs service discovery and is awkward for short-lived jobs.

      Push (StatsD, Datadog agent, OpenTelemetry): agents send metrics to collectors — works through firewalls and for short jobs; collectors must handle bursts. Large systems often have agents push to a queue (Kafka) first.`,
    },
    {
      q: "How are time series stored?",
      a: `A series is a metric name + labels with (timestamp, value) points. Time-series DBs (Prometheus TSDB, InfluxDB, M3, Gorilla) store points in time-partitioned blocks with heavy compression — delta-of-delta timestamps and XOR-encoded floats get ~1.4 bytes per point. Indexes map labels to series IDs. Avoid high-cardinality labels like user_id.`,
    },
    {
      q: "What are downsampling and retention?",
      a: `Raw 10-second data is kept for a short time (e.g. 7 days); older data is rolled up to 1-minute then 1-hour aggregates (min/max/avg/count) kept for months or years. Saves storage enormously while long-range graphs still work.`,
    },
    {
      q: "How does the alerting pipeline work?",
      a: `Rules (e.g. error_rate > 2% for 5m) are evaluated periodically against the data; firing alerts go to an alert manager that deduplicates, groups, silences and routes them to PagerDuty/Slack/email with escalation. The monitoring system must itself be highly available and independent of what it monitors.`,
    },
  ],

  "Design Google Docs (collaborative editing)": [
    {
      q: "How do multiple users edit the same document concurrently?",
      a: `Each client applies edits locally immediately (responsiveness) and sends operations to the server over WebSocket. Concurrent operations must be reconciled so all clients converge to the same document. Two approaches: Operational Transformation (OT) and CRDTs.`,
    },
    {
      q: "Explain OT vs CRDT.",
      a: `OT: operations like insert(pos, char) are transformed against concurrent operations — if someone inserted earlier in the text, shift my position. Usually needs a central server to order operations (Google Docs uses OT).

      CRDT: each character gets a unique, ordered ID, so operations commute and can be merged in any order without a central server — good for offline/peer-to-peer (Yjs, Automerge), but more metadata overhead.`,
    },
    {
      q: "Describe the architecture.",
      a: `- Collaboration servers: each document is handled by one server (routed by doc ID) holding the live document state in memory, ordering and transforming operations, broadcasting them to connected clients.
      - Operation log persisted (DB/Kafka) for durability.
      - Periodic snapshots so loading doesn't replay all history; version history is built from snapshots + ops.
      - Presence (cursors, selections) is sent as ephemeral messages, not persisted.`,
    },
  ],

  "Design a leaderboard / top-K system": [
    {
      q: "How do you design a real-time game leaderboard?",
      a: `Redis sorted set: ZINCRBY leaderboard score user — O(log n) update. Top 10: ZREVRANGE 0 9 WITHSCORES. A user's rank: ZREVRANK. Persist scores in a DB as the source of truth and rebuild Redis on failure. Use separate keys for daily/weekly leaderboards with expiry.`,
    },
    {
      q: "What if there are hundreds of millions of users?",
      a: `Shard sorted sets by score range or user hash. Top-K: take top K from each shard and merge. Exact rank for a user across shards: sum of counts of higher scores in each shard (ZCOUNT). Or approximate ranks using score histograms ("you're in the top 3%"), which is usually enough beyond the top few thousand.`,
    },
    {
      q: "How do you find top-K trending items in a huge stream?",
      a: `Exact counts per item are too memory heavy. Use a Count-Min Sketch to estimate frequencies plus a min-heap of size K for current heavy hitters, per time window, in a stream processor; merge partial results across partitions. Batch jobs can compute exact results later for accuracy.`,
    },
  ],

  "Design a distributed job scheduler": [
    {
      q: "What are the requirements and components?",
      a: `Schedule one-off and recurring (cron) jobs, run them reliably at roughly the right time, retries, dependencies between jobs, monitoring. Components: API to create jobs, job store DB (job definition, next_run_time, status), scheduler nodes that find due jobs, a queue, and worker pools that execute them.`,
    },
    {
      q: "How do you find due jobs efficiently and avoid two nodes running the same job?",
      a: `Index on next_run_time and poll for due jobs in small windows. Partition jobs among scheduler nodes (by job ID hash) so each scans only its partition. To claim a job atomically: UPDATE jobs SET owner=?, lease_until=now()+30s WHERE id=? AND (owner IS NULL OR lease_until < now()) — or SELECT … FOR UPDATE SKIP LOCKED. Then compute and store the next run time.`,
    },
    {
      q: "How do you guarantee a job runs exactly once?",
      a: `True exactly-once isn't achievable; do at-least-once with leases and heartbeats — if a worker dies, its lease expires and another picks the job up — and make jobs idempotent (an execution ID per scheduled run that the job checks before side effects). Record each run's status, retry with backoff, then alert/DLQ.`,
    },
    {
      q: "How do you handle job dependencies (DAGs)?",
      a: `Model workflows as DAGs (like Airflow). A job becomes runnable when all its upstream jobs succeed; on completion, the scheduler checks downstream jobs and enqueues those whose dependencies are now satisfied (topological order). Failures stop downstream jobs and can be retried from the failed node.`,
    },
  ],

  "Design Instagram": [
    {
      q: "What are the requirements and estimates?",
      a: `Upload photos/videos, follow users, home feed, likes/comments, stories (24 h). Read-heavy. Estimate: 500M DAU, 100M uploads/day ≈ 1,200 uploads/s; ~2 MB per photo (plus resized versions) ≈ 200 TB/day — so media must be in object storage + CDN.`,
    },
    {
      q: "How does photo upload work?",
      a: `Client requests a pre-signed URL and uploads directly to S3. An event triggers processing workers that create multiple sizes/formats and strip metadata. Post metadata (post_id, user_id, caption, media keys, created_at) is written to the DB, then a PostCreated event drives feed fan-out, notifications and search indexing.`,
    },
    {
      q: "How are the data stores chosen?",
      a: `- Users, follow graph: sharded relational DB (Instagram used sharded Postgres) or a graph store; cache followers/following lists.
      - Posts and comments: sharded by user_id or post_id; IDs from a Snowflake-like generator (time-sortable).
      - Feed: Redis lists of post IDs per user.
      - Likes count: counters in Redis/Cassandra, aggregated asynchronously.
      - Media: S3 + CDN.`,
    },
    {
      q: "How do Stories with a 24-hour TTL work?",
      a: `Stories are stored with an expiry (DB TTL in Cassandra/DynamoDB, or a cleanup job); media objects get lifecycle rules. The stories tray is built from followed users who have active stories, cached per user and updated on new stories. Viewed state is tracked per viewer to order unseen stories first.`,
    },
  ],
};
