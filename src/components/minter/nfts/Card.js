import React from "react";
import PropTypes from "prop-types";
import { Card, Col, Badge, Stack, Row, Button } from "react-bootstrap";
import { truncateAddress } from "../../../utils";
import Identicon from "../../ui/Identicon";

const NftCard = ({ nft, adoptAnimal, releaseAnimal, contractOwner }) => {
  const { image, description, owner, name, index, attributes, sold,  price } = nft;
  console.log(nft);
  return (
    <Col key={index}>
      <Card className=" h-100">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <Identicon address={owner} size={28} />
            <span className="font-monospace text-secondary">
              {truncateAddress(owner)}
            </span>
            <Badge bg="secondary" className="ms-auto">
              {price / 10 ** 18} CELO
            </Badge>
          </Stack>
        </Card.Header>

        <div className=" ratio ratio-4x3">
          <img src={image} alt={description} style={{ objectFit: "cover" }} />
        </div>

        <Card.Body className="d-flex  flex-column text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Text className="flex-grow-1">{description}</Card.Text>
          <div>
            <Row className="mt-2">
              {attributes.map((attribute, key) => (
                <Col key={key}>
                  <div className="border rounded bg-light">
                    <div className="text-secondary fw-lighter small text-capitalize">
                      {attribute.trait_type}
                    </div>
                    <div className="text-secondary text-capitalize font-monospace">
                      {attribute.value}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
          {!sold ? (
            <Button variant="outline-primary mt-2" onClick={adoptAnimal}>
              Adopt Animal
            </Button>
          ) : contractOwner === owner ? (
            <Button variant="outline-danger mt-2" onClick={releaseAnimal}>
              Release Animal
            </Button>
          ) : (
            <Button variant="outline-danger mt-2" disabled>
              Animal has found an owner☺
            </Button>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

NftCard.propTypes = {

  // props passed into this component
  nft: PropTypes.instanceOf(Object).isRequired,
};

export default NftCard;
