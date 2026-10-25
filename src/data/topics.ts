/** Seniority a topic gets asked at. A topic with no levels is relevant to everyone. */
export const LEVELS = ["entry", "mid", "senior"] as const;
export type Level = (typeof LEVELS)[number];
export const LEVEL_LABEL: Record<Level, string> = { entry: "Entry level", mid: "Mid level", senior: "Senior" };

export function parseLevel(v: unknown): Level | null {
  return typeof v === "string" && (LEVELS as readonly string[]).includes(v) ? (v as Level) : null;
}

/** Whether a topic is shown for a role filter. Topics without levels show for every role. */
export const forLevel = (role: Level | null) => (t: { levels?: Level[] }) => !role || !t.levels?.length || t.levels.includes(role);

export type Topic = {
  id: number;
  title: string;
  section: string;
  points: string[];
  practice?: { title: string; url: string }[];
  levels?: Level[];
};

// Track key, e.g. "sd", "sql", or any key an admin creates.
export type TrackKind = string;

/** Tracks you practise by solving (listed under Questions) rather than read as lessons under Tracks. */
export const PRACTICE_TRACKS: readonly string[] = ["sql"];

export function topicHref(track: string, id: number) {
  return PRACTICE_TRACKS.includes(track) ? `/questions?tab=${track}#topic-${id}` : `/tracks/${track}/${id}`;
}

const lc = (slug: string, title: string) => ({ title, url: `https://leetcode.com/problems/${slug}/` });
// DataLemur: real company SQL interview questions, plus its free SQL tutorial lessons.
const dl = (slug: string, title: string, company: string) => ({ title: `${title} (${company})`, url: `https://datalemur.com/questions/${slug}` });
const lesson = (slug: string, title: string) => ({ title: `Lesson: ${title}`, url: `https://datalemur.com/sql-tutorial/${slug}` });
// Reading for the OOP track: GeeksforGeeks, TpointTech (formerly javatpoint) and Refactoring.Guru.
const gfg = (path: string, title: string) => ({ title: `GfG: ${title}`, url: `https://www.geeksforgeeks.org/${path}/` });
const tpt = (slug: string, title: string) => ({ title: `TpointTech: ${title}`, url: `https://www.tpointtech.com/${slug}` });
const rg = (slug: string, title: string) => ({ title: `Refactoring.Guru: ${title}`, url: `https://refactoring.guru/${slug}` });
const LLD_REPO = { title: "awesome-low-level-design (GitHub)", url: "https://github.com/ashishps1/awesome-low-level-design" };
const E: Level[] = ["entry"];
const EM: Level[] = ["entry", "mid"];
const EMS: Level[] = ["entry", "mid", "senior"];
const M: Level[] = ["mid"];
const MS: Level[] = ["mid", "senior"];
const S: Level[] = ["senior"];

// One topic per day, in order: fundamentals first, then building blocks, then case studies.
const SYSTEM_DESIGN: Omit<Topic, "id">[] = [
  { section: "Fundamentals", title: "How to approach a system design interview", points: ["Clarify functional vs non-functional requirements", "Back-of-the-envelope estimates (QPS, storage, bandwidth)", "High-level design → deep dive → bottlenecks", "State trade-offs out loud"] },
  { section: "Fundamentals", title: "Scalability: vertical vs horizontal", points: ["Scale up vs scale out", "Stateless services", "Where state lives (DB, cache, session store)", "Amdahl's law intuition"] },
  { section: "Fundamentals", title: "Latency, throughput & numbers every engineer should know", points: ["Memory vs SSD vs network latency orders of magnitude", "p50 / p99 / p999 latency", "Throughput vs latency trade-off", "Little's law"] },
  { section: "Fundamentals", title: "CAP theorem & PACELC", points: ["Consistency, Availability, Partition tolerance", "CP vs AP systems with examples", "PACELC: latency vs consistency without partitions"] },
  { section: "Fundamentals", title: "Consistency models", points: ["Strong, eventual, causal, read-your-writes", "Linearizability vs serializability", "Quorum reads/writes (R + W > N)"] },
  { section: "Fundamentals", title: "Availability, SLAs, SLOs & SLIs", points: ["Nines of availability and downtime budgets", "Redundancy & failover (active-active, active-passive)", "Error budgets"] },
  { section: "Networking", title: "DNS, CDN & how a request reaches your server", points: ["DNS resolution & TTL", "Anycast & GeoDNS", "CDN push vs pull, cache invalidation at the edge"] },
  { section: "Networking", title: "HTTP/1.1, HTTP/2, HTTP/3 & TLS", points: ["Keep-alive, multiplexing, head-of-line blocking", "QUIC basics", "TLS handshake cost"] },
  { section: "Networking", title: "REST vs gRPC vs GraphQL", points: ["Resource modelling & idempotency", "Protobuf & streaming in gRPC", "Over/under-fetching and GraphQL N+1"] },
  { section: "Networking", title: "Real-time: polling, long polling, WebSockets, SSE", points: ["When to use each", "Connection fan-out & sticky sessions", "Heartbeats & reconnection"] },
  { section: "Building blocks", title: "Load balancers", points: ["L4 vs L7", "Round robin, least connections, consistent hashing", "Health checks", "Avoiding the LB as a single point of failure"] },
  { section: "Building blocks", title: "Reverse proxy & API gateway", points: ["TLS termination, routing, auth, throttling", "BFF pattern", "Service mesh basics (sidecar)"] },
  { section: "Building blocks", title: "Caching strategies", points: ["Cache-aside, read-through, write-through, write-back", "Eviction: LRU, LFU, TTL", "Cache stampede & thundering herd", "Hot keys"] },
  { section: "Building blocks", title: "Distributed cache: Redis & Memcached", points: ["Data structures in Redis", "Persistence (RDB/AOF)", "Redis Cluster & replication"] },
  { section: "Building blocks", title: "Consistent hashing", points: ["Hash ring & virtual nodes", "Minimizing reshuffling on node changes", "Used in Dynamo, Cassandra, caches"] },
  { section: "Data", title: "SQL vs NoSQL: choosing a database", points: ["Relational, document, key-value, wide-column, graph", "Access patterns drive the choice", "ACID vs BASE"] },
  { section: "Data", title: "Database indexing", points: ["B-tree vs LSM-tree", "Clustered vs secondary indexes", "Covering & composite indexes", "Write amplification"] },
  { section: "Data", title: "Replication", points: ["Leader-follower, multi-leader, leaderless", "Sync vs async replication", "Replication lag & read-your-writes"] },
  { section: "Data", title: "Sharding / partitioning", points: ["Range, hash, directory-based sharding", "Choosing a shard key", "Hot partitions & resharding", "Cross-shard queries"] },
  { section: "Data", title: "Transactions & isolation levels", points: ["Read uncommitted → serializable", "Dirty read, non-repeatable read, phantom", "MVCC", "Optimistic vs pessimistic locking"] },
  { section: "Data", title: "Distributed transactions: 2PC & Saga", points: ["Two-phase commit and its blocking problem", "Saga: choreography vs orchestration", "Compensating actions", "Outbox pattern"] },
  { section: "Data", title: "Blob / object storage", points: ["S3-style storage model", "Pre-signed URLs", "Multipart upload", "Metadata DB + blob store split"] },
  { section: "Data", title: "Search: inverted index & Elasticsearch", points: ["Tokenization & inverted index", "Relevance (TF-IDF / BM25)", "Keeping search in sync with the primary DB"] },
  { section: "Async", title: "Message queues", points: ["Point-to-point vs pub/sub", "At-most / at-least / exactly-once delivery", "Dead letter queues", "Backpressure"] },
  { section: "Async", title: "Kafka deep dive", points: ["Topics, partitions, offsets", "Consumer groups & rebalancing", "Ordering guarantees per partition", "Retention & compaction"] },
  { section: "Async", title: "Event-driven architecture & CQRS", points: ["Event sourcing", "Command/query separation", "Eventual consistency in read models"] },
  { section: "Async", title: "Batch vs stream processing", points: ["MapReduce idea", "Spark vs Flink", "Windowing & late events", "Lambda vs Kappa architecture"] },
  { section: "Reliability", title: "Rate limiting algorithms", points: ["Token bucket, leaky bucket", "Fixed window vs sliding window log/counter", "Distributed rate limiting with Redis"] },
  { section: "Reliability", title: "Idempotency & retries", points: ["Idempotency keys", "Exponential backoff with jitter", "Retry storms"] },
  { section: "Reliability", title: "Circuit breaker, bulkhead & timeouts", points: ["Closed / open / half-open states", "Isolating failures", "Graceful degradation"] },
  { section: "Reliability", title: "Leader election & consensus (Raft, Paxos)", points: ["Why consensus is needed", "Raft: terms, log replication", "ZooKeeper / etcd usage"] },
  { section: "Reliability", title: "Distributed IDs & clocks", points: ["UUID vs Snowflake IDs", "Clock skew", "Lamport & vector clocks"] },
  { section: "Reliability", title: "Monitoring, logging & tracing", points: ["Metrics, logs, traces", "Distributed tracing (span/trace IDs)", "Alerting on SLOs"] },
  { section: "Architecture", title: "Monolith vs microservices", points: ["When to split", "Service boundaries (DDD)", "Data ownership per service", "Distributed monolith anti-pattern"] },
  { section: "Architecture", title: "Authentication & authorization at scale", points: ["Sessions vs JWT", "OAuth 2.0 / OIDC flows", "RBAC vs ABAC"] },
  { section: "Architecture", title: "Bloom filters, HyperLogLog & probabilistic structures", points: ["False positives only", "Cardinality estimation", "Count-min sketch for heavy hitters"] },
  { section: "Architecture", title: "Geospatial indexing", points: ["Geohash", "Quadtree", "S2 / H3 cells", "Proximity queries"] },
  { section: "Case study", title: "Design a URL shortener (TinyURL)", points: ["Base62 encoding vs hash + collision handling", "Key generation service", "Read-heavy caching", "Analytics"] },
  { section: "Case study", title: "Design a rate limiter", points: ["Where to place it", "Per user / IP / API key rules", "Redis + Lua for atomicity"] },
  { section: "Case study", title: "Design a key-value store (Dynamo)", points: ["Partitioning & replication", "Quorum, hinted handoff", "Vector clocks & conflict resolution", "Gossip & anti-entropy (Merkle trees)"] },
  { section: "Case study", title: "Design a unique ID generator", points: ["Snowflake bit layout", "Multi-datacenter IDs", "Sortable IDs"] },
  { section: "Case study", title: "Design a notification system", points: ["Push, SMS, email providers", "Templates & user preferences", "Queue per channel, retries, dedup"] },
  { section: "Case study", title: "Design a news feed (Facebook / Twitter)", points: ["Fan-out on write vs read", "Celebrity problem (hybrid)", "Feed ranking & caching"] },
  { section: "Case study", title: "Design a chat system (WhatsApp)", points: ["WebSocket gateways & presence", "Message ordering & delivery receipts", "Group chat fan-out", "Offline storage"] },
  { section: "Case study", title: "Design search autocomplete", points: ["Trie with top-k at each node", "Offline aggregation of queries", "Caching prefixes"] },
  { section: "Case study", title: "Design YouTube / Netflix", points: ["Upload → transcode pipeline", "Adaptive bitrate streaming", "CDN strategy", "Metadata vs blob storage"] },
  { section: "Case study", title: "Design Google Drive / Dropbox", points: ["Chunking & dedup", "Sync conflicts", "Metadata DB", "Notification of changes"] },
  { section: "Case study", title: "Design a web crawler", points: ["URL frontier & politeness", "Dedup (URL + content fingerprint)", "Robots.txt", "Distributed crawling"] },
  { section: "Case study", title: "Design Uber / ride sharing", points: ["Location updates at scale", "Geospatial matching", "Trip state machine", "Surge pricing"] },
  { section: "Case study", title: "Design a payment system", points: ["Idempotent payments", "Double-entry ledger", "Reconciliation", "PSP integration & webhooks"] },
  { section: "Case study", title: "Design an e-commerce checkout (Amazon)", points: ["Cart service", "Inventory reservation & overselling", "Order saga", "Flash sale handling"] },
  { section: "Case study", title: "Design a distributed message queue", points: ["Partitioned log storage", "Replication & ISR", "Consumer offsets", "Delivery semantics"] },
  { section: "Case study", title: "Design a hotel / ticket booking system (BookMyShow)", points: ["Seat locking with TTL", "Concurrency & double booking", "Payment timeout handling"] },
  { section: "Case study", title: "Design a metrics & monitoring system", points: ["Time-series storage", "Downsampling & retention", "Alerting pipeline", "Push vs pull collection"] },
  { section: "Case study", title: "Design Google Docs (collaborative editing)", points: ["Operational transform vs CRDT", "Cursor presence", "Versioning & snapshots"] },
  { section: "Case study", title: "Design a leaderboard / top-K system", points: ["Redis sorted sets", "Approximate top-K with count-min sketch", "Real-time vs batch"] },
  { section: "Case study", title: "Design a distributed job scheduler", points: ["Cron at scale", "Leases & exactly-once execution", "Retries & DAG dependencies"] },
  { section: "Case study", title: "Design Instagram", points: ["Photo upload & storage", "Feed generation", "Follow graph", "Stories with TTL"] },
];

const SQL_TRACK: Omit<Topic, "id">[] = [
  { section: "Basics", title: "SELECT, WHERE & logical operators", points: ["Column selection & aliases", "AND / OR / NOT precedence", "IN, BETWEEN, LIKE", "NULL handling with IS NULL"], practice: [dl("tesla-unfinished-parts", "Unfinished Parts", "Tesla"), lesson("sql-and-or-not", "AND, OR & NOT")] },
  { section: "Basics", title: "DISTINCT, ORDER BY & LIMIT", points: ["Removing duplicates", "Multi-column sorting", "LIMIT / OFFSET pagination and why OFFSET gets slow"], practice: [dl("teams-power-users", "Teams Power Users", "Microsoft"), lesson("sql-distinct", "DISTINCT")] },
  { section: "Basics", title: "String functions", points: ["CONCAT, SUBSTRING, LENGTH / CHAR_LENGTH", "UPPER / LOWER, TRIM", "REGEXP in MySQL"], practice: [lesson("sql-string-text", "String functions"), lc("fix-names-in-a-table", "Fix Names in a Table")] },
  { section: "Basics", title: "Date & time functions", points: ["DATE, DATEDIFF, DATE_ADD / DATE_SUB", "DATE_FORMAT", "Comparing dates across rows"], practice: [dl("sql-avg-review-ratings", "Average Review Ratings", "Amazon"), dl("sql-average-post-hiatus-1", "Average Post Hiatus", "Facebook")] },
  { section: "Joins", title: "INNER JOIN", points: ["Join conditions vs WHERE filters", "Joining more than two tables", "Table aliases"], practice: [dl("second-day-confirmation", "Second Day Confirmation", "TikTok"), dl("international-call-percentage", "International Call Percentage", "Verizon")] },
  { section: "Joins", title: "LEFT / RIGHT JOIN & anti-joins", points: ["Keeping unmatched rows", "Finding missing rows with LEFT JOIN … IS NULL", "FULL OUTER JOIN emulation in MySQL (UNION)"], practice: [dl("sql-page-with-no-likes", "Page With No Likes", "Facebook"), dl("sql-ibm-db2-product-analytics", "IBM db2 Product Analytics", "IBM")] },
  { section: "Joins", title: "SELF JOIN", points: ["Comparing rows in the same table", "Manager / employee hierarchies", "Consecutive-row comparisons"], practice: [dl("sql-well-paid-employees", "Well Paid Employees", "FAANG"), dl("repeated-payments", "Repeated Payments", "Stripe")] },
  { section: "Joins", title: "CROSS JOIN", points: ["Cartesian products", "Generating all combinations", "Combining with LEFT JOIN to fill gaps"], practice: [lesson("sql-joins-inner-outer-left-right", "SQL joins"), lc("students-and-examinations", "Students and Examinations")] },
  { section: "Aggregation", title: "GROUP BY & aggregate functions", points: ["COUNT(*) vs COUNT(col)", "SUM, AVG, MIN, MAX", "Grouping by multiple columns"], practice: [dl("sql-histogram-tweets", "Histogram of Tweets", "Twitter"), dl("cards-issued-difference", "Cards Issued Difference", "JPMorgan")] },
  { section: "Aggregation", title: "HAVING vs WHERE", points: ["Filtering before vs after grouping", "Aggregate conditions", "Execution order of a SQL query"], practice: [dl("matching-skills", "Data Science Skills", "LinkedIn"), dl("frequent-callers", "Patient Support Analysis", "UnitedHealth"), lesson("query-order-of-execution", "Query order of execution")] },
  { section: "Aggregation", title: "Conditional aggregation with CASE", points: ["CASE WHEN inside SUM / COUNT", "Pivoting rows to columns", "IF() in MySQL"], practice: [dl("laptop-mobile-viewership", "Laptop vs. Mobile Viewership", "New York Times"), dl("final-account-balance", "Final Account Balance", "PayPal"), dl("time-spent-snaps", "Sending vs. Opening Snaps", "Snapchat")] },
  { section: "Aggregation", title: "Ratios & percentages", points: ["AVG of a boolean expression", "ROUND and integer division traps", "IFNULL / COALESCE for missing data"], practice: [dl("click-through-rate", "App Click-through Rate", "Facebook"), dl("signup-confirmation-rate", "Signup Activation Rate", "TikTok"), dl("uncategorized-calls-percentage", "Uncategorized Calls", "UnitedHealth")] },
  { section: "Aggregation", title: "Weighted averages & range joins", points: ["Joining on date ranges", "SUM(a*b)/SUM(b)", "Handling products with no sales"], practice: [dl("alibaba-compressed-mean", "Compressed Mean", "Alibaba"), dl("prime-warehouse-storage", "Maximize Prime Item Inventory", "Amazon")] },
  { section: "Subqueries", title: "Subqueries in WHERE & FROM", points: ["Scalar vs row vs table subqueries", "Derived tables", "IN vs EXISTS"], practice: [dl("alibaba-compressed-mode", "Compressed Mode", "Alibaba"), lesson("sql-cte-subquery", "CTEs vs subqueries")] },
  { section: "Subqueries", title: "Correlated subqueries", points: ["Per-row subquery evaluation", "Performance implications", "Rewriting as joins"], practice: [dl("user-retention", "Active User Retention", "Facebook"), dl("reactivated-users", "Reactivated Users", "Facebook")] },
  { section: "Subqueries", title: "Nth highest value problems", points: ["LIMIT with OFFSET", "Returning NULL when absent", "DISTINCT on ties"], practice: [dl("sql-second-highest-salary", "Second Highest Salary", "FAANG")] },
  { section: "Subqueries", title: "Relational division", points: ["\"Bought all products\" pattern", "COUNT(DISTINCT) = total count", "NOT EXISTS double negation"], practice: [dl("supercloud-customer", "Supercloud Customer", "Microsoft")] },
  { section: "Set ops", title: "UNION, UNION ALL & combining results", points: ["UNION vs UNION ALL cost", "Column alignment", "Combining rankings from two queries"], practice: [dl("spotify-streaming-history", "Spotify Streaming History", "Spotify"), lesson("sql-union-intercept-except", "UNION, INTERSECT & EXCEPT")] },
  { section: "Window functions", title: "ROW_NUMBER, RANK & DENSE_RANK", points: ["OVER (PARTITION BY … ORDER BY …)", "Ties behaviour of each", "Top-N per group"], practice: [dl("sql-top-three-salaries", "Top Three Salaries", "FAANG"), dl("sql-third-transaction", "User's Third Transaction", "Uber"), dl("odd-even-measurements", "Odd and Even Measurements", "Google")] },
  { section: "Window functions", title: "LAG & LEAD", points: ["Comparing with previous / next row", "Consecutive streaks", "Gaps-and-islands intro"], practice: [dl("yoy-growth-rate", "Y-on-Y Growth Rate", "Wayfair"), lesson("sql-time-series-window-function-lead-lag", "LEAD & LAG")] },
  { section: "Window functions", title: "Running totals & moving averages", points: ["SUM() OVER with ORDER BY", "ROWS BETWEEN frames", "RANGE vs ROWS"], practice: [dl("rolling-average-tweets", "Tweets' Rolling Averages", "Twitter"), dl("fill-missing-product", "Fill Missing Client Data", "Accenture")] },
  { section: "Window functions", title: "Latest value per group", points: ["Window vs subquery approach", "Default values for missing groups", "MAX(date) join pattern"], practice: [dl("histogram-users-purchases", "Histogram of Users and Purchases", "Walmart"), dl("card-launch-success", "Card Launch Success", "JPMorgan"), dl("sql-bloomberg-stock-min-max-1", "FAANG Stock Min-Max", "Bloomberg")] },
  { section: "Advanced queries", title: "CTEs & recursive CTEs", points: ["WITH clause readability", "Recursive hierarchy traversal", "Generating number/date series"], practice: [dl("median-search-freq", "Median Google Search Frequency", "Google"), lesson("sql-cte-subquery", "CTEs vs subqueries")] },
  { section: "Advanced queries", title: "Data modification: INSERT, UPDATE, DELETE", points: ["UPDATE with JOIN", "DELETE duplicates keeping one row", "INSERT … ON DUPLICATE KEY UPDATE"], practice: [dl("sql-swapped-food-delivery", "Swapped Food Delivery", "Zomato"), lc("delete-duplicate-emails", "Delete Duplicate Emails")] },
  { section: "Advanced queries", title: "GROUP_CONCAT & string aggregation", points: ["Ordered, distinct concatenation", "Separator option", "group_concat_max_len"], practice: [lc("group-sold-products-by-the-date", "Group Sold Products By The Date"), lc("list-the-products-ordered-in-a-period", "List the Products Ordered in a Period")] },
  { section: "Advanced queries", title: "Pattern matching & conditions", points: ["LIKE vs REGEXP", "Triangle-style CASE logic", "Searching inside lists of codes"], practice: [lesson("sql-like-wildcard-pattern", "LIKE & wildcards"), lc("patients-with-a-condition", "Patients With a Condition")] },
  { section: "Design", title: "Normalization (1NF → BCNF)", points: ["Functional dependencies", "Update / insert / delete anomalies", "When to denormalize"] },
  { section: "Design", title: "Keys & constraints", points: ["Primary, foreign, unique, composite keys", "ON DELETE CASCADE vs RESTRICT", "CHECK constraints in MySQL 8"] },
  { section: "Design", title: "Data types & schema design in MySQL", points: ["INT vs BIGINT, DECIMAL vs FLOAT", "VARCHAR vs TEXT", "DATETIME vs TIMESTAMP", "Modelling one-to-many and many-to-many"] },
  { section: "Internals", title: "InnoDB storage engine", points: ["Clustered index on primary key", "Buffer pool", "Redo & undo logs", "InnoDB vs MyISAM"] },
  { section: "Internals", title: "Indexes in MySQL", points: ["B+ tree structure", "Composite index & leftmost prefix rule", "Covering indexes", "When indexes are not used"] },
  { section: "Internals", title: "EXPLAIN & query optimization", points: ["type, key, rows, Extra columns", "Using filesort / temporary", "Rewriting slow queries"] },
  { section: "Internals", title: "Transactions & ACID in MySQL", points: ["BEGIN / COMMIT / ROLLBACK", "Autocommit", "Savepoints"] },
  { section: "Internals", title: "Isolation levels & MVCC in InnoDB", points: ["REPEATABLE READ default", "Consistent reads via undo log", "Phantom reads & next-key locks"] },
  { section: "Internals", title: "Locking & deadlocks", points: ["Row vs table locks", "Shared vs exclusive, gap locks", "SELECT … FOR UPDATE", "Detecting & avoiding deadlocks"] },
  { section: "Internals", title: "Replication & high availability in MySQL", points: ["Binlog formats", "Async vs semi-sync replication", "Read replicas & lag", "Group replication basics"] },
  { section: "Internals", title: "Partitioning & sharding MySQL", points: ["RANGE / LIST / HASH partitions", "Partition pruning", "Application-level sharding"] },
  { section: "Programmability", title: "Views, stored procedures & triggers", points: ["When views help", "Procedures vs application code", "Trigger pitfalls"] },
  { section: "Interview", title: "Top SQL interview questions round-up", points: ["Nth highest salary variants", "Duplicates detection", "Employees earning more than managers", "Department-wise max salary"], practice: [{ title: "All DataLemur SQL questions", url: "https://datalemur.com/questions?category=SQL" }] },
];

// Textbook DBMS theory (Korth / Navathe), the "fundamentals" round of interviews and GATE-style questions.
const DBMS_TRACK: Omit<Topic, "id">[] = [
  { section: "Basics", title: "What a DBMS is & why not plain files", points: ["Redundancy, inconsistency & isolation problems of file systems", "Integrity, atomicity & concurrent access", "DBMS vs RDBMS", "Disadvantages: cost, complexity, overhead"] },
  { section: "Basics", title: "Three-schema architecture & data independence", points: ["External, conceptual & internal levels", "Logical vs physical data independence", "Schema vs instance", "Mappings between levels"] },
  { section: "Basics", title: "DBMS architecture & languages", points: ["1-tier, 2-tier & 3-tier architecture", "DDL, DML, DCL & TCL with examples", "Query processor vs storage manager", "Role of the DBA"] },
  { section: "Basics", title: "Data models", points: ["Hierarchical & network models", "Relational model", "Object-oriented & object-relational", "Where NoSQL models fit"] },
  { section: "ER model", title: "Entities, attributes & relationships", points: ["Entity, entity set, relationship set", "Strong vs weak entities & identifying relationships", "Simple / composite, single / multi-valued, derived attributes", "Degree of a relationship (unary, binary, ternary)"] },
  { section: "ER model", title: "Cardinality & participation constraints", points: ["1:1, 1:N, M:N mapping", "Total vs partial participation", "(min, max) notation", "Reading constraints off an ER diagram"] },
  { section: "ER model", title: "Extended ER: generalization, specialization & aggregation", points: ["Top-down specialization vs bottom-up generalization", "Disjoint vs overlapping, total vs partial", "Attribute inheritance", "Aggregation: relationships between relationships"] },
  { section: "ER model", title: "Converting an ER diagram to tables", points: ["M:N becomes a junction table", "Where the foreign key goes for 1:1 and 1:N", "Multi-valued attributes and weak entities", "Minimum number of tables questions"] },
  { section: "Relational model", title: "Relational model concepts", points: ["Relation, tuple, attribute, domain", "Degree vs cardinality", "Properties of a relation (no duplicate tuples, unordered)", "NULL semantics"] },
  { section: "Relational model", title: "Keys", points: ["Super key, candidate key, primary key, alternate key", "Foreign, composite & surrogate keys", "Primary key vs unique key", "Counting super keys from candidate keys"] },
  { section: "Relational model", title: "Integrity constraints", points: ["Domain constraints", "Entity integrity (no NULL primary key)", "Referential integrity & ON DELETE / ON UPDATE actions", "Key & CHECK constraints"] },
  { section: "Relational model", title: "Relational algebra", points: ["Selection σ, projection π, rename ρ", "Union, set difference, cartesian product", "Natural, theta, equi & outer joins", "Division for \"for all\" queries"] },
  { section: "Relational model", title: "Relational calculus", points: ["Tuple vs domain relational calculus", "Safe vs unsafe expressions", "Relational completeness", "Mapping algebra ↔ calculus ↔ SQL"] },
  { section: "Normalization", title: "Functional dependencies & Armstrong's axioms", points: ["Trivial vs non-trivial FDs", "Reflexivity, augmentation, transitivity", "Union, decomposition & pseudo-transitivity rules", "FDs as business rules"] },
  { section: "Normalization", title: "Attribute closure & canonical cover", points: ["Computing X⁺", "Finding all candidate keys", "Minimal (canonical) cover", "Equivalence of two FD sets"] },
  { section: "Normalization", title: "Anomalies, 1NF & 2NF", points: ["Insertion, update & deletion anomalies", "1NF: atomic values, no repeating groups", "Prime vs non-prime attributes", "2NF: no partial dependency"] },
  { section: "Normalization", title: "3NF & BCNF", points: ["Transitive dependency", "3NF condition (X is a super key or A is prime)", "BCNF: every determinant is a super key", "Why BCNF may lose dependency preservation"] },
  { section: "Normalization", title: "Lossless join & dependency preservation", points: ["Lossless test: common attributes form a key of one side", "Dependency-preserving decomposition", "3NF synthesis vs BCNF decomposition", "Finding the highest normal form of a relation"] },
  { section: "Normalization", title: "4NF, 5NF & denormalization", points: ["Multivalued dependencies & 4NF", "Join dependencies & 5NF", "When and why to denormalize", "Read vs write trade-offs"] },
  { section: "Transactions", title: "Transactions, ACID & transaction states", points: ["Atomicity, consistency, isolation, durability", "Which DBMS component guarantees each", "Active → partially committed → committed / failed → aborted", "Commit & rollback"] },
  { section: "Transactions", title: "Schedules: serial, recoverable & cascadeless", points: ["Serial vs concurrent schedules", "Recoverable schedules", "Cascading rollback & cascadeless schedules", "Strict schedules"] },
  { section: "Transactions", title: "Conflict & view serializability", points: ["Conflicting operations (same item, at least one write)", "Precedence graph & cycle test", "View serializability & blind writes", "Every conflict-serializable schedule is view-serializable"] },
  { section: "Transactions", title: "Concurrency problems & isolation levels", points: ["Dirty read, lost update, unrepeatable read, phantom read", "Read uncommitted → serializable", "Which anomaly each level prevents", "Write skew"] },
  { section: "Concurrency control", title: "Lock-based protocols & two-phase locking", points: ["Shared vs exclusive locks & compatibility matrix", "Growing & shrinking phases", "Basic vs strict vs rigorous 2PL", "Lock upgrade / downgrade"] },
  { section: "Concurrency control", title: "Deadlocks", points: ["Coffman conditions", "Wait-for graph detection", "Wait-die vs wound-wait prevention", "Starvation & timeouts"] },
  { section: "Concurrency control", title: "Timestamp ordering & optimistic concurrency", points: ["Read & write timestamps per item", "Basic timestamp ordering rules", "Thomas write rule", "Validation-based (optimistic) protocol"] },
  { section: "Concurrency control", title: "MVCC & multiple-granularity locking", points: ["Versions & snapshot isolation", "Readers don't block writers", "Intention locks: IS, IX, SIX", "Lock escalation"] },
  { section: "Recovery", title: "Failures & log-based recovery", points: ["Transaction, system & media failures", "Write-ahead logging (WAL)", "Undo vs redo", "Deferred vs immediate update"] },
  { section: "Recovery", title: "Checkpoints, shadow paging & ARIES", points: ["Why checkpoints shorten recovery", "Shadow paging", "ARIES: analysis, redo, undo", "Steal / no-force buffer policies"] },
  { section: "Storage & indexing", title: "Storage & file organization", points: ["Blocks, pages & records", "Heap, sequential & hashed files", "Fixed vs variable length records", "Buffer manager & replacement policies"] },
  { section: "Storage & indexing", title: "Index types", points: ["Primary, clustering & secondary indexes", "Dense vs sparse indexes", "Multilevel indexes", "Clustered vs non-clustered"] },
  { section: "Storage & indexing", title: "B-trees & B+ trees", points: ["Order & node occupancy rules", "Insertion with splits, deletion with merges", "Why databases prefer B+ trees (linked leaves, range scans)", "Height and max-keys calculations"] },
  { section: "Storage & indexing", title: "Hashing", points: ["Static hashing & overflow chains", "Extendible hashing (global / local depth)", "Linear hashing", "Hash index vs B+ tree index"] },
  { section: "Query processing", title: "Query processing & optimization", points: ["Parse → relational algebra → physical plan", "Equivalence rules (push selections down)", "Heuristic vs cost-based optimization", "Selectivity & statistics"] },
  { section: "Query processing", title: "Join algorithms", points: ["Nested loop & block nested loop", "Index nested loop", "Sort-merge join", "Hash join & cost in block transfers"] },
  { section: "Beyond RDBMS", title: "OLTP vs OLAP & data warehousing", points: ["Row vs column storage", "Star vs snowflake schema", "Fact & dimension tables", "ETL vs ELT"] },
  { section: "Beyond RDBMS", title: "Distributed databases", points: ["Horizontal vs vertical fragmentation", "Replication & transparency", "Distributed commit (2PC)", "CAP theorem"] },
  { section: "Beyond RDBMS", title: "NoSQL & BASE", points: ["Key-value, document, column-family, graph", "BASE vs ACID", "Schema-on-read", "Picking SQL vs NoSQL for a use case"] },
  { section: "Interview", title: "DBMS rapid-fire round-up", points: ["DELETE vs TRUNCATE vs DROP", "WHERE vs HAVING, UNION vs UNION ALL", "CHAR vs VARCHAR, clustered vs non-clustered index", "Views vs materialized views, triggers vs procedures"] },
];

// Theory first, then relationships and principles, then patterns and LLD; `levels` drives the role filter on /tracks.
const OOP_TRACK: Omit<Topic, "id">[] = [
  { section: "Foundations", levels: E, title: "What OOP is & why it exists", points: ["Procedural vs object-oriented thinking", "Objects bundle state and behaviour", "Pure vs hybrid OO languages", "Advantages & limitations of OOP"], practice: [gfg("introduction-of-object-oriented-programming", "Introduction to OOP"), tpt("java-oops-concepts", "Java OOPs concepts")] },
  { section: "Foundations", levels: E, title: "Classes, objects & memory", points: ["Class as blueprint, object as instance", "Reference vs object, stack vs heap", "Ways to create an object in Java", "Instance vs class (static) members"], practice: [gfg("java/classes-objects-java", "Classes and objects"), tpt("object-and-class-in-java", "Object and class")] },
  { section: "Foundations", levels: E, title: "Constructors & object lifecycle", points: ["Default, parameterised & copy constructors", "Constructor chaining with this() and super()", "Private constructors", "Garbage collection vs destructors"], practice: [gfg("java/constructors-in-java", "Constructors"), tpt("java-constructor", "Java constructor")] },
  { section: "Foundations", levels: EM, title: "Access modifiers, static & final", points: ["private, default, protected, public", "Static variables, methods & blocks", "final variable, method & class", "this vs super"], practice: [gfg("java/access-modifiers-java", "Access modifiers"), gfg("java/static-keyword-java", "static keyword"), tpt("static-keyword-in-java", "static keyword")] },
  { section: "Four pillars", levels: EM, title: "Encapsulation", points: ["Data hiding with private fields", "Getters / setters and invariants", "Encapsulation vs abstraction", "Tell, don't ask"], practice: [gfg("java/encapsulation-in-java", "Encapsulation"), tpt("encapsulation", "Encapsulation")] },
  { section: "Four pillars", levels: EM, title: "Abstraction: abstract classes & interfaces", points: ["Hiding the how, exposing the what", "Abstract methods & abstract classes", "Interfaces as contracts", "Real-world examples (JDBC, Collections)"], practice: [gfg("java/abstraction-in-java-2", "Abstraction"), tpt("abstract-class-in-java", "Abstract class")] },
  { section: "Four pillars", levels: EM, title: "Inheritance & its types", points: ["IS-A relationship & code reuse", "Single, multilevel, hierarchical, multiple, hybrid", "Diamond problem & why Java bans multiple class inheritance", "Constructor call order"], practice: [gfg("java/inheritance-in-java", "Inheritance"), tpt("inheritance-in-java", "Inheritance")] },
  { section: "Four pillars", levels: EM, title: "Polymorphism: overloading vs overriding", points: ["Compile-time vs runtime polymorphism", "Overloading rules (signature, not return type)", "Overriding rules (access, exceptions, @Override)", "Upcasting & downcasting"], practice: [gfg("java/polymorphism-in-java", "Polymorphism"), gfg("java/method-overloading-in-java", "Overloading"), gfg("java/overriding-in-java", "Overriding"), tpt("runtime-polymorphism-in-java", "Runtime polymorphism")] },
  { section: "Four pillars", levels: M, title: "Dynamic dispatch & binding", points: ["Static vs dynamic binding", "How a vtable resolves a call", "Why static, private & final methods aren't overridden", "Covariant return types & method hiding"], practice: [tpt("method-overriding-in-java", "Method overriding")] },
  { section: "Going deeper", levels: EMS, title: "Abstract class vs interface", points: ["State, constructors & access in each", "Default, static & private interface methods (Java 8/9)", "Multiple inheritance of type", "Choosing one in a design"], practice: [gfg("java/difference-between-abstract-class-and-interface-in-java", "Abstract class vs interface"), tpt("interface-in-java", "Interface")] },
  { section: "Going deeper", levels: M, title: "Object contracts: equals, hashCode & toString", points: ["== vs equals()", "The equals / hashCode contract", "What breaks in a HashMap when it's violated", "Comparable vs Comparator"], practice: [gfg("java/equals-hashcode-methods-java", "equals() and hashCode()")] },
  { section: "Going deeper", levels: MS, title: "Immutability & value objects", points: ["Rules for an immutable class", "Defensive copies", "Why String is immutable", "Value objects vs entities"], practice: [gfg("java/create-immutable-class-java", "Immutable class"), tpt("how-to-create-immutable-class", "Immutable class")] },
  { section: "Going deeper", levels: M, title: "Exceptions in OO design", points: ["Checked vs unchecked", "Custom exception hierarchies", "Exceptions and overriding", "try-with-resources & AutoCloseable"], practice: [gfg("java/exceptions-in-java", "Exceptions"), tpt("exception-handling-in-java", "Exception handling")] },
  { section: "Going deeper", levels: M, title: "Generics & type safety", points: ["Why generics (compile-time safety)", "Bounded types & wildcards (PECS)", "Type erasure", "Generic methods"], practice: [gfg("java/generics-in-java", "Generics")] },
  { section: "Relationships & UML", levels: EM, title: "Association, aggregation & composition", points: ["HAS-A vs IS-A", "Aggregation: independent lifecycle", "Composition: owned lifecycle", "Dependency (uses-a)"], practice: [gfg("java/association-composition-aggregation-java", "Association, composition, aggregation"), tpt("aggregation-in-java", "Aggregation")] },
  { section: "Relationships & UML", levels: MS, title: "Composition over inheritance", points: ["Fragile base class problem", "Delegation", "When inheritance is still right", "Mixing behaviour at runtime"], practice: [gfg("java/favoring-composition-over-inheritance-in-java-with-examples", "Composition over inheritance")] },
  { section: "Relationships & UML", levels: MS, title: "UML class diagrams", points: ["Class box: name, fields, methods, visibility", "Arrows: inheritance, realisation, association, aggregation, composition, dependency", "Multiplicity", "Sketching UML on a whiteboard fast"], practice: [gfg("system-design/unified-modeling-language-uml-class-diagrams", "UML class diagrams")] },
  { section: "Design principles", levels: MS, title: "SOLID: SRP & OCP", points: ["Single responsibility: one reason to change", "Open/closed: extend without modifying", "Spotting violations", "Refactoring a switch into polymorphism"], practice: [gfg("system-design/solid-principle-in-programming-understand-with-real-life-examples", "SOLID principles")] },
  { section: "Design principles", levels: MS, title: "SOLID: LSP, ISP & DIP", points: ["Liskov: subtypes must be substitutable (Square/Rectangle)", "Interface segregation: small, focused interfaces", "Dependency inversion: depend on abstractions", "DIP vs dependency injection"], practice: [gfg("system-design/solid-principle-in-programming-understand-with-real-life-examples", "SOLID principles")] },
  { section: "Design principles", levels: MS, title: "Coupling, cohesion, DRY, KISS & YAGNI", points: ["Low coupling, high cohesion", "Law of Demeter", "DRY vs premature abstraction", "KISS & YAGNI in interviews"], practice: [rg("refactoring/smells", "Code smells")] },
  { section: "Design principles", levels: S, title: "Dependency injection & testability", points: ["Constructor vs setter vs field injection", "IoC containers (Spring)", "Mocks and seams for unit tests", "Service locator anti-pattern"], practice: [gfg("system-design/dependency-injection-di-design-pattern", "Dependency injection")] },
  { section: "Design patterns", levels: MS, title: "Creational: Singleton, Factory & Builder", points: ["Thread-safe singleton (holder, enum, double-checked)", "Simple factory vs factory method vs abstract factory", "Builder for many optional params", "Why singletons hurt testability"], practice: [gfg("system-design/singleton-design-pattern", "Singleton"), gfg("system-design/factory-method-for-designing-pattern", "Factory method"), gfg("system-design/builder-design-pattern", "Builder"), rg("design-patterns/singleton", "Singleton")] },
  { section: "Design patterns", levels: MS, title: "Structural: Adapter, Decorator, Facade & Proxy", points: ["Adapter: convert one interface to another", "Decorator: add behaviour by wrapping (Java I/O)", "Facade: one simple entry point", "Proxy: control access (lazy, remote, caching)"], practice: [gfg("system-design/adapter-pattern", "Adapter"), gfg("system-design/decorator-pattern", "Decorator"), rg("design-patterns/decorator", "Decorator")] },
  { section: "Design patterns", levels: MS, title: "Behavioural: Strategy, Observer, State & Command", points: ["Strategy: swap algorithms at runtime", "Observer: publish / subscribe", "State: behaviour changes with state", "Command: requests as objects (undo)"], practice: [gfg("system-design/strategy-pattern-set-1", "Strategy"), gfg("system-design/observer-pattern-set-1-introduction", "Observer"), gfg("system-design/state-design-pattern", "State"), rg("design-patterns/command", "Command")] },
  { section: "Design patterns", levels: S, title: "Choosing patterns & anti-patterns", points: ["Start from the problem, not the pattern", "Over-engineering signals", "God object, anaemic model, singleton abuse", "Patterns you can see in the JDK"], practice: [gfg("system-design/design-patterns-cheat-sheet-when-to-use-which-design-pattern", "Patterns cheat sheet"), rg("design-patterns/catalog", "Pattern catalog"), tpt("design-patterns-in-java", "Design patterns in Java")] },
  { section: "Low-level design", levels: MS, title: "How to approach an LLD interview", points: ["Clarify requirements & scope", "Find nouns (classes) and verbs (methods)", "Class diagram → key flows → code", "Extensibility & edge cases"], practice: [gfg("system-design/what-is-low-level-design-or-lld-learn-system-design", "What is LLD"), LLD_REPO] },
  { section: "Low-level design", levels: EMS, title: "LLD: Parking lot", points: ["Spots, vehicles, levels, tickets", "Spot allocation strategy", "Pricing strategy", "Concurrency at the entry gate"], practice: [gfg("system-design/design-parking-lot-using-object-oriented-principles", "Parking lot"), LLD_REPO] },
  { section: "Low-level design", levels: MS, title: "LLD: Elevator system", points: ["Elevator, request, controller, display", "Elevator states (State pattern)", "Scheduling (SCAN / LOOK)", "Multiple elevators dispatch"], practice: [LLD_REPO] },
  { section: "Low-level design", levels: MS, title: "LLD: Movie ticket booking (BookMyShow)", points: ["Movie, show, screen, seat, booking", "Seat locking with timeouts", "Payment & booking states", "Avoiding double booking"], practice: [gfg("system-design/design-bookmyshow-a-system-design-interview-question", "BookMyShow"), LLD_REPO] },
  { section: "Low-level design", levels: MS, title: "LLD: Splitwise (expense sharing)", points: ["User, group, expense, split", "Equal, exact & percent splits (Strategy)", "Balance sheet", "Simplifying debts"], practice: [LLD_REPO] },
  { section: "Low-level design", levels: S, title: "LLD: LRU cache & rate limiter", points: ["HashMap + doubly linked list", "Generic, thread-safe cache", "Token bucket vs sliding window", "Pluggable eviction / limiting strategies"], practice: [lc("lru-cache", "LRU Cache"), LLD_REPO] },
  { section: "Low-level design", levels: MS, title: "Machine coding round", points: ["90 minutes, working code", "Package structure & layering", "In-memory repositories", "What evaluators score"], practice: [gfg("system-design/design-snake-game", "Snake game"), gfg("system-design/design-a-chess-game", "Chess game"), LLD_REPO] },
  { section: "Senior depth", levels: S, title: "Concurrency in OO design", points: ["Thread-safe classes & shared mutable state", "synchronized, locks, atomics", "Immutability & confinement", "Deadlock in object graphs"], practice: [gfg("java/multithreading-in-java", "Multithreading"), gfg("java/deadlock-in-java-multithreading", "Deadlock"), tpt("multithreading-in-java", "Multithreading")] },
  { section: "Senior depth", levels: S, title: "Code review & refactoring smells", points: ["Long method, large class, feature envy", "Switch on type, primitive obsession", "Refactor step by step under tests", "Explaining trade-offs in review"], practice: [rg("refactoring/smells", "Code smells")] },
  { section: "Senior depth", levels: S, title: "Designing for extensibility", points: ["Plugin points & extension interfaces", "Events vs direct calls", "Versioning public APIs", "When OOP isn't the right tool"] },
  { section: "Interview", levels: EM, title: "OOP rapid-fire round-up", points: ["Class vs struct, object vs instance", "Can we override static / private methods?", "Can a constructor be final / static?", "Shallow vs deep copy"], practice: [gfg("oops-interview-questions", "OOPs interview questions"), tpt("oops-interview-questions", "OOPs interview questions"), tpt("corejava-interview-questions", "Core Java interview questions")] },
];

// Seed for the tracks collection. At runtime tracks come from the database (src/lib/catalog.ts).
export const SEED_TRACKS: { key: string; name: string; description: string; topics: Topic[] }[] = [
  { key: "sd", name: "System Design", description: "Fundamentals, building blocks, then classic case studies.", topics: SYSTEM_DESIGN.map((t, i) => ({ ...t, id: i + 1 })) },
  { key: "sql", name: "MySQL", description: "Queries with DataLemur interview practice, then schema design and InnoDB internals.", topics: SQL_TRACK.map((t, i) => ({ ...t, id: i + 1 })) },
  { key: "dbms", name: "DBMS", description: "Core DBMS theory: ER model, normalization, transactions, concurrency, recovery and indexing.", topics: DBMS_TRACK.map((t, i) => ({ ...t, id: i + 1 })) },
  { key: "oop", name: "OOP & LLD", description: "OOP theory, SOLID and design patterns, then low-level design problems — tagged by the role level they're asked at.", topics: OOP_TRACK.map((t, i) => ({ ...t, id: i + 1 })) },
];
