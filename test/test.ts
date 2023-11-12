import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Testing smart contract exploit', async function () {
    let accounts: SignerWithAddress;

    const attackerMint = ethers.utils.parseEther("10");
    const deployerMint = ethers.utils.parseEther("100000");

    before(async function () {
        accounts = await ethers.getSigners();

        const tokenFactory = await ethers.getContractFactory(
            'contracts/arithmetic-overflows-2/SimpleToken.sol:SimpleToken',
            accounts[0].address
        );
        this.token = await tokenFactory.deploy();

        await this.token.mint(accounts[0].address, deployerMint);
        await this.token.mint(accounts[1].address, attackerMint); 
    });

    it('Exploit', async function () {
        await this.tokenFactory.transfer(accounts[1].address, deployerMint);
        
    });

    after(async function () {
        expect(await this.token.getBalance(accounts[1].address)).to.be.gt(
            ethers.utils.parseEther("1000000"));
    });
});