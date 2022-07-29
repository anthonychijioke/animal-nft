import {useContract} from './useContract';
import AnimalNFTAbi from '../contracts/AnimalNFT.json';
import AnimalNFTContractAddress from '../contracts/animalNFT-address.json';


// export interface for NFT contract
export const useMinterContract = () => useContract(AnimalNFTAbi.abi, AnimalNFTContractAddress.animalNFT);