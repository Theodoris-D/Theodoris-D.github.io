# Bitcoin transaction graph
Jun – Jul 2025 · research internship · Inria, DIANA project-team, Sophia Antipolis · Python, Numba, NetworkX

Around a set of addresses identified as illicit, I built and validated a pipeline that extracts their transaction neighbourhood, then tested whether graph topology alone can group addresses by owner.

## Pipeline
1. Seeds: illicit addresses provided by the team.
2. 2-hop BFS (in or out), parallelised with Numba → 31,535,968 nodes.
3. Remove hubs with > 1,000 in- and out-neighbours → 815,984 nodes (−97.4 %).
4. Weakly / strongly connected components; focus on the giant component.
5. Normalised Laplacian, undirected; eigengap → k = 2.
6. k-means on the spectral embedding.

## Validation
- ~10 hand-checkable edge-case graphs; 5 generated families (disconnected, complete, 2D grids, stars, unbalanced trees) up to 10,000 nodes.
- 100,000 consecutive runs per graph; 500,000+ runs in total; 0 errors, 0 divergences.

## Result
Cluster 0: 10,557 nodes (99.75 %); cluster 1: 26 nodes (0.25 %). Spectral clustering does not find meaningful communities here; the team moved towards graph neural networks, which capture local relational patterns.

## Limits
Exploratory (6 weeks); no ground truth on address ownership; seeds taken as given; hub filtering and the undirected view discard signal.
