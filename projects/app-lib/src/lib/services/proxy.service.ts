import {
    ApplicationRef,
    Injectable
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { BigNumber } from 'bignumber.js';
import { interval, Observable, Subject } from 'rxjs';
import { Contract } from 'web3-eth-contract';
import BowProxy from '../abi/BowProxy.json';
import HRC20 from '../abi/HRC20.json';
import BowToken from '../abi/BowToken.json';
import BowPool from '../abi/BowPool.json';
import StableCoin from '../abi/StableCoin.json';
import { AddlpSlippageConfirmComponent } from '../components/addlp-slippage-confirm/addlp-slippage-confirm.component';
import { ApproveDlgComponent } from '../components/approve-dlg/approve-dlg.component';
import { Balance } from '../model/balance';
import { PoolInfo } from '../model/pool-info';
import { SwapConfirmComponent } from '../components/swap-confirm/swap-confirm.component';
import { UnsupportedNetworkComponent } from '../components/unsupported-network/unsupported-network.component';
import { WalletExceptionDlgComponent } from '../components/wallet-exception-dlg/wallet-exception-dlg.component';
import { EnvService } from './env.service';

const Web3_1_3 = require('web3_1_3');
const Web3_1_2 = require('web3_1_2');
@Injectable({
    providedIn: 'root'
})
export class ProxyService {

    walletReady: Subject<any> = new Subject();

    poolId = this.env.environment.poolId;
    coins = this.env.environment.coins;
    liquiditySymbol = this.env.environment.liquiditySymbol;
    tokenSymbol = this.env.environment.tokenSymbol;
    web3: any;
    binanceWeb3: any;
    metamaskWeb3: any;
    wcWeb3: any;
    accounts: string[] = new Array();
    // bianceChain: any;

    // isConnected: boolean = false;

    balance: Balance = new Balance(this.coins.length);


    poolInfo: PoolInfo = new PoolInfo(this.coins.length);

    // daiContract: Contract;
    // busdContract: Contract;
    // usdtContract: Contract;
    poolContract: Contract;

    poolAddress: string;

    proxyContract: Contract;

    tokenContract: Contract;

    contracts: Array<Contract> = new Array();
    contractsAddress: Array<string> = new Array();
    walletsAddress: Array<string> = new Array();

    chainConfig: any;
    unSupportedNetworkSubject: Subject<any> = new Subject();
    chainId: string;
    wcProvider: WalletConnectProvider;

    virtualPrice: BigNumber;

    constructor(private dialog: MatDialog, private applicationRef: ApplicationRef, private env: EnvService) {
        this.balance.coinsBalance = new Array();
        this.poolInfo.coinsBalance = new Array();
        this.coins.forEach(e => {
            this.balance.coinsBalance.push(new BigNumber(0));
            this.poolInfo.coinsAdminFee.push(new BigNumber(0));
            this.poolInfo.coinsBalance.push(new BigNumber(0));
            this.poolInfo.coinsRealBalance.push(new BigNumber(0));
        });

        interval(1000 * 60).subscribe(num => { // 轮训刷新数据
            if (this.web3 && this.accounts && this.chainConfig && this.chainConfig.enabled) {
                this.loadData().then();
            }
        });
        if (this.isMetaMaskInstalled()) {
            // @ts-ignore
            this.metamaskWeb3 = new Web3_1_3(window.ethereum);
        }
        if (this.isBinanceInstalled()) {
            // @ts-ignore
            this.binanceWeb3 = new Web3_1_3(window.BinanceChain);
        }
    }
    isMetaMaskInstalled() {
        //@ts-ignore
        return window.ethereum && window.ethereum.isMetaMask;
    }
    isBinanceInstalled() {
        // @ts-ignore
        return window.BinanceChain;
    }



    private initContracts(): Promise<any> {
        let denominator = new BigNumber(10).exponentiatedBy(18);
        this.proxyContract = new this.web3.eth.Contract(BowProxy.abi, this.chainConfig.contracts.proxy.address);
        this.proxyContract.methods.getTotalAllocPoint().call().then(points => {
            if (points) {
                this.poolInfo.totalAllocPoint = new BigNumber(points).div(denominator);
            }
        }).catch(e => {
            console.log(e);
        });
        this.proxyContract.methods.getWallets().call().then(addArr => {
            this.walletsAddress = addArr;
            return addArr;
        }).then(walletsAddress => {
            return this.proxyContract.methods.getTokenAddress().call().then(tokenAddress => {
                if (tokenAddress) {
                    this.tokenContract = new this.web3.eth.Contract(BowToken.abi, tokenAddress);
                    this.tokenContract.methods.balanceOf(this.accounts[0]).call().then(balance => {
                        if (balance) {
                            this.balance.tokenBalance = new BigNumber(balance).div(denominator);
                        }
                    });
                    this.tokenContract.methods.balanceOf(walletsAddress[0]).call().then(balance => {
                        if (balance) {
                            this.poolInfo.tokenShareBalance = new BigNumber(balance).div(denominator);
                        }
                    });
                    this.tokenContract.methods.balanceOf(walletsAddress[1]).call().then(balance => {
                        if (balance) {
                            this.poolInfo.tokenSwapBalance = new BigNumber(balance).div(denominator);
                        }
                    });
                    this.tokenContract.methods.totalSupply().call().then(totalSupply => {
                        if (totalSupply) {
                            this.poolInfo.tokenTotalSupply = new BigNumber(totalSupply).div(denominator);
                        }
                    });
                    this.tokenContract.methods.availableSupply().call().then(supply => {
                        if (supply) {
                            this.poolInfo.tokenAvailableSupply = new BigNumber(supply).div(denominator);
                        }
                    });
                }
            });
        });
        return this.getPoolInfo(this.chainConfig.contracts.pid).then(res => {
            if (res && res._coins) {
                this.contracts.splice(0, this.contracts.length);
                res._coins.forEach((e, index) => {
                    this.contracts.push(new this.web3.eth.Contract(HRC20.abi, e));
                    this.contractsAddress.push(e);
                    this.coins[index].address = e;
                });
            }
            if (res && res._poolAddress) {
                this.poolAddress = res._poolAddress;
                this.poolContract = new this.web3.eth.Contract(BowPool.abi, res._poolAddress);
            }
            if (res && res._allocPoint) {
                this.poolInfo.allocPoint = new BigNumber(res._allocPoint).div(denominator);
            }
            if (res && res._accTokenPerShare) {
                this.poolInfo.accTokenPerShare = new BigNumber(res._accTokenPerShare).div(denominator);
            }
            if (res && res._shareRewardRate) {
                this.poolInfo.shareRewardRate = new BigNumber(res._shareRewardRate).div(denominator);
            }
            if (res && res._swapRewardRate) {
                this.poolInfo.swapRewardRate = new BigNumber(res._swapRewardRate).div(denominator);
            }
            if (res && res._totalVolAccPoints) {
                this.poolInfo.totalVolAccPoints = new BigNumber(res._totalVolAccPoints).div(denominator);
            }
            if (res && res._totalVolReward) {
                this.poolInfo.totalVolReward = new BigNumber(res._totalVolReward).div(denominator);
            }
            return true;
        });
    }

    public async getPoolInfo(pid: number): Promise<any> {
        if (this.chainConfig && this.accounts && this.accounts.length > 0) {
            return this.proxyContract.methods.getPoolInfo(pid).call().then((res) => {
                return res;
            });
        } else {
            return new Promise((resolve, reject) => {
                resolve(null);
            });
        }
    }

    private async init() {
        if (this.web3) {
            if (this.web3.currentProvider) {
                // Subscribe to accounts change
                let accountsChanged = new Observable((observer) => {
                    this.web3.currentProvider.on("accountsChanged", async (accounts: string[]) => {
                        observer.next(accounts);
                    });
                });
                accountsChanged.subscribe(async (accounts: string[]) => {
                    console.log('accounts: ' + accounts);
                    if (accounts.length > 0) {
                        this.accounts = accounts;
                        await this.loadData();
                    } else {
                        this.accounts = accounts;
                        this.balance.clear();
                    }
                    this.applicationRef.tick();
                });

                let chainChanged = new Observable((observer) => {
                    this.web3.currentProvider.on("chainChanged", async (chainId: string) => {
                        observer.next(chainId);
                    });
                });
                chainChanged.subscribe(async (chainId: string) => {
                    console.log('chainId: ' + chainId);
                    chainId = String(chainId);
                    if (chainId.indexOf('0x') === 0) {
                        chainId = this.web3.utils.hexToNumber(chainId);
                    } else {
                        chainId = await this.web3.eth.getChainId();
                    }
                    let networkInfo = await this.getNetworkInfo(chainId);
                    if (networkInfo.isSupported) {
                        this.chainConfig = this.env.environment.chains[chainId];
                        this.chainId = chainId;
                        await this.loadData();
                    } else {
                        if (!this.web3.currentProvider.isMetaMask) {
                            this.dialog.open(UnsupportedNetworkComponent, { data: { chainId: chainId } });
                            this.balance.clear();
                            this.poolInfo.clear();
                            // this.accounts = [];
                        }
                    }
                    this.applicationRef.tick();
                });

                // Subscribe to session connection
                let connected = new Observable((observer) => {
                    this.web3.currentProvider.on("connect", () => {
                        observer.next();
                    });
                });
                connected.subscribe(() => {
                    console.log("connect!");
                    if (!this.wcWeb3 && this.wcProvider) { // 监听wc的链接状态，连上以后才能初始化
                        //@ts-ignore
                        this.wcWeb3 = new Web3_1_2(this.wcProvider);
                        this.web3 = this.wcWeb3;
                        this.init();
                    }
                    this.applicationRef.tick();
                });

                // Subscribe to session disconnection
                let disconnected = new Observable((observer) => {
                    this.web3.currentProvider.on("disconnect", (code: number, reason: string) => {
                        observer.next({ code: code, reason: reason });
                    });
                });
                disconnected.subscribe((res: any) => {
                    console.log('disconnect!');
                    console.log(res);
                    window.location.reload();
                });

            }

            let networkInfo = await this.getNetworkInfo();
            if (networkInfo.isSupported) {
                this.chainConfig = networkInfo.config;
                this.chainId = networkInfo.chainId;
                this.accounts = await this.web3.eth.getAccounts();
                this.walletReady.next();
                await this.loadData();
            } else {
                this.dialog.open(UnsupportedNetworkComponent, { data: { chainId: networkInfo.chainId } });
                return;
            }
        }
    }

    async getNetworkInfo(_chainId?: string) {
        if (this.web3) {
            let chainId;
            if (!_chainId) {
                if (this.web3.currentProvider && this.web3.currentProvider.chainId && String(this.web3.currentProvider.chainId).indexOf('0x') === 0) {
                    chainId = this.web3.utils.hexToNumber(this.web3.currentProvider.chainId);
                } else if (this.web3.currentProvider && String(this.web3.currentProvider.chainId).indexOf('0x') !== 0) {
                    chainId = await this.web3.eth.getChainId();
                }
            } else {
                chainId = _chainId;
            }
            let chainConfig = this.env.environment.chains[chainId];
            if (!chainConfig || !chainConfig.enabled) {
                return { isSupported: false, chainId: chainId, config: chainConfig };
            } else {
                return { isSupported: true, chainId: chainId, config: chainConfig };
            }
        } else {
            throw "There is no web3 object yet."
        }
    }
    /**
     * connect to wallet connect
     */
    public async connectWC() {
        this.wcProvider = new WalletConnectProvider({
            // infuraId: "a1b8fe06fc1349b1b812bdb7b8f79465",
            rpc: {
                // @ts-ignore
                56: environment.chains[56].rpc,
                // @ts-ignore
                97: environment.chains[97].rpc,
            },
        });
        // Subscribe to session connection
        this.wcProvider.on("connect", async () => {
            console.log("WalletConnect connect");
        });
        // Subscribe to session disconnection
        this.wcProvider.on("disconnect", (code: number, reason: string) => {
            console.log(code, reason);
        });
        //  Enable session (triggers QR Code modal)
        this.wcProvider.enable().then(res => {
            if (this.wcProvider.connected && this.wcWeb3) {
                this.web3 = this.wcWeb3;
                this.init();
            } else if (this.wcProvider.connected && !this.wcWeb3) {
                // @ts-ignore
                this.wcWeb3 = new Web3_1_2(this.wcProvider);
                this.web3 = this.wcWeb3;
                localStorage.setItem("web3Type", "walletconnect");
                this.init();
            }
        }).catch(e => {
            // @ts-ignore
            // this.wcWeb3 = new Web3_1_2(this.wcProvider);
            // this.web3 = this.wcWeb3;
            console.log(e);
        });

    }

    public async connentMetaMask() {
        if (this.isMetaMaskInstalled()) {
            //@ts-ignore
            await window.ethereum.enable();
            // @ts-ignore
            this.metamaskWeb3 = new Web3_1_3(window.ethereum);
            this.web3 = this.metamaskWeb3;
            localStorage.setItem("web3Type", "metamask");
            this.init();
        }
    }

    public async connectTokenPocket() {
        if (this.isMetaMaskInstalled()) {
            //@ts-ignore
            await window.ethereum.enable();
            // @ts-ignore
            this.metamaskWeb3 = new Web3_1_3(window.ethereum);
            this.web3 = this.metamaskWeb3;
            localStorage.setItem("web3Type", "tokenPocket");
            this.init();
        }
    }

    public async connectBinance() {
        if (this.isBinanceInstalled()) {
            // @ts-ignore
            await window.BinanceChain.enable();
            // @ts-ignore
            this.binanceWeb3 = new Web3_1_3(window.BinanceChain);
            this.web3 = this.binanceWeb3;
            localStorage.setItem("web3Type", "binance");
            this.init();
        }
    }

    public async loadData() {
        if (this.web3) {
            this.initContracts().then(() => {
                let denominator = new BigNumber(10).exponentiatedBy(18);
                this.poolContract.methods.decimals().call({ from: this.accounts[0] }).then(lpDecimals => {
                    this.poolContract.methods.balanceOf(this.accounts[0]).call({ from: this.accounts[0] }).then(lpBalanceStr => {
                        this.balance.lp = new BigNumber(lpBalanceStr).div(new BigNumber(10).exponentiatedBy(lpDecimals));
                    }).catch(e => {
                        console.log(e);
                    });
                    this.poolContract.methods.totalSupply().call({ from: this.accounts[0] }).then(totalSupplyStr => {
                        this.poolInfo.totalSupply = new BigNumber(totalSupplyStr).div(new BigNumber(10).exponentiatedBy(lpDecimals));
                        if (this.poolInfo.totalSupply.comparedTo(0) > 0) {
                            this.getVirtualPrice().then(virtualPrice => {
                                this.poolInfo.virtualPrice = virtualPrice;
                            }).catch(e => {
                                console.log(e);
                            });
                        }
                    }).catch(e => {
                        console.log(e);
                    });
                }).catch(e => {
                    console.log(e);
                });
                this.poolContract.methods.balanceOf(this.walletsAddress[2]).call({ from: this.accounts[0] }).then(totalLPStakingStr => {
                    this.poolInfo.totalLPStaking = new BigNumber(totalLPStakingStr).div(denominator);
                }).catch(e => {
                    console.log(e);
                });
                this.proxyContract.methods.getUserInfo(this.chainConfig.contracts.pid, this.accounts[0]).call({ from: this.accounts[0] }).then(res => {
                    if (res && res._amount) {
                        this.balance.stakingLP = new BigNumber(res._amount).div(denominator);
                    }
                    if (res && res._volume) {
                        this.balance.volume = new BigNumber(res._volume).div(denominator);
                    }
                    if (res && res._rewardDebt) {
                        this.balance.rewardDebt = new BigNumber(res._rewardDebt).div(denominator);
                    }
                    if (res && res._volReward) {
                        this.balance.volReward = new BigNumber(res._volReward).div(denominator);
                    }
                    if (res && res._farmingReward) {
                        this.balance.farmingReward = new BigNumber(res._farmingReward).div(denominator);
                    }
                }).catch(e => {
                    console.log(e);
                });
                this.proxyContract.methods.pendingReward(this.chainConfig.contracts.pid, this.accounts[0]).call({ from: this.accounts[0] }).then(pending => {
                    if (pending) {
                        this.balance.pendingToken = new BigNumber(pending).div(denominator);
                    }
                }).catch(e => {
                    console.log(e);
                });
                this.contracts.forEach((e, index) => {
                    e.methods.decimals().call({ from: this.accounts[0] }).then(decimals => {
                        e.methods.balanceOf(this.accounts[0]).call({ from: this.accounts[0] }).then(balanceStr => {
                            this.balance.coinsBalance[index] = new BigNumber(balanceStr).div(new BigNumber(10).exponentiatedBy(decimals));
                        }).catch(e => {
                            console.log(e);
                        });
                        e.methods.balanceOf(this.poolAddress).call({ from: this.accounts[0] }).then(pBalanceStr => {
                            this.poolInfo.coinsBalance[index] = new BigNumber(pBalanceStr).div(new BigNumber(10).exponentiatedBy(decimals));
                        }).catch(e => {
                            console.log(e);
                        });
                        this.poolContract.methods.admin_balances(index).call({ from: this.accounts[0] }).then(adminBalanceStr => {
                            this.poolInfo.coinsRealBalance[index] = this.poolInfo.coinsBalance[index].minus(new BigNumber(adminBalanceStr).div(new BigNumber(10).exponentiatedBy(decimals)));
                        }).catch(e => {
                            console.log(e);
                        });
                    }).catch(e => {
                        console.log(e);
                    });
                });
            }).catch(e => {
                console.log(e);
            });
        }
    }

    private getTXData(data): Promise<any> {
        return this.web3.eth.estimateGas(data).then(gas => {
            data.gas = gas;
            return data;
        });
    }

    public async addLiquidity(amts: string[], lp: BigNumber): Promise<any> {
        if (this.poolContract) {
            let totalCoins = new BigNumber(0);
            amts.forEach(e => {
                totalCoins = totalCoins.plus(e);
            });
            let slippage = lp.div(totalCoins).minus(1).multipliedBy(100);
            console.log("total amt: " + totalCoins.toFixed(18));
            console.log("lp: " + lp.toFixed(18));
            if (slippage.comparedTo(0) < 0 && !this.poolInfo.isEmpty()) {
                let dialogRef = this.dialog.open(AddlpSlippageConfirmComponent, { data: { slippage: slippage.toFixed(4, BigNumber.ROUND_UP) } });
                return dialogRef.afterClosed().toPromise().then(async res => {
                    if (res === true) {
                        return this._addLiquidity(amts);
                    }
                });
            } else {
                return this._addLiquidity(amts);
            }
        }
    }

    private async _addLiquidity(amts: string[]): Promise<any> {
        let amtsStr = new Array();
        amts.forEach((e, i, arr) => {
            amtsStr.push(this.web3.utils.toWei(String(e), 'ether'));
        });
        let data = this.poolContract.methods.add_liquidity(amtsStr, 0).encodeABI();
        let txdata = { from: this.accounts[0], to: this.poolAddress, data: data };
        return this.getTXData(txdata).then(data => {
            return this.web3.eth.sendTransaction(data).catch(e => {
                console.log(e);
            });
        }).catch(e => {
            console.log(e);
            this.dialog.open(WalletExceptionDlgComponent, { data: { content: "addliquidity_exception" } });
        });
    }

    public async approve(i: number, amt: string, address: string): Promise<any> {
        if (this.proxyContract || this.poolContract) {
            let dialogRef = this.dialog.open(ApproveDlgComponent, { data: { amt: amt, symbol: this.coins[i].symbol } });
            return dialogRef.afterClosed().toPromise().then(async res => {
                let amt;
                if (res && res.continu && res.infinite === true) {
                    amt = new BigNumber(2).exponentiatedBy(256).minus(1).toFixed(0);
                } else if (res && res.continu && res.infinite === false) {
                    amt = res.amt;
                    amt = this.web3.utils.toWei(String(amt), 'ether');
                } else {
                    return new Promise((resolve, reject) => {
                        resolve(true);
                    });
                }
                console.log(amt);
                let data = this.contracts[i].methods.approve(address, amt).encodeABI();
                try {
                    return await this.web3.eth.sendTransaction({ from: this.accounts[0], to: this.contractsAddress[i], data: data });
                } catch (e) {
                    console.log(e);
                    return new Promise((resolve, reject) => {
                        resolve(true);
                    });
                }
            });

        }
    }

    public async approveLP(amt: string, address: string): Promise<any> {
        if (this.proxyContract) {
            let dialogRef = this.dialog.open(ApproveDlgComponent, { data: { amt: amt, symbol: this.liquiditySymbol } });
            return dialogRef.afterClosed().toPromise().then(async res => {
                let amt;
                if (res && res.continu && res.infinite === true) {
                    amt = new BigNumber(2).exponentiatedBy(256).minus(1).toFixed(0);
                } else if (res && res.continu && res.infinite === false) {
                    amt = res.amt;
                    amt = this.web3.utils.toWei(String(amt), 'ether');
                } else {
                    return new Promise((resolve, reject) => {
                        resolve(true);
                    });
                }
                console.log(amt);
                let data = this.poolContract.methods.approve(address, amt).encodeABI();
                try {
                    return await this.web3.eth.sendTransaction({ from: this.accounts[0], to: this.poolAddress, data: data });
                } catch (e) {
                    console.log(e);
                    return new Promise((resolve, reject) => {
                        resolve(true);
                    });
                }
            });
        }
    }

    private async _exchange(i: number, j: number, amt: string, minAmt: string): Promise<any> {
        amt = this.web3.utils.toWei(String(amt), 'ether');
        minAmt = this.web3.utils.toWei(String(minAmt), 'ether');
        let data = this.proxyContract.methods.exchange(this.chainConfig.contracts.pid, i, j, amt, minAmt).encodeABI();
        let txdata = { from: this.accounts[0], to: this.chainConfig.contracts.proxy.address, value: 0, data: data };
        return this.getTXData(txdata).then(data => {
            return this.web3.eth.sendTransaction(data).catch(e => {
                console.log(e);
            });
        }).catch(e => {
            this.dialog.open(WalletExceptionDlgComponent, { data: { content: "exchange_exception" } });
            console.log(e);
        });
    }

    public async exchange(i: number, j: number, amt: string, minAmt: string): Promise<any> {
        if (this.poolContract) {
            let slippage = new BigNumber(minAmt).div(new BigNumber(amt)).minus(1).multipliedBy(100);
            if (slippage.comparedTo(0) < 0) {
                let dialogRef = this.dialog.open(SwapConfirmComponent, { data: { slippage: slippage.toFixed(4, BigNumber.ROUND_UP) } });
                return dialogRef.afterClosed().toPromise().then(async res => {
                    if (res === true) {
                        return this._exchange(i, j, amt, minAmt);
                    }
                });
            } else {
                return this._exchange(i, j, amt, minAmt);
            }
        }
    }

    public async getExchangeOutAmt(i: number, j: number, amt: string) {
        if (this.poolContract && !new BigNumber(amt).isNaN()) {
            amt = this.web3.utils.toWei(String(amt), 'ether');
            let decimals = await this.contracts[j].methods.decimals().call({ from: this.accounts[0] });
            return this.poolContract.methods.get_dy(i, j, amt).call().then((res) => {
                return new BigNumber(res).div(new BigNumber(10).exponentiatedBy(decimals));
            });
        } else {
            return new Promise((resolve, reject) => {
                resolve(new BigNumber(0));
            });
        }
    }

    public async redeemImBalance(amts: string[]): Promise<any> {
        let maxLp = new BigNumber(0);
        amts.forEach((e, i, arr) => {
            arr[i] = this.web3.utils.toWei(String(e), 'ether');
            maxLp = maxLp.plus(e);
        });
        maxLp = this.web3.utils.toWei(maxLp.toFixed(9, BigNumber.ROUND_UP), 'ether');
        if (this.poolContract) {
            let data = this.poolContract.methods.remove_liquidity_imbalance(amts, maxLp).encodeABI();
            let txdata = { from: this.accounts[0], to: this.poolAddress, data: data };
            this.getTXData(txdata).then(data => {
                return this.web3.eth.sendTransaction(data).catch(e => {
                    console.log(e);
                });
            }).catch(e => {
                this.dialog.open(WalletExceptionDlgComponent, { data: { content: "redeem_ImBalance_exception" } });
                console.log(e);
            });
        }
    }

    public async redeemToAll(lps: string, minAmts: Array<string>): Promise<any> {
        let lp = new BigNumber(lps);
        let amt = new BigNumber(0);
        minAmts.forEach(e => {
            amt = amt.plus(e);
        });
        let slippage = amt.div(lp).minus(1).multipliedBy(100);
        // if (slippage.comparedTo(0) < 0) {
        //     let dialogRef = this.dialog.open(RedeemConfirmComponent, { data: { slippage: slippage.toFixed(4, BigNumber.ROUND_UP) }, height: '20em', width: '32em' });
        //     return dialogRef.afterClosed().toPromise().then(res => {
        //         if (res === true) {
        //             return this._redeemToAll(lps, minAmts);
        //         }
        //     });
        // } else {
        return this._redeemToAll(lps, minAmts);
        // }
    }

    private async _redeemToAll(lps: string, minAmts: Array<string>): Promise<any> {
        if (this.poolContract) {
            lps = this.web3.utils.toWei(String(lps), 'ether');
            let amts = new Array();
            minAmts.forEach(e => {
                amts.push(this.web3.utils.toWei(String(e), 'ether'));
                // amts.push('0');
            });
            let data = this.poolContract.methods.remove_liquidity(lps, amts).encodeABI();
            let txdata = { from: this.accounts[0], to: this.poolAddress, data: data };
            return this.getTXData(txdata).then(data => {
                return this.web3.eth.sendTransaction(data).catch(e => {
                    console.log(e);
                });
            }).catch(e => {
                this.dialog.open(WalletExceptionDlgComponent, { data: { content: "redeem_allcoin_exception" } });
                console.log(e);
            });
        }
    }

    public async redeemToOneCoin(lps: string, coinIndex: string, minAmt: string): Promise<any> {
        let lp = new BigNumber(lps);
        let amt = new BigNumber(minAmt);
        let slippage = amt.div(lp).minus(1).multipliedBy(100);
        // if (slippage.comparedTo(0) < 0) {
        //     let dialogRef = this.dialog.open(RedeemConfirmComponent, { data: { slippage: slippage.toFixed(4, BigNumber.ROUND_UP) }, height: '20em', width: '32em' });
        //     return dialogRef.afterClosed().toPromise().then(res => {
        //         if (res === true) {
        //             return this._redeemToOneCoin(lps, coinIndex, minAmt);
        //         }
        //     });
        // } else {
        return this._redeemToOneCoin(lps, coinIndex, minAmt);
        // }
    }

    private async _redeemToOneCoin(lps: string, coinIndex: string, minAmt: string): Promise<any> {
        if (this.poolContract) {
            lps = this.web3.utils.toWei(String(lps), 'ether');
            minAmt = this.web3.utils.toWei(String(minAmt), 'ether');
            let data = this.poolContract.methods.remove_liquidity_one_coin(lps, coinIndex, minAmt).encodeABI();
            let txdata = { from: this.accounts[0], to: this.poolAddress, data: data };
            return this.getTXData(txdata).then(data => {
                return this.web3.eth.sendTransaction(data).catch(e => {
                    console.log(e);
                });
            }).catch(e => {
                console.log(e);
                this.dialog.open(WalletExceptionDlgComponent, { data: { content: "redeem_onecoin_exception" } });
            });
        }
    }

    public async calcWithdrawOneCoin(lps: string, coinIndex: string): Promise<any> {
        if (this.poolContract) {
            lps = this.web3.utils.toWei(String(lps), 'ether');
            let data = await this.poolContract.methods.calc_withdraw_one_coin(lps, coinIndex).call({ from: this.accounts[0] });
            return data;
            // try {
            //     return await this.web3.eth.call({ from: this.accounts[0], to: this.chainConfig.contracts.Pool.address, gas: 6721975, data: data });
            // } catch (e) {
            //     console.log(e);
            // }
        }
    }

    public async allowance(i, address: string): Promise<BigNumber> {
        if (this.chainConfig && this.contracts && this.contracts.length > 0 && this.accounts && this.accounts.length > 0) {
            let decimals = await this.contracts[i].methods.decimals().call({ from: this.accounts[0] });
            return this.contracts[i].methods.allowance(this.accounts[0], address).call().then((res) => {
                return new BigNumber(res).div(new BigNumber(10).exponentiatedBy(decimals));
            });
        } else {
            return new Promise((resolve, reject) => {
                resolve(new BigNumber(0));
            });
        }

    }

    public async allowanceLP(address: string): Promise<BigNumber> {
        if (this.chainConfig && this.contracts && this.contracts.length > 0 && this.accounts && this.accounts.length > 0) {
            let decimals = await this.poolContract.methods.decimals().call({ from: this.accounts[0] });
            return this.poolContract.methods.allowance(this.accounts[0], address).call().then((res) => {
                return new BigNumber(res).div(new BigNumber(10).exponentiatedBy(decimals));
            });
        } else {
            return new Promise((resolve, reject) => {
                resolve(new BigNumber(0));
            });
        }

    }

    public async getVirtualPrice(): Promise<BigNumber> {
        if (this.chainConfig && this.contracts && this.contracts.length > 0 && this.accounts && this.accounts.length > 0) {
            return this.poolContract.methods.get_virtual_price().call().then((res) => {
                let r = new BigNumber(res).div(new BigNumber(10).exponentiatedBy(18));
                if (r.comparedTo(999999) >= 0) {
                    return new BigNumber(0);
                } else {
                    return r;
                }
            });
        } else {
            return new Promise((resolve, reject) => {
                resolve(new BigNumber(0));
            });
        }
    }

    public async calculateVirtualPrice(amts: string[], lp: BigNumber, deposit: boolean) {
        // Returns portfolio virtual price (for calculating profit)
        // scaled up by 1e18
        let balances: Array<BigNumber> = new Array();
        amts.forEach((e, index) => {
            let b: BigNumber;
            if (deposit) {
                b = this.poolInfo.coinsRealBalance[index].plus(e);
                console.log("Balances [" + index + "]: " + b.toFixed(18));
            } else {
                if (new BigNumber(e).comparedTo(0) < 0) {// 兑换时要减去管理员费
                    b = this.poolInfo.coinsRealBalance[index].plus(e);
                    let adminFee = new BigNumber(e).abs().div(new BigNumber(1).minus(0.003)).multipliedBy(0.002);
                    b.minus(adminFee);
                } else {
                    b = this.poolInfo.coinsRealBalance[index];
                }
                console.log("Balances [" + index + "]: " + b.toFixed(18));
            }
            balances.push(b);
        });
        let D = this.get_D(balances, new BigNumber(100));
        console.log('D: ' + D.toFixed(18));
        if (deposit) {
            for (let i = 0; i < amts.length; i++) {
                amts[i] = String(amts[i]);
            }
            // console.log('lp: ' + lp.toFixed(18));
            let token_supply = this.poolInfo.totalSupply.plus(lp);
            console.log('total supply: ' + token_supply.toFixed(18));
            // return D * PRECISION / token_supply
            return D.div(token_supply);
        } else {
            let token_supply = this.poolInfo.totalSupply;
            console.log('total supply: ' + token_supply.toFixed(18));
            // return D * PRECISION / token_supply
            return D.div(token_supply);
        }

    }

    private get_D(xp: BigNumber[], amp: BigNumber) {
        let D: BigNumber;
        let S: BigNumber = new BigNumber(0);
        for (let i = 0; i < xp.length; i++) {
            let _x = xp[i];
            // S += _x
            S = S.plus(_x);
        }
        if (S.comparedTo(0) === 0) {
            D = new BigNumber(0);
        }
        let Dprev: BigNumber = new BigNumber(0);
        D = S;
        // Ann: uint256 = amp * coins.length
        let Ann: BigNumber = amp.multipliedBy(this.coins.length);
        for (let i = 0; i < 255; i++) {
            let D_P = D;
            for (let j = 0; j < xp.length; j++) {
                let _x = xp[j];
                // D_P = D_P * D / (_x * coins.length)
                D_P = D_P.multipliedBy(D).div(_x.multipliedBy(this.coins.length)); // If division by 0, this will be borked: only withdrawal will work. And that is good
            }
            Dprev = D;
            // D = (Ann * S + D_P * coins.length) * D / ((Ann - 1) * D + (coins.length + 1) * D_P)
            let numerator: BigNumber = Ann
                .multipliedBy(S)
                .plus(D_P.multipliedBy(this.coins.length))
                .multipliedBy(D);
            let denominator = Ann.minus(1).multipliedBy(D).plus(
                new BigNumber(this.coins.length).plus(1).multipliedBy(D_P)
            );
            D = numerator.div(denominator);
            // Equality with the precision of 1
            if (D > Dprev) {
                if (D.minus(Dprev).comparedTo(1) <= 0) {
                    break;
                }
            } else {
                if (Dprev.minus(D).comparedTo(1) <= 0) {
                    break;
                }
            }
        }
        return D;
    }
    private _xp(balances: BigNumber[]) {
        let rates = [1, 1, 1];
        let result: Array<BigNumber> = new Array();
        for (let i = 0; i < this.coins.length; i++) {
            result.push(new BigNumber(rates[i]).multipliedBy(balances[i]));
        }
        return result;
    }

    // private _A(): BigNumber {
    //     // Handle ramping A up or down
    //     let t1 = future_A_time;
    //     A1 = future_A;
    //     if (block.timestamp < t1) {
    //         uint256 A0 = initial_A;
    //         uint256 t0 = initial_A_time;
    //         // Expressions in uint256 cannot have negative numbers, thus "if"
    //         if (A1 > A0) {
    //             // return A0 + (A1 - A0) * (block.timestamp - t0) / (t1 - t0)
    //             A1 = A0.add(
    //                 A1.sub(A0).mul(block.timestamp.sub(t0)).div(t1.sub(t0))
    //             );
    //         } else {
    //             // return A0 - (A0 - A1) * (block.timestamp - t0) / (t1 - t0)
    //             A1 = A0.sub(
    //                 A0.sub(A1).mul(block.timestamp.sub(t0)).div(t1.sub(t0))
    //             );
    //         }
    //     } else {
    //         //if (t1 == 0 || block.timestamp >= t1)
    //         // retrun A1
    //     }
    // }

    public async calcTokenAmount(amts: string[], isDeposit: boolean): Promise<BigNumber> {
        let amtsStr = new Array();
        amts.forEach((e, index, arr) => {
            amtsStr.push(this.web3.utils.toWei(String(e), 'ether'));
        });
        if (this.chainConfig && this.contracts && this.contracts.length > 0 && this.accounts && this.accounts.length > 0) {
            return this.poolContract.methods.calc_token_amount(amtsStr, isDeposit).call().then((res) => {
                return new BigNumber(res).div(new BigNumber(10).exponentiatedBy(18));
            });
        } else {
            return new Promise((resolve, reject) => {
                resolve(new BigNumber(0));
            });
        }
    }

    public async depositLP(amt: string): Promise<any> {
        amt = this.web3.utils.toWei(String(amt), 'ether');
        let data = this.proxyContract.methods.deposit(this.chainConfig.contracts.pid, amt).encodeABI();
        let txdata = { from: this.accounts[0], to: this.chainConfig.contracts.proxy.address, value: 0, data: data };
        return this.getTXData(txdata).then(data => {
            return this.web3.eth.sendTransaction(data).catch(e => {
                console.log(e);
            });
        }).catch(e => {
            this.dialog.open(WalletExceptionDlgComponent, { data: { content: "exchange_exception" } });
            console.log(e);
        });
    }

    public async withdrawLP(amt: string): Promise<any> {
        amt = this.web3.utils.toWei(String(amt), 'ether');
        let data = this.proxyContract.methods.withdraw(this.chainConfig.contracts.pid, amt).encodeABI();
        let txdata = { from: this.accounts[0], to: this.chainConfig.contracts.proxy.address, value: 0, data: data };
        return this.getTXData(txdata).then(data => {
            return this.web3.eth.sendTransaction(data).catch(e => {
                console.log(e);
            });
        }).catch(e => {
            this.dialog.open(WalletExceptionDlgComponent, { data: { content: "exchange_exception" } });
            console.log(e);
        });
    }

    public async emergencyWithdraw(): Promise<any> {
        let data = this.proxyContract.methods.emergencyWithdraw(this.chainConfig.contracts.pid).encodeABI();
        let txdata = { from: this.accounts[0], to: this.chainConfig.contracts.proxy.address, value: 0, data: data };
        return this.getTXData(txdata).then(data => {
            return this.web3.eth.sendTransaction(data).catch(e => {
                console.log(e);
            });
        }).catch(e => {
            this.dialog.open(WalletExceptionDlgComponent, { data: { content: "exchange_exception" } });
            console.log(e);
        });
    }

    public claimSimulationStableCoin(i: number): Promise<any> {
        let coinContract = new this.web3.eth.Contract(StableCoin.abi, this.contractsAddress[i]);
        let data = coinContract.methods.claimCoins().encodeABI();
        let txdata = { from: this.accounts[0], to: this.contractsAddress[i], value: 0, data: data };
        return this.getTXData(txdata).then(data => {
            return this.web3.eth.sendTransaction(data).catch(e => {
                console.log(e);
            });
        }).catch(e => {
            console.log(e);
        });
    }
}
