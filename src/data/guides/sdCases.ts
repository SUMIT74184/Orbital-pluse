import type { TopicGuide } from "./index";

/*
 * Case-study lessons for the System Design track, keyed by topic title (see src/data/topics.ts).
 * Each follows the interview flow: what we build → estimates → architecture → step by step → hard parts.
 */
export const SD_CASE_GUIDES: Record<string, TopicGuide> = {
  "Design a URL shortener (TinyURL)": {
    simple: `Build a service that turns a long URL into a short one like short.ly/x7Kq9 and redirects anyone who opens it.

    Requirements: create a short link, redirect fast, optional custom alias and expiry, click analytics. It's very read-heavy (a link is created once and opened thousands of times), so the design is all about generating unique short codes and serving redirects from cache.`,
    analogy: `A cloakroom token: you hand in a big coat (the long URL) and get a small numbered token (the short code). Anyone with the token gets the coat back instantly. The main job is to never hand out the same token twice.`,
    visual: "tinyurl-arch",
    how: {
      visual: "base62",
      steps: [
        "**Estimate:** 10 crore new links/month ≈ 40 writes/s; 100:1 reads ≈ 4,000 redirects/s. 5 years × 12 × 10 crore = 600 crore links × 500 B ≈ 3 TB.",
        "**API:** `POST /urls {longUrl, alias?, expiry?}` → `{shortUrl}`; `GET /{code}` → 301/302 redirect.",
        "**Code generation:** get a unique number from a counter / key generation service (ranges handed out in blocks of 1,000 per server) and Base62-encode it. 7 chars = 3.5 trillion codes.",
        "**Store** `code → longUrl, createdAt, expiry` in a key-value store or sharded SQL table, keyed by code.",
        "**Redirect:** check Redis first (hot links), fall back to the DB, then fill the cache. Return 302 if you want every click to reach you (analytics), 301 to let browsers cache it.",
        "**Analytics:** don't write to the DB on each click; push click events to Kafka and aggregate asynchronously.",
      ],
    },
    concepts: [
      { term: "Base62", meaning: "Digits 0-9, a-z, A-Z; turns a number into a short, URL-safe string." },
      { term: "Hash + collision check", meaning: "Alternative: take the first 7 chars of MD5(url); on collision, retry with a salt. Needs a DB check each time." },
      { term: "Key generation service (KGS)", meaning: "Pre-generates unique ids or hands out ranges so app servers never collide." },
      { term: "301 vs 302", meaning: "Permanent (browser caches, fewer hits) vs temporary (every click hits you, better analytics)." },
      { term: "Read-heavy caching", meaning: "A small set of links gets most clicks; LRU cache in Redis absorbs them." },
      { term: "Custom alias", meaning: "User-chosen code; insert with a unique constraint and reject if taken." },
    ],
    compare: {
      head: ["", "Counter + Base62", "Hash of URL"],
      rows: [
        ["Uniqueness", "Guaranteed", "Needs collision handling"],
        ["Same URL twice", "Two different codes", "Same code (dedup for free)"],
        ["Predictable codes", "Yes (can be scraped) — shuffle the bits if needed", "No"],
        ["Coordination", "Counter / range service", "None, but a DB check per insert"],
      ],
    },
    mistakes: [
      "Using a single DB auto-increment for every app server — a bottleneck and single point of failure.",
      "Writing analytics synchronously on the redirect path.",
      "Forgetting expiry and abuse (malware links) handling.",
    ],
    remember: "Unique number → Base62 code; cache-first redirects; analytics async through a queue.",
  },

  "Design a rate limiter": {
    simple: `Build a component that limits how many requests a client can make (e.g. 100 per minute per user) and returns 429 when they exceed it. It must be fast (adds < 1–2 ms), accurate across many servers, and keep working if the limiter's store has a hiccup.`,
    analogy: `The ticket checker at a popular temple who lets in 100 people every 10 minutes per gate. There are many gates (servers), so all checkers share one counter board (Redis) to make sure the total is right.`,
    visual: "rate-limiter-arch",
    how: {
      visual: "token-bucket",
      steps: [
        "**Where:** in the API gateway / middleware, before requests reach services (client-side limits can be bypassed).",
        "**Rules:** configurable per endpoint and tier, e.g. `login: 5/min per IP`, `api: 1000/hour per key`; loaded from config and cached.",
        "**Algorithm:** token bucket or sliding window counter, state stored in Redis per key.",
        "**Atomicity:** do read-check-update in one Lua script (or INCR + EXPIRE) so concurrent requests can't both pass.",
        "**Response:** 429 with `Retry-After` and remaining-quota headers; optionally queue instead of reject for internal jobs.",
        "**Failure mode:** if Redis is down, fail open (allow) for most APIs, fail closed for sensitive ones like login/OTP.",
      ],
    },
    concepts: [
      { term: "Limit key", meaning: "What you count by: user id, API key, IP, or a combination." },
      { term: "Token bucket", meaning: "Refill at rate r up to capacity b; allows short bursts." },
      { term: "Sliding window counter", meaning: "Accurate and cheap; uses current and previous window counts." },
      { term: "Lua script", meaning: "Runs atomically inside Redis — no race between check and update." },
      { term: "Fail open / fail closed", meaning: "On limiter failure, allow everything / block everything." },
      { term: "Local + global limits", meaning: "A rough in-memory limit per server first, then the shared Redis check." },
    ],
    example: `~~~
    -- fixed window in Redis, per user per minute
    local n = redis.call('INCR', KEYS[1])          -- rl:42:202610271230
    if n == 1 then redis.call('EXPIRE', KEYS[1], 60) end
    return n <= tonumber(ARGV[1])                  -- limit, e.g. 100
    ~~~`,
    mistakes: [
      "Doing GET then SET from the app — two servers both see 99 and both allow.",
      "Rate limiting only per IP, punishing whole offices and mobile carriers.",
      "Making the limiter a synchronous dependency with no timeout or fallback.",
    ],
    remember: "Limit at the gateway, keep counters in Redis updated atomically, return 429 with Retry-After.",
  },

  "Design a key-value store (Dynamo)": {
    simple: `Build a distributed store with just \`put(key, value)\` and \`get(key)\` that holds huge amounts of data, is always writable, and survives machines dying. This is how Amazon's Dynamo, Cassandra and Riak work.

    Each problem has a known technique: spread data with consistent hashing, copy each key to N nodes, use quorums to tune consistency, detect conflicting versions with vector clocks, handle short outages with hinted handoff, and repair drift with Merkle trees.`,
    analogy: `A library with many branches. Each book is assigned to a branch by its title (consistent hashing) and photocopies are kept at the next two branches (replication). If one branch is closed for a day, a neighbour holds returned books with a note "give to branch X" (hinted handoff).`,
    visual: "dynamo-techniques",
    how: {
      visual: "hash-ring",
      steps: [
        "**Partition:** place nodes (with virtual nodes) on a hash ring; a key lives on the first node clockwise.",
        "**Replicate:** also store it on the next N−1 distinct nodes (N = 3).",
        "**Write:** the coordinator sends to all N and succeeds after W acks. **Read:** asks N, returns after R replies; newest version wins.",
        "**Conflicts:** versions carry vector clocks; concurrent versions are returned to the client to merge (or last-write-wins).",
        "**Temporary failure:** a stand-in node accepts the write with a hint and passes it on when the owner returns.",
        "**Repair:** read repair fixes stale replicas during reads; Merkle trees compare replicas in the background and sync only differing ranges.",
        "**Membership:** nodes gossip with a few random peers each second to learn who's alive.",
      ],
    },
    concepts: [
      { term: "Consistent hashing", meaning: "Adding a node moves only ~1/N of keys." },
      { term: "N, R, W", meaning: "Replicas, read quorum, write quorum. R + W > N gives overlapping reads." },
      { term: "Sloppy quorum", meaning: "Use the next healthy nodes when owners are down, to stay writable." },
      { term: "Vector clock", meaning: "Per-node counters that show if two versions are ordered or concurrent." },
      { term: "Merkle tree", meaning: "Tree of hashes; compare roots to find which key ranges differ." },
      { term: "Gossip", meaning: "Peer-to-peer spreading of membership and failure info." },
    ],
    mistakes: [
      "Forgetting that N=3, R=1, W=1 can return stale data.",
      "Using wall-clock last-write-wins and silently losing concurrent writes.",
      "Describing a central master that tracks every key — Dynamo is deliberately masterless.",
    ],
    remember: "Ring for placement, N replicas, R + W > N quorums, vector clocks for conflicts, hinted handoff and Merkle trees for repair.",
  },

  "Design a unique ID generator": {
    simple: `Generate unique ids for things like tweets and orders across many servers and data centres: 10,000+ per second, 64-bit, roughly sortable by time, and without a single bottleneck.

    The classic answer is Twitter's Snowflake: each id packs a millisecond timestamp, a data centre id, a machine id and a sequence number. Every machine generates ids on its own and they never clash.`,
    analogy: `Exam roll numbers like 2026-CS-07-0153: year, branch, section, then a serial number. Each section office numbers its own students without calling the others, yet every roll number is unique, and you can tell the year from it.`,
    visual: "snowflake",
    how: {
      visual: "id-options",
      steps: [
        "Assign each generator a unique machine id at startup (config, ZooKeeper/etcd lease).",
        "On each request read the current time in ms since a custom epoch (e.g. 1 Jan 2025).",
        "Same ms as the last id → increment the 12-bit sequence; new ms → reset it to 0.",
        "Sequence overflow (4096 in one ms) → wait for the next millisecond.",
        "Clock moved backwards → refuse (or wait) until it passes the last timestamp used.",
        "Combine: `ts << 22 | dc << 17 | machine << 12 | seq`.",
      ],
    },
    concepts: [
      { term: "Snowflake", meaning: "1 sign + 41 time + 5 DC + 5 machine + 12 sequence bits." },
      { term: "Custom epoch", meaning: "Start counting from your launch date so 41 bits last ~69 years." },
      { term: "k-sortable", meaning: "Ids increase with time (roughly), good for B-tree inserts and pagination." },
      { term: "Ticket server", meaning: "Central DB that hands out numbers (Flickr) — simple, but a SPOF unless doubled." },
      { term: "UUID v4 vs v7", meaning: "Random 128-bit vs time-ordered 128-bit." },
      { term: "Clock rollback", meaning: "NTP moving time backwards could create duplicates; must be guarded." },
    ],
    mistakes: [
      "Two servers configured with the same machine id.",
      "Ignoring clock rollback.",
      "Promising strict global ordering — ids from different machines in the same ms aren't ordered.",
    ],
    remember: "Snowflake: time | datacentre | machine | sequence — unique, 64-bit, time-sortable, no coordination per id.",
  },

  "Design a notification system": {
    simple: `Send notifications (push, SMS, email, in-app) when something happens: "Your order has shipped". Requirements: millions per day, respect user preferences and quiet hours, templates in many languages, retries, no duplicates, and a slow provider shouldn't delay other channels.`,
    analogy: `A post office sorting room. Letters come in from many senders; clerks check the address book (preferences), put each letter in the right bag — speed post, courier, local — and each bag goes out with its own delivery team. A late courier van doesn't stop speed post.`,
    visual: "notification-arch",
    how: {
      steps: [
        "Services call `POST /notify {userId, type, data}` or publish an event.",
        "Notification service loads user preferences (opted out? quiet hours? which channels?) and device tokens / contacts.",
        "Renders the template for the user's language and dedups (same event id already sent?).",
        "Puts one message per channel on that channel's queue (push, SMS, email).",
        "Channel workers call providers (FCM/APNs, Twilio, SES) with retries and backoff; permanent failures go to a DLQ.",
        "Record delivery status and opens/clicks for analytics; rate-limit per user so nobody gets spammed.",
      ],
    },
    concepts: [
      { term: "Channel", meaning: "Push, SMS, email, in-app, WhatsApp — each with its own provider and limits." },
      { term: "Template", meaning: "Message text with placeholders, per type and language." },
      { term: "User preferences", meaning: "Opt-outs, channel choice, quiet hours, frequency caps." },
      { term: "Queue per channel", meaning: "Isolates slow or failing providers (bulkhead)." },
      { term: "Dedup key", meaning: "Event id stored for a while so retries don't send twice." },
      { term: "Priority", meaning: "OTPs and security alerts jump ahead of marketing messages." },
    ],
    mistakes: [
      "Calling SMS/email providers synchronously from the order service.",
      "One shared queue for OTPs and marketing blasts — OTPs arrive 20 minutes late.",
      "No per-user rate limit, so a bug sends a user 500 notifications.",
    ],
    remember: "Check preferences → render template → dedup → queue per channel → workers with retries → track delivery.",
  },

  "Design a news feed (Facebook / Twitter)": {
    simple: `Show each user a feed of recent posts from people they follow. Reads vastly outnumber writes, and opening the app must be instant. The core decision is when to build each feed:

    Fan-out on write (push): when someone posts, copy the post id into every follower's feed cache — reads are instant. Fan-out on read (pull): build the feed when the user opens the app — writes are cheap. Real systems use a hybrid: push for normal users, pull for celebrities with crores of followers.`,
    analogy: `A newspaper delivery boy. Push: the moment a paper is printed, he drops a copy at every subscriber's door — reading is instant. Pull: you go to the stall and pick up the papers you like. For a hugely popular paper, printing a copy for every house in advance is too slow, so people pick it up at the stall.`,
    visual: "feed-fanout",
    how: {
      steps: [
        "**Post:** save the post (posts DB + media in S3), then publish a PostCreated event.",
        "**Fan-out workers:** get the author's followers; for each, push the post id to the front of `feed:{followerId}` in Redis (keep ~500 ids).",
        "**Skip celebrities:** authors with > ~1 lakh followers aren't fanned out.",
        "**Read:** take the cached feed ids, merge in recent posts from followed celebrities, then hydrate ids into full posts (cached).",
        "**Rank:** order by a score (recency, affinity, engagement) instead of pure time; paginate with a cursor.",
        "**Inactive users:** don't fan out to users who haven't opened the app in 30 days; build theirs on read.",
      ],
    },
    concepts: [
      { term: "Fan-out on write", meaning: "Precompute feeds at post time. Fast reads, heavy writes." },
      { term: "Fan-out on read", meaning: "Compute at read time. Cheap writes, slower reads." },
      { term: "Celebrity / hot-key problem", meaning: "One post → crores of feed writes; handled by pulling instead." },
      { term: "Feed cache", meaning: "Per-user list of post ids in Redis." },
      { term: "Hydration", meaning: "Turning ids into full posts with author, counts, media URLs." },
      { term: "Cursor pagination", meaning: "'Give me 20 posts older than id X' — stable as new posts arrive." },
    ],
    compare: {
      head: ["", "Push (on write)", "Pull (on read)"],
      rows: [
        ["Read latency", "Very low", "Higher"],
        ["Write cost", "One write per follower", "One write"],
        ["Celebrities", "Very expensive", "Fine"],
        ["Inactive users", "Wasted work", "No work"],
      ],
    },
    mistakes: [
      "Pure fan-out on write — breaks for celebrity accounts.",
      "Storing full post objects in each feed instead of ids.",
      "Offset pagination (page 2, 3…) that shows duplicates as new posts arrive.",
    ],
    remember: "Hybrid fan-out: push post ids to normal followers' cached feeds, pull celebrity posts at read time, then rank and hydrate.",
  },

  "Design a chat system (WhatsApp)": {
    simple: `Build 1:1 and group messaging with online status and sent/delivered/read ticks. Messages must arrive in order, never be lost, and reach users who are offline later.

    Each phone keeps a persistent WebSocket connection to a gateway server. The chat service stores every message first, then delivers it through whichever gateway the recipient is connected to — or keeps it until they come online.`,
    analogy: `A courier office. You hand over a letter (send), the office stamps it received (one tick). If the receiver is home, it's delivered right away (two ticks); if not, it waits in the office until they're back. When they open it, the courier tells you (blue ticks).`,
    visual: "chat-arch",
    how: {
      visual: "message-receipts",
      steps: [
        "On app open, the client connects a WebSocket to a gateway; the session registry records `user → gateway`.",
        "Sender sends `{chatId, clientMsgId, text}`. The chat service assigns a per-chat sequence number and stores it (Cassandra, partitioned by chatId).",
        "Server acks the sender → **one tick**.",
        "Look up the recipient's gateway; push the message. If offline, keep it in their pending queue and send a push notification.",
        "Recipient's app acks → **two ticks** are sent back; on opening the chat → **blue ticks**.",
        "Groups: store once per group, fan out delivery to each member's gateway (cap group size, e.g. 1024).",
        "Presence: clients heartbeat every ~30 s; 'last seen' is updated lazily and broadcast only to contacts who are looking.",
      ],
    },
    concepts: [
      { term: "WebSocket gateway", meaning: "Servers holding millions of long-lived connections." },
      { term: "Session registry", meaning: "Map of user → connected gateway, in Redis." },
      { term: "Per-chat sequence number", meaning: "Gives a total order inside a chat even if messages arrive out of order." },
      { term: "clientMsgId", meaning: "Id generated on the phone so retries don't create duplicate messages." },
      { term: "Store-and-forward", meaning: "Persist first, then deliver; offline users get it later." },
      { term: "End-to-end encryption", meaning: "Only the phones hold keys; servers store ciphertext (Signal protocol)." },
    ],
    mistakes: [
      "Delivering before storing — a crash loses the message.",
      "Using server timestamps from different machines to order messages.",
      "Polling for new messages instead of a persistent connection.",
    ],
    remember: "Persistent WebSockets + a registry of who's where; store with a per-chat sequence, then deliver; acks drive the ticks.",
  },

  "Design search autocomplete": {
    simple: `As the user types "ip", show the top 5 suggestions ("iphone 16", "ipl score") within ~100 ms, for every keystroke, for crores of users.

    Keep a trie (prefix tree) where each node already stores the top-k completions for its prefix, so a lookup is just walking to the prefix node. The trie is built offline from search logs (hourly or daily) and served from memory and caches.`,
    analogy: `A shopkeeper who has noticed what people usually ask for. As soon as you say "Ma…", they say "Maggi? Marie biscuits?" — they've pre-memorised the top items for each starting sound instead of thinking through every product.`,
    visual: "trie-topk",
    how: {
      steps: [
        "**Collect:** log every search query (async, sampled).",
        "**Aggregate offline:** count query frequency over a recent window with Spark; drop rare/blocked terms.",
        "**Build:** create a trie and store the top-k (e.g. 10) queries at every node; serialise it.",
        "**Serve:** load the trie into memory on suggestion servers (sharded by first letters if large).",
        "**Request:** `GET /suggest?q=ip` → walk to node 'ip' → return its top list. Debounce on the client (wait ~100 ms after typing).",
        "**Cache:** popular prefixes in CDN/browser cache with a short TTL.",
      ],
    },
    concepts: [
      { term: "Trie", meaning: "Tree where each edge is a character; a path spells a prefix." },
      { term: "Top-k per node", meaning: "Precomputed best completions so lookups are O(length of prefix)." },
      { term: "Offline aggregation", meaning: "Rebuild from logs periodically instead of updating the trie per search." },
      { term: "Debouncing", meaning: "Client waits for a typing pause before calling the API." },
      { term: "Trending boost", meaning: "A stream job adds fresh spikes (a cricket match) between rebuilds." },
      { term: "Filtering", meaning: "Remove offensive or legally blocked suggestions before publishing." },
    ],
    mistakes: [
      "Walking the whole subtree at query time to find the most popular completions.",
      "Updating the trie synchronously on every search.",
      "Calling the server on every keystroke without debounce or caching.",
    ],
    remember: "Trie with top-k stored at each node, built offline from logs, served from memory with caching.",
  },

  "Design YouTube / Netflix": {
    simple: `Let creators upload videos and let crores of viewers stream them smoothly on any network. The two halves are very different: uploads go through a heavy processing pipeline (transcoding into many resolutions), while viewing is almost entirely served by CDNs.

    Videos are cut into small segments (2–10 s) in several qualities; the player picks the best quality the network can handle for each segment — adaptive bitrate streaming.`,
    analogy: `A film distributor: the studio delivers one master print, the lab makes copies for big screens, small screens and phones (transcoding), and copies are kept in every city's cinema (CDN) so nobody waits for a reel from Mumbai.`,
    visual: "video-pipeline",
    how: {
      visual: "abr",
      steps: [
        "**Upload:** client gets a pre-signed URL and uploads the raw file (multipart, resumable) to object storage.",
        "**Queue:** an upload-complete event starts the processing DAG.",
        "**Transcode:** split into chunks, encode in parallel into 240p → 4K with several codecs; create HLS/DASH segments and a manifest; make thumbnails.",
        "**Publish:** push popular content to CDN edges (Netflix pre-positions overnight); store metadata (title, owner, status) in the DB.",
        "**Watch:** player downloads the manifest, then segments from the nearest edge, switching quality per segment based on measured bandwidth.",
        "**Counts & recommendations:** view events go to Kafka for counters and ML, never synchronously to the DB.",
      ],
    },
    concepts: [
      { term: "Transcoding", meaning: "Converting video to other resolutions, bitrates and codecs." },
      { term: "HLS / DASH", meaning: "Streaming formats: a manifest listing segment files per quality." },
      { term: "Adaptive bitrate (ABR)", meaning: "Player switches quality segment by segment to avoid buffering." },
      { term: "CDN / Open Connect", meaning: "Edge servers (even inside ISPs) serve the video bytes." },
      { term: "Metadata vs blob", meaning: "Titles and stats in a DB; video bytes in object storage." },
      { term: "Long tail", meaning: "Most videos are rarely watched; serve them from origin, cache only popular ones at edges." },
    ],
    mistakes: [
      "Streaming whole MP4 files from your servers instead of segments via a CDN.",
      "Transcoding synchronously during upload.",
      "Updating view counts with one DB write per view.",
    ],
    remember: "Upload → object store → parallel transcode into segments → CDN; players use adaptive bitrate.",
  },

  "Design Google Drive / Dropbox": {
    simple: `Store users' files in the cloud and keep them in sync across laptop, phone and the web, including large files, edits while offline, and sharing.

    The key trick is chunking: split each file into ~4 MB blocks identified by their hash. When a file changes, only the changed blocks are uploaded, and identical blocks are stored once (dedup). A metadata service tracks which blocks make up each version of each file.`,
    analogy: `A book stored as separate chapters. If you edit chapter 7, you only send the new chapter 7, not the whole book. And if two people have the same chapter, the library keeps only one copy.`,
    visual: "dropbox-arch",
    how: {
      steps: [
        "The desktop client watches the folder; a changed file is split into blocks and each block hashed (SHA-256).",
        "Client asks the metadata service which hashes are new; uploads only those blocks to the block store (S3).",
        "Client commits the new file version: `file → [hash1, hash2, …]`, with the version it was based on.",
        "Metadata service bumps the version and notifies the user's other devices (long poll / WebSocket).",
        "Other devices fetch the new block list and download only missing blocks.",
        "Conflict: if the base version is stale (edited elsewhere offline), keep both — save 'file (conflicted copy)'.",
      ],
    },
    concepts: [
      { term: "Chunking", meaning: "Split files into blocks so changes and retries work per block." },
      { term: "Content hash / dedup", meaning: "Block id = hash of its bytes; identical blocks stored once." },
      { term: "Metadata DB", meaning: "Files, folders, versions, block lists, sharing — strongly consistent SQL." },
      { term: "Delta sync", meaning: "Upload only changed blocks." },
      { term: "Conflict copy", meaning: "When two devices edit the same base version, keep both instead of losing one." },
      { term: "Notification service", meaning: "Tells devices that something changed so they pull." },
    ],
    mistakes: [
      "Re-uploading the whole file on every save.",
      "Silently letting the last writer win and losing someone's edits.",
      "Putting file bytes in the metadata database.",
    ],
    remember: "Hash-named blocks in object storage, block lists and versions in a metadata DB, notify devices, keep conflicted copies.",
  },

  "Design a web crawler": {
    simple: `Download billions of web pages (for a search engine or archive), following links from page to page, while being polite to websites (not hammering them), respecting robots.txt, and not crawling the same page twice.

    It's a big loop: take a URL from a priority queue (the frontier), fetch it, store it, extract links, filter out ones already seen, and add the new ones back to the frontier.`,
    analogy: `A surveyor mapping every house in a city: start with a few known addresses, visit each, note every new street mentioned, add them to the to-visit list, and cross out streets already visited. And don't knock on the same house 100 times in a minute.`,
    visual: "crawler-arch",
    how: {
      steps: [
        "Start from seed URLs in the **frontier**, which has priority queues (important sites first) and per-host queues for politeness.",
        "A fetcher takes a URL whose host is allowed now (≥ 1 s since its last fetch), checks cached robots.txt, resolves DNS (cached), downloads.",
        "Skip near-duplicate content using a fingerprint (SimHash); store the page in object storage.",
        "Parse links, normalise them (lower-case host, drop #fragments), filter by type and domain rules.",
        "Check a 'seen URL' Bloom filter / DB; add only new URLs to the frontier.",
        "Distribute by hashing the host to a crawler node, so one node owns a site's politeness.",
        "Re-crawl pages on a schedule based on how often they change.",
      ],
    },
    concepts: [
      { term: "URL frontier", meaning: "The to-crawl queue, with priority and per-host politeness." },
      { term: "Politeness", meaning: "Limit request rate per host; respect robots.txt and Crawl-delay." },
      { term: "URL dedup", meaning: "Bloom filter or hash set of normalised URLs already seen." },
      { term: "Content dedup", meaning: "Fingerprints catch the same page under different URLs." },
      { term: "Spider trap", meaning: "Infinite URL spaces (calendars); cap depth and URL length." },
      { term: "DNS cache", meaning: "DNS lookups are slow; cache them in the crawler." },
    ],
    mistakes: [
      "One global FIFO queue — you end up hitting one site with hundreds of parallel requests.",
      "No trap protection, crawling infinite generated pages.",
      "Checking 'seen' only by exact URL string without normalisation.",
    ],
    remember: "Frontier with per-host politeness → fetch → dedup content → extract links → Bloom-filter seen URLs → back to frontier.",
  },

  "Design Uber / ride sharing": {
    simple: `Match riders with nearby drivers in seconds, track trips live, and charge correctly. The hard parts: lakhs of drivers sending GPS every few seconds, finding the nearest available drivers fast, and making sure one ride goes to exactly one driver.

    Driver locations live in an in-memory geospatial index (geohash/H3 cells), not a regular database. A trip is a state machine with strictly controlled transitions.`,
    analogy: `A taxi stand manager with a city map divided into blocks. Every few seconds drivers shout their block number. When a customer asks for a cab, the manager looks at that block and nearby blocks, picks the closest free driver, and marks him as taken so nobody else gets him.`,
    visual: "uber-arch",
    how: {
      visual: "trip-states",
      steps: [
        "Drivers send location every ~4 s over a persistent connection; the location service updates `cell → drivers` in Redis (with a TTL so idle drivers drop out).",
        "Rider requests a trip: matching service finds drivers in the rider's cell and neighbouring cells, then ranks by ETA (road distance, not straight line).",
        "Offer to the best driver with a short timeout; atomically set the driver's status to busy (compare-and-set) so two trips can't grab him.",
        "Trip service moves the state machine: REQUESTED → MATCHED → ARRIVING → IN_TRIP → COMPLETED → PAID.",
        "During the trip, location streams to the rider; the route is saved for fare calculation.",
        "Surge pricing: a stream job compares demand and supply per cell every minute and sets a multiplier.",
      ],
    },
    concepts: [
      { term: "Geospatial index", meaning: "Geohash / H3 cells → drivers, held in memory for fast nearby search." },
      { term: "Location update rate", meaning: "5 lakh drivers ÷ 4 s ≈ 1.25 lakh writes/s — too much for a SQL DB." },
      { term: "ETA ranking", meaning: "Nearest by road time, using a routing engine, not straight-line distance." },
      { term: "Atomic dispatch", meaning: "Compare-and-set on driver status prevents double assignment." },
      { term: "Trip state machine", meaning: "Only valid transitions allowed; every change is persisted." },
      { term: "Surge pricing", meaning: "Price multiplier per area from real-time demand/supply." },
    ],
    mistakes: [
      "Writing every GPS ping to a relational database.",
      "Searching only the rider's own cell.",
      "Offering one ride to several drivers without an atomic 'first accept wins'.",
    ],
    remember: "In-memory geo index of live drivers, search nearby cells, rank by ETA, atomic assignment, trip as a state machine.",
  },

  "Design a payment system": {
    simple: `Take money from customers (via a payment service provider like Razorpay or Stripe), record it correctly, and pay merchants. The top requirement isn't speed but correctness: never charge twice, never lose a payment, and always be able to prove where every rupee went.

    Every payment carries an idempotency key, every movement of money is recorded in a double-entry ledger, and the system regularly reconciles its records against the bank's/PSP's reports.`,
    analogy: `A careful accountant. Every transaction is written in two columns (from whom, to whom) so the books always balance. Every evening they match their books against the bank statement line by line, and investigate anything that doesn't match.`,
    visual: "payment-arch",
    how: {
      visual: "ledger",
      steps: [
        "Checkout calls `POST /payments` with an idempotency key; payment service creates a row with status PENDING.",
        "Call the PSP with the same key (they dedup too); the customer completes 3-D Secure / UPI on the PSP's page.",
        "The PSP's result arrives via redirect and a **webhook**; verify the webhook signature and update status idempotently.",
        "On success, write ledger entries (debit customer, credit merchant payable) in one transaction, and emit PaymentSucceeded.",
        "Unknown outcome (timeout)? Don't retry blindly — query the PSP for the status.",
        "Daily **reconciliation**: compare your ledger with the PSP settlement file; flag mismatches.",
        "Payouts to merchants run as a separate batch with their own idempotency and ledger entries.",
      ],
    },
    concepts: [
      { term: "PSP", meaning: "Payment service provider (Razorpay, Stripe, PayU) that talks to card networks/UPI." },
      { term: "Idempotency key", meaning: "Prevents double charges when requests are retried." },
      { term: "Double-entry ledger", meaning: "Every transaction = equal debits and credits; append-only." },
      { term: "Webhook", meaning: "PSP calls you back with the final result; must be verified and idempotent." },
      { term: "Reconciliation", meaning: "Matching internal records with external statements." },
      { term: "Payment states", meaning: "CREATED → PENDING → SUCCEEDED / FAILED → REFUNDED; never delete rows." },
    ],
    mistakes: [
      "Storing card numbers yourself (PCI scope) instead of PSP tokens.",
      "Updating a balance column in place instead of an append-only ledger.",
      "Treating a timeout as a failure and charging again.",
    ],
    remember: "Idempotency key on every call, webhooks as the source of truth, append-only double-entry ledger, daily reconciliation.",
  },

  "Design an e-commerce checkout (Amazon)": {
    simple: `Handle cart → checkout → payment → order confirmation for millions of shoppers, without overselling stock — especially during flash sales where thousands try to buy the last 100 items in the same second.

    The pattern: reserve inventory with an expiry when checkout starts, run the order as a saga (reserve → pay → confirm), and release the reservation if payment fails or times out.`,
    analogy: `Holding an item at a shop counter: "I'll keep this aside for you for 10 minutes while you go to the ATM." If you don't come back, it goes back on the shelf. Two customers can never be holding the same last item.`,
    visual: "checkout-arch",
    how: {
      visual: "oversell",
      steps: [
        "Cart lives in a fast store (Redis/DynamoDB) keyed by user; prices are re-validated at checkout.",
        "Place order: create order (PENDING) with an idempotency key.",
        "Reserve stock atomically: `UPDATE inventory SET available = available - 1, reserved = reserved + 1 WHERE sku = ? AND available > 0` — 0 rows means sold out.",
        "Take payment; on success mark the order CONFIRMED and turn the reservation into a sale.",
        "On failure or after 10–15 minutes, a compensating step releases the reservation.",
        "Flash sale: put buyers in a queue / token system, pre-load stock counters into Redis (DECR), and only send winners to checkout.",
      ],
    },
    concepts: [
      { term: "Inventory reservation", meaning: "Hold stock for a limited time during checkout." },
      { term: "Overselling", meaning: "Selling more than you have, caused by read-then-write races." },
      { term: "Conditional update", meaning: "Decrement only if stock > 0, atomically in one statement." },
      { term: "Order saga", meaning: "Reserve → pay → confirm, with compensations on failure." },
      { term: "Virtual waiting room", meaning: "Admits users gradually during a flash sale to protect the backend." },
      { term: "Idempotent place-order", meaning: "Double-clicking 'Buy' creates one order, not two." },
    ],
    mistakes: [
      "SELECT stock, then UPDATE in a separate step.",
      "Reserving stock when items are added to the cart (people abandon carts).",
      "Letting a flash sale's traffic hit the main database directly.",
    ],
    remember: "Atomic conditional stock decrement, reservation with expiry, order saga with compensation, queue buyers in flash sales.",
  },

  "Design a distributed message queue": {
    simple: `Build something like Kafka: producers append messages, consumers read them, nothing is lost when a machine dies, and it handles millions of messages per second.

    The core idea is a partitioned, replicated, append-only log on disk. Sequential disk writes and reads are very fast, partitions let you scale out, replication keeps copies, and consumers track their own position (offset).`,
    analogy: `A row of numbered notebooks (partitions). Writers only add lines at the end. Each notebook has photocopies kept by other clerks (replicas). Readers keep their own bookmark, so they can read at their own speed or go back.`,
    visual: "isr-replication",
    how: {
      visual: "kafka-partitions",
      steps: [
        "A topic has P partitions spread across brokers; each partition has a leader and followers.",
        "Producer picks a partition (by key hash), batches messages, sends to the leader.",
        "Leader appends to its segment files; followers fetch and append. With `acks=all`, reply once all in-sync replicas have it.",
        "Consumers in a group are assigned partitions and fetch from their last committed offset.",
        "A controller (Raft-based KRaft) tracks brokers and elects a new leader from the ISR on failure.",
        "Old segments are deleted after the retention period, or compacted to the latest value per key.",
      ],
    },
    concepts: [
      { term: "Append-only log", meaning: "Messages written sequentially; never updated in place." },
      { term: "Segment files", meaning: "A partition is stored as rolling files plus an offset index." },
      { term: "ISR", meaning: "Replicas fully caught up; eligible to become leader." },
      { term: "acks=0/1/all", meaning: "Don't wait / wait for leader / wait for all ISR — speed vs durability." },
      { term: "Consumer offset", meaning: "Committed position per group per partition." },
      { term: "Zero-copy", meaning: "Send file bytes straight from disk cache to the socket (sendfile)." },
    ],
    compare: {
      head: ["Semantics", "How"],
      rows: [
        ["At-most-once", "Commit offset before processing"],
        ["At-least-once", "Process, then commit offset (default)"],
        ["Exactly-once", "Idempotent producer + transactions writing output and offsets together"],
      ],
    },
    mistakes: [
      "Promising global ordering across partitions.",
      "acks=1 with unclean leader election on and expecting no data loss.",
      "Storing messages in a relational DB table as the queue at high volume.",
    ],
    remember: "Partitioned, replicated, append-only log; consumers own offsets; acks=all + ISR for durability.",
  },

  "Design a hotel / ticket booking system (BookMyShow)": {
    simple: `Let users browse shows, pick seats and pay — and guarantee that a seat is never sold to two people, even when thousands try to book the same show the moment tickets open.

    Selecting a seat places a temporary lock with a timeout (say 10 minutes). Payment within that time confirms the booking; otherwise the lock expires and the seat becomes available again.`,
    analogy: `Trying on clothes at a store: when you take a shirt to the trial room, nobody else can buy it. If you leave it there and walk away, after a while the staff put it back on the rack.`,
    visual: "seat-lock",
    how: {
      steps: [
        "Browse shows and the seat map from a read-optimised store with caching.",
        "User selects seats → atomically lock them: Redis `SET seat:{show}:{seat} {user} NX EX 600`, or a DB row update `WHERE status = 'AVAILABLE'`.",
        "If any seat fails to lock, release the others and tell the user to pick again.",
        "Create a booking (PENDING) and start payment with an idempotency key.",
        "Payment success → in one DB transaction mark seats BOOKED (only if still held by this user) and booking CONFIRMED.",
        "Payment fails / times out → release locks. A late payment success after expiry → refund automatically.",
        "Hot shows: a virtual queue admits users in batches when booking opens.",
      ],
    },
    concepts: [
      { term: "Seat lock with TTL", meaning: "Temporary hold that frees itself if the user disappears." },
      { term: "Double booking", meaning: "Two users booked into one seat — prevented by atomic lock / conditional update." },
      { term: "Optimistic vs pessimistic", meaning: "Version check at commit vs lock rows up front; seat booking usually uses a short pessimistic hold." },
      { term: "Payment timeout", meaning: "Booking expires if payment doesn't finish in time." },
      { term: "Idempotent confirm", meaning: "Webhook retries don't confirm twice." },
      { term: "Virtual waiting room", meaning: "Queue that protects the system when booking opens for a big release." },
    ],
    mistakes: [
      "Checking 'is seat free?' and then booking it as two separate steps.",
      "Holding seats forever when users close the app.",
      "Confirming a booking from payment success without checking the lock is still theirs.",
    ],
    remember: "Atomically lock seats with a TTL, pay within the window, confirm with a conditional update, release on failure.",
  },

  "Design a metrics & monitoring system": {
    simple: `Collect numbers like CPU usage, request rate and latency from thousands of servers every few seconds, store them efficiently, draw dashboards, and alert someone when something goes wrong.

    The data is time series: (metric name, labels, timestamp, value). It's written constantly, read mostly as recent ranges, and old data can be summarised. A specialised time-series database stores it compactly, and an alert engine evaluates rules continuously.`,
    analogy: `A hospital ICU monitor: it records heart rate every second, shows the last hour as a graph, keeps only per-hour summaries for last year's records, and beeps loudly when a value crosses a danger line for long enough.`,
    visual: "metrics-arch",
    how: {
      steps: [
        "Services expose counters/gauges/histograms (`/metrics`) or push via an agent.",
        "Collectors scrape every 15 s (pull) — easy to tell when a target is down — and forward to Kafka to buffer spikes.",
        "Time-series DB writes points into per-series chunks with delta + XOR compression (~1–2 bytes per point).",
        "Downsampling jobs roll raw data into 1-minute / 1-hour averages; raw kept ~15 days, rollups for a year.",
        "Dashboards query ranges with aggregation (`rate(http_requests_total[5m])`).",
        "Alert engine evaluates rules every minute; when a condition holds for N minutes it notifies (PagerDuty, Slack) with dedup and grouping.",
      ],
    },
    concepts: [
      { term: "Time series", meaning: "Values of one metric + label set over time." },
      { term: "Pull vs push", meaning: "Server scrapes targets (Prometheus) vs agents send data (StatsD, OTel)." },
      { term: "Counter / gauge / histogram", meaning: "Only goes up / goes up and down / distribution in buckets (for percentiles)." },
      { term: "Downsampling", meaning: "Store lower resolution for older data to save space." },
      { term: "Cardinality", meaning: "Number of unique series; unbounded labels (user_id) explode it." },
      { term: "Alert 'for' duration", meaning: "Fire only if the condition lasts, avoiding flapping alerts." },
    ],
    mistakes: [
      "Storing metrics in a general relational table.",
      "Using user ids or request ids as metric labels.",
      "Alerting on raw CPU instead of user-facing symptoms (errors, latency).",
    ],
    remember: "Collect → buffer → time-series DB with compression and downsampling → dashboards + rule-based alerts.",
  },

  "Design Google Docs (collaborative editing)": {
    simple: `Several people edit the same document at the same time and everyone sees each other's changes and cursors live, with every copy ending up identical.

    The hard part is concurrent edits: if two people insert text at the same position, the operations must be adjusted so both copies converge. Operational Transformation (OT) does this with a central server ordering operations; CRDTs use data structures that merge automatically without a central order.`,
    analogy: `Two people editing the same printed page. Asha writes 'S' at the end of 'CAT'; Ravi writes '!' at the same spot. If each just applies the other's change at the original position, they end up with 'CAT!S' and 'CATS!'. OT says: "Asha's insert came first, so shift Ravi's one place to the right" — both get 'CATS!'.`,
    visual: "ot-example",
    how: {
      steps: [
        "Each open document has one collaboration session (on one server, chosen by doc id).",
        "Clients send operations (`insert 'S' at 3, based on revision 41`) over WebSockets and apply them locally right away.",
        "The server orders operations, transforms any that were made against an older revision, assigns revision 42, and broadcasts.",
        "Clients transform incoming operations against their own pending ones and apply them.",
        "The operation log is persisted; periodic snapshots allow fast loading and version history.",
        "Cursor positions and selections are sent as lightweight presence messages, not stored.",
      ],
    },
    concepts: [
      { term: "Operational Transformation (OT)", meaning: "Adjust concurrent operations against each other; needs a central server. Google Docs." },
      { term: "CRDT", meaning: "Conflict-free replicated data type; merges in any order, works peer-to-peer/offline. Figma, Yjs." },
      { term: "Revision number", meaning: "Which document version an operation was based on." },
      { term: "Optimistic local apply", meaning: "Show your edit instantly; reconcile with the server later." },
      { term: "Snapshot + op log", meaning: "Store periodic full copies plus the operations since." },
      { term: "Presence", meaning: "Who's online, cursors, selections — ephemeral." },
    ],
    compare: {
      head: ["", "OT", "CRDT"],
      rows: [
        ["Needs central server", "Yes", "No"],
        ["Offline editing", "Limited", "Natural"],
        ["Complexity", "Transform functions", "Metadata per character"],
        ["Used by", "Google Docs", "Figma, Notion-like apps, Yjs"],
      ],
    },
    mistakes: [
      "Locking the whole document or paragraph for one editor.",
      "Last-write-wins on the whole document.",
      "Saving the full document on every keystroke.",
    ],
    remember: "Send small operations over WebSockets; OT transforms concurrent ops via a central server, CRDTs merge without one.",
  },

  "Design a leaderboard / top-K system": {
    simple: `Show the top players of a game (or top sellers, trending hashtags) in real time, plus "your rank", for crores of users with scores changing constantly.

    For exact leaderboards, Redis sorted sets are ideal: they keep members ordered by score and support update, top-N and rank in O(log n). For "top-K most frequent items" over huge streams, approximate structures like count-min sketch plus a small heap avoid storing every item.`,
    analogy: `A scoreboard in a cricket tournament that reorders itself the moment a team scores: anyone can glance at the top 10, or ask "where is my team?", without someone re-sorting the whole list by hand.`,
    visual: "leaderboard",
    how: {
      steps: [
        "Game server sends score updates: `ZINCRBY lb:2026-10 50 user:42`.",
        "Top 10: `ZREVRANGE lb:2026-10 0 9 WITHSCORES`. My rank: `ZREVRANK lb:2026-10 user:42`.",
        "Use separate keys per period (daily, monthly) with expiry; also persist scores to a DB for durability.",
        "Very large boards: shard by score range or keep an exact top-N set plus approximate ranks for everyone else.",
        "Top-K trending items over a stream: count-min sketch for counts + a min-heap of size K, per time window.",
      ],
    },
    concepts: [
      { term: "Sorted set (ZSET)", meaning: "Redis structure ordered by score; skip list + hash." },
      { term: "ZINCRBY / ZREVRANGE / ZREVRANK", meaning: "Increment a score / get top N / get one member's rank." },
      { term: "Time-bucketed boards", meaning: "Separate keys per day/week/month; old ones expire." },
      { term: "Count-min sketch", meaning: "Approximate counts in fixed memory." },
      { term: "Min-heap of K", meaning: "Keeps the current top K; replace the smallest when a bigger one appears." },
      { term: "Ties", meaning: "Break ties by earlier achievement time (encode it into the score)." },
    ],
    mistakes: [
      "`SELECT … ORDER BY score DESC` on a huge table for every page view.",
      "Counting every distinct hashtag exactly when approximate top-K is enough.",
      "One giant all-time key that never expires and keeps growing.",
    ],
    remember: "Redis sorted sets for exact leaderboards; count-min sketch + heap for approximate top-K on streams.",
  },

  "Design a distributed job scheduler": {
    simple: `Run jobs at the right time ("send invoices at 9 AM daily", "retry this in 5 minutes"), across many machines, with each job run happening exactly once even if machines crash, plus retries and dependencies between jobs (job B after job A).

    Jobs and their next run time live in a database. Scheduler nodes find due jobs and claim each with a lease (a time-limited lock), push them to a queue, and workers run them and report back.`,
    analogy: `An office task board: each task card has a due time. When it's due, a clerk writes their name and "until 10:30" on the card (lease) and does the task. If they don't finish by 10:30 (they went home sick), someone else can take the card.`,
    visual: "scheduler-arch",
    how: {
      visual: "job-states",
      steps: [
        "Users register jobs: schedule (cron or one-off), payload, retry policy, timeout, dependencies.",
        "Store `next_run_at` and an index on it; partition jobs by id across scheduler nodes.",
        "Every second, a scheduler claims due jobs: `UPDATE … SET lease_owner = me, lease_until = now + 30s WHERE next_run_at <= now AND (lease_until IS NULL OR lease_until < now)`.",
        "Push claimed runs to a queue; workers execute and heartbeat to extend the lease.",
        "On success, record the result and compute the next run time; on failure, schedule a retry with backoff.",
        "Make job handlers idempotent with a run id — 'exactly once' in practice means at-least-once + idempotency.",
        "For DAGs, start a job only when all its parents have succeeded.",
      ],
    },
    concepts: [
      { term: "Cron expression", meaning: "`0 9 * * *` = every day at 09:00." },
      { term: "Lease", meaning: "A lock with an expiry; protects against a crashed owner holding a job forever." },
      { term: "Heartbeat", meaning: "Worker regularly extends its lease while running." },
      { term: "At-least-once + idempotency", meaning: "How 'exactly once' is achieved in practice." },
      { term: "DAG", meaning: "Directed acyclic graph of job dependencies (Airflow)." },
      { term: "Misfire policy", meaning: "What to do with runs missed during downtime: run once now, run all, or skip." },
    ],
    mistakes: [
      "Running cron on every app server — the job runs N times.",
      "Locks without expiry, so a crashed worker blocks the job forever.",
      "Non-idempotent jobs (sending emails) with automatic retries.",
    ],
    remember: "Jobs with next-run times in a DB, claimed with leases, executed by workers via a queue, retried idempotently.",
  },

  "Design Instagram": {
    simple: `Let users upload photos and short videos, follow others, see a feed of followed accounts, like and comment, and post 24-hour stories — for crores of daily users.

    It combines several patterns: media in object storage served via CDN, metadata in sharded databases, a follow graph, a precomputed feed (hybrid fan-out), and stories as feed items with a 24-hour expiry.`,
    analogy: `A huge photo exhibition: the photos sit in a warehouse with copies at every city's gallery (S3 + CDN); a register lists who took which photo (posts DB); each visitor has a personalised album of new photos from photographers they follow (feed cache); and the 'today only' corner is cleared every 24 hours (stories).`,
    visual: "instagram-arch",
    how: {
      visual: "feed-fanout",
      steps: [
        "**Upload:** app gets a pre-signed URL, uploads the photo to S3; workers create resized versions; CDN serves them.",
        "**Post:** save `post_id, user_id, media keys, caption, created_at` in a posts DB sharded by user_id.",
        "**Follow graph:** `follower → followee` edges in a store indexed both ways (who I follow, who follows me).",
        "**Feed:** fan-out workers push the new post id into followers' Redis feed lists; celebrity posts are merged at read time.",
        "**Open app:** read feed ids, hydrate posts (cached), rank, and paginate with a cursor.",
        "**Likes/comments:** counters updated asynchronously (approximate counts shown).",
        "**Stories:** stored with `expires_at = created + 24h`; feed of stories built the same way; TTL deletes them.",
      ],
    },
    concepts: [
      { term: "Media pipeline", meaning: "Upload original → generate sizes/formats → CDN." },
      { term: "Sharded posts DB", meaning: "Partition by user_id so a user's posts are together." },
      { term: "Follow graph", meaning: "Who follows whom; needed for fan-out and suggestions." },
      { term: "Hybrid fan-out", meaning: "Push for normal accounts, pull for celebrities." },
      { term: "Counter service", meaning: "Likes/views aggregated asynchronously, not one DB update per like." },
      { term: "TTL content", meaning: "Stories expire automatically after 24 hours." },
    ],
    example: `~~~
    Estimate: 50 crore DAU, 10 crore photos/day × 300 KB (+ resized copies)
      ≈ 30 TB/day of new media → object storage + CDN, never the DB
    Feed reads: 50 crore × 10 opens/day ≈ 5 × 10^9 / 10^5 s ≈ 50,000 reads/s → cache-first
    ~~~`,
    mistakes: [
      "Storing images in the database.",
      "Recomputing every feed from scratch on each app open.",
      "Incrementing like counts synchronously in the posts table for viral posts (hot row).",
    ],
    remember: "S3 + CDN for media, sharded metadata, follow graph, hybrid fan-out feed cache, async counters, TTL for stories.",
  },
};
