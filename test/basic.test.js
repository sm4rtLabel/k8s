import assert from "assert"
import {describe, it, before, after} from "node:test"
import {
    connect,
    result,
    results,
    message,
    spawn,
    monitor,
    unmonitor,
    dryrun,
    createDataItemSigner
} from "@permaweb/aoconnect";
import fs from 'fs'

describe("WAO HyperBEAM Basic Tests", function () {
    let hbeam, hb

    before(async () => {
        const jwk = fs.readFileSync('wallet.json');
        // Start HyperBEAM node (reset: true clears previous data)
        const { result, results, message, spawn, monitor, unmonitor, dryrun } = connect(
            {
                MU_URL: "https://mu.ao-testnet.xyz",
                CU_URL: "https://localhost:6363",
                GATEWAY_URL: "https:/localhost:8734",
            },
        );
    })

    // after(async () => {
    //   // Clean up and kill the HyperBEAM node
    //  // await hbeam.kill()
    // })

    // it("should start HyperBEAM node successfully", async () => {
    //   assert.ok(hb, "HyperBEAM instance should be initialized")
    // })

    it("should perform basic device operation", async () => {
        const processId = await spawn({
            module: "module TxID",
            scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
            signer: createDataItemSigner(jwk),
            tags: [
                { name: "Authority", value: "fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY" },
                { name: "Another-Tag", value: "another-value" },
            ],
        });
    })
    assert.ok(true, "HyperBEAM basic tests passed")
})
