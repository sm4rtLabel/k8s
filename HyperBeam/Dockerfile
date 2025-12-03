# Builder stage
FROM debian:12 AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential cmake git pkg-config ncurses-dev libssl-dev \
    libradosstriper-dev librocksdb-dev \
    erlang-dev erlang-base erlang-nox \
    curl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /src
COPY . .
RUN ./rebar3 as rocksdb release

# Runtime stage
FROM debian:12
RUN apt-get update && apt-get install -y --no-install-recommends \
    erlang-base erlang-nox \
    librocksdb-dev \
    curl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /src/_build/default/rel/hb /opt/hb
WORKDIR /opt/hb
VOLUME ["/data"]
ENV HB_STORE_PATH=/data
ENV HB_KEY=/secrets/wallet.json
EXPOSE 8734
CMD ["./bin/hb", "foreground"]
