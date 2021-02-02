// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    poolId: "p1",
    liquiditySymbol: "BSLP-01",
    virtualPriceDiff: 0.006,
    coins: [{ symbol: 'bowDAI' }, { symbol: 'bowHUSD' }, { symbol: 'bowUSDT' }],
    chains: {
        256: {
            enabled: true,
            name: 'DEV',
            rpc: 'https://http-testnet.hecochain.com',
            contracts: {
                proxy: {
                    address: "0x0290FB167208Af455bB137780163b7B7a9a10C16"
                },
                pid: 0
            }
        },
        1337: {
            enabled: true,
            name: 'DEV',
            rpc: 'http://localhost:8545/',
            contracts: {
                proxy: {
                    address: "0xB54a89207514270F4e15B9c8E64Fa1d0C90A3371"
                },
                pid: 0
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
