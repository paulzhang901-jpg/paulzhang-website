# Search Architecture

V1 discovery supports keyword, topic, life need, content type, and language. Future search may add semantic intent, scripture reference, journey stage, and personalized recommendations.

Architecture must permit lexical + taxonomy + semantic retrieval without requiring semantic/AI search in V1. Search indexes/reference results must point to canonical content IDs and respect publication status, access level, and translation status. No search vendor or vector database is selected.

Canonical events are registered in [`events.yaml`](../../config/architecture/events.yaml). See [Content Model](./CONTENT_MODEL.md), [Taxonomy](./TAXONOMY.md), and [Internationalization](./INTERNATIONALIZATION.md).
