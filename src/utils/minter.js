import { create } from "ipfs-http-client";
import axios from "axios";
import { ethers } from "ethers";

// initialize IPFS

const authorization =
    "Basic " +
    Buffer.from(
        process.env.REACT_APP_PROJECT_ID +
        ":" +
        process.env.REACT_APP_PROJECT_SECRET
    ).toString("base64");

const client = create({ url: "https://ipfs.infura.io:5001/api/v0", headers: { authorization } });

// mint an NFT
export const addAnimal = async (
    minterContract,
    performActions,
    { name, description, ipfsImage, price, attributes }
) => {
    await performActions(async (kit) => {
        if (!name || !description || !ipfsImage) return;
        const { defaultAccount } = kit;

        // convert NFT metadata to JSON format
        const data = JSON.stringify({
            name,
            description,
            price,
            image: ipfsImage,
            owner: defaultAccount,
            attributes,
        });

        try {

            // save NFT metadata to IPFS
            const added = await client.add(data);

            // IPFS url for uploaded metadata
            const url = `https://diac.infura-ipfs.io/ipfs/${added.path}`;
            const _price = ethers.utils.parseUnits(String(price), "ether");

            // mint the NFT and save the IPFS url to the blockchain
            let transaction = await minterContract.methods
                .safeMint(url, _price)
                .send({ from: defaultAccount });

            return transaction;
        } catch (error) {
            console.log("Error uploading file: ", error);
        }
    });
};


// function to upload a file to IPFS
export const uploadToIpfs = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const added = await client.add(file, {
            progress: (prog) => console.log(`received: ${prog}`),
        });
        return `https://diac.infura-ipfs.io/ipfs/${added.path}`;
    } catch (error) {
        console.log("Error uploading file: ", error);
    }
};


// fetch all NFTs on the smart contract
export const getAnimals = async (minterContract) => {
    try {
        const animals = [];
        const animalLength = await minterContract.methods.totalSupply().call();
        for (let i = 0; i < Number(animalLength); i++) {
            const animal = new Promise(async (resolve) => {
                const _animal = await minterContract.methods.getAnimal(i).call();
                const res = await minterContract.methods.tokenURI(i).call();
                const meta = await fetchNftMeta(res);
                const image = meta.data.image.replace("ipfs.infura.", "diac.infura-ipfs.")
                const owner = await fetchNftOwner(minterContract, i);
                resolve({
                    index: i,
                    tokenId: i,
                    owner,
                    price: _animal.price,
                    sold: _animal.sold,
                    name: meta.data.name,
                    image,
                    description: meta.data.description,
                    attributes: meta.data.attributes,
                });
            });
            animals.push(animal);
        }
        return Promise.all(animals);
    } catch (e) {
        console.log({ e });
    }
};

// get the metedata for an NFT from IPFS
export const fetchNftMeta = async (ipfsUrl) => {
    try {
        if (!ipfsUrl) return null;
        const meta = await axios.get(
            ipfsUrl.replace("ipfs.infura.", "diac.infura-ipfs.")
        );
        return meta;
    } catch (e) {
        console.log({ e });
    }
};

export const adoptAnimal = async (minterContract, index, performActions) => {
    try {
        await performActions(async (kit) => {
            const { defaultAccount } = kit;
            console.log(defaultAccount);
            const animal = await minterContract.methods.getAnimal(index).call();
            console.log(animal);
            await minterContract.methods
                .adoptAnimal(index)
                .send({ from: defaultAccount, value: animal.price });
        });
    } catch (error) {
        console.log({ error });
    }
}

export const releaseAnimal = async (minterContract, index, performActions) => {
    try {
        await performActions(async (kit) => {
            const { defaultAccount } = kit;
            const animal = await minterContract.methods.getAnimal(index).call();
            await minterContract.methods
                .releaseAnimal(index)
                .send({
                    from: defaultAccount,
                    value: animal.price
                });
        });
    } catch (error) {
        console.log({ error });
    }
}


// get the owner address of an NFT
export const fetchNftOwner = async (minterContract, index) => {
    try {
        return await minterContract.methods.ownerOf(index).call();
    } catch (e) {
        console.log({ e });
    }
};

// get the address that deployed the NFT contract
export const fetchNftContractOwner = async (minterContract) => {
    try {
        let owner = await minterContract.methods.owner().call();
        return owner;
    } catch (e) {
        console.log({ e });
    }
};
