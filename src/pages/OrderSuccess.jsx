import { Link, useParams } from "react-router-dom";

function OrderSuccess() {
  const { orderId } = useParams();

  return (
    <div className="orderSuccessPage">
      <div className="orderSuccessCard">
        <div className="successIcon">✅</div>

        <h1>Order Confirmed</h1>

        <p>
          Thank you for shopping with <b>THE VELTRIXX</b>.
        </p>

        <p className="orderIdText">
          Order ID: <b>{orderId}</b>
        </p>

        <div className="deliveryEstimate">
          🚚 Estimated Delivery: 3-7 Business Days
        </div>

        <div className="successBtns">
          <Link to="/orders">
            <button className="trackBtn">
              View Orders
            </button>
          </Link>

          <Link to="/">
            <button className="shopBtn">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;