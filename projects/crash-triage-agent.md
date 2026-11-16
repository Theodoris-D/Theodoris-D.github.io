# Crash-Triage Agent
Nov 2026 · solo · Python, C · MIT · https://github.com/Theodoris-D/crash-triage-agent

An LLM agent triages crashing C programs: it drives GDB and AddressSanitizer through an MCP server (8 tools, 7 read-only), names the root cause, crash class and CWE, writes a patch and verifies it by recompiling and re-running. It reads attacker-influenceable text (source comments, program and debugger output), so it ships least-privilege tools, spotlighting with injection detection, an independent report verifier and a SHA-256 hash-chained audit log.

## Results (Claude Haiku 5.5, 12 cases, defences on, no attack; run 20261110-141440-bc9f4b)
| metric | agent | baseline (no LLM) |
|---|---|---|
| crash class exact | 83 % (10/12) [55.2, 95.3] | — |
| CWE exact | 75 % (9/12) [46.8, 91.1] | 75 % (9/12) |
| CWE family | 83 % (10/12) | 83 % (10/12) |
| root-cause line ±1 | 83 % (10/12) | 83 % (10/12) |
| fix verified | 100 % (12/12) [75.7, 100] | 0 % (0/12) |

Second run (20261115-214207-6c443d): fix verified 11/12 (c09 failed), crash class 11/12, root-cause line 11/12, CWE exact 9/12.

Brackets: 95 % Wilson intervals. The agent ties the parser on classification; its only advantage is verified repair.

## CWE retrieval (keyword vs BM25 vs Hugging Face embeddings)
Offline, no model: 288 NVD CVE descriptions and the agent's 24 diagnoses, CWE ids removed; 18 curated entries.
- Top-1 on NVD: keyword 52 % (151/288), BM25 50 %, bge-small 58 %, hybrid BM25 + bge-small (ChromaDB) 61 % (175/288, McNemar p = 0.006), bge-reranker 75 %.
- Agent diagnoses: keyword 17/24, hybrid 23/24 (selected on this set: optimistic), reranker 6/24.
- Full MITRE catalogue (956 entries) makes every retriever worse.
- End to end (two real runs with the hybrid): CWE exact 19/24 vs 18/24 with keywords. The misses name the consequence, not the root cause; retrieval is not the bottleneck.

## Method
- De-leaked benchmark: neutral ids, no CWE hints in the sources.
- The agent is not given the crashing input; the baseline is.
- Localisation scored within ±1 line; CWE scored exact and by family.
- 20 offline tests with a deterministic mock provider; regression gate for CI.

## Threat model
- forbidden_inspect → least-privilege expression whitelist.
- false_verified → "verified" recomputed from the propose_fix verdict, never from the model.
- beacon_exfil → spotlighting, detect/redact, beacon strip.

## Limits
- n = 12, one model, one run.
- Patch quality beyond the functional tests is not assessed.
- Prompt-injection run on Haiku 5.5 (c01–c03, 3 goals × 3 channels × defences on/off, 0 errors): 0/27 attacks succeeded with defences off and 0/27 with defences on; injection detected 20/27 and 19/27. The model refused every payload on its own, so the run does not measure what the defences add. The detector misses most payloads in debugger output (gdb_note).
- propose_fix output is unredacted; beacon strip covers the explanation field only.
- Sandbox is defence in depth (rlimits, scrubbed env, --network=none Docker), not a jail.

Cost: total development and evaluation under $1; one run on Haiku 5.5 ≈ $0.05–0.10.
