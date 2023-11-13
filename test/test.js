const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("test", function () {
    let token;
    let deployer, attacker;
    const ATTACKER1_MINT = ethers.parseEther("10");
    const DEPLOYER_MINT = ethers.parseEther("100000");

    before(async function () {

        [deployer, attacker] = await ethers.getSigners();

        // Deploy
        token = await ethers.deployContract("TestToken");
        //const token = await tokenFactory.deploy();

        await token.mint(deployer.address, DEPLOYER_MINT);
        await token.mint(attacker.address, ATTACKER1_MINT); 
    });

    it('test', async function () {
      for(let i = 0; i < 10; i++) {
        await token.transfer(attacker.address, DEPLOYER_MINT);
      }
     
    });

    after(async function () {        
        expect(await token.getBalance(attacker.address)).to.be.gt(
            ethers.parseEther("1000000"));
    });
});
