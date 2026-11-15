# Verifiable secure aggregation (PUDA over vectors)
Fall 2025 · EURECOM research project · with Prof. Melek Önen and Prof. Antonio Faonio · Rust, Arkworks, BLS12-381 · https://github.com/Theodoris-D/puda-verifiable-aggregation

An untrusted aggregator sums users' encrypted vectors without seeing any of them; anyone with the public verification key can check the sum with a pairing equation. Extends PUDA (CANS 2015) from single values to vectors of dimension κ, and adds a key-binding scheme (KBS) based on a 2HashDH OPRF. Used in a paper under submission.

## Protocol
- Setup (trusted dealer, once): ek_i, tk_i = (a, b_i) per user; ska = −Σ ek_i; vk = (P2·a_k, P2·b_i).
- EncTag (user i, round τ): c_ik = P1·x_ik + H(τ‖k)·ek_i; σ_i = H(τ)·b_i + (Σ_k a_k·x_ik)·P1.
- Aggregate: V_k = Σ_i c_ik + H(τ‖k)·ska = P1·Σ_i x_ik; x_k by 2^16-entry discrete-log table; γ = Σ σ_i.
- Verify: e(γ, P2) = Π_k e(P1·x_k, vk_a[k]) · Π_i e(H(τ), vk_b[i]).

## Results
- 24 configurations: 10–100 users × 10–100 dimensions.
- At 100 users × 100 dims: verification 0.88 s, aggregation 0.73 s, setup 0.37 s, 0.19 s per user to encrypt and tag.
- Encryption per user grows about 1.9 ms per dimension, independent of the number of users.
- 6 property tests (correctness, completeness, soundness, KBS success, KBS failure, OPRF agreement), 100 randomised trials each.

## Limits
- KBS is a prototype: the user's ZK proof is simulated.
- Trusted dealer; no user dropouts.
- Sums bounded: users × max value < 65,536 with the 2^16 table (2^26 entries ≈ 3.9 GB is the practical ceiling measured).
- Single-machine timings, some series not monotone.
