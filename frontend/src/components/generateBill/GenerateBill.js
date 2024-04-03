import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useRedirectLoggedOutUser from "../../customHook/useRedirectLoggedOutUser";
import { selectIsLoggedIn } from "../../redux/features/auth/authSlice";
import {
  getProduct,
  getProducts,
  selectIsLoading,
  selectProduct,
  updateProduct,
} from "../../redux/features/product/productSlice";

import Card from "./Card";
import "./GenerateBill.css";
import Search from "../search/Search";
import productService from "../../redux/features/product/productService";
import BillCard from "./BillCard";
import { useNavigate } from "react-router-dom";

const GenerateBill = () => {
  useRedirectLoggedOutUser("/login");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState({});
  const [bill, setBill] = useState(false);

  const isLoggedIn = useSelector(selectIsLoggedIn);
  const { products, isLoading, isError, message } = useSelector(
    (state) => state.product
  );

  useEffect(() => {
    if (isLoggedIn === true) {
      dispatch(getProducts()); 
      //   console.log("Products", products);
    }
    if (isError) {
      console.log(message);
    }
  }, [isLoggedIn, isError, message, dispatch]);

  const handleQuantityChange = (productId, quantity) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: quantity,
    }));
  };
  const confirm = async (e) => {
    e.preventDefault();
    console.log("hi front");
    for(const key in quantities){
      const id = key;
      const quantity = quantities[key];
      const product = await productService.getProduct(id);
      const formData = new FormData();
      formData.append("name", product?.name);
      formData.append("category", product?.category);
      formData.append("quantity", product?.quantity - quantity);
      formData.append("price", product?.price);
      formData.append("description", product?.description);
      formData.append("image", product?.image);
      console.log(formData)
      await dispatch(updateProduct({id,formData}));
      await dispatch(getProducts());
      setBill(false);
    }
  }

  const GenBill = async (e) => {
    e.preventDefault();
    setBill(true);
  };

  return (
    <div>
      {!bill && (
        <form onSubmit={GenBill} method="patch">
          <div className="cards-container">
            {products.map((item, index) => {
              return (
                <Card
                  product={item}
                  key={index}
                  onQuantityChange={handleQuantityChange}
                />
              );
            })}
          </div>
          <div className="--my">
            <button type="submit" className="--btn --btn-primary">
              Generate Bill
            </button>
          </div>
        </form>
      )}
      {bill && <BillCard quantities={quantities} confirm={confirm} />}
    </div>
  );
};

export default GenerateBill;
