const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('testCOToken', function () {

    let token;
    let ico;
    let icoFactory;
    let deployer, investor1, investor2, investor3, attacker;

    const FIRST_INVESTOR_INVESTED = ethers.parseEther("520"); 
    const SECOND_INVESTOR_INVESTED = ethers.parseEther("126");
    const THIRD_INVESTOR_INVESTED = ethers.parseEther("54");
    const SECOND_INVESTOR_REFUNDED = ethers.parseEther("26");

    const TOTAL_INVESTED = FIRST_INVESTOR_INVESTED + SECOND_INVESTOR_INVESTED + THIRD_INVESTOR_INVESTED - SECOND_INVESTOR_REFUNDED;

    before(async function () {

        [deployer, investor1, investor2, investor3, attacker] = await ethers.getSigners();

        // Attacker starts with 1 ETH
        await ethers.provider.send("hardhat_setBalance", [
            attacker.address,
            "0xDE0B6B3A7640000", // 1 ETH
        ]);
        this.initialAttackerBalancer = await ethers.provider.getBalance(attacker.address);
        expect(this.initialAttackerBalancer).to.be.equal(ethers.parseEther("1"))

        // Deploy
        icoFactory = await ethers.getContractFactory('TestCO', deployer);
        ico = await icoFactory.deploy();
        //const ico = await ethers.deployContract("TestCO");
        //ico = await TestCOFactory.deploy();
        // Get Token Contract
        token = await ethers.getContractAt(
            'TestCOToken',
            await ico.token()
        );
    })

    it('Investments Tests', async function () {

        // Should Fail (no ETH)
        await expect(ico.connect(investor1).buy(
            FIRST_INVESTOR_INVESTED.mul(10))).to.be.revertedWith("wrong ETH amount sent");

        // Should Succeed
        await ico.connect(investor1).buy(
            FIRST_INVESTOR_INVESTED.mul(10),
            {value: FIRST_INVESTOR_INVESTED}
        );
        await ico.connect(investor2).buy(
            SECOND_INVESTOR_INVESTED.mul(10),
            {value: SECOND_INVESTOR_INVESTED}
        );
        await ico.connect(investor3).buy(
            THIRD_INVESTOR_INVESTED.mul(10),
            {value: THIRD_INVESTOR_INVESTED}
        );

        // Tokens and ETH balance checks
        expect(await token.balanceOf(investor1.address))
        .to.be.equal(FIRST_INVESTOR_INVESTED.mul(10));
        expect(await token.balanceOf(investor2.address))
        .to.be.equal(SECOND_INVESTOR_INVESTED.mul(10));
        expect(await token.balanceOf(investor3.address))
        .to.be.equal(THIRD_INVESTOR_INVESTED.mul(10));
        
        expect(await ethers.provider.getBalance(ico.address)).to.be.equal(
            FIRST_INVESTOR_INVESTED.add(SECOND_INVESTOR_INVESTED).add(THIRD_INVESTOR_INVESTED)
        )
        
    });

    it('Refund Tests', async function () {
        
        // Should Fail (investor doesn't own so many tokens)
        await expect(ico.connect(investor2).refund(
            SECOND_INVESTOR_INVESTED.mul(100),
        )).to.be.revertedWith("ERC20: burn amount exceeds balance");

        // Should succeed
        await ico.connect(investor2).refund(SECOND_INVESTOR_REFUNDED.mul(10));

        // Tokens and ETH balance check
        expect(await ethers.provider.getBalance(ico.address)).to.be.equal(TOTAL_INVESTED)
        expect(await token.balanceOf(investor2.address))
        .to.be.equal(SECOND_INVESTOR_INVESTED.sub(SECOND_INVESTOR_REFUNDED).mul(10));
    });


    it('Test exploit', async function () {

    });

    after(async function () {
        
        expect(await ethers.provider.getBalance(ico.address)).to.be.equal(0);
        expect(await ethers.provider.getBalance(attacker.address)).to.be.gt(
            this.initialAttackerBalancer.add(TOTAL_INVESTED).sub(ethers.utils.parseEther("0.2"))
        );
    });
});
