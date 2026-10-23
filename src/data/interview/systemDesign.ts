import type { InterviewQA } from "./index";
import { SYSTEM_DESIGN_CASE_STUDIES_QA } from "./systemDesignCases";

// Interview Q&A for the System Design track, keyed by topic title (see src/data/topics.ts).
export const SYSTEM_DESIGN_QA: Record<string, InterviewQA[]> = {
  "How to approach a system design interview": [
    {
      q: "How do you structure a 45-minute system design interview?",
      a: `Use a fixed framework so you never stall:
      - Requirements (5 min): functional (what the system does) and non-functional (scale, latency, availability, consistency).
      - Estimates (3-5 min): DAU, QPS (avg and peak), storage per year, bandwidth.
      - API + data model (5 min): the main endpoints and the core entities.
      - High-level design (10 min): clients, LB, services, DB, cache, queue, blob store, CDN.
      - Deep dive (15 min): the 1-2 hardest parts (e.g. feed fan-out, ID generation, hot keys).
      - Wrap up: bottlenecks, failure modes, monitoring, what you'd do with more time.`,
    },
    {
      q: "What is the difference between functional and non-functional requirements?",
      a: `Functional requirements describe features: "users can post a tweet", "users see a home timeline".

      Non-functional requirements describe qualities: scale (100M DAU), latency (p99 < 200 ms), availability (99.99%), consistency (eventual is fine for likes), durability (never lose a payment), security and cost. Non-functional requirements drive almost every architectural choice, so always ask about them.`,
    },
    {
      q: "Walk me through a back-of-the-envelope estimate.",
      a: `Example: 100M DAU, each user makes 10 reads and 1 write a day.
      - Reads/day = 1B → 1B / ~100k seconds ≈ 10k QPS average; peak ≈ 2-3× = 30k QPS.
      - Writes ≈ 1k QPS average.
      - If each write is 1 KB: 100M KB/day = 100 GB/day ≈ 36 TB/year (×3 for replication ≈ 110 TB).

      Round aggressively (1 day ≈ 10^5 s) and say the numbers out loud; the goal is the order of magnitude, which tells you whether one DB is enough or you need sharding and caching.`,
    },
    {
      q: "Why does the interviewer care about trade-offs so much?",
      a: `There is no single correct design. Senior engineers are judged on whether they can name the alternatives, explain what each costs (latency, consistency, complexity, money) and pick one for a reason tied to the requirements. Phrases like "I'm choosing eventual consistency here because a stale like count is acceptable and it lets us serve from replicas" score far more than just drawing boxes.`,
    },
  ],

  "Scalability: vertical vs horizontal": [
    {
      q: "What is the difference between vertical and horizontal scaling?",
      a: `Vertical scaling (scale up) means a bigger machine: more CPU, RAM, faster disk. It's simple and needs no code changes, but it has a hard ceiling, gets expensive non-linearly and remains a single point of failure.

      Horizontal scaling (scale out) means more machines behind a load balancer. It's nearly unlimited and adds redundancy, but needs stateless services, data partitioning and handling of distributed-system problems (consistency, network failures).`,
    },
    {
      q: "Why must services be stateless to scale horizontally?",
      a: `If a server keeps user state in memory (session, cart), the next request must hit the same server, so you need sticky sessions, and losing that server loses the state. Stateless services move state into a shared store (Redis, DB, JWT on the client), so any instance can serve any request, instances can be added or killed freely and autoscaling just works.`,
    },
    {
      q: "Where does state live in a scalable architecture?",
      a: `- Durable data: databases (SQL/NoSQL), object storage for files.
      - Hot / ephemeral data: distributed cache (Redis/Memcached).
      - Sessions: Redis or signed tokens (JWT) held by the client.
      - In-flight work: message queues.
      The compute tier stays stateless and is the easy part to scale; the data tier is where the hard scaling work (replication, sharding) happens.`,
    },
    {
      q: "What does Amdahl's law tell us about scaling?",
      a: `Speedup is limited by the part that can't be parallelised. If 10% of the work is serial (e.g. a single DB write lock or a global counter), even infinite machines give at most 10× speedup. In design terms: find and remove serial bottlenecks (single leader, global locks, a single queue partition) before adding more servers.`,
    },
  ],

  "Latency, throughput & numbers every engineer should know": [
    {
      q: "What are the latency numbers every engineer should know?",
      a: `Rough orders of magnitude:
      - L1 cache: ~1 ns; main memory: ~100 ns.
      - SSD random read: ~100 µs; HDD seek: ~10 ms.
      - Round trip in the same datacenter: ~0.5 ms.
      - Cross-continent round trip: ~100-150 ms.
      - Read 1 MB sequentially from memory: ~10 µs; from SSD: ~1 ms.
      Takeaway: memory is ~1000× faster than SSD, network hops dominate, so cache aggressively and avoid chatty cross-region calls.`,
    },
    {
      q: "Latency vs throughput — what's the difference?",
      a: `Latency is how long one request takes (ms). Throughput is how many requests are handled per unit time (QPS). They trade off: batching raises throughput but adds latency to each item; a pipeline can have high throughput but each item still takes the full pipeline time. You optimise latency for user-facing paths and throughput for background/batch work.`,
    },
    {
      q: "Why do we look at p99 rather than average latency?",
      a: `Averages hide the tail. If p50 is 50 ms but p99 is 2 s, 1 in 100 requests is terrible — and a page that makes 100 backend calls will almost always hit one slow call (tail-at-scale). SLOs are therefore set on p95/p99/p999. Tail latency is reduced with timeouts, hedged requests, avoiding GC pauses and isolating slow dependencies.`,
    },
    {
      q: "What is Little's law and how is it used?",
      a: `L = λ × W: average items in the system = arrival rate × average time in the system.

      Example: 2,000 QPS with 50 ms latency means 2000 × 0.05 = 100 concurrent requests in flight, so you need about 100 worker threads/connections (plus headroom). It's used to size thread pools, DB connection pools and queue capacity.`,
    },
  ],

  "CAP theorem & PACELC": [
    {
      q: "Explain the CAP theorem.",
      a: `In a distributed data store, when a network partition (P) happens you must choose between:
      - Consistency (C): every read sees the latest write (or gets an error).
      - Availability (A): every request gets a non-error response, possibly stale.
      Partitions are unavoidable in real networks, so the real choice is CP or AP during a partition. CAP says nothing about normal operation.`,
    },
    {
      q: "Give examples of CP and AP systems.",
      a: `CP: HBase, ZooKeeper, etcd, MongoDB with majority writes, a bank ledger — they refuse writes on the minority side rather than diverge.

      AP: Cassandra, DynamoDB (default), DNS, CouchDB — they keep accepting reads/writes on both sides and reconcile later (last-write-wins, vector clocks, CRDTs).

      Choose by business impact: a stale product review is fine (AP); a double-spent balance is not (CP).`,
    },
    {
      q: "What does PACELC add to CAP?",
      a: `PACELC: if Partition, choose Availability or Consistency; Else (normal operation), choose Latency or Consistency. Even without failures, strong consistency costs latency because you must synchronously coordinate replicas. DynamoDB/Cassandra are PA/EL (fast, eventually consistent); Spanner/HBase are PC/EC (consistent, slower).`,
    },
    {
      q: "Is it true that you can only pick 2 of C, A and P?",
      a: `That's the common simplification but misleading. You can't "drop" P in a distributed system, so it's really C vs A only when a partition occurs. Also, systems aren't purely one type — many offer tunable consistency per request (Cassandra's ONE vs QUORUM), and different features of the same product can make different choices.`,
    },
  ],

  "Consistency models": [
    {
      q: "Explain strong, eventual and causal consistency.",
      a: `- Strong (linearizable): once a write completes, every subsequent read anywhere returns it — behaves like a single copy.
      - Eventual: if writes stop, all replicas converge eventually; reads may be stale meanwhile.
      - Causal: operations that are causally related (a reply after the post it replies to) are seen in that order by everyone; unrelated ones may be seen in any order.
      Stronger models are easier to reason about but cost latency and availability.`,
    },
    {
      q: "What is read-your-writes consistency and how do you implement it?",
      a: `A user always sees their own updates (after editing a profile, the refresh shows the edit), even if others see it later. Implementations:
      - Read the user's own data from the leader for a short time after a write.
      - Track the last write timestamp/LSN in the session and only read from replicas caught up to it.
      - Sticky routing of a user to one replica.`,
    },
    {
      q: "Linearizability vs serializability?",
      a: `Linearizability is a recency guarantee on single objects: every operation appears to happen atomically at one point between its start and end, in real-time order.

      Serializability is an isolation guarantee for transactions over many objects: the result equals some serial order of transactions, not necessarily real-time order.

      Strict serializability (Spanner) gives both.`,
    },
    {
      q: "How do quorums give consistency (R + W > N)?",
      a: `With N replicas, a write waits for W acks and a read queries R replicas. If R + W > N, every read set overlaps every write set in at least one replica, so a read sees the latest write (using versions to pick the newest). Typical N=3, W=2, R=2. Lowering W gives fast writes; lowering R gives fast reads; W=1, R=1 is fastest but only eventually consistent.`,
    },
  ],

  "Availability, SLAs, SLOs & SLIs": [
    {
      q: "What do SLI, SLO and SLA mean?",
      a: `- SLI (indicator): a measured metric, e.g. % of requests succeeding in < 300 ms.
      - SLO (objective): the internal target for that SLI, e.g. 99.9% over 30 days.
      - SLA (agreement): a contract with customers with penalties (credits) if missed; usually looser than the SLO.`,
    },
    {
      q: "How much downtime does each 'nine' allow?",
      a: `Per year:
      - 99% → ~3.65 days
      - 99.9% → ~8.76 hours
      - 99.99% → ~52.6 minutes
      - 99.999% → ~5.26 minutes
      Note: components in series multiply — two 99.9% services in a chain give ~99.8%. Redundant components in parallel improve it: 1 - (0.001)² = 99.9999%.`,
    },
    {
      q: "Active-active vs active-passive failover?",
      a: `Active-passive: one node serves traffic, a standby takes over via heartbeat when it fails. Simpler and no write conflicts, but failover takes time and the standby capacity is idle.

      Active-active: all nodes serve traffic; failure just shifts load. Better utilisation and instant failover, but harder — you need load balancing and conflict handling for writes.`,
    },
    {
      q: "What is an error budget?",
      a: `100% - SLO. A 99.9% SLO gives a 0.1% error budget (~43 minutes/month). While budget remains, teams ship features fast; once it's burned, releases freeze and effort shifts to reliability. It turns reliability vs velocity into an objective, data-driven decision.`,
    },
  ],

  "DNS, CDN & how a request reaches your server": [
    {
      q: "What happens when you type a URL in the browser?",
      a: `- Browser checks its cache, then the OS resolver, then the recursive resolver (ISP / 8.8.8.8).
      - Resolver walks root → TLD (.com) → authoritative name server to get the IP (results cached per TTL).
      - TCP handshake (and TLS handshake for HTTPS) with that IP — often a CDN edge or load balancer.
      - HTTP request is sent; LB routes to an app server, which may hit cache/DB.
      - Response returns; browser parses HTML, fetches CSS/JS/images (often from the CDN), renders.`,
    },
    {
      q: "What is a CDN and push vs pull CDNs?",
      a: `A CDN is a network of edge servers close to users that caches static (and sometimes dynamic) content, cutting latency and origin load.

      Pull: the edge fetches from origin on the first cache miss, then caches per TTL — easy, good for high-traffic sites.
      Push: you upload content to the CDN proactively — good for large, rarely changing files (videos, releases) and low-traffic sites.`,
    },
    {
      q: "How do you invalidate content cached in a CDN?",
      a: `- Versioned URLs (app.3f9a2.js): change the file name on deploy — the best option, no purge needed.
      - Explicit purge API calls for specific paths/tags.
      - Short TTLs with Cache-Control / stale-while-revalidate.
      Prefer versioning for static assets; use purges for content like an updated product page.`,
    },
    {
      q: "What are GeoDNS and Anycast?",
      a: `GeoDNS returns different IPs depending on the resolver's location, sending users to the nearest region.

      Anycast advertises the same IP from many locations; BGP routing delivers packets to the nearest one. CDNs and public DNS (1.1.1.1) use Anycast for low latency and DDoS absorption.`,
    },
  ],

  "HTTP/1.1, HTTP/2, HTTP/3 & TLS": [
    {
      q: "What are the differences between HTTP/1.1, HTTP/2 and HTTP/3?",
      a: `- HTTP/1.1: text protocol, keep-alive reuses connections, but one request at a time per connection → browsers open ~6 connections.
      - HTTP/2: binary framing, multiplexes many streams on one TCP connection, header compression (HPACK), server push. But TCP-level head-of-line blocking remains: one lost packet stalls all streams.
      - HTTP/3: runs over QUIC (UDP), streams are independent so packet loss only blocks one stream, faster handshakes (0-RTT/1-RTT), connection migration when the network changes.`,
    },
    {
      q: "What is head-of-line blocking?",
      a: `A slow or lost item at the front of a queue blocks everything behind it. In HTTP/1.1 a slow response blocks the next request on that connection. In HTTP/2 the application level is fixed by multiplexing, but TCP still delivers bytes in order, so one lost packet blocks all streams. QUIC fixes it at the transport level.`,
    },
    {
      q: "Explain the TLS handshake briefly and its cost.",
      a: `Client sends supported ciphers and a random; server replies with its certificate and key share; both derive a shared session key (ECDHE); the client verifies the cert chain against trusted CAs; encrypted traffic begins. TLS 1.3 needs 1 RTT (0-RTT on resumption) versus 2 RTT in TLS 1.2. Cost is mainly latency, which is why we terminate TLS at the edge/LB and reuse connections.`,
    },
  ],

  "REST vs gRPC vs GraphQL": [
    {
      q: "When would you choose REST, gRPC or GraphQL?",
      a: `- REST: public APIs and simple CRUD; human-readable JSON, HTTP caching, universal tooling.
      - gRPC: internal service-to-service calls; Protobuf is compact and fast, strict contracts, streaming, code generation. Poor browser support without a proxy.
      - GraphQL: client-driven data needs (mobile/web with many screens); one request fetches exactly the fields needed across resources.`,
    },
    {
      q: "What is idempotency in REST and which methods are idempotent?",
      a: `An operation is idempotent if repeating it has the same effect as doing it once. GET, PUT, DELETE, HEAD are idempotent; POST is not (two POSTs create two orders); PATCH may or may not be. This matters for retries: clients can safely retry idempotent calls; for POST, use an Idempotency-Key header.`,
    },
    {
      q: "What is the N+1 problem in GraphQL and how is it solved?",
      a: `Fetching a list of 50 posts then resolving each post's author separately causes 1 + 50 DB queries. The fix is batching with DataLoader: per-request it collects all author IDs requested in a tick and loads them in one query (WHERE id IN (...)), also caching within the request.`,
    },
    {
      q: "What are over-fetching and under-fetching?",
      a: `Over-fetching: an endpoint returns more fields than the client needs (wasted bandwidth on mobile). Under-fetching: one endpoint doesn't return enough, forcing extra round trips. GraphQL solves both by letting the client specify fields; REST mitigates with sparse fieldsets (?fields=) or BFF endpoints.`,
    },
  ],

  "Real-time: polling, long polling, WebSockets, SSE": [
    {
      q: "Compare polling, long polling, WebSockets and SSE.",
      a: `- Short polling: client asks every N seconds. Simple, but wasteful and delayed.
      - Long polling: server holds the request until data arrives or a timeout, then the client re-requests. Near real-time over plain HTTP.
      - SSE: one long-lived HTTP response streaming server → client events; auto-reconnect; one-way, text only.
      - WebSockets: full-duplex persistent TCP connection; best for chat, games, collaboration.
      Rule of thumb: notifications/feeds → SSE; bidirectional → WebSockets.`,
    },
    {
      q: "How do you scale WebSocket servers?",
      a: `Connections are stateful, so:
      - A connection/gateway tier holds sockets; keep business logic in stateless services behind it.
      - Store "user → gateway server" mapping in Redis so messages can be routed to the right server, or use pub/sub (Redis, Kafka) that every gateway subscribes to.
      - Use L4 load balancing or sticky sessions; scale on connection count (~100k-1M per tuned server).
      - Handle reconnect storms after a deploy with jittered backoff.`,
    },
    {
      q: "Why are heartbeats needed on persistent connections?",
      a: `TCP may not notice a dead peer (phone lost signal) for a long time, and proxies/NATs drop idle connections. Periodic ping/pong detects dead connections so the server can free resources and mark the user offline, and keeps intermediaries from timing out the connection.`,
    },
  ],

  "Load balancers": [
    {
      q: "What's the difference between L4 and L7 load balancers?",
      a: `L4 (transport) routes based on IP/port without reading the payload — very fast, protocol-agnostic, good for TCP/UDP (e.g. AWS NLB).

      L7 (application) understands HTTP — can route by path/host/header/cookie, terminate TLS, rewrite, do auth and rate limits, but costs more CPU (e.g. NGINX, Envoy, AWS ALB).`,
    },
    {
      q: "Explain common load balancing algorithms.",
      a: `- Round robin / weighted round robin: simple rotation; weights for bigger servers.
      - Least connections / least response time: good when request costs vary.
      - IP hash / consistent hashing: same client or key goes to the same server — useful for caches and sticky sessions.
      - Random with two choices (power of two): pick 2 random servers, use the less loaded — near-optimal and cheap.`,
    },
    {
      q: "How does a load balancer know a server is healthy?",
      a: `Active health checks: it periodically calls an endpoint like /health (TCP connect or HTTP 200) and removes servers that fail N times in a row, re-adding them after successes. Passive checks: it watches real traffic for errors/timeouts. A good /health checks the process's own readiness, not every downstream dependency (or one DB blip removes all servers).`,
    },
    {
      q: "Isn't the load balancer itself a single point of failure?",
      a: `It can be, so run LBs in redundant pairs: active-passive with a floating virtual IP (keepalived/VRRP), or active-active behind DNS/Anycast. Managed cloud LBs are already distributed across zones. DNS-level load balancing across regions adds another layer.`,
    },
  ],

  "Reverse proxy & API gateway": [
    {
      q: "Forward proxy vs reverse proxy?",
      a: `A forward proxy sits in front of clients and makes requests on their behalf (corporate proxy, VPN) — the server doesn't see the client.

      A reverse proxy sits in front of servers and receives requests on their behalf (NGINX) — the client doesn't see the servers. It provides load balancing, TLS termination, caching, compression and hides internal topology.`,
    },
    {
      q: "What does an API gateway do?",
      a: `It's a single entry point for clients to many microservices, handling cross-cutting concerns: routing, authentication/JWT validation, rate limiting, request/response transformation, aggregation of multiple service calls, TLS termination, logging and metrics. Examples: Kong, AWS API Gateway, Envoy-based gateways. Risk: it can become a bottleneck or a dumping ground for business logic.`,
    },
    {
      q: "What is the Backend-for-Frontend (BFF) pattern?",
      a: `A separate gateway/backend per client type (web, iOS, Android) that shapes and aggregates data for that client's screens. Each frontend team owns its BFF, avoiding one generic API that fits nobody well. The downside is some duplication across BFFs.`,
    },
    {
      q: "What is a service mesh / sidecar?",
      a: `Each service instance gets a proxy sidecar (Envoy) that handles all its network traffic: mTLS, retries, timeouts, circuit breaking, load balancing and tracing — configured centrally (Istio, Linkerd). Services stay simple and these concerns become uniform, at the cost of operational complexity and a small latency hop.`,
    },
  ],

  "Caching strategies": [
    {
      q: "Explain cache-aside, read-through, write-through and write-back.",
      a: `- Cache-aside (lazy loading): app reads cache; on a miss it reads the DB and populates the cache. On writes, update DB then delete the cache key. Most common.
      - Read-through: the cache itself loads from the DB on a miss.
      - Write-through: writes go to cache and DB synchronously — cache always fresh, writes slower.
      - Write-back (write-behind): write to cache, flush to DB asynchronously — very fast writes but risk of data loss if the cache dies.
      - Write-around: write only to DB; the cache fills on read.`,
    },
    {
      q: "Why delete the cache key instead of updating it on writes?",
      a: `With two concurrent writers, "update DB then set cache" can interleave so the cache ends up with the older value permanently. Deleting is idempotent and the next read loads the fresh value. A small window can still exist (read stale value, write it after the delete), so add TTLs and optionally delayed double-delete.`,
    },
    {
      q: "What are cache stampede / thundering herd and how do you prevent them?",
      a: `When a hot key expires, thousands of requests miss simultaneously and all hit the DB. Fixes:
      - Request coalescing / locking: only one request rebuilds, others wait or get the stale value.
      - Stale-while-revalidate / early probabilistic refresh before expiry.
      - Jittered TTLs so keys don't expire at the same time.`,
    },
    {
      q: "Explain LRU vs LFU eviction and what hot keys are.",
      a: `LRU evicts the least recently used item (good default, handles recency). LFU evicts the least frequently used (better for stable popularity, but slow to adapt). TTL expires by time.

      A hot key is one key receiving huge traffic (a celebrity's profile) that overloads a single cache shard. Fixes: local in-process cache, replicate the key across shards with suffixes (key#1..key#N) and read randomly.`,
    },
  ],

  "Distributed cache: Redis & Memcached": [
    {
      q: "Redis vs Memcached?",
      a: `Memcached: simple key → blob, multithreaded, no persistence, no replication — pure cache.

      Redis: rich data structures (strings, hashes, lists, sets, sorted sets, streams, HyperLogLog, geo), persistence, replication, clustering, Lua scripting, pub/sub, transactions. Mostly single-threaded command execution (I/O threads in newer versions). Redis is the default choice unless you need only a simple multi-threaded cache.`,
    },
    {
      q: "Which Redis data structures do you use for what?",
      a: `- String: cache values, counters (INCR), distributed locks (SET NX PX).
      - Hash: object fields (user profile).
      - List: queues, recent items.
      - Set: unique members, tags, mutual friends (SINTER).
      - Sorted set: leaderboards, rate-limit sliding windows, priority queues.
      - HyperLogLog: approximate unique counts.
      - Stream: append-only log with consumer groups.`,
    },
    {
      q: "How does Redis persist data? RDB vs AOF?",
      a: `RDB takes point-in-time snapshots (fork + copy-on-write) — compact, fast restart, but you lose writes since the last snapshot.

      AOF logs every write command; fsync policy (always / everysec / no) controls durability — less data loss, larger files, rewritten periodically. Production commonly uses both.`,
    },
    {
      q: "How does Redis Cluster scale?",
      a: `The keyspace is split into 16,384 hash slots (CRC16(key) mod 16384), spread across primaries, each with replicas for failover. Clients route by slot (redirected with MOVED). Multi-key ops must be in the same slot — use hash tags {user:42} to force it. Replication is async, so a failover can lose recent writes.`,
    },
  ],

  "Consistent hashing": [
    {
      q: "What problem does consistent hashing solve?",
      a: `With hash(key) mod N, adding or removing one server changes N and remaps almost every key — a cache would lose nearly all hits and a datastore would move most of its data. With consistent hashing only ~1/N of keys move when a node joins or leaves.`,
    },
    {
      q: "How does consistent hashing work?",
      a: `Servers and keys are hashed onto the same ring (0 … 2^32-1). A key belongs to the first server clockwise from its position. When a server is added, it only takes keys from its clockwise neighbour; when removed, its keys go to the next server.`,
    },
    {
      q: "Why are virtual nodes needed?",
      a: `With few physical nodes, positions on the ring are uneven, so some servers get far more keys. Each physical server is placed at many points (e.g. 100-200 vnodes), which evens out load, spreads a failed node's keys across many servers instead of one, and lets stronger machines own more vnodes.`,
    },
    {
      q: "Where is consistent hashing used?",
      a: `Amazon Dynamo / DynamoDB, Cassandra, Riak, memcached client libraries, CDNs and load balancers (Maglev, Envoy ring hash) for session affinity, and Discord for routing to chat servers. Alternatives include rendezvous (highest random weight) hashing and jump hash.`,
    },
  ],

  "SQL vs NoSQL: choosing a database": [
    {
      q: "When do you choose SQL vs NoSQL?",
      a: `SQL (Postgres/MySQL): structured data with relationships, need for joins, ACID transactions, complex ad-hoc queries — payments, orders, inventory.

      NoSQL: massive scale with simple, known access patterns, flexible schema or very high write throughput — feeds, sessions, IoT, chat messages, catalogs.

      Many systems use both (polyglot persistence). Modern SQL scales far (read replicas, sharding, Vitess/Citus), so "we need scale" alone is not a strong reason.`,
    },
    {
      q: "Name the NoSQL categories with examples.",
      a: `- Key-value: Redis, DynamoDB — lookups by key, sessions, caches.
      - Document: MongoDB, Couchbase — JSON documents, catalogs, user profiles.
      - Wide-column: Cassandra, HBase, Bigtable — write-heavy time series, messages.
      - Graph: Neo4j, Neptune — social graphs, recommendations, fraud rings.
      - Plus search engines (Elasticsearch) and time-series DBs (InfluxDB, Prometheus).`,
    },
    {
      q: "ACID vs BASE?",
      a: `ACID: Atomicity, Consistency, Isolation, Durability — transactions are all-or-nothing and isolated; typical of relational DBs.

      BASE: Basically Available, Soft state, Eventually consistent — favours availability and partition tolerance, accepting temporary inconsistency; typical of many NoSQL stores.`,
    },
    {
      q: "Why do access patterns drive the database choice?",
      a: `NoSQL stores like DynamoDB/Cassandra are fast only for queries designed into the key structure (partition key + sort key); ad-hoc queries are expensive or impossible. So list the queries first ("get last 50 messages in a chat", "get user by email"), then choose the store and key design that serves them in one lookup.`,
    },
  ],

  "Database indexing": [
    {
      q: "How does a database index speed up queries and what does it cost?",
      a: `An index is a separate sorted structure (usually a B+ tree) mapping column values to rows, turning a full table scan O(n) into O(log n). Costs: extra storage, and every INSERT/UPDATE/DELETE must also update every index, slowing writes. Index columns used in WHERE, JOIN, ORDER BY with good selectivity.`,
    },
    {
      q: "B-tree vs LSM-tree?",
      a: `B-tree (Postgres, MySQL InnoDB): updates pages in place; great for reads and range scans; random writes cause write amplification.

      LSM-tree (Cassandra, RocksDB, LevelDB): writes go to an in-memory memtable + WAL, flushed as sorted immutable SSTables, merged by background compaction. Very high write throughput; reads may check several SSTables (Bloom filters help).`,
    },
    {
      q: "Clustered vs secondary index?",
      a: `A clustered index stores the table rows themselves in index order (InnoDB's primary key) — only one per table, fast range scans on that key.

      A secondary index stores the indexed column plus a pointer (in InnoDB, the primary key), so a lookup may need a second lookup into the clustered index unless the index covers the query.`,
    },
    {
      q: "What are composite and covering indexes?",
      a: `A composite index is on multiple columns, e.g. (user_id, created_at). It follows the leftmost-prefix rule: it serves WHERE user_id = ? and WHERE user_id = ? ORDER BY created_at, but not WHERE created_at = ? alone.

      A covering index contains every column the query needs, so the DB answers from the index alone without touching the table.`,
    },
  ],

  "Replication": [
    {
      q: "Why replicate data and what are the main replication topologies?",
      a: `Replication gives high availability, read scaling and geographic locality.
      - Single-leader: all writes go to the leader, followers replicate — simple, no write conflicts (MySQL, Postgres).
      - Multi-leader: several leaders accept writes (multi-region) — needs conflict resolution.
      - Leaderless: clients write to/read from several replicas with quorums (Dynamo, Cassandra).`,
    },
    {
      q: "Synchronous vs asynchronous replication?",
      a: `Synchronous: the leader waits for follower acknowledgment before confirming — no data loss on failover, but higher latency and writes block if a follower is down.

      Asynchronous: the leader confirms immediately — fast, but a leader crash can lose recently confirmed writes. Semi-synchronous (wait for at least one follower) is a common middle ground.`,
    },
    {
      q: "What is replication lag and what problems does it cause?",
      a: `The delay before a follower applies the leader's writes. Problems:
      - Read-your-writes violations: the user updates something and doesn't see it.
      - Monotonic read violations: a user sees new data, then old data from a different replica.
      Fixes: read from leader after own writes, sticky replica per user, or wait for a replica to reach a given log position.`,
    },
    {
      q: "What happens on leader failover and what can go wrong?",
      a: `Detect failure (heartbeat timeout), elect the most up-to-date follower, reconfigure clients to the new leader. Pitfalls: lost async writes, split brain (two nodes think they're leader — prevented with fencing tokens/consensus), and timeouts too short causing needless failovers.`,
    },
  ],

  "Sharding / partitioning": [
    {
      q: "What is sharding and when do you need it?",
      a: `Sharding splits data horizontally across multiple databases, each holding a subset of rows. You need it when a single node can't handle the data size or write throughput even after vertical scaling, caching and read replicas. It adds significant complexity, so it's a last step.`,
    },
    {
      q: "Compare range, hash and directory-based sharding.",
      a: `- Range (A-M, N-Z or by date): efficient range queries, but prone to hot spots (all new data hits the latest shard).
      - Hash (hash(key) mod N or consistent hashing): even distribution, but range queries hit all shards.
      - Directory/lookup: a service maps keys to shards — flexible, easy to move tenants, but the directory is an extra hop and must be highly available.`,
    },
    {
      q: "How do you choose a good shard key?",
      a: `It should have high cardinality, distribute load evenly, and keep data that's queried together on the same shard. Example: for a chat app, shard messages by conversation_id so a conversation's history is one shard. Avoid monotonically increasing keys (timestamps) with range sharding, and low-cardinality keys (country).`,
    },
    {
      q: "What are the problems with sharding?",
      a: `- Cross-shard queries and joins need scatter-gather or denormalisation.
      - Cross-shard transactions need 2PC/sagas.
      - Hot partitions (a celebrity) — split or add salt to the key.
      - Resharding is painful — use consistent hashing or many logical shards mapped onto fewer physical ones so you move whole logical shards.
      - Globally unique IDs need a generator (Snowflake).`,
    },
  ],

  "Transactions & isolation levels": [
    {
      q: "Explain the four SQL isolation levels and the anomalies they allow.",
      a: `- Read Uncommitted: dirty reads possible.
      - Read Committed: no dirty reads; non-repeatable reads possible (Postgres default).
      - Repeatable Read: same row reads are stable; phantoms possible in the standard (InnoDB default, mostly prevents phantoms with next-key locks).
      - Serializable: as if transactions ran one by one.
      Higher isolation = fewer anomalies but less concurrency.`,
    },
    {
      q: "Define dirty read, non-repeatable read and phantom read.",
      a: `- Dirty read: reading another transaction's uncommitted change, which may later roll back.
      - Non-repeatable read: reading the same row twice in one transaction and getting different values because another transaction committed an update.
      - Phantom read: re-running a range query returns new/missing rows because another transaction inserted/deleted matching rows.`,
    },
    {
      q: "What is MVCC?",
      a: `Multi-Version Concurrency Control keeps multiple versions of each row tagged with transaction IDs. Readers see a consistent snapshot as of their start time, so readers never block writers and writers never block readers. Old versions are cleaned up later (Postgres VACUUM, InnoDB purge of undo logs).`,
    },
    {
      q: "Optimistic vs pessimistic locking — when to use each?",
      a: `Pessimistic: lock the row before changing it (SELECT … FOR UPDATE). Safe under high contention but reduces concurrency and risks deadlocks.

      Optimistic: read a version number, then UPDATE … WHERE id = ? AND version = ?; if 0 rows updated, someone else changed it — retry. Great when conflicts are rare (editing profiles), bad under heavy contention (seat booking for a hot event).`,
    },
  ],

  "Distributed transactions: 2PC & Saga": [
    {
      q: "How does two-phase commit (2PC) work?",
      a: `A coordinator runs:
      - Phase 1 (prepare): asks every participant to prepare; each writes its changes durably, locks resources and votes yes/no.
      - Phase 2 (commit/abort): if all vote yes, the coordinator logs commit and tells everyone to commit; otherwise abort.
      It gives atomicity across databases.`,
    },
    {
      q: "Why is 2PC rarely used across microservices?",
      a: `It's blocking: if the coordinator crashes after participants voted yes, they hold locks waiting indefinitely. It also adds latency (multiple round trips), reduces availability (every participant must be up) and many modern datastores/brokers don't support XA. So microservices prefer sagas with eventual consistency.`,
    },
    {
      q: "What is a saga? Choreography vs orchestration?",
      a: `A saga is a sequence of local transactions; if a step fails, previously completed steps are undone with compensating transactions (refund payment, release inventory).

      Choreography: services react to each other's events — decoupled, but the flow is hard to follow.
      Orchestration: a central orchestrator tells each service what to do — clear flow and easier error handling, but one more component.`,
    },
    {
      q: "What is the transactional outbox pattern?",
      a: `Problem: "update DB then publish to Kafka" isn't atomic — one can fail. Solution: in the same DB transaction, write the business change and an event row into an outbox table. A relay process (polling or CDC like Debezium) publishes outbox rows to the broker and marks them sent. Delivery is at-least-once, so consumers must be idempotent.`,
    },
  ],

  "Blob / object storage": [
    {
      q: "Why store files in object storage instead of the database?",
      a: `Large binary blobs bloat the DB, slow backups and replication, and waste expensive DB storage and I/O. Object stores (S3, GCS) are cheap, extremely durable (11 nines), scale infinitely and integrate with CDNs. Store the file in S3 and only metadata (owner, key, size, content type) in the DB.`,
    },
    {
      q: "What are pre-signed URLs and why use them?",
      a: `A time-limited URL signed with the server's credentials that allows a specific GET or PUT on one object. Clients upload/download directly to S3 without data passing through your app servers (saving bandwidth and CPU), while you still control access and expiry.`,
    },
    {
      q: "How do you upload very large files reliably?",
      a: `Multipart upload: split the file into parts (e.g. 5-100 MB), upload parts in parallel, retry only failed parts, then call complete to assemble them. It allows resumable uploads and higher throughput. Combine with pre-signed URLs per part, and checksums for integrity.`,
    },
  ],

  "Search: inverted index & Elasticsearch": [
    {
      q: "What is an inverted index?",
      a: `A map from each term to the list of documents (postings) containing it, often with positions and frequencies. Text is tokenized, lowercased, stop words removed and stemmed ("running" → "run"). A query intersects/unions the posting lists of its terms — far faster than scanning every document with LIKE '%term%'.`,
    },
    {
      q: "How is relevance scored (TF-IDF / BM25)?",
      a: `TF-IDF: score rises with how often the term appears in the document (term frequency) and how rare it is across all documents (inverse document frequency).

      BM25 (Elasticsearch default) improves on it by saturating term frequency (10 mentions isn't 10× better) and normalizing by document length. Business signals (popularity, recency) are usually blended in.`,
    },
    {
      q: "How do you keep Elasticsearch in sync with the primary database?",
      a: `Elasticsearch is a secondary index, not the source of truth. Options:
      - Change Data Capture (Debezium reads the DB log → Kafka → indexer) — reliable, decoupled.
      - Outbox events consumed by an indexer.
      - Dual writes from the app — simple but can diverge on failures.
      Plus periodic full reindexing to repair drift. Expect near-real-time (~1 s refresh) lag.`,
    },
    {
      q: "How does Elasticsearch scale?",
      a: `An index is split into primary shards spread across nodes, each with replica shards. Queries scatter to all shards and results are merged (gather). Replicas serve reads and provide failover. The number of primary shards is fixed at creation (reindex or split to change), so size them for growth (aim ~10-50 GB per shard).`,
    },
  ],

  "Message queues": [
    {
      q: "Why use a message queue?",
      a: `- Decoupling: producers don't need consumers to be up.
      - Load leveling: absorb spikes; consumers process at their own pace.
      - Async work: send emails, resize images, off the request path.
      - Reliability: retries and persistence.
      - Fan-out to many consumers with pub/sub.
      Examples: RabbitMQ, SQS, Kafka.`,
    },
    {
      q: "Point-to-point vs publish/subscribe?",
      a: `Point-to-point: each message is consumed by exactly one consumer among competing workers — work queues (SQS, RabbitMQ queue).

      Pub/sub: each message is delivered to every subscriber (each subscription gets its own copy) — event broadcasting (SNS, Kafka with several consumer groups).`,
    },
    {
      q: "Explain at-most-once, at-least-once and exactly-once delivery.",
      a: `- At-most-once: ack before processing; a crash loses the message. Fine for metrics.
      - At-least-once: ack after processing; a crash causes redelivery, so duplicates happen. The common default.
      - Exactly-once: very hard end-to-end. In practice it's at-least-once delivery + idempotent consumers (dedup by message ID), or Kafka transactions within Kafka.`,
    },
    {
      q: "What are dead letter queues and backpressure?",
      a: `A DLQ receives messages that failed processing after N retries (poison messages), so they don't block the queue; you alert on and inspect them.

      Backpressure is signalling producers to slow down when consumers can't keep up — bounded queues, rejecting/throttling producers, or scaling consumers based on queue depth.`,
    },
  ],

  "Kafka deep dive": [
    {
      q: "Explain Kafka's topics, partitions and offsets.",
      a: `A topic is a named stream of records, split into partitions. Each partition is an append-only, ordered log stored on disk and replicated across brokers. Each record has an offset (its position). Consumers track the offset they've processed, so they can rewind and replay. Records are retained by time/size regardless of consumption.`,
    },
    {
      q: "How do consumer groups work?",
      a: `Consumers sharing a group.id split the partitions among themselves: each partition is read by exactly one consumer in the group, so parallelism is capped by partition count. Different groups each get all messages (pub/sub). When consumers join/leave, a rebalance reassigns partitions (cooperative rebalancing reduces the pause).`,
    },
    {
      q: "What ordering guarantees does Kafka give?",
      a: `Ordering is guaranteed only within a partition. Messages with the same key go to the same partition (hash of key), so all events for order #42 stay ordered. There's no global order across partitions. Enable the idempotent producer to avoid reordering/duplicates on retries.`,
    },
    {
      q: "Why is Kafka so fast and how is durability ensured?",
      a: `Speed: sequential disk appends, OS page cache, zero-copy sendfile, batching and compression.

      Durability: each partition has a leader and followers; the in-sync replica set (ISR) tracks caught-up followers. With acks=all and min.insync.replicas=2, a write is acknowledged only when at least 2 replicas have it.`,
    },
    {
      q: "What is log compaction?",
      a: `Instead of deleting by age, Kafka keeps at least the latest record per key and removes older ones (a null value is a tombstone deleting the key). This makes a topic act like a durable changelog/table snapshot — used for state restoration, CDC and config.`,
    },
  ],

  "Event-driven architecture & CQRS": [
    {
      q: "What is event-driven architecture?",
      a: `Services communicate by emitting events ("OrderPlaced") to a broker, and other services react, instead of calling each other synchronously. Benefits: loose coupling, independent scaling, easy to add new consumers. Costs: eventual consistency, harder debugging/tracing, need for idempotency and schema versioning.`,
    },
    {
      q: "What is event sourcing?",
      a: `Instead of storing current state, store the sequence of events that led to it (Deposited 100, Withdrew 30); current state is derived by replaying them (with periodic snapshots). Gives a full audit log, time travel and easy rebuild of new read models. Downsides: complexity, event schema evolution, and queries need projections.`,
    },
    {
      q: "Explain CQRS.",
      a: `Command Query Responsibility Segregation: separate the write model (commands, validating business rules, normalized) from read models (denormalized views optimized per query — e.g. Elasticsearch, Redis). Read models are updated asynchronously from events, so they're eventually consistent. Useful when read and write loads/shapes differ a lot; overkill for simple CRUD.`,
    },
  ],

  "Batch vs stream processing": [
    {
      q: "Batch vs stream processing?",
      a: `Batch processes a bounded dataset periodically (nightly reports, ML training) — high throughput, high latency (minutes-hours). Tools: Spark, Hadoop MapReduce.

      Stream processes unbounded events continuously as they arrive (fraud detection, live dashboards) — low latency (ms-seconds). Tools: Flink, Kafka Streams, Spark Structured Streaming.`,
    },
    {
      q: "Explain the MapReduce idea.",
      a: `Map: each worker processes a chunk of input in parallel and emits key-value pairs (word → 1). Shuffle: pairs are grouped by key across the cluster. Reduce: each key's values are combined (sum counts). Moving computation to the data and parallel processing lets it handle petabytes on commodity hardware.`,
    },
    {
      q: "What are windows and late events in stream processing?",
      a: `Windows group an infinite stream into finite chunks: tumbling (fixed, non-overlapping), sliding (overlapping), session (gap-based).

      Late events arrive after their window's time because of network delays. Event-time processing uses watermarks ("we've probably seen everything up to time T") and allowed lateness to update results.`,
    },
    {
      q: "Lambda vs Kappa architecture?",
      a: `Lambda: a batch layer (accurate, recomputed) plus a speed layer (approximate, real-time), merged at serving. Accurate but two codebases.

      Kappa: everything is a stream; reprocessing is done by replaying the log (Kafka) through the same streaming job. Simpler, now preferred with mature stream processors.`,
    },
  ],

  "Rate limiting algorithms": [
    {
      q: "Explain the token bucket algorithm.",
      a: `A bucket holds up to B tokens and refills at R tokens/second. Each request takes a token; if empty, it's rejected (HTTP 429). It allows bursts up to B while enforcing an average rate R, needs only 2 values per key (tokens, last refill time), and is used by AWS and Stripe.`,
    },
    {
      q: "Leaky bucket vs token bucket?",
      a: `Leaky bucket: requests enter a queue that drains at a constant rate — output is perfectly smooth; bursts are queued or dropped. Good for traffic shaping.

      Token bucket: allows bursts up to bucket size as long as the average rate holds. Better for APIs where short bursts are fine.`,
    },
    {
      q: "Fixed window vs sliding window log vs sliding window counter?",
      a: `- Fixed window: counter per minute. Simple, but allows 2× limit at window edges (100 at 0:59 + 100 at 1:00).
      - Sliding log: store each request timestamp (sorted set), count those in the last 60 s. Exact but memory-heavy.
      - Sliding window counter: current count + previous window count × overlap fraction. Approximate, cheap, and smooths the edge problem — good default.`,
    },
    {
      q: "How do you rate limit across many servers?",
      a: `Keep counters in a shared store like Redis, keyed by user/IP/API key. Make check-and-increment atomic with a Lua script or INCR + EXPIRE. To reduce latency, use local token buckets that sync periodically (slightly inexact). Fail open if Redis is down (to avoid an outage), and return 429 with Retry-After and X-RateLimit headers.`,
    },
  ],

  "Idempotency & retries": [
    {
      q: "What is an idempotency key and how is it implemented?",
      a: `The client generates a unique key per logical operation (UUID) and sends it with the request. The server stores key → result (with a unique constraint) in the same transaction as the operation. A retry with the same key returns the stored result instead of re-executing (no double charge). Keys expire after e.g. 24 hours; concurrent duplicates are blocked by the unique constraint or a lock.`,
    },
    {
      q: "Why exponential backoff with jitter?",
      a: `Retrying immediately piles more load on a struggling service. Exponential backoff waits 100 ms, 200 ms, 400 ms… (capped). Without jitter, all clients that failed together retry together in synchronized waves; adding randomness (full jitter: random(0, backoff)) spreads them out so the service can recover.`,
    },
    {
      q: "What is a retry storm and how do you prevent it?",
      a: `If each of 3 layers retries 3 times, one user request can become 27 calls to the bottom service, amplifying an outage. Prevent it by retrying at only one layer, using retry budgets (e.g. retries ≤ 10% of requests), circuit breakers, only retrying transient errors (timeouts, 503) and only idempotent operations.`,
    },
  ],

  "Circuit breaker, bulkhead & timeouts": [
    {
      q: "Explain the circuit breaker pattern and its states.",
      a: `It wraps calls to a dependency to stop hammering it when it's failing:
      - Closed: calls pass; failures are counted.
      - Open: after the failure rate exceeds a threshold, calls fail fast (or use a fallback) without hitting the dependency.
      - Half-open: after a cool-down, a few trial calls go through; success closes the circuit, failure re-opens it.
      It prevents cascading failures and gives the dependency time to recover.`,
    },
    {
      q: "What is the bulkhead pattern?",
      a: `Like ship compartments: isolate resources per dependency or tenant (separate thread pools/connection pools), so one slow dependency exhausting its pool can't consume all threads and take down unrelated features.`,
    },
    {
      q: "Why are timeouts so important?",
      a: `Without timeouts, a hung dependency makes threads wait forever, pools fill up and the whole service stops responding. Set timeouts on every network call, based on the dependency's p99 latency, and use deadline propagation so downstream calls don't keep working on a request the client has already abandoned.`,
    },
    {
      q: "What is graceful degradation?",
      a: `Keeping the core function working when parts fail: show cached or default recommendations if the recommender is down, hide the reviews widget, disable non-critical features via feature flags, or serve a read-only mode. Users get a degraded experience instead of an error page.`,
    },
  ],

  "Leader election & consensus (Raft, Paxos)": [
    {
      q: "Why do distributed systems need consensus?",
      a: `To have multiple nodes agree on a value despite failures — who the leader is, the order of log entries, a config value, a lock owner. Without it you get split brain (two leaders accepting conflicting writes). Consensus algorithms (Paxos, Raft, Zab) need a majority quorum, so a 5-node cluster tolerates 2 failures.`,
    },
    {
      q: "Explain how Raft works.",
      a: `Nodes are followers, candidates or leaders. Time is divided into terms.
      - Leader election: a follower that doesn't hear heartbeats within a random timeout becomes a candidate, increments the term and requests votes; a majority makes it leader.
      - Log replication: the leader appends client commands to its log and replicates to followers; an entry is committed once a majority stores it, then applied to the state machine.
      - Safety: only candidates with an up-to-date log can win.`,
    },
    {
      q: "How are ZooKeeper / etcd used in system design?",
      a: `They're strongly consistent coordination stores built on consensus. Uses: leader election (ephemeral nodes / leases), distributed locks, service discovery, configuration management, cluster membership. Kubernetes stores all cluster state in etcd. They're not for high-volume data.`,
    },
    {
      q: "What is a fencing token?",
      a: `A monotonically increasing number issued with each lock/lease. A paused old leader (GC pause) may wake up thinking it still holds the lock; the storage rejects writes carrying a token lower than one already seen, so the stale leader can't corrupt data.`,
    },
  ],

  "Distributed IDs & clocks": [
    {
      q: "UUID vs Snowflake IDs?",
      a: `UUIDv4: 128-bit random, generated anywhere with no coordination, but not sortable and random inserts fragment B-tree indexes.

      Snowflake: 64-bit = timestamp (41 bits) + machine ID (10 bits) + sequence (12 bits). Roughly time-sortable, fits in a BIGINT, ~4096 IDs/ms per machine, index-friendly. UUIDv7 and ULID are time-ordered alternatives in 128 bits.`,
    },
    {
      q: "Why can't we rely on wall-clock time across machines?",
      a: `Clocks drift and NTP corrections can jump them backwards, with skew of milliseconds or more. Ordering events by timestamp across nodes can then be wrong, and "last write wins" can silently drop a newer write. Use logical clocks for ordering or bounded-uncertainty clocks (Spanner TrueTime).`,
    },
    {
      q: "What are Lamport clocks and vector clocks?",
      a: `Lamport clock: each node keeps a counter, increments on each event, and on receiving a message sets counter = max(local, received) + 1. Gives a total order consistent with causality, but can't tell if two events are concurrent.

      Vector clock: each node keeps a counter per node. Comparing vectors tells you whether A happened before B or they're concurrent (conflict) — used in Dynamo-style stores to detect conflicting writes.`,
    },
  ],

  "Monitoring, logging & tracing": [
    {
      q: "What are the three pillars of observability?",
      a: `- Metrics: numeric time series (QPS, error rate, latency percentiles, CPU) — cheap, for dashboards and alerts (Prometheus, Datadog).
      - Logs: detailed per-event records, ideally structured JSON with request IDs (ELK, Loki).
      - Traces: the path of one request across services with timings per hop (Jaeger, Zipkin, OpenTelemetry).`,
    },
    {
      q: "How does distributed tracing work?",
      a: `The entry point creates a trace ID; each unit of work is a span with its own ID, parent span ID, start/end time and tags. IDs are propagated in headers (W3C traceparent) to downstream services and over queues. A collector assembles spans into a tree, showing where latency or errors come from. Sampling keeps cost down.`,
    },
    {
      q: "What should you monitor and alert on?",
      a: `Use the golden signals (latency, traffic, errors, saturation) or RED (rate, errors, duration) for services and USE (utilisation, saturation, errors) for resources. Alert on user-facing symptoms tied to SLOs (error budget burn rate), not on every cause like CPU 80%, to avoid alert fatigue.`,
    },
  ],

  "Monolith vs microservices": [
    {
      q: "Monolith vs microservices — trade-offs?",
      a: `Monolith: one deployable — simple development, testing, deployment and transactions; fast for small teams. But it scales as a whole, and large codebases slow teams down.

      Microservices: independently deployable services per business capability — independent scaling, deployment, tech choice and team ownership. Costs: network calls, distributed transactions, eventual consistency, observability and operational overhead.`,
    },
    {
      q: "When should you split a monolith?",
      a: `When organisational pain appears: many teams stepping on each other, slow deploys, parts with very different scaling or reliability needs. Start with a modular monolith with clear boundaries; extract services gradually with the strangler fig pattern (route specific endpoints to the new service until the old code is gone).`,
    },
    {
      q: "How do you define service boundaries?",
      a: `Use Domain-Driven Design bounded contexts: group by business capability (orders, payments, catalog), not technical layers. Each service owns its data — no other service reads its DB directly; they use APIs or events. Aim for high cohesion within and low coupling (few chatty calls) between services.`,
    },
    {
      q: "What is a distributed monolith?",
      a: `Services that are separately deployed but tightly coupled: shared database, synchronous call chains, lockstep deployments. You get all the costs of microservices with none of the benefits. Signs: you can't deploy one service without others, or one service failing takes down everything.`,
    },
  ],

  "Authentication & authorization at scale": [
    {
      q: "Session-based auth vs JWT?",
      a: `Sessions: the server stores session data (Redis) and the client holds a session ID cookie. Easy revocation; needs a shared store.

      JWT: a signed token containing claims; any service verifies it with a key without a lookup — stateless and scalable. But revocation is hard until expiry, so use short-lived access tokens (5-15 min) plus refresh tokens, and a deny-list for emergencies.`,
    },
    {
      q: "Explain the OAuth 2.0 authorization code flow and OIDC.",
      a: `OAuth 2.0 is delegated authorization: the user is redirected to the authorization server, logs in and consents; the app receives an authorization code, exchanges it on the back channel (with PKCE for public clients) for an access token, and calls the API with it.

      OIDC adds authentication on top: an ID token (JWT) with identity claims, used for "Sign in with Google".`,
    },
    {
      q: "Authentication vs authorization, and RBAC vs ABAC?",
      a: `Authentication: who are you? Authorization: what are you allowed to do?

      RBAC: permissions attach to roles (admin, editor); users get roles. Simple and auditable.
      ABAC: rules over attributes of user, resource and context ("doctors can read records of patients in their department during shifts"). More flexible, more complex. Large systems often combine them, sometimes with relationship-based models (Google Zanzibar).`,
    },
  ],

  "Bloom filters, HyperLogLog & probabilistic structures": [
    {
      q: "What is a Bloom filter and where is it used?",
      a: `A bit array plus k hash functions. Insert sets k bits; a lookup checks those k bits — if any is 0, the item is definitely absent; if all are 1, it's probably present. False positives are possible, false negatives never; no deletion (counting Bloom filters allow it). Uses: avoid disk lookups for missing keys in LSM stores (Cassandra), check if a username is taken, skip already crawled URLs, filter malicious URLs.`,
    },
    {
      q: "What is HyperLogLog?",
      a: `It estimates the number of distinct elements (cardinality) using about 12 KB with ~0.8% error, regardless of whether there are millions or billions of items. It hashes items and tracks the maximum number of leading zeros per bucket. Use it for unique visitors/day; Redis has PFADD/PFCOUNT, and HLLs can be merged.`,
    },
    {
      q: "What is a Count-Min Sketch?",
      a: `A 2D array of counters with one hash function per row. Increment the counter in each row; estimate frequency as the minimum across rows. It may overestimate (collisions), never underestimate, in fixed memory. Used for heavy hitters / top-K trending items in streams.`,
    },
  ],

  "Geospatial indexing": [
    {
      q: "How do you find nearby restaurants efficiently?",
      a: `A plain lat/lng range query on two separate indexes is inefficient. Use a spatial index that maps 2D space to cells: geohash, quadtree, or S2/H3. Find the cell of the user, search that cell plus neighbouring cells, then compute exact distances and filter/sort. Postgres PostGIS, Redis GEO, Elasticsearch geo queries all do this.`,
    },
    {
      q: "Explain geohash.",
      a: `It recursively splits the world into a grid, interleaving latitude and longitude bits, encoded as base32 strings. Longer prefixes are smaller cells (6 chars ≈ 1.2 km × 0.6 km). Nearby points usually share prefixes, so a prefix query finds a cell. Edge case: close points across a cell boundary have different prefixes — always also search the 8 neighbours.`,
    },
    {
      q: "Quadtree vs geohash?",
      a: `A quadtree recursively splits a region into 4 children only when it has too many points, so dense cities get small cells and oceans stay large — adapts to density. It's an in-memory tree, rebuilt or updated as data changes. Geohash is a fixed grid that's easy to store in any DB index. Uber uses H3 (hexagons), Google uses S2.`,
    },
  ],

  ...SYSTEM_DESIGN_CASE_STUDIES_QA,
};
