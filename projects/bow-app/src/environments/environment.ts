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
        56: {
            enabled: false,
            name: 'BSC Main Net',
            rpc: 'https://bsc-dataseed.binance.org/',
            contracts: {
                coins: [
                    { symbol: 'DAI', address: '0xec5dcb5dbf4b114c9d0f65bccab49ec54f6a0867' },
                    { symbol: 'BUSD', address: '0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee' },
                    { symbol: 'USDT', address: '0x337610d27c682e347c9cd60bd4b3b107c9d34ddd' },
                ],
                Pool: {
                    address: '0x936EaEB69174e9f67b07213890DF8E0c29A71c83',
                }
            }
        },
        256: {
            enabled: true,
            name: 'HECO Testnet',
            rpc: 'https://http-testnet.hecochain.com',
            contracts: {
                coins: [
                    { symbol: 'bowDAI', address: '0xE4663EfDa57d5bc66448bf185c2FE9559b43Fa21' },
                    { symbol: 'bowHUSD', address: '0xd6a8FA35f220ed7cbeaD085F648Dbe549e71fC2F' },
                    { symbol: 'bowUSDT', address: '0x969Bd0E251eF73D5abc67dd3C8cEA3bFF5aff756' },
                ],
                Pool: {
                    address: '0xb434c766CB2C9A597aE55F28aFAB2C5624B9cDA2',
                }
            }
        },
        1337: {
            enabled: true,
            name: 'Local Dev',
            rpc: 'https://localhost:8545/',
            contracts: {
                coins: [
                    { symbol: 'bowDAI', address: '0x3fFC867611E6D8d22085Db73594AfdbEbC670232' },
                    { symbol: 'bowBUSD', address: '0x1Da0c54f79BbFD51c8A0e545628C14E3C8e19a27' },
                    { symbol: 'bowUSDT', address: '0x2C363dB398f819bF9F28b26a9E35601E71C73aD8' },
                ],
                Pool: {
                    address: '0x032C74B20d04dbE6F5cDCf68C36dec557Fa0e3c2',
                }
            }
        },
        "Binance-Chain-Ganges": {
            enabled: true,
            name: 'BSC Testnet',
            rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
            contracts: {
                coins: [
                    { symbol: 'DAI', address: '0xec5dcb5dbf4b114c9d0f65bccab49ec54f6a0867' },
                    { symbol: 'BUSD', address: '0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee' },
                    { symbol: 'USDT', address: '0x337610d27c682e347c9cd60bd4b3b107c9d34ddd' },
                ],
                Pool: {
                    address: '0x936EaEB69174e9f67b07213890DF8E0c29A71c83',
                }
            }
        }
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
