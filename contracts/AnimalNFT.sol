// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AnimalNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    uint256 owners = 0;
    uint256 public releaseFee;

    constructor(uint _releaseFee) ERC721("ZOOLANDER", "ZOO") {
        releaseFee = _releaseFee;
    }


    struct Animal {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => Animal) private animals;

    function safeMint(string memory uri, uint256 price) public payable returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(msg.sender, tokenId);

        _setTokenURI(tokenId, uri);
        addAnimal(tokenId, price);
        return tokenId;
    }

    function addAnimal(
        uint256 tokenId,
        uint256 price
    ) private {
        require(price > 0, "Price must be at least 1 celo");
        animals[tokenId] = Animal(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
    }

    function adoptAnimal(uint256 tokenId) public payable {
        uint256 price = animals[tokenId].price;
        address seller = animals[tokenId].seller;
        require(msg.sender != seller, "You can't adopt your animal");
        require(
            msg.value >= price,
            "Please submit the asking price in order to complete the purchase"
        );
        animals[tokenId].owner = payable(msg.sender);
        animals[tokenId].sold = true;
        animals[tokenId].seller = payable(address(0));
        _transfer(address(this), msg.sender, tokenId);

        payable(seller).transfer(msg.value);
    }

    function releaseAnimal(uint256 tokenId) public payable {
        require(
            animals[tokenId].owner == msg.sender,
            "Only owner of animal can perform this operation"
        );
        require(msg.value >= releaseFee, "Send the release fee");
        
        animals[tokenId].sold = false;
        animals[tokenId].seller = payable(msg.sender);
        animals[tokenId].owner = payable(address(this));

        _transfer(msg.sender, address(this), tokenId);
    }

    function getAnimal(uint256 tokenId)
        public
        view
        returns (Animal memory)
    {
        return animals[tokenId];
    }

    function getAnimalLength() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function getOwners() public view returns (uint256) {
        return owners;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
