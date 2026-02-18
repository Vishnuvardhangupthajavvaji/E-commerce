import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import CartItemCard from "../components/CartItemCard";
import { CartContext } from "../context/CartContext";


function Cart() {

  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const { loadCartCount } = useContext(CartContext);

  const loadCart = () => {
    API.get("cart/")
      .then(res => {
        setCart(res.data);

        let sum = 0;
        res.data.forEach(item => {
          sum += item.product.price * item.quantity;
        });
        setTotal(sum);
      })
      .catch(err => console.log(err));
  };

  const updateQty = (id, qty) => {

  if (qty <= 0) return;

  API.patch(`cart/update/${id}/`, { quantity: qty })
    .then(() => {loadCart();
      loadCartCount();
    });
  };


  useEffect(() => {
    loadCart();
  }, []);

  const removeItem = (id) => {
    API.delete(`cart/remove/${id}/`)
      .then(() => {loadCart();
        loadCartCount();
      });
  };

  return (
    <>
      <div className="container mt-4">
        <h3>Shopping Cart</h3>

        {cart.map(item => (
          <CartItemCard
            key={item.id}
            item={item}
            updateQty={updateQty}
            removeItem={removeItem}
          />
        ))}

        { total>0 ? (
          <h4 className="text-end mt-3">
          Total: ₹ {total}
          </h4>
        ) : (
          <h4 className="text-mid mt-3"> Your Cart Is Empty!!</h4>
        )}
      </div>
    </>
  );
}

export default Cart;
