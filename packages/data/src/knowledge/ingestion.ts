// Filesystem ingestion is worker-only; web runtime imports database retrieval instead.
export { loadCorpus, parseArticle, type KnowledgeArticle } from './corpus';
