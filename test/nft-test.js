const {
    expect
} = require("chai");
const {
    ethers
} = require("hardhat");

describe("AnimalNFT", function () {
    this.timeout(50000);

    let animalNft;
    let owner;
    let acc1;

    this.beforeEach(async function () {
        // This is executed before each test
        // Deploying the smart contract
        const AnimalNFT = await ethers.getContractFactory("AnimalNFT");
        [owner, acc1] = await ethers.getSigners();

        animalNft = await AnimalNFT.deploy();
    });

    it("Should set the right owner", async function () {
        expect(await animalNft.owner()).to.equal(owner.address);
    });

    it("Should mint one animal nft", async function () {

        // expect(await watchNFT.balanceOf(acc1.address)).to.equal(0);
        const price = ethers.utils.parseUnits("1", "ether");


        const tokenURI = "https://example.com/1";
        await animalNft.connect(owner).safeMint(tokenURI, price);
        await animalNft;

        // expect(await watchNFT.balanceOf(acc1.address)).to.equal(1);
    });

    it("Should set the correct tokenURI", async function () {
        const price = ethers.utils.parseUnits("1", "ether");

        const tokenURI_1 = "https://example.com/1";
        const tokenURI_2 = "https://example.com/2";


        const tx1 = await animalNft.connect(owner).safeMint(tokenURI_1, price);

        await tx1.wait();
        const tx2 = await animalNft.connect(owner).safeMint(tokenURI_2, price);

        await tx2.wait();

        expect(await animalNft.tokenURI(0)).to.equal(tokenURI_1);
        expect(await animalNft.tokenURI(1)).to.equal(tokenURI_2);
    });
    it("Should adopt and release the animal", async function () {
        const price = ethers.utils.parseUnits("1", "ether");

        await animalNft.connect(owner).safeMint("https://example.com/1", price);
        await animalNft
            .connect(acc1)
            .adoptAnimal(0, {
                value: price
            });
        await animalNft.connect(acc1).releaseAnimal(0)
    })

    it("Should get the animal", async function () {

        const price = ethers.utils.parseUnits("1", "ether");

        await animalNft.connect(owner).safeMint("https://example.com/1", price);

        await animalNft
            .connect(acc1)
            .getAnimal(0);
    })
});