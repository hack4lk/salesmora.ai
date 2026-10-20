# Preserve the existing PostgreSQL major, Alpine libc and data-directory format.
FROM postgres:17-alpine@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24
RUN apk add --no-cache --virtual .vector-build build-base curl \
 && curl -fsSL https://github.com/pgvector/pgvector/archive/refs/tags/v0.8.7.tar.gz -o /tmp/vector.tar.gz \
 && echo 'cac0b10c360f05b2d521200105ba3697e773d4cd3731f5a915a7e37ebe0bea85  /tmp/vector.tar.gz' | sha256sum -c - \
 && tar -xzf /tmp/vector.tar.gz -C /tmp \
 && make -C /tmp/pgvector-0.8.7 OPTFLAGS='' with_llvm=no \
 && make -C /tmp/pgvector-0.8.7 with_llvm=no install \
 && rm -rf /tmp/pgvector-0.8.7 /tmp/vector.tar.gz \
 && apk del .vector-build
