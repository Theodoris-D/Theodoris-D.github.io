# QEMU snapshot restore
Spring 2026 · EURECOM semester project · with Frédéric Kah · QEMU, KVM, GDB RSP, QEMU Guest Agent, Python · code on EURECOM GitLab (not public)

Snapshot-based fuzzing restores a VM to the same state after every input, so restore latency caps throughput. We built a harness that drives a QEMU guest entirely from the host (GDB stub for breakpoints and memory writes, guest agent for control) and measured five restore strategies on total iteration time (execution + restore), across 512 MB – 4 GB guests and 0 – 60,000 dirty pages.

## Strategies
- upstream: loadvm, copies all RAM, O(RAM).
- upstream + mapped-ram: flat snapshot file, page cache helps after the first restore, O(RAM).
- hotreload-wb: KVM dirty ring, copies back only dirtied pages from SSD, O(dirty).
- hotreload-shm: same from host RAM (/dev/shm), bounded by memory bandwidth.
- cow: kill and relaunch QEMU over a shared golden RAM mapped private; restore ≈ constant, but each first write faults during execution.

## Results (server: Xeon Gold 5515+, 128 GiB; 100 iterations after 20 warm-up)
Restore time at 0 dirty pages (512 MB / 2 GB / 4 GB):
- upstream: 3,735 / 13,573 / 23,900 ms
- upstream + mapped-ram: 1,225 / 3,997 ms / timeout
- hotreload-wb: 339 / 240 / 330 ms
- hotreload-shm: 189 / 237 / 232 ms
- cow: 71 / 54 / 53 ms

cow execution time grows with dirty pages: ≈130 ms at 10k, ≈285 ms at 30k, ≈530 ms at 60k.
Crossover cow → hotreload-shm: 25,000 – 30,000 dirty pages (≈100 – 120 MB) on the server; 8,000 – 10,000 on the laptop (i7-1260P). The threshold depends on absolute dirty MB, not on the dirty fraction of RAM.
Best throughput: 27 iter/s (laptop) and 20 iter/s (server), cow at 0 dirty pages.

## Recommendations
Few dirty pages → cow; many dirty pages or large guests → hotreload-shm; little /dev/shm → hotreload-wb; no custom QEMU → upstream + mapped-ram; never plain upstream.

## Limits
Synthetic sequential write pattern; warm page cache on a lightly loaded host; I/O time computed as a residual (upper bound); two machines only; hotreload keeps a small RAM-dependent cost (≈75 ms from 512 MB to 4 GB) not yet explained.
