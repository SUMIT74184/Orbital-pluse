import type { TopicGuide } from "./index";

// Plain-language lessons for the System Design track's concept topics, keyed by topic title (see src/data/topics.ts).
export const SD_GUIDES: Record<string, TopicGuide> = {
  "How to approach a system design interview": {
    simple: `A system design interview is not a quiz with one right answer. The interviewer gives you a vague problem ("design WhatsApp") and watches how you think: do you ask the right questions, pick sensible building blocks, and explain the trade-offs?

    The trick is to follow the same plan every time, out loud. First pin down what to build, then how big it is, then draw the simple version, then make it survive scale and failures.`,
    analogy: `Think of an architect asked to "design a house". A good one doesn't start drawing walls. They ask: how many people live here? Budget? Do you work from home? Need parking? Only then do they sketch rooms, and finally worry about plumbing and earthquakes.

    Requirements → rough size → sketch → details. Same in system design.`,
    visual: "sd-framework",
    how: {
      visual: "sd-time",
      steps: [
        "**Clarify requirements (5 min).** Functional: what users can do (send a message, see read ticks). Non-functional: scale, latency, availability, consistency. Write both lists down.",
        "**Estimate (3 min).** Daily active users → requests per second → storage per year. Round hard: 1 day ≈ 10⁵ seconds.",
        "**Define the API (3–4 min).** 3–5 endpoints, e.g. `POST /messages`, `GET /messages?chat=…&before=…`.",
        "**Data model (3–4 min).** Main tables or keys, and which database type fits the access pattern.",
        "**High-level design (10 min).** Client → load balancer → services → cache / DB / queue. Walk one request through it.",
        "**Deep dive (15 min).** Pick the 1–2 hardest parts (fan-out, hot keys, ordering) and go deep. Let the interviewer steer.",
        "**Wrap up (5 min).** Bottlenecks, single points of failure, monitoring, and what you'd do with more time.",
      ],
    },
    concepts: [
      { term: "Functional requirements", meaning: "What the system does: features users see (post a photo, follow someone)." },
      { term: "Non-functional requirements", meaning: "How well it does it: scale, latency, availability, consistency, durability, cost." },
      { term: "Back-of-the-envelope estimate", meaning: "Quick rounded maths for QPS, storage and bandwidth to decide what the design must handle." },
      { term: "QPS", meaning: "Queries per second. Peak QPS is usually 2–3× the average." },
      { term: "Read/write ratio", meaning: "How many reads per write. A URL shortener is ~100:1, so you optimise reads with caching." },
      { term: "Trade-off", meaning: "Every choice costs something (e.g. caching = speed but stale data). Saying this out loud earns marks." },
    ],
    example: `~~~
    Estimate for a chat app:
      50 crore daily users × 40 messages/day = 2,000 crore msgs/day
      2 × 10^10 / 10^5 s  ≈ 2 lakh writes/sec (peak ~5 lakh)
      Each message ~100 bytes → 2 TB/day → ~730 TB/year (before replication)
    ⇒ needs sharded storage, and a write-optimised DB like Cassandra.
    ~~~`,
    mistakes: [
      "Jumping straight into drawing boxes without asking a single question.",
      "Spending 15 minutes on requirements and estimates and never reaching the deep dive.",
      "Naming technologies (\"use Kafka\") without saying why it fits this problem.",
      "Designing for Google scale when the interviewer said 10,000 users.",
    ],
    remember: "Requirements → estimates → API → data → high-level → deep dive → bottlenecks, and say the trade-off every time you choose something.",
  },

  "Scalability: vertical vs horizontal": {
    simple: `Scalability means your system can handle more users by adding resources, without being rewritten.

    There are two ways. Vertical scaling (scale up) means buying a bigger machine: more CPU, more RAM. Horizontal scaling (scale out) means adding more machines and spreading the work between them. Big systems scale out, because one machine always has a ceiling and is a single point of failure.`,
    analogy: `A busy chai stall. Vertical scaling: give the one chaiwala a bigger kettle and a faster stove. Works for a while, but he still has only two hands, and if he falls sick the stall closes.

    Horizontal scaling: open three more counters with three chaiwalas and a person at the front sending customers to whichever counter is free (the load balancer). For this to work, any chaiwala must be able to serve any customer, so nobody's order is kept "in one chaiwala's head". That's what "stateless servers" means.`,
    visual: "scale-up-out",
    how: {
      steps: [
        "Start with one server and one database. Scale up first; it's simple and often enough.",
        "Make app servers **stateless**: move sessions to Redis or JWTs, files to S3. Now any server can handle any request.",
        "Put a **load balancer** in front and add servers as traffic grows (auto-scaling).",
        "The database becomes the bottleneck: add **read replicas** and a **cache**.",
        "Still too much? **Shard** the database (split data across machines).",
      ],
    },
    concepts: [
      { term: "Vertical scaling", meaning: "Bigger machine. No code change, but limited, costly at the top end, and one point of failure." },
      { term: "Horizontal scaling", meaning: "More machines. Nearly unlimited and fault tolerant, but needs load balancing and stateless design." },
      { term: "Stateless service", meaning: "Keeps no user data between requests in its own memory, so requests can go to any copy." },
      { term: "Where state lives", meaning: "Databases, caches (Redis), object stores (S3), session stores — not app server memory." },
      { term: "Amdahl's law", meaning: "If 10% of the work can't run in parallel, you can never get more than 10× faster, however many machines you add." },
      { term: "Elasticity", meaning: "Adding and removing machines automatically as load changes (auto-scaling groups)." },
    ],
    compare: {
      head: ["", "Vertical (scale up)", "Horizontal (scale out)"],
      rows: [
        ["How", "Bigger CPU / RAM / disk", "More machines + load balancer"],
        ["Limit", "Biggest machine you can buy", "Practically none"],
        ["Failure", "One box down = all down", "One box down = others carry on"],
        ["Code changes", "None", "Must be stateless; data must be split"],
        ["Typical use", "Databases early on", "Web / app servers, caches, NoSQL"],
      ],
    },
    mistakes: [
      "Keeping user sessions in server memory and then adding a load balancer — users get logged out randomly.",
      "Saying horizontal is always better: for a small app, a bigger box is cheaper and simpler.",
      "Scaling app servers but forgetting the single database behind them.",
    ],
    remember: "Scale up for simplicity, scale out for limits and reliability — and scaling out needs stateless servers.",
  },

  "Latency, throughput & numbers every engineer should know": {
    simple: `Latency is how long one request takes. Throughput is how many requests you can handle per second. They're different: a highway can carry many cars per hour (throughput) even if each trip takes an hour (latency).

    You don't need exact numbers, only the orders of magnitude: memory is about 1000× faster than an SSD, and a request across the world takes ~100–200 ms. These numbers tell you where to cache and what to avoid in the hot path.`,
    analogy: `Getting a book. On your desk (CPU cache): 1 second. On your bookshelf (RAM): a minute. At the college library (SSD): a couple of days. Ordering it from another country (network across continents): years.

    You'd keep the books you use daily on the desk — that's exactly why systems cache hot data in memory.`,
    visual: "latency-numbers",
    how: {
      visual: "percentiles",
      steps: [
        "Measure latency as **percentiles**, not averages: p50 is the typical user, p99 is the unlucky 1 in 100.",
        "Tail latency matters: if a page calls 50 services, most page loads hit at least one service's p99.",
        "**Little's law**: requests in flight = throughput × latency. 1,000 req/s × 0.2 s = 200 concurrent requests to plan threads and connections for.",
        "Raise throughput by batching, parallelism and more machines; lower latency by caching, fewer network hops and moving data closer (CDN).",
      ],
    },
    concepts: [
      { term: "Latency", meaning: "Time for one request, usually in ms. Users feel it." },
      { term: "Throughput", meaning: "Work done per unit time: requests/sec, MB/sec." },
      { term: "p50 / p99 / p999", meaning: "The latency that 50% / 99% / 99.9% of requests are faster than." },
      { term: "Tail latency", meaning: "The slow end (p99+). Caused by GC pauses, slow disks, retries, noisy neighbours." },
      { term: "Little's law", meaning: "L = λ × W: items in the system = arrival rate × time each spends." },
      { term: "Bandwidth", meaning: "Maximum data rate of a link; throughput is what you actually get." },
    ],
    example: `~~~
    Handy numbers (round them):
      1 day         ≈ 86,400 s ≈ 10^5 s
      1 million/day ≈ 12 req/s
      RAM read      100 ns     SSD read   100 µs     same-DC hop 0.5 ms
      India ↔ US    ~200 ms round trip
      1 char = 1 byte, a tweet ≈ 300 B, a photo ≈ 300 KB, 1 min HD video ≈ 50 MB
    ~~~`,
    mistakes: [
      "Reporting the average latency — it hides the slow requests users complain about.",
      "Thinking more throughput automatically means lower latency. Batching often raises throughput but adds latency.",
      "Doing network calls inside a loop (N+1 calls) in a latency-critical path.",
    ],
    remember: "Memory ≫ SSD ≫ network across the world; measure p99, not the average.",
  },

  "CAP theorem & PACELC": {
    simple: `When data is copied on several machines, the network between them can break (a partition). CAP says: during a partition you must choose — either keep answering (Availability) and risk returning old data, or refuse some requests to keep every answer correct (Consistency).

    Partition tolerance isn't optional in a real distributed system, because networks do fail. So the real choice is CP or AP. PACELC adds: Else, when everything is fine, you still trade Latency against Consistency (waiting for replicas to agree takes time).`,
    analogy: `Two branches of a bank share your account. The phone line between them goes dead. You withdraw ₹500 at branch 1.

    A CP bank tells branch 2 "don't allow withdrawals until the line is back" — correct but unavailable. An AP bank lets branch 2 keep serving with the old balance — available, but you might overdraw. Which is right depends on the business: a bank balance wants CP; a "likes" counter is fine with AP.`,
    visual: "cap-partition",
    how: {
      visual: "pacelc",
      steps: [
        "Ask: what's worse for this feature — showing stale data, or showing an error?",
        "Money, inventory, bookings, locks → prefer **CP** (correctness first).",
        "Feeds, likes, profiles, product catalogues → prefer **AP** (stay up, fix later).",
        "Then PACELC: even without failures, do you wait for replicas (EC, slower) or answer from the nearest copy (EL, faster)?",
      ],
    },
    concepts: [
      { term: "Consistency (C in CAP)", meaning: "Every read sees the latest write — the system behaves like a single copy (linearizability)." },
      { term: "Availability (A)", meaning: "Every request to a working node gets a non-error answer." },
      { term: "Partition tolerance (P)", meaning: "The system keeps working even if messages between nodes are lost." },
      { term: "CP system", meaning: "Gives up availability during a partition: HBase, ZooKeeper, etcd, MongoDB (default)." },
      { term: "AP system", meaning: "Gives up consistency during a partition: Cassandra, DynamoDB (default), CouchDB." },
      { term: "PACELC", meaning: "If Partition: A or C; Else: Latency or Consistency." },
    ],
    compare: {
      head: ["", "CP", "AP"],
      rows: [
        ["During a partition", "Rejects / waits", "Answers, may be stale"],
        ["Good for", "Payments, stock, seat booking, leader election", "Feeds, likes, carts, DNS"],
        ["Examples", "ZooKeeper, etcd, HBase, Spanner", "Cassandra, DynamoDB, Riak"],
      ],
    },
    mistakes: [
      "Saying \"pick any two of three\" — you can't drop P in a distributed system; the choice is C vs A during a partition.",
      "Confusing CAP consistency with ACID consistency (ACID's C is about rules/constraints, not replicas).",
      "Labelling a whole product CP or AP — many databases let you tune it per query (quorums).",
    ],
    remember: "Networks will split; then you choose correct (CP) or available (AP) — and PACELC says even on good days you trade latency for consistency.",
  },

  "Consistency models": {
    simple: `A consistency model is a promise about what a read can return after a write, when data has several copies.

    Strong consistency: once a write succeeds, every read anywhere sees it. Eventual consistency: copies agree "eventually"; for a short time some reads may be old. In between are useful middle levels like "you always see your own writes" and "you never see an answer before its question" (causal).`,
    analogy: `You post a photo on Instagram. With eventual consistency your friend in another city might see it 2 seconds later than your roommate — nobody cares.

    But if you change your password and the login page still accepts the old one for 2 seconds, that's a problem. Different features need different promises.`,
    visual: "consistency-spectrum",
    how: {
      visual: "quorum",
      steps: [
        "Store each item on **N** replicas (often 3).",
        "A write waits for **W** of them to confirm; a read asks **R** of them and takes the newest version.",
        "If **R + W > N**, the read set and write set always overlap in at least one replica, so you always see the latest write.",
        "N=3, W=2, R=2 is the balanced choice. W=1, R=1 is fast but eventually consistent. W=3 makes writes fail if any replica is down.",
      ],
    },
    concepts: [
      { term: "Linearizability", meaning: "Strongest: operations appear to happen instantly at one point in time, in real-time order." },
      { term: "Eventual consistency", meaning: "If writes stop, all replicas converge to the same value." },
      { term: "Read-your-writes", meaning: "A user always sees their own updates (others may lag)." },
      { term: "Monotonic reads", meaning: "Once you've seen a value, you never see an older one later." },
      { term: "Causal consistency", meaning: "If A caused B (a reply to a comment), everyone sees A before B." },
      { term: "Quorum (R + W > N)", meaning: "Read and write enough replicas that they overlap, giving strong-ish reads." },
    ],
    compare: {
      head: ["", "Linearizability", "Serializability"],
      rows: [
        ["About", "Single object, replicas", "Transactions over many objects"],
        ["Promise", "Reads see the latest write in real time", "Result equals some serial order of transactions"],
        ["World", "Distributed systems / CAP", "Databases / ACID isolation"],
      ],
    },
    mistakes: [
      "Treating eventual consistency as \"randomly wrong\" — it's bounded and usually converges in milliseconds.",
      "Mixing up linearizability and serializability.",
      "Using strong consistency everywhere and paying latency for features that don't need it.",
    ],
    remember: "Pick the weakest consistency each feature can tolerate; R + W > N gives quorum reads that see the latest write.",
  },

  "Availability, SLAs, SLOs & SLIs": {
    simple: `Availability is the percentage of time your service works. "Three nines" (99.9%) sounds great but still allows ~8.8 hours of downtime a year; "five nines" allows just ~5 minutes.

    SLI, SLO and SLA are how teams talk about it. SLI is the measurement (99.95% of requests succeeded), SLO is the internal goal (99.9%), SLA is the contract with customers (99.5% or we refund you).`,
    analogy: `A Mumbai local train. SLI: "trains ran on time 97% of days this month". SLO: Railways' own target, "on time 95% of days". SLA: a promise printed on your pass, "if trains are late more than 10% of days, you get a refund".

    The target (SLO) is kept stricter than the promise (SLA) so they notice problems before they owe money.`,
    visual: "nines",
    how: {
      visual: "sli-slo-sla",
      steps: [
        "Pick SLIs users feel: success rate, latency under X ms, freshness of data.",
        "Set an SLO, e.g. 99.9% of requests succeed over 30 days. That gives an **error budget** of 0.1% ≈ 43 minutes a month.",
        "Alert when you're burning the budget too fast, not on every single error.",
        "Budget left → ship features faster. Budget spent → freeze risky releases and fix reliability.",
        "Reach higher availability with redundancy: no single point of failure, multiple zones, automatic failover.",
      ],
    },
    concepts: [
      { term: "Availability", meaning: "Uptime ÷ total time. 99.99% ≈ 52 minutes of downtime per year." },
      { term: "SLI", meaning: "Service level indicator — a metric, e.g. % of requests under 300 ms." },
      { term: "SLO", meaning: "Service level objective — the target value for an SLI." },
      { term: "SLA", meaning: "Service level agreement — a contract with penalties if missed." },
      { term: "Error budget", meaning: "100% − SLO: the failure you're allowed to 'spend'." },
      { term: "Active-active vs active-passive", meaning: "Both copies serve traffic vs one standby waits to take over on failure." },
    ],
    example: `~~~
    Components in series multiply:
      LB 99.99% × App 99.9% × DB 99.95%  ≈ 99.84%   (worse than any part!)
    Redundant copies in parallel:
      two DBs at 99.9% each → 1 − (0.001 × 0.001) = 99.9999%
    ~~~`,
    mistakes: [
      "Promising 100% — impossible and it leaves no room to deploy.",
      "Forgetting that chaining dependencies lowers overall availability.",
      "Setting the SLO equal to the SLA, so there's no early warning.",
    ],
    remember: "Each extra nine is 10× less downtime; SLI is measured, SLO is the goal, SLA is the paid promise.",
  },

  "DNS, CDN & how a request reaches your server": {
    simple: `When you type shop.com, your computer first needs its IP address. DNS is the internet's phone book that turns names into IPs, through a chain of servers, with every answer cached for a time (TTL).

    A CDN is a network of servers all over the world that keeps copies of your static files (images, JS, videos). DNS sends you to the nearest CDN server, so a user in Chennai downloads images from Chennai, not from your server in Singapore.`,
    analogy: `DNS is like asking for a shop's address: you ask a friend (resolver) → who checks a city directory (root) → which points to the area directory (.com) → which gives the exact address (authoritative server). Next time, your friend remembers it.

    A CDN is like Amazon keeping popular products in a warehouse in your city instead of shipping every order from one central warehouse.`,
    visual: "dns-cdn",
    how: {
      visual: "dns-steps",
      steps: [
        "Browser checks its own cache, then the OS cache.",
        "Asks the resolver (ISP or 8.8.8.8). If it doesn't know: root server → .com server → shop.com's authoritative name server → IP.",
        "With GeoDNS / anycast, the IP returned is the nearest CDN edge.",
        "TCP + TLS handshake with the edge. Static files are served from its cache (a hit).",
        "On a miss, or for dynamic API calls, the edge forwards to your origin servers, often over a faster private backbone.",
      ],
    },
    concepts: [
      { term: "DNS record types", meaning: "A (name → IPv4), AAAA (IPv6), CNAME (alias), MX (mail), NS (name server)." },
      { term: "TTL", meaning: "How long an answer may be cached. Low TTL = faster failover but more DNS traffic." },
      { term: "Anycast", meaning: "Many servers share one IP; the network routes you to the nearest one." },
      { term: "CDN pull", meaning: "Edge fetches from origin on the first miss, then caches. Easy, most common." },
      { term: "CDN push", meaning: "You upload content to the CDN ahead of time. Good for large, rarely changing files." },
      { term: "Cache invalidation", meaning: "Purge a URL or, better, version file names (app.3f9a.js) so new deploys use new URLs." },
    ],
    compare: {
      head: ["", "Pull CDN", "Push CDN"],
      rows: [
        ["Who uploads", "CDN fetches on first request", "You upload in advance"],
        ["First request", "Slow (miss)", "Fast"],
        ["Best for", "Websites, images, frequent changes", "Big video files, software downloads"],
      ],
    },
    mistakes: [
      "Forgetting DNS caching when planning failover — clients may keep the old IP until the TTL ends.",
      "Putting personalised API responses on the CDN with long TTLs.",
      "Invalidating by purging everything instead of using versioned file names.",
    ],
    remember: "DNS turns names into the nearest IP; a CDN serves static content from a server near the user and shields your origin.",
  },

  "HTTP/1.1, HTTP/2, HTTP/3 & TLS": {
    simple: `HTTP is the language browsers and servers speak. HTTP/1.1 sends one request at a time per connection, so browsers open several connections. HTTP/2 sends many requests at once over a single connection (multiplexing). HTTP/3 runs on QUIC over UDP, so one lost packet doesn't stall everything, and connections start faster.

    TLS is the encryption layer (the "S" in HTTPS). Setting it up costs extra round trips, which is why reusing connections matters.`,
    analogy: `HTTP/1.1 is a single-lane road: one car at a time. HTTP/2 is a multi-lane road but on one bridge — if the bridge is blocked (a lost TCP packet), every lane stops. HTTP/3 gives each lane its own small bridge, so one blockage only stops that lane.`,
    visual: "http-versions",
    how: {
      visual: "tls-handshake",
      steps: [
        "TCP handshake: SYN, SYN-ACK, ACK — one round trip.",
        "TLS 1.3 handshake: client sends supported ciphers and a key share; server replies with its certificate and key share — one more round trip.",
        "Both sides now share a secret key; HTTP requests flow encrypted.",
        "Keep-alive and HTTP/2 reuse this connection for many requests, so you pay the setup once.",
        "HTTP/3 (QUIC) combines transport and TLS setup into one round trip, and can resume with 0-RTT.",
      ],
    },
    concepts: [
      { term: "Keep-alive", meaning: "Reuse one TCP connection for many requests (default in HTTP/1.1)." },
      { term: "Head-of-line blocking", meaning: "Later items wait behind a stuck first one — per connection in HTTP/1.1, per TCP packet in HTTP/2." },
      { term: "Multiplexing", meaning: "Many request/response streams interleaved on one connection (HTTP/2, HTTP/3)." },
      { term: "Header compression", meaning: "HPACK (HTTP/2) / QPACK (HTTP/3) avoid resending the same headers." },
      { term: "QUIC", meaning: "Transport over UDP with built-in TLS, independent streams and connection migration (Wi-Fi → 4G)." },
      { term: "TLS termination", meaning: "Decrypting HTTPS at the load balancer so internal services get plain HTTP." },
    ],
    compare: {
      head: ["", "HTTP/1.1", "HTTP/2", "HTTP/3"],
      rows: [
        ["Transport", "TCP", "TCP", "QUIC over UDP"],
        ["Requests per connection", "One at a time", "Many (multiplexed)", "Many, independent"],
        ["Head-of-line blocking", "Per connection", "At TCP level", "Only the affected stream"],
        ["Format", "Text", "Binary frames", "Binary frames"],
        ["Setup", "TCP + TLS (2–3 RTT)", "Same", "1 RTT, 0-RTT on resume"],
      ],
    },
    mistakes: [
      "Saying HTTP/2 fixed head-of-line blocking completely — it moved it to the TCP layer.",
      "Ignoring handshake cost: a new HTTPS connection to a far server can cost 400+ ms on mobile.",
      "Thinking TLS is only encryption — it also authenticates the server via its certificate.",
    ],
    remember: "1.1 = one at a time, 2 = many on one TCP pipe, 3 = many on QUIC so losses don't block everything.",
  },

  "REST vs gRPC vs GraphQL": {
    simple: `These are three styles of API. REST treats everything as resources with URLs and uses HTTP verbs (GET, POST, PUT, DELETE). It's simple, cacheable and the default for public APIs.

    gRPC lets one service call a function on another as if it were local, using compact binary Protobuf over HTTP/2 — fast and strongly typed, ideal between internal microservices. GraphQL gives clients one endpoint where they ask for exactly the fields they need — great for mobile apps with varied screens.`,
    analogy: `REST is a restaurant menu with fixed dishes: order "thali" and you get everything on it. GraphQL is a buffet: take exactly what you want on one plate. gRPC is the kitchen's internal order slip system: short codes, super fast, only staff understand it.`,
    visual: "api-styles",
    concepts: [
      { term: "Resource", meaning: "A noun with a URL in REST: /users/42/orders." },
      { term: "Idempotent methods", meaning: "GET, PUT, DELETE can be repeated safely; POST usually can't." },
      { term: "Protobuf", meaning: "Binary schema-based format used by gRPC; small and fast to parse." },
      { term: "Streaming", meaning: "gRPC supports server, client and bidirectional streams over one HTTP/2 connection." },
      { term: "Over-fetching / under-fetching", meaning: "Getting more fields than needed / needing several calls — what GraphQL solves." },
      { term: "N+1 problem", meaning: "A GraphQL resolver fetching each child separately; fix with batching (DataLoader)." },
    ],
    compare: {
      head: ["", "REST", "gRPC", "GraphQL"],
      rows: [
        ["Format", "JSON over HTTP", "Protobuf over HTTP/2", "JSON over HTTP"],
        ["Shape of data", "Fixed by server", "Fixed by .proto", "Chosen by client"],
        ["Caching", "Easy (HTTP caches)", "Hard", "Hard (one POST endpoint)"],
        ["Best for", "Public APIs, CRUD", "Service-to-service, streaming", "Mobile / complex UIs"],
        ["Browser support", "Native", "Needs a proxy (gRPC-Web)", "Native"],
      ],
    },
    mistakes: [
      "Using verbs in REST URLs (/getUser) instead of nouns and HTTP methods.",
      "Making POST /payments non-idempotent and charging twice on a retry (use an idempotency key).",
      "Picking GraphQL for a simple CRUD API, adding complexity and losing HTTP caching.",
    ],
    remember: "REST for public and simple, gRPC for fast internal calls, GraphQL when clients need flexible shapes.",
  },

  "Real-time: polling, long polling, WebSockets, SSE": {
    simple: `HTTP is normally "client asks, server answers". But chat, live scores and notifications need the server to push updates. There are four ways:

    - Short polling: ask every few seconds. Simple, wasteful.
    - Long polling: ask, and the server holds the request open until it has something.
    - SSE (Server-Sent Events): one long-lived HTTP response that the server keeps writing to. One-way, server → client.
    - WebSocket: upgrade to a full two-way connection that both sides can send on any time.`,
    analogy: `Waiting for a parcel. Short polling: you call the courier every 5 minutes, "is it here?". Long polling: you call and they say "hold on the line, I'll tell you when it arrives". SSE: you subscribe to SMS updates. WebSocket: you and the delivery person are on a WhatsApp call — both can talk any time.`,
    visual: "realtime",
    concepts: [
      { term: "Short polling", meaning: "Repeated requests on a timer. Wasted requests and delay up to the interval." },
      { term: "Long polling", meaning: "Server holds the request until data arrives or a timeout; client immediately re-asks." },
      { term: "SSE", meaning: "text/event-stream over HTTP; auto-reconnect built in; server → client only." },
      { term: "WebSocket", meaning: "Full-duplex TCP connection after an HTTP upgrade. Chat, games, collaboration." },
      { term: "Sticky sessions", meaning: "Keep a client on the same server; long-lived connections live on one machine." },
      { term: "Heartbeat", meaning: "Small ping every ~30 s to detect dead connections and keep proxies from closing them." },
    ],
    compare: {
      head: ["", "Short poll", "Long poll", "SSE", "WebSocket"],
      rows: [
        ["Direction", "Client pulls", "Client pulls", "Server → client", "Both ways"],
        ["Latency", "Up to interval", "Low", "Low", "Lowest"],
        ["Server cost", "Many empty requests", "Held requests", "One open stream", "One open socket"],
        ["Use for", "Rare updates", "Fallback", "Live scores, feeds, notifications", "Chat, games, docs"],
      ],
    },
    mistakes: [
      "Using WebSockets for one-way updates where SSE is simpler.",
      "Forgetting that a million open sockets need connection servers sized for it, plus a pub/sub layer to route messages to the right server.",
      "No reconnect-with-backoff logic, so every client reconnects at once after a deploy.",
    ],
    remember: "Poll if rare, SSE if the server only pushes, WebSocket if both sides talk.",
  },

  "Load balancers": {
    simple: `A load balancer sits in front of a group of servers and spreads incoming requests across them. It also runs health checks and stops sending traffic to servers that are down.

    L4 load balancers look only at IPs and ports (fast, protocol-agnostic). L7 load balancers understand HTTP, so they can route /api to one group and /images to another, terminate TLS, and add headers.`,
    analogy: `The token counter at a hospital OPD. Patients arrive at one counter, get sent to whichever doctor is free (least connections) or simply the next doctor in turn (round robin). If a doctor goes on a break, the counter stops sending patients to that room (health check).`,
    visual: "load-balancer",
    how: {
      steps: [
        "Client resolves the site's DNS to the load balancer's (virtual) IP.",
        "LB picks a healthy backend using its algorithm.",
        "It forwards the request (L4: forwards the TCP connection; L7: reads the HTTP request and opens its own connection to the backend).",
        "Health checks hit `/health` every few seconds; failing servers are removed and re-added when they recover.",
        "The LB itself runs as a pair (active-passive with a floating IP) or as many nodes behind DNS/anycast, so it's not a single point of failure.",
      ],
    },
    concepts: [
      { term: "Round robin", meaning: "Each server in turn. Simple; good when requests are similar." },
      { term: "Least connections", meaning: "Send to the server with the fewest active requests. Good for uneven request times." },
      { term: "Weighted", meaning: "Bigger servers get a larger share." },
      { term: "IP hash / consistent hashing", meaning: "Same client or key always goes to the same server (cache locality, sticky)." },
      { term: "L4 vs L7", meaning: "Transport level (IP/port) vs application level (HTTP path, headers, cookies)." },
      { term: "Health check", meaning: "Periodic probe; failing servers are taken out of rotation." },
    ],
    compare: {
      head: ["", "L4", "L7"],
      rows: [
        ["Sees", "IP, port, TCP/UDP", "URL, headers, cookies"],
        ["Can route by path", "No", "Yes"],
        ["TLS termination", "No (passes through)", "Yes"],
        ["Speed", "Faster", "Slightly slower, more features"],
        ["Examples", "AWS NLB, LVS", "AWS ALB, Nginx, Envoy, HAProxy"],
      ],
    },
    mistakes: [
      "Drawing one load balancer and calling the system highly available — it's a single point of failure.",
      "Using sticky sessions to hide stateful servers instead of moving state out.",
      "Health checks that only test 'process is up', not 'can reach the database'.",
    ],
    remember: "An LB spreads load and routes around dead servers; L4 is fast and simple, L7 understands HTTP.",
  },

  "Reverse proxy & API gateway": {
    simple: `A reverse proxy sits in front of your servers and receives requests on their behalf. Clients never talk to your servers directly. It can cache, compress, terminate TLS and hide your internal layout.

    An API gateway is a reverse proxy with API-specific powers: authentication, rate limiting, request routing to many microservices, and request/response transformation. One front door for everything.`,
    analogy: `An office reception desk. Visitors don't wander to employees' desks; reception checks ID (auth), limits how many visitors per hour (rate limit), and calls the right department (routing). Employees never deal with the crowd directly.`,
    visual: "api-gateway",
    concepts: [
      { term: "Forward proxy", meaning: "Acts for clients (e.g. a company proxy for employees' browsing)." },
      { term: "Reverse proxy", meaning: "Acts for servers (Nginx in front of your app)." },
      { term: "TLS termination", meaning: "Decrypt HTTPS once at the edge; internal traffic can be plain or mTLS." },
      { term: "BFF (Backend for Frontend)", meaning: "A separate gateway per client type (mobile, web) shaping responses for that UI." },
      { term: "Service mesh", meaning: "A sidecar proxy (Envoy) next to every service handling retries, mTLS and metrics for service-to-service calls." },
      { term: "Sidecar", meaning: "A helper container running beside your app in the same pod." },
    ],
    compare: {
      head: ["", "Load balancer", "Reverse proxy", "API gateway"],
      rows: [
        ["Main job", "Spread traffic", "Front servers, cache, TLS", "Front APIs: auth, limits, routing"],
        ["Knows about users / keys", "No", "Rarely", "Yes"],
        ["Examples", "AWS ALB/NLB", "Nginx, HAProxy", "Kong, AWS API Gateway, Apigee"],
      ],
    },
    mistakes: [
      "Putting business logic in the gateway — it becomes a bottleneck every team must change.",
      "Forgetting the gateway itself must be horizontally scaled and highly available.",
      "Confusing forward and reverse proxies.",
    ],
    remember: "Reverse proxy fronts servers; an API gateway is a reverse proxy that also does auth, rate limits and routing for APIs.",
  },

  "Caching strategies": {
    simple: `A cache keeps a copy of frequently used data in fast memory (like Redis) so you don't hit the slow database every time. A cache hit takes ~1 ms; a database query may take 10–100 ms.

    The hard parts are keeping the cache in sync with the database, deciding what to throw out when it's full (eviction), and avoiding a flood of database queries when a popular item expires.`,
    analogy: `A shopkeeper keeps the top-selling items on the counter (cache) and the rest in the godown (database). When a customer asks for something on the counter, it's instant. If not, they walk to the godown, and if it's popular, they put a few on the counter for next time. When the counter is full, the item nobody has asked for in a while goes back (LRU).`,
    visual: "cache-strategies",
    how: {
      visual: "cache-aside",
      steps: [
        "Read path (cache-aside): look up `user:42` in Redis. Hit → return.",
        "Miss → read from the DB, store it in Redis with a TTL (e.g. 10 min), return it.",
        "Write path: update the DB, then **delete** the cache key (not update it), so the next read reloads fresh data.",
        "When memory is full, Redis evicts by policy, usually LRU.",
        "For very hot keys, protect the DB from a stampede: let only one request rebuild the value (lock / request coalescing), or refresh it a bit before it expires.",
      ],
    },
    concepts: [
      { term: "Cache hit ratio", meaning: "Hits ÷ total lookups. 90%+ means the DB sees 10× less read load." },
      { term: "TTL", meaning: "Time to live — the entry expires automatically, bounding staleness." },
      { term: "LRU / LFU", meaning: "Evict the least recently used / least frequently used item when full." },
      { term: "Cache stampede (thundering herd)", meaning: "A hot key expires and thousands of requests hit the DB at once." },
      { term: "Hot key", meaning: "One key getting huge traffic (a celebrity's profile); replicate it or add a local in-process cache." },
      { term: "Cache penetration", meaning: "Requests for keys that don't exist always miss; cache the 'not found' or use a Bloom filter." },
    ],
    compare: {
      head: ["Strategy", "Read", "Write", "Risk"],
      rows: [
        ["Cache-aside", "App loads on miss", "DB, then delete key", "Brief staleness; first read slow"],
        ["Read-through", "Cache loads on miss", "—", "Cache library must know the DB"],
        ["Write-through", "Always fresh", "Cache + DB together", "Slower writes"],
        ["Write-back", "Fresh", "Cache now, DB later", "Data loss if cache dies"],
        ["Write-around", "Miss on first read", "DB only", "Recent writes aren't cached"],
      ],
    },
    mistakes: [
      "Updating the cache on write instead of deleting it — two concurrent writers can leave the old value cached forever.",
      "No TTL, so a bug that writes bad data into the cache never heals.",
      "Caching everything — cache only hot, read-heavy data that tolerates slight staleness.",
    ],
    remember: "Cache-aside: read cache, miss → DB → fill with TTL; on write, update DB then delete the key.",
  },

  "Distributed cache: Redis & Memcached": {
    simple: `Redis and Memcached are in-memory key-value stores used as caches shared by all your app servers. Memcached is a simple, multi-threaded string cache. Redis is "a cache plus data structures": lists, sets, sorted sets, hashes, streams, with optional persistence and replication.

    Because data is in RAM, operations take well under a millisecond. Redis runs commands one at a time on a single thread, so each command is atomic — handy for counters, locks and rate limiters.`,
    analogy: `Memcached is a whiteboard where you can only write and erase simple notes. Redis is a smart whiteboard that also keeps ranked lists, to-do queues and tally counters, and can take a photo of itself (snapshot) so the notes survive a power cut.`,
    visual: "redis-types",
    concepts: [
      { term: "In-memory", meaning: "Data lives in RAM: very fast, limited by memory size and cost." },
      { term: "RDB snapshot", meaning: "Redis saves a point-in-time copy to disk periodically. Small, fast restart, may lose recent writes." },
      { term: "AOF (append-only file)", meaning: "Logs every write; replay on restart. Safer, larger." },
      { term: "Replication", meaning: "A primary with replicas; Sentinel promotes a replica if the primary dies." },
      { term: "Redis Cluster", meaning: "Data split across 16,384 hash slots spread over many primaries." },
      { term: "Eviction policy", meaning: "allkeys-lru, volatile-ttl, etc. — what to drop when memory is full." },
    ],
    compare: {
      head: ["", "Redis", "Memcached"],
      rows: [
        ["Data types", "Strings, hashes, lists, sets, sorted sets, streams…", "Strings only"],
        ["Persistence", "RDB / AOF", "None"],
        ["Replication / failover", "Yes (Sentinel, Cluster)", "No (client-side only)"],
        ["Threads", "Single-threaded commands (I/O threads optional)", "Multi-threaded"],
        ["Extra", "Pub/sub, Lua scripts, transactions, TTL per key", "Very simple, very predictable"],
      ],
    },
    mistakes: [
      "Using Redis as the only copy of important data without understanding persistence settings.",
      "Running slow commands like KEYS * in production — they block the single thread.",
      "Storing huge values (MBs) per key; they slow everyone else down.",
    ],
    remember: "Memcached = simple fast string cache; Redis = cache + data structures + persistence + replication.",
  },

  "Consistent hashing": {
    simple: `When you spread keys across N cache servers with hash(key) % N, adding or removing a single server changes N, so almost every key moves to a different server — your cache is suddenly empty.

    Consistent hashing places both servers and keys on a circle (ring). A key belongs to the first server clockwise from it. Adding a server only takes over the keys in one small arc; everyone else stays put. Only about 1/N of keys move.`,
    analogy: `Imagine delivery boys standing at points around a circular colony road. Each house is served by the first delivery boy you meet walking clockwise. If a new delivery boy joins and stands between two others, only the houses just before him switch to him — the rest of the colony is unaffected.`,
    visual: "hash-ring",
    how: {
      steps: [
        "Hash each server's name to a number on a ring (0 … 2³²−1).",
        "Hash each key onto the same ring.",
        "Walk clockwise from the key to the first server: that server owns it.",
        "Give each physical server ~100–200 **virtual nodes** (positions) so load is even and a failed server's keys spread over many others.",
        "For replication, store the key on the next 2–3 distinct servers clockwise too.",
      ],
    },
    concepts: [
      { term: "Hash ring", meaning: "The hash space bent into a circle so the end wraps to the start." },
      { term: "Virtual nodes", meaning: "Many ring positions per server — smooths load and spreads recovery work." },
      { term: "Rebalancing", meaning: "Adding / removing a server moves only ~K/N keys (K keys, N servers)." },
      { term: "Modulo hashing", meaning: "hash % N — simple but reshuffles almost everything when N changes." },
      { term: "Preference list", meaning: "The next N nodes clockwise that hold replicas of a key (Dynamo)." },
      { term: "Used in", meaning: "DynamoDB, Cassandra, Riak, memcached clients, CDNs, load balancers." },
    ],
    example: `~~~
    4 → 5 servers, 1,000,000 keys
      hash % N        → ~800,000 keys move (80%)
      consistent hash → ~200,000 keys move (1/5)
    ~~~`,
    mistakes: [
      "Forgetting virtual nodes — without them load is very uneven.",
      "Saying consistent hashing removes all data movement; it minimises it.",
      "Not mentioning how replicas are chosen (next distinct physical nodes clockwise).",
    ],
    remember: "Put servers and keys on a ring; a key goes to the next server clockwise, so adding a server moves only ~1/N of the keys.",
  },

  "SQL vs NoSQL: choosing a database": {
    simple: `SQL (relational) databases store data in tables with a fixed schema, support joins and ACID transactions. They're the safe default: MySQL, PostgreSQL.

    NoSQL is a family of databases each built for one access pattern at massive scale: key-value (Redis, DynamoDB), document (MongoDB), wide-column (Cassandra), graph (Neo4j). They usually trade joins and strict consistency for easy horizontal scaling and flexible schemas.`,
    analogy: `SQL is a well-organised government office with forms in fixed formats, cross-referenced files and strict rules — slower to change but always consistent. NoSQL is a set of specialist shops: a locker room (key-value) for instant grab-and-go, a filing cabinet of folders (documents), a giant ledger written only at the end (wide-column), a map of who knows whom (graph).`,
    visual: "db-choice",
    concepts: [
      { term: "Schema-on-write", meaning: "SQL: data must fit the table definition when written." },
      { term: "Schema-on-read", meaning: "NoSQL documents: structure is interpreted by the reader; fields can vary." },
      { term: "Access pattern", meaning: "How data is read and written — the main thing that should drive your choice." },
      { term: "ACID", meaning: "Atomic, consistent, isolated, durable transactions — the SQL default." },
      { term: "BASE", meaning: "Basically available, soft state, eventually consistent — common in NoSQL." },
      { term: "Polyglot persistence", meaning: "Using different databases for different parts of one system." },
    ],
    compare: {
      head: ["Need", "Pick", "Example"],
      rows: [
        ["Transactions, joins, reporting", "Relational", "Orders, payments, users — Postgres / MySQL"],
        ["Get by key, super fast", "Key-value", "Sessions, carts, cache — Redis / DynamoDB"],
        ["Flexible nested records", "Document", "Product catalogue, CMS — MongoDB"],
        ["Huge write volume, time-ordered", "Wide-column", "Chat messages, IoT, logs — Cassandra"],
        ["Many-hop relationships", "Graph", "Friends-of-friends, fraud rings — Neo4j"],
        ["Full-text search", "Search engine", "Product search — Elasticsearch"],
      ],
    },
    mistakes: [
      "\"NoSQL because it scales\" — Postgres with replicas and caching handles most apps' scale.",
      "Choosing MongoDB, then needing multi-document transactions and joins everywhere.",
      "Not saying the access pattern before naming the database.",
    ],
    remember: "Default to SQL; reach for a NoSQL type when a specific access pattern or scale demands it.",
  },

  "Database indexing": {
    simple: `An index is a separate sorted structure that lets the database find rows without scanning the whole table — like the index at the back of a textbook. Lookups go from O(n) to O(log n).

    Most SQL databases use B+ trees, which are great for reads and range queries. Write-heavy NoSQL stores use LSM trees, which turn writes into fast sequential appends and sort them later. Indexes cost extra storage and slow down writes, so add them for the queries you actually run.`,
    analogy: `Finding "Rahul Sharma" in a 1,000-page phone book: if names are sorted, you open the middle, then narrow down — about 10 jumps. If they were in random order, you'd read every page. The index is that sorting, kept on the side.`,
    visual: "bplus-tree",
    how: {
      visual: "lsm-tree",
      steps: [
        "B+ tree read: start at the root, follow the range that contains your key, reach a leaf in 3–4 page reads even for crores of rows.",
        "B+ tree range scan: find the first key, then walk the linked leaves.",
        "LSM write: append to a log and an in-memory sorted table; when it's full, flush it to disk as a sorted file.",
        "LSM background compaction merges files and drops overwritten/deleted values.",
        "LSM read: check memory, then newer to older files; Bloom filters skip files that can't contain the key.",
      ],
    },
    concepts: [
      { term: "Clustered (primary) index", meaning: "Rows are stored in index order; one per table (InnoDB uses the primary key)." },
      { term: "Secondary index", meaning: "Separate structure pointing back to the row (in InnoDB, via the primary key)." },
      { term: "Composite index", meaning: "Index on (a, b, c). Usable for a, a+b, a+b+c — the leftmost-prefix rule." },
      { term: "Covering index", meaning: "Contains every column the query needs, so the table itself isn't touched." },
      { term: "Write amplification", meaning: "One logical write causes many physical writes (index updates, compaction)." },
      { term: "Selectivity", meaning: "How well a column narrows results; indexing a boolean column rarely helps." },
    ],
    compare: {
      head: ["", "B+ tree", "LSM tree"],
      rows: [
        ["Writes", "In-place updates, random I/O", "Sequential appends, very fast"],
        ["Reads", "Fast, predictable", "May check several files"],
        ["Range scans", "Excellent", "Good"],
        ["Space / amplification", "Some fragmentation", "Compaction rewrites data"],
        ["Used by", "MySQL, Postgres, Oracle", "Cassandra, RocksDB, LevelDB, HBase"],
      ],
    },
    example: `~~~
    CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
    -- fast: WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20
    -- fast: WHERE user_id = 42 AND created_at > '2026-01-01'
    -- not used: WHERE created_at > '2026-01-01'   (skips the leftmost column)
    ~~~`,
    mistakes: [
      "Indexing every column — every write must now update all those indexes.",
      "Wrong column order in a composite index (put equality columns first, range column last).",
      "Wrapping the column in a function (WHERE YEAR(created_at) = 2026) so the index can't be used.",
    ],
    remember: "Indexes trade write speed and space for fast reads; B+ trees for read-heavy SQL, LSM trees for write-heavy stores.",
  },

  Replication: {
    simple: `Replication means keeping copies of the same data on several machines. It gives you high availability (if one dies, another has the data), more read capacity (spread reads over copies), and lower latency (a copy near the user).

    The common setup is leader-follower: all writes go to one leader, which streams changes to followers. Followers serve reads but can lag behind, so a user might not see their own fresh update.`,
    analogy: `A teacher (leader) writes notes on the board; students (followers) copy them into their notebooks. Anyone can ask a student what the notes say (reads), but only the teacher writes new notes. A slow student's notebook may be a few lines behind (replication lag).`,
    visual: "replication",
    how: {
      visual: "replica-lag",
      steps: [
        "Client writes to the leader, which writes to its log (MySQL binlog, Postgres WAL).",
        "Synchronous replication: the leader waits for a follower to confirm before replying — safe, slower.",
        "Asynchronous replication: the leader replies immediately and followers catch up — fast, can lose the last writes if the leader dies.",
        "Reads go to followers to scale; read-your-own-writes requests go to the leader (or wait until the follower catches up).",
        "If the leader fails, a follower is promoted (failover) and clients are pointed to it.",
      ],
    },
    concepts: [
      { term: "Leader-follower (primary-replica)", meaning: "One writer, many readers. MySQL, Postgres, MongoDB." },
      { term: "Multi-leader", meaning: "Several leaders accept writes (e.g. one per region); must resolve conflicts." },
      { term: "Leaderless", meaning: "Any replica takes writes; quorums (R + W > N) give consistency. Cassandra, Dynamo." },
      { term: "Replication lag", meaning: "Delay before a follower has the latest write." },
      { term: "Read-your-writes", meaning: "Guarantee that a user sees their own update; route their reads to the leader for a while." },
      { term: "Split brain", meaning: "Two nodes both think they're leader after a network split; prevented with consensus / fencing." },
    ],
    compare: {
      head: ["", "Synchronous", "Asynchronous"],
      rows: [
        ["Write latency", "Higher (waits for replica)", "Low"],
        ["Data loss on leader crash", "None", "Last few writes"],
        ["Availability", "Blocks if replica is down", "Unaffected"],
        ["Common choice", "One sync + rest async (semi-sync)", "Default in MySQL"],
      ],
    },
    mistakes: [
      "Thinking replication is a backup — a bad DELETE replicates to every copy instantly.",
      "Ignoring replication lag in features like 'edit profile then view it'.",
      "Replication scales reads, not writes — writes still all hit the leader.",
    ],
    remember: "Replicate for availability and read scale; writes go to the leader, and followers may lag.",
  },

  "Sharding / partitioning": {
    simple: `When one database can't hold all the data or handle all the writes, you split the data across several databases called shards. Each shard holds a slice (e.g. users 1–1 crore on shard 1), and together they hold everything.

    The key decision is the shard key — the field used to decide which shard a row goes to. A good key spreads data and traffic evenly and keeps most queries on one shard.`,
    analogy: `A college with 20,000 students can't keep all records in one register. So it splits them: roll numbers 1–5000 in register A, 5001–10000 in register B, and so on. To find a student you first work out which register, then look inside only that one.`,
    visual: "sharding",
    how: {
      visual: "shard-strategies",
      steps: [
        "Choose a shard key that matches your main query: `user_id` for a social app, `tenant_id` for B2B SaaS.",
        "Choose the method: hash (even spread), range (good for time/alphabet ranges), or a directory lookup (flexible).",
        "A router (app library, proxy like Vitess, or the DB itself) sends each query to the right shard.",
        "Queries without the shard key must fan out to every shard (scatter-gather) — keep these rare.",
        "To add capacity, split shards; consistent hashing or many small logical shards make this cheaper.",
      ],
    },
    concepts: [
      { term: "Horizontal partitioning", meaning: "Split rows across machines (sharding)." },
      { term: "Vertical partitioning", meaning: "Split columns or tables across machines." },
      { term: "Shard key", meaning: "The column that decides the shard. Hard to change later." },
      { term: "Hot partition", meaning: "One shard gets far more traffic (a celebrity, today's date)." },
      { term: "Resharding", meaning: "Moving data when adding shards; plan with many logical shards per machine." },
      { term: "Cross-shard query / transaction", meaning: "Touches several shards; slow and complex — design to avoid." },
    ],
    compare: {
      head: ["", "Replication", "Sharding"],
      rows: [
        ["Each node has", "All the data", "Part of the data"],
        ["Scales", "Reads + availability", "Writes + storage"],
        ["Usually", "Used together: each shard is replicated", ""],
      ],
    },
    mistakes: [
      "Sharding by created date — all new writes land on the newest shard.",
      "Sharding too early; it complicates joins, transactions and operations.",
      "Choosing a key that forces common queries to hit every shard.",
    ],
    remember: "Shard to scale writes and storage; the shard key decides everything, so pick it from the main access pattern.",
  },

  "Transactions & isolation levels": {
    simple: `A transaction groups several database operations so they all succeed or all fail (like debiting one account and crediting another). Isolation decides how much concurrent transactions can see of each other's unfinished work.

    Stronger isolation prevents more weird bugs but costs performance. Most databases default to Read Committed (Postgres) or Repeatable Read (MySQL) and use MVCC so readers don't block writers.`,
    analogy: `Two people editing the same Google Sheet cell at the same time. Low isolation: you see their half-typed value (dirty read). Higher isolation: you only see what they've saved. Serializable: it's as if you took turns, one after the other.`,
    visual: "isolation-matrix",
    how: {
      visual: "dirty-read",
      steps: [
        "Dirty read: reading uncommitted data that might be rolled back. Prevented from Read Committed up.",
        "Non-repeatable read: reading the same row twice gives different values. Prevented from Repeatable Read up.",
        "Phantom read: re-running a range query returns new rows. Prevented by Serializable (and mostly by InnoDB's gap locks).",
        "Lost update / write skew: two transactions read, then both write based on what they read. Fix with `SELECT … FOR UPDATE`, version columns, or Serializable.",
      ],
    },
    concepts: [
      { term: "ACID", meaning: "Atomicity, Consistency, Isolation, Durability." },
      { term: "MVCC", meaning: "Keep multiple versions of rows so readers see a snapshot without locking." },
      { term: "Pessimistic locking", meaning: "Lock rows before changing them (SELECT … FOR UPDATE). Good when conflicts are common." },
      { term: "Optimistic locking", meaning: "Check a version number at write time; retry on conflict. Good when conflicts are rare." },
      { term: "Snapshot isolation", meaning: "Each transaction reads a consistent snapshot; can still allow write skew." },
      { term: "Write skew", meaning: "Two transactions each check a condition, then both write — breaking the rule together (two doctors both go off-call)." },
    ],
    example: `~~~
    -- optimistic locking with a version column
    UPDATE products SET stock = stock - 1, version = version + 1
    WHERE id = 7 AND version = 12;
    -- 0 rows updated → someone else changed it first → re-read and retry
    ~~~`,
    mistakes: [
      "Assuming the default level is Serializable.",
      "Read-modify-write in application code without a lock or version check (lost updates).",
      "Holding a transaction open while calling an external API — locks stay held for seconds.",
    ],
    remember: "Isolation levels trade anomalies for speed: RU < RC < RR < Serializable; use locks or versions for read-then-write.",
  },

  "Distributed transactions: 2PC & Saga": {
    simple: `When one business action touches several databases or services (create order, reserve stock, charge card), you can't use a single local transaction. Two approaches:

    2PC (two-phase commit): a coordinator asks everyone "can you commit?", and only if all say yes tells everyone "commit". It's atomic, but if the coordinator dies mid-way, everyone waits holding locks. A Saga breaks the action into local steps, each with an undo (compensation); if a step fails, the earlier steps are undone. Sagas are the usual choice for microservices.`,
    analogy: `Planning a Goa trip with friends. 2PC: the organiser asks everyone "confirm you can come", and only books when all confirm — but if the organiser's phone dies after collecting yeses, everyone is stuck waiting.

    Saga: book flights, then hotel, then cab, one by one. If the cab fails, cancel the hotel, then the flights (compensations).`,
    visual: "two-phase-commit",
    how: {
      visual: "saga",
      steps: [
        "Choreography saga: each service listens for the previous event (OrderCreated → InventoryReserved → PaymentCharged) and emits its own.",
        "Orchestration saga: a central orchestrator calls each step and decides what to undo on failure. Easier to follow for long flows.",
        "Every step has a compensating action (release stock, refund, cancel order).",
        "Steps and compensations must be idempotent because messages can be delivered twice.",
        "Use the outbox pattern so 'update my DB' and 'publish the event' never get out of sync.",
      ],
    },
    concepts: [
      { term: "Coordinator", meaning: "Runs 2PC: sends PREPARE, collects votes, sends COMMIT or ABORT." },
      { term: "Blocking problem", meaning: "In 2PC, prepared participants can't decide alone if the coordinator disappears." },
      { term: "Saga", meaning: "A sequence of local transactions with compensations instead of a global lock." },
      { term: "Compensating action", meaning: "A business-level undo (refund), not a database rollback." },
      { term: "Outbox pattern", meaning: "Write the event into an outbox table in the same local transaction; a relay publishes it." },
      { term: "Eventual consistency", meaning: "Between saga steps, the system is temporarily inconsistent (order created, not yet paid)." },
    ],
    compare: {
      head: ["", "2PC", "Saga"],
      rows: [
        ["Consistency", "Atomic, strong", "Eventual"],
        ["Locks", "Held across services until commit", "Only local, short"],
        ["Failure handling", "Abort all", "Compensate completed steps"],
        ["Availability", "Lower (blocking)", "Higher"],
        ["Used in", "Within one DB cluster, XA", "Microservices: orders, bookings"],
      ],
    },
    mistakes: [
      "Writing to the DB and publishing to Kafka as two separate steps (dual write) — one can fail.",
      "Forgetting compensations can fail too; they need retries.",
      "Proposing 2PC across many microservices owned by different teams.",
    ],
    remember: "2PC = everyone votes then commits (atomic but blocking); Saga = local steps with undo actions (available, eventually consistent).",
  },

  "Blob / object storage": {
    simple: `Object storage (Amazon S3, Google Cloud Storage) stores big files — photos, videos, backups — as objects: the bytes plus some metadata, under a key like users/42/avatar.jpg. It's cheap, nearly unlimited and extremely durable.

    You don't store large files in your database. The DB keeps only metadata (owner, size, key); the bytes go to object storage, served through a CDN.`,
    analogy: `A cloakroom at a wedding: you hand over your bag (the file) and get a token number (the key). The cloakroom doesn't care what's inside. Your guest list (database) just notes "Asha — token 42". Bags never go on the guest list itself.`,
    visual: "presigned-upload",
    how: {
      steps: [
        "Client asks your API: \"I want to upload photo.jpg (3 MB)\".",
        "API checks permissions and returns a **pre-signed URL** — a time-limited link that allows one PUT to one key.",
        "Client uploads the bytes directly to S3, not through your servers.",
        "For big files use **multipart upload**: split into parts, upload in parallel, retry failed parts only.",
        "S3 sends an event (or the client confirms); you save the metadata row and trigger processing like thumbnails.",
      ],
    },
    concepts: [
      { term: "Object", meaning: "Data + metadata + a unique key in a bucket. Objects are replaced, not edited in place." },
      { term: "Bucket", meaning: "A top-level container with its own permissions and region." },
      { term: "Pre-signed URL", meaning: "Signed, expiring URL that lets a client upload or download without your credentials." },
      { term: "Multipart upload", meaning: "Upload a large file in parallel chunks; resumable." },
      { term: "Durability", meaning: "S3 is designed for 11 nines — data copied across multiple facilities." },
      { term: "Storage classes", meaning: "Hot (Standard) to cold (Glacier): cheaper storage, slower/costlier retrieval." },
    ],
    compare: {
      head: ["", "Block storage", "File storage", "Object storage"],
      rows: [
        ["Looks like", "A raw disk", "Folders and files", "Keys in buckets over HTTP"],
        ["Examples", "AWS EBS", "AWS EFS, NFS", "S3, GCS"],
        ["Best for", "Databases, VM disks", "Shared files", "Media, backups, logs, data lakes"],
      ],
    },
    mistakes: [
      "Storing images as BLOBs in MySQL — bloats the DB, slows backups and replication.",
      "Uploading through your app servers, wasting their bandwidth and memory.",
      "Making buckets public instead of using pre-signed URLs or a CDN with signed access.",
    ],
    remember: "Bytes in object storage, metadata in the DB, uploads via pre-signed URLs, downloads via CDN.",
  },

  "Search: inverted index & Elasticsearch": {
    simple: `\`WHERE title LIKE '%shoes%'\` can't use a normal index and scans every row. Search engines solve this with an inverted index: for every word, a list of the documents that contain it — like the index at the back of a book.

    Elasticsearch builds these indexes, ranks results by relevance (BM25), handles typos and synonyms, and spreads data across shards. It's a secondary store: your main database stays the source of truth, and search is kept in sync from it.`,
    analogy: `A textbook's back index: "photosynthesis — pages 12, 45, 88". You don't read the whole book; you jump to those pages. If you search "photosynthesis chlorophyll", you take the pages common to both words.`,
    visual: "inverted-index",
    how: {
      visual: "search-sync",
      steps: [
        "Analyse text: lower-case, split into words (tokens), remove stop words, stem (running → run).",
        "Add each token → document id to the inverted index (posting list).",
        "Query 'red running shoes' is analysed the same way; posting lists are intersected or merged.",
        "Score each match with BM25 (rare words and repeated matches count more) and return the top results.",
        "Keep the index fresh via CDC from the DB → Kafka → indexer; search is near-real-time (≈1 s).",
      ],
    },
    concepts: [
      { term: "Inverted index", meaning: "Map from term → list of documents (and positions) containing it." },
      { term: "Tokenization / analyzer", meaning: "Turning text into normalised terms: split, lower-case, stem, synonyms." },
      { term: "TF-IDF / BM25", meaning: "Relevance scoring: frequent in this doc, rare across all docs = more relevant." },
      { term: "Shard & replica", meaning: "Elasticsearch splits an index into shards, each with replicas, across nodes." },
      { term: "Near-real-time", meaning: "New documents become searchable after a refresh (~1 s), not instantly." },
      { term: "Faceting / aggregations", meaning: "Counts by category, price buckets — the filters on the left of a shop page." },
    ],
    mistakes: [
      "Using Elasticsearch as the primary database for orders or payments.",
      "Dual-writing to DB and search from the app — they drift apart; use CDC or the outbox.",
      "Forgetting that the same analyzer must be used at index time and query time.",
    ],
    remember: "Search = an inverted index (word → documents) ranked by BM25, fed from the main DB.",
  },

  "Message queues": {
    simple: `A message queue lets one service hand work to another without waiting. The producer drops a message in the queue and moves on; consumers pick messages up when they can. This smooths traffic spikes, decouples services, and lets slow work (emails, video processing) happen in the background.

    In a point-to-point queue each message is processed by one consumer (share the work). In pub/sub each message goes to every subscriber (each reacts in its own way).`,
    analogy: `A restaurant order rail. Waiters (producers) clip order slips on the rail and go back to customers. Cooks (consumers) take slips one by one. If 50 orders arrive at once, they wait on the rail instead of overwhelming the kitchen. If a cook is sick, others take the slips.`,
    visual: "queue-vs-pubsub",
    how: {
      visual: "dlq",
      steps: [
        "Producer sends a message; the broker stores it durably.",
        "A consumer receives it and processes it.",
        "On success, the consumer **acks** and the broker deletes it (or moves the offset).",
        "On failure or timeout, the message becomes visible again and is retried with backoff.",
        "After N failed attempts it moves to a **dead letter queue** for inspection, so it doesn't block others.",
        "If consumers fall behind, **backpressure**: queue depth grows; scale consumers or slow producers.",
      ],
    },
    concepts: [
      { term: "Producer / consumer / broker", meaning: "Sender, receiver, and the queue server in between (RabbitMQ, SQS, Kafka)." },
      { term: "Point-to-point", meaning: "One message → one consumer. Work queues." },
      { term: "Pub/sub", meaning: "One message → all subscribers. Event notifications." },
      { term: "Ack", meaning: "Consumer confirms processing so the broker can drop the message." },
      { term: "Dead letter queue", meaning: "Where poison messages go after too many failures." },
      { term: "Backpressure", meaning: "Signals or limits that stop producers from overwhelming consumers." },
    ],
    compare: {
      head: ["Guarantee", "Meaning", "How"],
      rows: [
        ["At-most-once", "May lose, never duplicate", "Ack before processing"],
        ["At-least-once", "Never lose, may duplicate", "Ack after processing (default) + idempotent consumer"],
        ["Exactly-once", "Effect happens once", "Dedup ids / transactions; costly"],
      ],
    },
    mistakes: [
      "Assuming exactly-once delivery and not making consumers idempotent.",
      "No DLQ, so one bad message is retried forever and blocks the queue.",
      "Using a queue where the caller needs an immediate answer.",
    ],
    remember: "Queues decouple and absorb spikes; plan for at-least-once delivery with idempotent consumers and a DLQ.",
  },

  "Kafka deep dive": {
    simple: `Kafka is a distributed append-only log. Producers append messages to a topic; the topic is split into partitions spread across brokers. Each message in a partition gets an increasing number called the offset.

    Unlike a classic queue, Kafka doesn't delete messages when they're read; it keeps them for a retention period (say 7 days). Each consumer group remembers its own offset, so many different systems can read the same stream at their own pace, and you can replay history.`,
    analogy: `A diary with numbered pages. Writers only add pages at the end. Readers each keep a bookmark (offset). The analytics team can be on page 500 while the email team is on page 520, and if someone made a mistake, they move their bookmark back and re-read.`,
    visual: "kafka-partitions",
    how: {
      visual: "isr-replication",
      steps: [
        "Producer picks a partition by key: `hash(order_id) % partitions`. Same key → same partition → ordered.",
        "The partition leader appends the message; followers copy it. With `acks=all` the write is confirmed once all in-sync replicas have it.",
        "Consumers in a group split partitions between them: each partition is read by exactly one consumer in the group.",
        "Consumers commit their offsets; after a crash, they resume from the last committed offset (so some messages may repeat).",
        "Adding or removing consumers triggers a rebalance that reassigns partitions.",
      ],
    },
    concepts: [
      { term: "Topic / partition", meaning: "A named stream, split into ordered logs for parallelism." },
      { term: "Offset", meaning: "Position of a message within a partition." },
      { term: "Consumer group", meaning: "Consumers sharing the work; max useful consumers = number of partitions." },
      { term: "ISR", meaning: "In-sync replicas — followers caught up with the leader; only they can become leader." },
      { term: "Retention", meaning: "Keep messages for a time or size limit, regardless of whether they were read." },
      { term: "Log compaction", meaning: "Keep only the latest message per key — a changelog of current state." },
    ],
    compare: {
      head: ["", "Kafka", "RabbitMQ / SQS"],
      rows: [
        ["Model", "Durable log, consumers track offsets", "Queue, message deleted after ack"],
        ["Replay", "Yes", "No"],
        ["Ordering", "Per partition", "Per queue (roughly)"],
        ["Throughput", "Millions/sec", "Lower, richer routing"],
        ["Best for", "Event streams, analytics, CDC", "Task queues, RPC-style jobs"],
      ],
    },
    mistakes: [
      "Expecting global ordering across a topic — order is only within a partition.",
      "More consumers than partitions — the extra consumers sit idle.",
      "Choosing a key with few values (like country) and creating hot partitions.",
    ],
    remember: "Kafka = partitioned, replicated, append-only log; order per partition, consumers own their offsets, messages can be replayed.",
  },

  "Event-driven architecture & CQRS": {
    simple: `In an event-driven system, services announce facts ("OrderPlaced") instead of calling each other directly. Anyone interested listens and reacts. This keeps services loosely coupled: the order service doesn't need to know that email, inventory and analytics exist.

    CQRS (Command Query Responsibility Segregation) goes further: use one model for writes and separate, read-optimised models for queries, kept up to date from events. Event sourcing stores the events themselves as the source of truth and rebuilds state by replaying them.`,
    analogy: `A school announcement over the loudspeaker: "Sports day moved to Friday". The office doesn't phone every teacher; each one hears it and adjusts their own plans. That's event-driven.

    Your bank passbook is event sourcing: it lists every deposit and withdrawal, and your balance is just the sum.`,
    visual: "cqrs",
    how: {
      visual: "event-sourcing",
      steps: [
        "A command (PlaceOrder) is validated and applied to the write model.",
        "The write side emits an event (OrderPlaced) — via the outbox pattern so it's never lost.",
        "Projectors consume events and update read models (a denormalised 'my orders' table, a search index, a cache).",
        "Queries read only from read models — fast and shaped for each screen.",
        "Read models lag by milliseconds to seconds (eventual consistency), so UIs may show 'processing…'.",
      ],
    },
    concepts: [
      { term: "Event", meaning: "An immutable fact in past tense: PaymentCaptured, SeatBooked." },
      { term: "Command", meaning: "A request to change state: CapturePayment. Can be rejected." },
      { term: "CQRS", meaning: "Separate write model and read model(s)." },
      { term: "Event sourcing", meaning: "Store all events; current state = replay. Full audit trail and time travel." },
      { term: "Projection / read model", meaning: "A view built from events for a specific query." },
      { term: "Snapshot", meaning: "Saved state at event N so you don't replay from the beginning every time." },
    ],
    mistakes: [
      "Using CQRS + event sourcing for simple CRUD — lots of complexity for nothing.",
      "Events that are really commands in disguise (\"SendEmail\") creating hidden coupling.",
      "Changing event formats without versioning, breaking replay of old events.",
    ],
    remember: "Publish facts, let others react; CQRS splits writes from reads, event sourcing keeps every event as the truth.",
  },

  "Batch vs stream processing": {
    simple: `Batch processing collects a large amount of data and processes it all at once on a schedule (every night: compute yesterday's sales report). Stream processing handles each event as it arrives, within seconds (flag a fraudulent card swipe now).

    Batch is simpler and great for accuracy over complete data; streaming gives fresh results but must deal with late and out-of-order events.`,
    analogy: `Batch is doing laundry once a week: collect everything, wash it together. Streaming is washing each plate right after you eat: always clean, but you need to be at the sink all the time.`,
    visual: "mapreduce",
    how: {
      visual: "windows",
      steps: [
        "Batch (MapReduce / Spark): split input files, run map tasks in parallel, shuffle by key, reduce, write output. Re-run whenever needed.",
        "Stream (Flink / Kafka Streams): read events from Kafka continuously, keep state per key (counts), emit results.",
        "Group events into windows: tumbling (every 1 min), sliding (last 5 min, every 1 min), session (until 30 s idle).",
        "Use event time (when it happened) not processing time; a watermark says how long to wait for late events.",
        "Lambda architecture runs batch + stream side by side; Kappa uses only streaming and replays the log to recompute.",
      ],
    },
    concepts: [
      { term: "MapReduce", meaning: "Map (transform to key-value) → shuffle (group by key) → reduce (aggregate)." },
      { term: "Spark", meaning: "In-memory batch engine (also micro-batch streaming); much faster than Hadoop MapReduce." },
      { term: "Flink", meaning: "True event-at-a-time stream processing with state and exactly-once checkpoints." },
      { term: "Window", meaning: "A time bucket over a stream for aggregation." },
      { term: "Watermark", meaning: "\"I've probably seen all events before time T\" — lets windows close." },
      { term: "Lambda vs Kappa", meaning: "Batch + speed layer vs stream-only with replay." },
    ],
    compare: {
      head: ["", "Batch", "Stream"],
      rows: [
        ["Latency", "Minutes to hours", "Milliseconds to seconds"],
        ["Data", "Bounded (a day's files)", "Unbounded (never ends)"],
        ["Tools", "Spark, Hadoop, BigQuery", "Flink, Kafka Streams, Spark Streaming"],
        ["Use", "Reports, ML training, billing", "Fraud, alerts, live dashboards, surge pricing"],
      ],
    },
    mistakes: [
      "Using processing time for windows and getting wrong counts when events arrive late.",
      "Choosing streaming when a daily report is all the business needs.",
      "Forgetting stream jobs need checkpointed state to recover after crashes.",
    ],
    remember: "Batch = all at once on a schedule, accurate; stream = each event now, fresh, with windows and late-event handling.",
  },

  "Rate limiting algorithms": {
    simple: `A rate limiter caps how many requests a user, IP or API key can make in a time period, e.g. 100 per minute. It protects your service from abuse, bugs in clients and traffic spikes. Over the limit, you return HTTP 429 Too Many Requests.

    Different algorithms trade accuracy, memory and burst handling: token bucket (most common, allows bursts), leaky bucket (smooth output), fixed window (simple but bursty at edges), sliding window (accurate).`,
    analogy: `A metro station turnstile with tokens. Every second, a staff member drops one token in a box that holds at most 20. Each passenger needs one token to enter. A group of 15 can rush in at once if tokens have piled up (burst), but on average only 1 per second gets through. Box empty? Wait (429).`,
    visual: "token-bucket",
    how: {
      visual: "rate-windows",
      steps: [
        "Pick the key: user id, API key or IP.",
        "Token bucket: store (tokens, last_refill) per key; on each request add `rate × elapsed`, cap at capacity, take one if available.",
        "Fixed window: `INCR counter:user:minute` with a 60 s expiry; reject if > limit.",
        "Sliding window log: store request timestamps in a sorted set; drop ones older than 60 s; count the rest.",
        "Sliding window counter: weight the previous window's count by how much of it still overlaps — accurate and cheap.",
        "Return `429` with `Retry-After` and `X-RateLimit-Remaining` headers.",
      ],
    },
    concepts: [
      { term: "Token bucket", meaning: "Tokens refill at rate r up to capacity b; allows bursts up to b." },
      { term: "Leaky bucket", meaning: "Requests queue and drain at a constant rate — smooths traffic." },
      { term: "Fixed window counter", meaning: "Count per calendar minute; can allow 2× at window edges." },
      { term: "Sliding window log", meaning: "Exact, but stores every timestamp (more memory)." },
      { term: "Sliding window counter", meaning: "Approximate sliding window from two fixed-window counts." },
      { term: "Distributed limiting", meaning: "Shared counters in Redis, updated atomically with Lua scripts." },
    ],
    compare: {
      head: ["Algorithm", "Bursts", "Memory", "Accuracy"],
      rows: [
        ["Token bucket", "Allowed up to capacity", "2 numbers per key", "Good"],
        ["Leaky bucket", "Smoothed out", "Queue per key", "Good"],
        ["Fixed window", "Up to 2× at boundary", "1 counter", "Low"],
        ["Sliding log", "None", "All timestamps", "Exact"],
        ["Sliding counter", "Small", "2 counters", "Very good"],
      ],
    },
    mistakes: [
      "Read-then-write counters from app code — races let extra requests through; do it atomically in Redis.",
      "Only limiting by IP — many users share one IP behind mobile carriers and offices.",
      "Returning 500 instead of 429 with Retry-After.",
    ],
    remember: "Token bucket is the default: refill at a steady rate, spend one per request, allow small bursts.",
  },

  "Idempotency & retries": {
    simple: `Networks fail, so clients retry. But if "charge ₹500" is retried after the first attempt actually succeeded, the customer pays twice. An operation is idempotent if doing it twice has the same effect as doing it once.

    GET, PUT and DELETE are naturally idempotent; POST usually isn't. The fix is an idempotency key: the client sends a unique id with the request, and the server remembers which ids it has processed. Retries themselves should wait longer each time, with randomness (jitter), so they don't overwhelm a struggling server.`,
    analogy: `Pressing a lift button five times doesn't call five lifts — that's idempotent. Paying a shopkeeper by UPI twice because the first screen froze isn't — unless the shop checks "this transaction id is already paid".`,
    visual: "idempotency-key",
    how: {
      visual: "backoff",
      steps: [
        "Client generates a unique key (UUID) per logical operation, and reuses it for every retry of that operation.",
        "Server: inside a transaction, insert the key into an `idempotency_keys` table (unique constraint).",
        "If the insert succeeds, do the work and save the response with the key.",
        "If the key already exists, return the saved response instead of doing the work again.",
        "Client retries only on timeouts / 5xx / 429, with exponential backoff + jitter and a maximum number of attempts.",
      ],
    },
    concepts: [
      { term: "Idempotent", meaning: "f(f(x)) = f(x). Repeating is harmless." },
      { term: "Idempotency key", meaning: "Client-chosen unique id that lets the server detect duplicates." },
      { term: "Exponential backoff", meaning: "Wait 1 s, 2 s, 4 s, 8 s… between retries." },
      { term: "Jitter", meaning: "Random variation in the wait so clients don't retry in sync." },
      { term: "Retry storm", meaning: "Every layer retries, multiplying load on a failing service (3 layers × 3 retries = 27×)." },
      { term: "Retry budget", meaning: "Cap retries to a small % of traffic to avoid storms." },
    ],
    example: `~~~
    POST /payments
    Idempotency-Key: 6f1c-…-a91
    { "order_id": 991, "amount": 500 }

    -- server
    INSERT INTO idem_keys(key, status) VALUES ('6f1c…a91', 'processing');  -- unique
    -- duplicate key error → SELECT response FROM idem_keys WHERE key = …
    ~~~`,
    mistakes: [
      "Generating a new idempotency key on each retry — then it can't detect duplicates.",
      "Retrying non-idempotent operations blindly.",
      "Retrying at every layer of the call chain, creating a retry storm.",
    ],
    remember: "Make writes idempotent with a client key, and retry with exponential backoff plus jitter and a cap.",
  },

  "Circuit breaker, bulkhead & timeouts": {
    simple: `In a microservice system, one slow service can drag everything down: callers wait, threads pile up, and soon the callers fail too (cascading failure). Three tools stop this:

    Timeouts: never wait forever. Circuit breaker: if a service keeps failing, stop calling it for a while and fail fast (or use a fallback). Bulkhead: give each dependency its own limited pool of threads/connections, so one bad dependency can't use them all.`,
    analogy: `The electrical circuit breaker at home: when there's a fault, it trips and cuts power to that circuit instead of letting the whole house catch fire. After a while you try switching it on again (half-open). Bulkheads are the separate watertight compartments in a ship — one leak floods one compartment, not the whole ship.`,
    visual: "circuit-breaker",
    how: {
      visual: "bulkhead",
      steps: [
        "Closed: calls go through; the breaker counts failures and slow calls.",
        "If the failure rate crosses a threshold (say 50% over 20 calls), it opens.",
        "Open: calls fail immediately or return a fallback (cached data, a default, 'try later'). No load on the sick service.",
        "After a cool-down (30 s) it goes half-open and lets a few test calls through.",
        "Tests succeed → closed again. Tests fail → open again.",
      ],
    },
    concepts: [
      { term: "Cascading failure", meaning: "One failure spreading to callers, then their callers." },
      { term: "Timeout", meaning: "Upper bound on waiting; set from the dependency's p99 plus margin." },
      { term: "Circuit breaker states", meaning: "Closed (normal), open (fail fast), half-open (testing)." },
      { term: "Fallback", meaning: "What to return when a call fails: cached value, default, partial page." },
      { term: "Bulkhead", meaning: "Separate resource pools per dependency to contain failures." },
      { term: "Graceful degradation", meaning: "Core features keep working while extras (recommendations) are switched off." },
    ],
    mistakes: [
      "No timeout on HTTP clients (some default to infinite).",
      "Retrying into an open circuit or without backoff.",
      "One shared thread pool for all downstream calls.",
    ],
    remember: "Timeouts bound waiting, circuit breakers stop calling what's broken, bulkheads keep one failure contained.",
  },

  "Leader election & consensus (Raft, Paxos)": {
    simple: `Many systems need exactly one node in charge — one database leader, one scheduler — and a group of machines must agree on things like "who is leader" and "what's the next log entry", even when some crash or messages are lost. That agreement is called consensus.

    Raft and Paxos are consensus algorithms. They work as long as a majority of nodes are alive (2 of 3, 3 of 5). You rarely implement them yourself; you use systems built on them, like etcd, ZooKeeper or Consul.`,
    analogy: `A class electing a monitor. Anyone can stand when the old monitor leaves (timeout); you need more than half the class's votes to win, so two monitors can't both win. Every new election has a new number (term), and an old monitor who comes back sees the higher term and steps down.`,
    visual: "raft",
    how: {
      visual: "raft-log",
      steps: [
        "All nodes start as followers. The leader sends heartbeats.",
        "A follower that hears nothing for a random timeout becomes a candidate, increments the term, and asks for votes.",
        "Each node votes once per term; a majority makes the candidate leader.",
        "Clients send writes to the leader, which appends to its log and replicates to followers.",
        "Once a majority has the entry, it's committed and applied; even if the leader dies, the new leader has it.",
      ],
    },
    concepts: [
      { term: "Consensus", meaning: "Nodes agreeing on one value / sequence despite failures." },
      { term: "Quorum / majority", meaning: "More than half the nodes. 5 nodes tolerate 2 failures." },
      { term: "Term", meaning: "Raft's election number; higher term always wins." },
      { term: "Log replication", meaning: "Leader copies entries to followers; committed once on a majority." },
      { term: "Split brain", meaning: "Two leaders at once — prevented by majority votes." },
      { term: "Fencing token", meaning: "Increasing number given to each leader so storage rejects writes from an old leader." },
    ],
    compare: {
      head: ["", "Raft", "Paxos"],
      rows: [
        ["Design goal", "Understandable", "Proven minimal protocol"],
        ["Leader", "Strong leader always", "Optional (Multi-Paxos uses one)"],
        ["Used in", "etcd, Consul, CockroachDB", "Chubby, Spanner (variants)"],
      ],
    },
    mistakes: [
      "Running 2 or 4 nodes — no extra fault tolerance over 1 or 3; use odd numbers.",
      "Using a Redis key with TTL as a 'lock' for correctness-critical leader election without fencing.",
      "Thinking consensus makes the system available during a majority failure — it doesn't.",
    ],
    remember: "Consensus needs a majority; Raft = random timeouts, vote per term, leader replicates the log, commit on majority.",
  },

  "Distributed IDs & clocks": {
    simple: `In one database, AUTO_INCREMENT gives unique ids. Across many machines you need ids that are unique without asking a central server on every insert — and ideally roughly sorted by time.

    UUIDs are unique but random (bad for B-tree inserts, 128-bit). Twitter's Snowflake packs a timestamp, a machine id and a per-millisecond counter into 64 bits: unique, time-sortable, no coordination. Separately, machines' clocks drift, so you can't trust timestamps to order events across machines; logical clocks (Lamport, vector) fix ordering.`,
    analogy: `Train ticket PNRs: each booking counter prints its own counter code + date + a running number. No counter has to phone headquarters to get the next number, yet no two tickets clash, and you can roughly tell which was booked first.`,
    visual: "snowflake",
    how: {
      visual: "lamport",
      steps: [
        "Snowflake: id = (milliseconds since a custom epoch) << 22 | machine id << 12 | sequence.",
        "Each machine increments the sequence within the same millisecond; if it hits 4096, wait for the next ms.",
        "If the clock goes backwards (NTP adjustment), refuse to generate ids until it catches up.",
        "Lamport clock: counter +1 on each event; on receive set to max(local, received) + 1.",
        "Vector clock: one counter per node; can tell whether two events are ordered or concurrent (conflict).",
      ],
    },
    concepts: [
      { term: "UUID v4", meaning: "122 random bits; no coordination, not sortable." },
      { term: "UUID v7 / ULID", meaning: "Time-ordered 128-bit ids; sortable and coordination-free." },
      { term: "Snowflake", meaning: "64-bit: 41 timestamp + 10 machine + 12 sequence bits." },
      { term: "Clock skew", meaning: "Different machines' clocks disagree by ms or more." },
      { term: "Lamport clock", meaning: "Logical counter giving an order consistent with causality." },
      { term: "Vector clock", meaning: "Per-node counters that detect concurrent (conflicting) updates." },
    ],
    mistakes: [
      "Using wall-clock timestamps to decide which of two writes on different servers came last.",
      "Random UUIDs as clustered primary keys in MySQL — page splits and fragmentation.",
      "Hard-coding machine ids so two servers accidentally share one.",
    ],
    remember: "Snowflake = time + machine + sequence in 64 bits; for ordering across machines use logical clocks, not wall clocks.",
  },

  "Monitoring, logging & tracing": {
    simple: `Observability is being able to tell what's wrong in production from the outside. It rests on three pillars:

    Metrics are numbers over time (requests/sec, error rate, p99 latency) — cheap, perfect for dashboards and alerts. Logs are detailed event records — what exactly happened for request X. Traces follow one request across all the services it touched, showing where the time went.`,
    analogy: `A car dashboard shows speed and engine temperature (metrics). The mechanic's service record lists every event (logs). A GPS trip history shows the exact route and where you got stuck in traffic (trace).`,
    visual: "observability",
    how: {
      visual: "spans",
      steps: [
        "Every service exposes metrics (RED: Rate, Errors, Duration); Prometheus scrapes them; Grafana graphs them.",
        "Services write structured JSON logs including a request / trace id; ship them to Elasticsearch / Loki.",
        "The edge assigns a trace id; every service passes it on in headers and records spans (start, duration, parent).",
        "Alert on SLO burn (errors eating the budget too fast), not on every CPU spike.",
        "During an incident: metrics tell you something's wrong → traces show which service → logs show why.",
      ],
    },
    concepts: [
      { term: "RED metrics", meaning: "Rate, Errors, Duration — per service." },
      { term: "USE metrics", meaning: "Utilisation, Saturation, Errors — per resource (CPU, disk)." },
      { term: "Structured logging", meaning: "Logs as key-value JSON so they can be searched and aggregated." },
      { term: "Trace / span", meaning: "A trace is one request; spans are the timed steps inside it." },
      { term: "Context propagation", meaning: "Passing trace ids between services (W3C traceparent header)." },
      { term: "Cardinality", meaning: "Number of unique label combinations; user_id as a metric label explodes storage." },
    ],
    mistakes: [
      "Alerting on everything — the on-call engineer starts ignoring alerts.",
      "Logs without a request id, impossible to correlate across services.",
      "Putting high-cardinality values (user ids, URLs with ids) in metric labels.",
    ],
    remember: "Metrics say something's wrong, traces say where, logs say why.",
  },

  "Monolith vs microservices": {
    simple: `A monolith is one application, deployed as one unit, usually with one database. Microservices split the system into small services by business capability (users, orders, payments), each deployed independently and owning its own data.

    Microservices help large organisations move independently and scale parts separately, but add network calls, distributed data and lots of operational work. Most products should start as a well-structured monolith and split only where there's a clear reason.`,
    analogy: `A monolith is a joint family in one house: one kitchen, easy to share, but everyone must agree before renovating. Microservices are separate flats in one building: each family renovates when it wants, but you now need intercoms, separate bills and rules for shared spaces.`,
    visual: "monolith-vs-micro",
    how: {
      steps: [
        "Start with a modular monolith: clear modules with clean interfaces inside one codebase.",
        "Split a module out when it has a different scaling need, release cadence or team ownership.",
        "Draw boundaries around business capabilities (DDD bounded contexts), not technical layers.",
        "Give each service its own database; others access its data only through its API or events.",
        "Add the platform pieces: API gateway, service discovery, tracing, CI/CD per service.",
      ],
    },
    concepts: [
      { term: "Bounded context", meaning: "A part of the domain with its own model and language (Billing vs Shipping)." },
      { term: "Database per service", meaning: "No shared tables between services; prevents hidden coupling." },
      { term: "Distributed monolith", meaning: "Services that must be deployed together and share a DB — worst of both." },
      { term: "Service discovery", meaning: "How services find each other's addresses (Consul, Kubernetes DNS)." },
      { term: "Strangler fig", meaning: "Gradually replace parts of a monolith by routing features to new services." },
      { term: "Conway's law", meaning: "System structure mirrors team structure." },
    ],
    compare: {
      head: ["", "Monolith", "Microservices"],
      rows: [
        ["Deploy", "Everything together", "Each service independently"],
        ["Calls", "In-process function calls", "Network calls (latency, failures)"],
        ["Data", "One DB, easy joins/transactions", "DB per service, sagas, events"],
        ["Scaling", "Whole app", "Per service"],
        ["Best for", "Small teams, early products", "Many teams, large, mature domains"],
      ],
    },
    mistakes: [
      "Starting a new startup with 20 microservices.",
      "Splitting services that share one database.",
      "Chatty services: one page load making 30 synchronous calls in a chain.",
    ],
    remember: "Start with a modular monolith; split into services when team size, scaling or release needs clearly demand it.",
  },

  "Authentication & authorization at scale": {
    simple: `Authentication is proving who you are (login). Authorization is deciding what you're allowed to do (can this user delete this post?).

    After login, the server must remember you. Sessions store a random id in a cookie and look it up server-side. JWTs put signed user info into the token itself, so any service can verify it without a lookup. OAuth 2.0 lets one app access another on your behalf ("Log in with Google"), and OpenID Connect adds identity on top.`,
    analogy: `Authentication is showing your ID card at the office gate. Authorization is your access card only opening the floors you're allowed on. A session is the guard keeping a register of who's inside; a JWT is a tamper-proof visitor badge that any door can check by itself.`,
    visual: "session-vs-jwt",
    how: {
      visual: "oauth-flow",
      steps: [
        "User logs in; password is checked against a slow hash (bcrypt / argon2).",
        "Server issues a short-lived access token (JWT, ~15 min) and a long-lived refresh token (stored securely, revocable).",
        "API gateway verifies the JWT signature and expiry on each request — no DB lookup.",
        "Services authorise using roles/attributes in the token plus resource checks (is this your order?).",
        "When the access token expires, the client uses the refresh token to get a new one; logout revokes the refresh token.",
      ],
    },
    concepts: [
      { term: "Session", meaning: "Server-side state keyed by a cookie id; easy to revoke, needs a shared store." },
      { term: "JWT", meaning: "header.payload.signature; stateless verification, hard to revoke before expiry." },
      { term: "OAuth 2.0", meaning: "Delegated authorization: an app gets a scoped access token without your password." },
      { term: "OIDC", meaning: "OpenID Connect: OAuth + an ID token that says who the user is." },
      { term: "RBAC", meaning: "Role-based: admin, editor, viewer." },
      { term: "ABAC", meaning: "Attribute-based: rules on user, resource and context (same department, office hours)." },
    ],
    compare: {
      head: ["", "Server sessions", "JWT"],
      rows: [
        ["Where state lives", "Server (Redis)", "Inside the token"],
        ["Revoke instantly", "Yes, delete the session", "No — wait for expiry or keep a denylist"],
        ["Cross-service", "Each service must reach the store", "Any service verifies with the public key"],
        ["Size", "Small cookie", "Larger header"],
      ],
    },
    mistakes: [
      "Putting secrets or personal data in a JWT payload — it's only signed, not encrypted.",
      "Long-lived JWTs with no refresh/revoke strategy.",
      "Only checking roles and forgetting ownership (user A reading user B's order by changing the id).",
    ],
    remember: "Authentication = who you are, authorization = what you can do; short JWTs + refresh tokens, OAuth for delegated access.",
  },

  "Bloom filters, HyperLogLog & probabilistic structures": {
    simple: `Sometimes an exact answer costs too much memory, and a tiny error is fine. Probabilistic data structures give approximate answers using a fraction of the space.

    A Bloom filter answers "have I seen this item?" with either "definitely not" or "probably yes" — no false negatives, a few false positives. HyperLogLog counts unique items (how many distinct visitors?) in ~12 KB with ~1% error, even for billions. A count-min sketch estimates how often each item appears (heavy hitters).`,
    analogy: `A Bloom filter is like a bouncer who remembers faces vaguely: if he's sure he's never seen you, he's always right. If he thinks he's seen you, he might be confusing you with someone similar.`,
    visual: "bloom-filter",
    how: {
      visual: "count-min",
      steps: [
        "Bloom add: run the item through k hash functions; set those k bits to 1.",
        "Bloom check: if any of the k bits is 0 → definitely not present. All 1 → probably present.",
        "Size it from expected items and target false-positive rate (~10 bits per item for 1%).",
        "HyperLogLog: hash items and track the longest run of leading zeros per bucket — rare long runs imply many distinct items.",
        "Count-min: d rows of counters; increment one cell per row; estimate = minimum of those cells.",
      ],
    },
    concepts: [
      { term: "False positive", meaning: "Says 'maybe present' when it isn't. Bloom filters allow these." },
      { term: "False negative", meaning: "Says 'not present' when it is. Bloom filters never do this." },
      { term: "Bloom filter use", meaning: "Skip disk reads for missing keys (Cassandra), 'username taken?', crawler seen-URLs." },
      { term: "HyperLogLog", meaning: "Cardinality estimation; Redis PFADD / PFCOUNT. Daily unique users." },
      { term: "Count-min sketch", meaning: "Approximate frequency; top trending hashtags, heavy hitters." },
      { term: "Trade-off", meaning: "Tiny, fixed memory in exchange for a small, tunable error." },
    ],
    compare: {
      head: ["Structure", "Answers", "Error"],
      rows: [
        ["Bloom filter", "Is X in the set?", "False positives only"],
        ["HyperLogLog", "How many distinct items?", "~0.8% standard error"],
        ["Count-min sketch", "How often has X appeared?", "Overestimates only"],
      ],
    },
    mistakes: [
      "Trying to delete from a plain Bloom filter (use a counting Bloom filter).",
      "Using a Bloom filter where a false positive is dangerous without a real check after it.",
      "Storing every user id in a set to count uniques when HyperLogLog would do.",
    ],
    remember: "Bloom: 'definitely not' or 'maybe'; HyperLogLog: count distinct; count-min: approximate frequency — all in tiny memory.",
  },

  "Geospatial indexing": {
    simple: `"Find restaurants within 2 km" is hard for a normal index, because location is two numbers (latitude, longitude) and a B-tree sorts by one. Geospatial indexes turn 2D locations into something you can index and search quickly.

    Geohash cuts the world into a grid and names each cell with a string; nearby places share a prefix. Quadtrees split crowded areas into smaller and smaller squares. Google's S2 and Uber's H3 use cells on a sphere (H3 uses hexagons). To search, find your cell and its neighbours, then check exact distances only for points in those cells.`,
    analogy: `Indian PIN codes: 400001, 400002… are all in Mumbai; the first digits tell you the region. To find shops near you, you look in your PIN code and the ones next to it, not the whole country.`,
    visual: "geohash-grid",
    how: {
      visual: "quadtree",
      steps: [
        "Encode each location as a geohash (or S2/H3 cell id) and store it in an indexed column.",
        "Pick the precision from the search radius (6 chars ≈ 1.2 km cells).",
        "Compute the user's cell plus its 8 neighbours (to cover the cell edges).",
        "Fetch points in those cells with a prefix / IN query.",
        "Compute exact distances (haversine) for those candidates, filter by radius, sort.",
      ],
    },
    concepts: [
      { term: "Geohash", meaning: "Base-32 string for a grid cell; longer = smaller cell; shared prefix ≈ nearby." },
      { term: "Quadtree", meaning: "Tree where each node splits into 4 when it has too many points; adapts to density." },
      { term: "S2 / H3", meaning: "Hierarchical cells on a sphere (squares / hexagons), used by Google, Uber." },
      { term: "Edge problem", meaning: "Two close points can be in different cells — always search neighbours too." },
      { term: "Haversine", meaning: "Formula for distance between two lat/long points on Earth." },
      { term: "Redis GEO", meaning: "GEOADD / GEOSEARCH, built on geohash in a sorted set." },
    ],
    mistakes: [
      "Searching only the user's own cell and missing a restaurant 50 m away across the boundary.",
      "Using `WHERE lat BETWEEN … AND lng BETWEEN …` on a huge table with no spatial index.",
      "Rebuilding a quadtree on every driver location update instead of using a cell-based index.",
    ],
    remember: "Turn 2D locations into cells (geohash, quadtree, S2/H3), search your cell and neighbours, then check exact distance.",
  },
};
