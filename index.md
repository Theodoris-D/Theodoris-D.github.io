# Theodoris Donval
Engineering student at EURECOM, on exchange at TUM.

- Status: open to a 24-week full-time internship (Pflichtpraktikum) from March 2027, Munich, in English, in any team or topic.
- Now: exchange semester in Informatics (Master's courses), TUM, Oct 2026 – Mar 2027.
- Degree: Diplôme d'Ingénieur (Master's in Computer Science), EURECOM, 2024 – 2027.

## Work

### Crash-Triage Agent (Nov 2026, solo) — [case study](projects/crash-triage-agent.md)
LLM agent driving GDB and AddressSanitizer through an 8-tool MCP server: root cause, CWE, patch, verification by recompiling and re-running.
- Result: 23/24 patches stop the crash and pass functional tests over two runs (12/12, then 11/12; 12-case C benchmark, Claude Haiku 5.5); non-LLM baseline: 0/12.
- Prompt injection on the real model: 0/27 attacks succeeded with defences off and on (cases c01–c03); the payloads are too easy for this model, so the defences' effect is not measured.
- Limits: CWE naming 9/12, only ties a sanitizer parser; patch quality beyond the tests not assessed; defences' effect not measurable with current payloads.
- Code: https://github.com/Theodoris-D/crash-triage-agent

### QEMU snapshot restore (Spring 2026, EURECOM, with Frédéric Kah) — [case study](projects/qemu-snapshot-restore.md)
Host-driven harness benchmarking five QEMU snapshot-restore strategies for snapshot-based fuzzing.
- Copy-on-write restore ≈ 50 ms at any guest size vs 3.7 – 23.9 s for plain loadvm; up to 27 iter/s.
- Hotreload from host RAM overtakes copy-on-write above ≈ 100 MB of dirty memory (server).
- Limits: synthetic write pattern; thresholds shift 3× between machines.

### Verifiable secure aggregation for federated learning (Fall 2025, EURECOM) — [case study](projects/verifiable-aggregation.md)
With Prof. Melek Önen and Prof. Antonio Faonio. An untrusted server sums encrypted vectors; anyone can verify the sum. PUDA (CANS 2015) extended to vectors, with OPRF key binding. Rust, Arkworks, BLS12-381. Used in a paper under submission.
- 100 users × 100 dims: verify 0.9 s, aggregate 0.7 s, 0.19 s per user to encrypt (24 configurations).
- Limits: OPRF key binding is a prototype (simulated ZK proof); sums bounded by a 2^16 discrete-log table.
- Code: https://github.com/Theodoris-D/puda-verifiable-aggregation

### Bitcoin transaction graph (Jun – Jul 2025, Inria) — [case study](projects/bitcoin-graph.md)
Validated a Numba-parallelised extraction routine (500,000+ runs, five graph families, 0 divergences). Subgraph around illicit addresses: 31.5 M → 816 k nodes after hub filtering. Spectral clustering fails (one cluster holds 99.75 %), which led the team towards graph neural networks.

## Education
Course lists with programmes: [TUM](education/tum.md) · [EURECOM](education/eurecom.md) · [CPGE MP2I/MPI](education/cpge.md)

- TUM, Oct 2026 – Mar 2027: Network Security, Deep Learning, AI Testing, Decentralized Information Systems Lab, EU AI Act Seminar.
- EURECOM, 2024 – 2027: system and network security, secure communications, MPC and blockchains, ML, statistical inference, information theory.
- CPGE MP2I/MPI, Lycée Clemenceau, Nantes, 2022 – 2024.

## Skills
- Code: Python, Rust, C, OCaml, SQL (basics)
- AI: agents (MCP, tool calling), LLM evaluation, prompt-injection defences
- ML & data: PyTorch, scikit-learn, NumPy, Pandas, Numba, NetworkX
- Systems & security: Linux, Git, GDB, AddressSanitizer, pairing-based cryptography
- Languages: French (native), English (bilingual, TOEIC 990/990), Greek (spoken), German (A1)

## Contact
CV (PDF): https://theodoris-d.github.io/cv.pdf

theodorisdonval@gmail.com · https://www.linkedin.com/in/theodoris-donval · https://github.com/Theodoris-D
