import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard"
import Cart from "./Cart"
import { generateCartItemsFrom } from "./Cart";

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {

  const [productDetails, setProductDetails] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [debounceTimeout, setDebounceTimeout] = useState(0)
  const { enqueueSnackbar } = useSnackbar();
  const [cartItems, setCartItems] = useState([])

  let token = localStorage.getItem("token");
  let username = localStorage.getItem("username");
  let balance = localStorage.getItem("balance");

  console.log(token)


  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
      setIsLoading(true)
      // await axios.get(`${config.endpoint}/products`)
      const URL = `${config.endpoint}/products`;
      try {
        const response = await axios.get(URL);
        setProductDetails(response.data)
        setFilteredProducts(response.data)
        setIsLoading(false)
      } catch(err) {
        let status = err?.response?.status;
        if(status >= 400 && status < 500) {
          enqueueSnackbar(err?.response?.data?.message, { variant: "error" });
        } else {
          enqueueSnackbar("Something went wrong. Check the backend console for more details", { variant: "error" });
        }
        setIsLoading(false)
      }
  };

  useEffect(() => {
    performAPICall();
  }, [])

  useEffect(() => {
    fetchCart(token);
  }, [productDetails]);

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    console.log(text)
    setIsLoading(true)
    axios.get(`${config.endpoint}/products/search?value=${text}`)
    .then(res => {
      // console.log(res)
      setFilteredProducts(res.data)
    })
    .catch( (error) => {
      // Products not found
      if (error.response) {
        if (error.response.status === 404) {
          setFilteredProducts([]);
        }
        if (error.response.status === 500) {
          enqueueSnackbar(error.response.data.message, { variant: "error" });
          setFilteredProducts(productDetails);
        }
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    })
    setIsLoading(false)
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
      if (debounceTimeout !== 0) {
        clearTimeout(debounceTimeout);
      }

  
      const newTimeOut = setTimeout(() => performSearch(event.target.value), 500);
      // console.log(event.target.value)
  
      setDebounceTimeout(newTimeOut);
  
  };

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      let response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response)
      if (response.status === 200) {
        setCartItems(generateCartItemsFrom(response.data, productDetails));
      }
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };


  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    let inCart = false;
    items.forEach(item => {
      if(item.productId === productId) inCart= true
    })
    return inCart
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if(token) {
      if(isItemInCart(items, productId)) {
        enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.", { variant: "warning" });
      } else {
        try {
          let response = await axios.post(`${config.endpoint}/cart`, {
            productId: productId, qty: qty
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          setCartItems(generateCartItemsFrom(response.data, productDetails));
          enqueueSnackbar("Item added to cart", { variant: "success" })
        } catch(e) {
          if(e.response && e.response.status === 400) {
            enqueueSnackbar(e.response.data.message, { variant: "warning" });
            console.log("inga")
          } else {
            enqueueSnackbar("Could not added product to Cart", { variant: "warning" });
          }
        }
      }
    } else {
      enqueueSnackbar("Login to add an item to the Cart", { variant: "warning" });
    }
  };

  const handleQuantity = async (productId, qty) => {
    // console.log(productId, qty)
    // addToCart(token, cartItems, productDetails, productId, qty)
    try {
      let response = await axios.post(`${config.endpoint}/cart`, {
        productId: productId, qty: qty
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setCartItems(generateCartItemsFrom(response.data, productDetails));
    } catch(e) {
      if(e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "warning" });
        console.log("inga")
      } else {
        enqueueSnackbar("Could not added product to Cart", { variant: "warning" });
      }
    }
  }

  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
          className="search-desktop"
          size="small"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          // onChange={(e) => performSearch(e.target.value)}
          onChange={(e) => debounceSearch(e, debounceSearch)}
        />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => debounceSearch(e, debounceTimeout)}
      />
       <Grid container>
         <Grid item className="product-grid" xs={12} md={ username ? 9 : 12}>
           <Box className="hero">
             <p className="hero-heading">
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>

          {
            isLoading ? (<Box className="loading" display="flex" flexDirection="column" justifyContent="center" alignItems="center">                
                <CircularProgress />                
                <span style={{marginTop: "10px"}}>Loading Products...</span>              
              </Box>  ) 
            : (
              <Box m={2}>                
                <Grid container
                item
                spacing={1}
                direction="row"
                justifyContent="center"
                alignItems="center"
                my={3}>                  
              {
                    filteredProducts.length !== 0 ? filteredProducts.map(product => (
                        <Grid item xs={6} md={3} key={product._id}>                          
                        <ProductCard product={product} handleAddToCart={(e) => addToCart( token, cartItems, productDetails, product["_id"], 1,)} />                        
                        </Grid>                        
                      )
                    ) : (
                      <Box className="loading" display="flex" flexDirection="column" justifyContent="center" alignItems="center">                        
                        <SentimentDissatisfied />                        
                        <span style={{marginTop: "10px"}}>No products found</span>                      
                      </Box>
                    )
                  }
                </Grid>
                </Box>
            )
          }
         </Grid>
            <Grid item md={3} sm={12} style={{background: "#E9F5E1", height: "100vh"}}>
            {
              username && (
                <Cart items={cartItems} products={productDetails} handleQuantity={handleQuantity} />
            )}
            </Grid>
       </Grid>
      <Footer />
    </div>
  );
}

export default Products;
