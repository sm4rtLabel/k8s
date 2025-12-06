# ===== Builder Stage =====
FROM ubuntu:22.04 AS builder
WORKDIR /app

ARG HB_CU_ADDRESS
ARG HB_CU_PORT

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

COPY config.flat /app/config.flat

# Install WebAssembly runtime (wasmtime)
RUN curl -fsSL https://github.com/bytecodealliance/wasmtime/releases/download/v11.0.0/wasmtime-v11.0.0-x86_64-linux.tar.xz -o /tmp/wasmtime.tar.xz && \
    mkdir -p /opt/wasmtime && tar -xf /tmp/wasmtime.tar.xz -C /opt/wasmtime --strip-components=1 && \
    ln -s /opt/wasmtime/wasmtime /usr/local/bin/wasmtime && \
    rm /tmp/wasmtime.tar.xz

# Verify wasmtime installation
RUN wasmtime --version

# Download Hyperbeam
RUN git clone https://github.com/permaweb/HyperBEAM.git
#    cd HyperBEAM && cp /app/config.flat ./config.flat && \
    #sed -i -E "s|\"http://localhost:6363\"|\"http://${HB_CU_ADDRESS}:${HB_CU_PORT}\"|g" ./src/hb_opts.erl && \
#    rebar3 get-deps && rebar3 compile

COPY config.flat /app/HyperBEAM/config.flat
COPY /data/replaceSourceFiles/*.erl /app/HyperBEAM/src/

# Copy custom source code and compile
RUN cd /app/HyperBEAM/  && \
    rebar3 get-deps && rebar3 compile

# Build release with proper sys.config
RUN cd /app/HyperBEAM && rebar3 release

# ===== Runtime Stage =====
FROM ubuntu:22.04 AS runtime
WORKDIR /hb

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y net-tools curl && rm -rf /var/lib/apt/lists/*

# Copy HyperBEAM release
COPY --from=builder /app/HyperBEAM/ /hb
COPY --from=builder /opt/wasmtime/wasmtime /opt/wasmtime/wasmtime

RUN ln -s /opt/wasmtime/wasmtime /usr/local/bin/wasmtime

# Set environment variables
ENV PATH="/usr/local/bin:$PATH"
ENV HB_STORE_PATH=/data
ENV HB_KEY=/secrets/wallet.json

# Create volumes
VOLUME ["/data", "/secrets"]

WORKDIR /hb/_build/default/rel/hb
COPY config.flat /hb/releases/0.0.1/sys.config
CMD ["./bin/hb", "foreground"]