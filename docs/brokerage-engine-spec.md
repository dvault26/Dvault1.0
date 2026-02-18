# Brokerage Detection Engine — Specification

Overview
--------
The Brokerage Detection Engine (BDE) identifies whether a blockchain transaction counterpart (typically a sender or receiver address) belongs to a known brokerage, exchange, or custodial service. It is intended to be used by the desktop app to label transactions for improved UX and compliance hints.

Goals
-----
- High-confidence detection for well-known custodial addresses.
- Graceful degradation: return a confidence score and matched evidence.
- Extensible: new exchange entries and heuristics should be addable without code changes.
- Privacy-preserving: detection is performed locally using a curated on-disk database; no telemetry or remote lookups by default.

Design
------
1. Data Model
   - exchanges.json: authoritative local JSON containing a list of known custodian entries.
   - Each entry contains:
     - id: stable short id (e.g., `binance`)
     - name: display name
     - chains: array of chain identifiers this address applies to (e.g., `ethereum`, `bitcoin`)
     - addresses: list of canonical addresses or address patterns (strings). Patterns may include simple wildcards or regex.
     - notes: optional free text.

2. Detection Algorithm (ordered checks)
   - Normalization: canonicalize the input address (case, hex prefix, remove separators).
   - Exact Match: look up exact address match in exchanges.json for the provided chain — confidence 0.99.
   - Prefix / Substring Match: for known address blocks (e.g., custodial deposit prefixes) — confidence 0.85.
   - Regex / Pattern Match: evaluate regex patterns declared in the DB — confidence 0.8.
   - Heuristic Match: heuristics such as clustering, reuse, or off-chain label hints (experimental) — confidence 0.5.
   - No match: return unknown with confidence 0.

3. Response Shape
   - { found: boolean, id?: string, name?: string, confidence: number, evidence?: { type: string, pattern?: string, matchedAddress?: string } }

4. Performance & Storage
   - DB is loaded into memory on app start and cached.
   - Lookups are O(1) for exact match (hash map), O(N) for pattern checks where N is number of pattern entries.

5. Extensibility
   - The `exchanges.json` can be edited by the app (persisted under userData) or shipped with default entries in the app bundle.
   - New detection strategies can be plugged in via module exports.

Security & Privacy
------------------
- All detection is local by default. If future remote lookups are added, they must be opt-in and documented.
- The DB should avoid storing private user addresses.

Integration Points
------------------
- Main process: `brokerage.detect(address, chain?)` returns the detection response.
- Preload: expose `dvault.brokerage.detect(address, chain)` to renderer.
- Renderer: show `BrokerageBadge` using response (name + confidence + matched amount context).

Maintenance
-----------
- Keep a curated curated `known_exchanges.json` checked into repo for offline default.
- Implement an admin UI to add/edit entries (future work).

Appendix: Example response

```
{
  "found": true,
  "id": "binance",
  "name": "Binance",
  "confidence": 0.99,
  "evidence": { "type": "exact", "matchedAddress": "0xabc..." }
}
```
