import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {

  return (
    <Card className="card">
      <CardMedia component="img" style={{}} image={product.image} alt="product" />
      <CardContent>
        <Typography variant="body1" component="div">
          {product.name}
        </Typography>
        
        <Typography
          variant="h6"
          color="textPrimary"
          sx={{ fontWeight: "bold" }}
          // mb={1}
        >
          ${product.cost}
        </Typography>
          <Rating
            name="read-only"
            value={product.rating}
            readOnly
            size="small"
          />
      </CardContent>
      <CardActions className="card-actions">
        <Button
          color="primary"
          variant="contained"
          fullWidth
          onClick={handleAddToCart}
          className="card-button"
        >
          <AddShoppingCartOutlined /> &nbsp; ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
