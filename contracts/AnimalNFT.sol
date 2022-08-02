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

    constructor() ERC721("ZOOLANDER", "ZOO") {}


    struct Animal {
        uint256 tokenId;
        address payable owner;
        address payable adoptionCenter;
        uint256 price;
        bool adopted;
    }

    mapping(uint256 => Animal) private animals;

    modifier exists(uint tokenId){
        require(_exists(tokenId), "Query of nonexistent animal");
        _;
    }
    /// @dev adds an animal to the platform
    function safeMint(string calldata uri, uint256 price)
        external
        payable
        onlyOwner
        returns (uint256)
    {
        require(bytes(uri).length > 0, "Empty uri");
        require(price > 0, "Invalid price");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(msg.sender, tokenId);

        _setTokenURI(tokenId, uri);
        addAnimal(tokenId, price);
        return tokenId;
    }

    function addAnimal(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price must be at least 1 wei");
        animals[tokenId] = Animal(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
    }
    /// @dev users can adopt an animal with id of tokenId
    function adoptAnimal(uint256 tokenId) external payable exists(tokenId) {
        require(
            animals[tokenId].owner != msg.sender,
            "You can't adopt your own animal"
        );
        require(!animals[tokenId].adopted, "Animal is already adopted");
        uint256 price = animals[tokenId].price;
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );
        address owner = animals[tokenId].owner;
        animals[tokenId].adoptionCenter = payable(address(0));
        animals[tokenId].adopted = true;
        animals[tokenId].owner = payable(msg.sender);
        animals[tokenId].price = 0;
        _transfer(address(this), msg.sender, tokenId);
        (bool success, ) = payable(owner).call{value: msg.value}("");
        require(success, "Payment failed");
    }

    /// @dev users can put an animal back on adoption
    function releaseAnimal(uint256 tokenId) public payable exists(tokenId) {
        require(
            animals[tokenId].owner == msg.sender,
            "Only owner of animal can perform this operation"
        );
        require(animals[tokenId].adopted, "Animal is already up for adoption");
        animals[tokenId].adopted = false;
        animals[tokenId].adoptionCenter = payable(address(this));

        _transfer(msg.sender, address(this), tokenId);
    }


    /// @dev users can retrieve animal from the adoption center
    function retrieveAnimal(uint tokenId) public exists(tokenId) {
        require(
            animals[tokenId].owner == msg.sender,
            "Only adoptionCenter of animal can perform this operation"
        );
        require(!animals[tokenId].adopted, "Animal is already up for adoption");

        animals[tokenId].adoptionCenter = payable(address(0));
        animals[tokenId].adopted = true;
        _transfer(address(this), msg.sender, tokenId);
    }

    function getAnimal(uint256 tokenId) public view returns (Animal memory) {
        return animals[tokenId];
    }

    function getAnimalLength() public view returns (uint256) {
        return _tokenIdCounter.current();
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
