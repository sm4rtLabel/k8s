# ===== Builder Stage =====
FROM ubuntu:22.04 as builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential cmake git pkg-config ncurses-dev libssl-dev nodejs npm curl \
    && rm -rf /var/lib/apt/lists/*

# Build Erlang/OTP
RUN git clone https://github.com/erlang/otp.git && \
    cd otp && \
    git checkout maint-28 && \
    ./configure --prefix=/usr/local --enable-smp-support --enable-threads --enable-kernel-poll && \
    make -j$(nproc) && make install

# Install latest stable Rust for NIF compilation
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
ENV PATH="/root/.cargo/bin:/usr/local/bin:$PATH"

# Verify Rust
RUN rustc --version

# Install rebar3
RUN curl -L https://github.com/erlang/rebar3/releases/latest/download/rebar3 -o /usr/local/bin/rebar3 \
    && chmod +x /usr/local/bin/rebar3 \
    && rebar3 --version

# Clone and compile HyperBEAM (Erlang + Rust NIFs)
RUN git clone https://github.com/permaweb/HyperBEAM.git && \
    cd HyperBEAM && \
    rebar3 get-deps && rebar3 compile

COPY config.flat /app/HyperBEAM/config.flat

RUN cd /app/HyperBEAM && rebar3 release

## ===== Runtime Stage =====
FROM builder
WORKDIR /hb

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y git curl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/HyperBEAM/_build/default/rel/hb /hb


# Set environment
ENV PATH="/usr/local/bin:$PATH"
ENV HB_STORE_PATH=/data
ENV HB_KEY=/secrets/wallet.json

VOLUME ["/data"]
EXPOSE 8734
EXPOSE 6363

CMD ["/hb/bin/hb", "foreground"]
