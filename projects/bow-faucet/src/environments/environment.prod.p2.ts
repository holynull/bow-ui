// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    poolId: "p2",
    liquiditySymbol: "BOWLP-02",
    tokenSymbol: "BOW",
    virtualPriceDiff: 0.006,
    coins: [{ symbol: 'renBTC' }, { symbol: 'HBTC' }, { symbol: 'anyBTC' }],
    chains: {
        256: {
            enabled: true,
            name: 'DEV',
            rpc: 'https://http-testnet.hecochain.com',
            contracts: {
                proxy: {
                    address: "0xe6D92fed3b36188bD37b63C86419822Eec6e07B5"
                },
                pid: 1
            }
        },
        1337: {
            enabled: true,
            name: 'DEV',
            rpc: 'http://localhost:8545/',
            contracts: {
                proxy: {
                    address: "0x7a47AAa1a420690DCAAF18be426b1fC160460A08"
                },
                pid: 1
            }
        },
    },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
