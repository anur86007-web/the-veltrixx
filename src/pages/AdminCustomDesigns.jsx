import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Download,
  MessageCircle,
  Search,
  Trash2,
  PackageCheck,
  Palette,
  User,
  Phone,
  MapPin,
  CalendarDays,
  IndianRupee,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";

const API = "https://the-veltrixx-backend.onrender.com/api";

function AdminCustomDesigns() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("veltrixx_token");

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  const fetchCustomOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/orders/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Custom orders fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const customDesigns = useMemo(() => {
    const list = [];

    orders.forEach((order) => {
      const items = order.items || order.orderItems || [];

      items.forEach((item) => {
        if (item.isCustomCase || item.customDesign || item.selectedColor === "Custom Design") {
          list.push({
            id: `${order._id}-${item._id || item.id || item.name}`,
            orderId: order._id,
            shortOrderId: order._id?.slice(-6)?.toUpperCase(),
            orderStatus: order.orderStatus || order.status || "Order Placed",
            paymentMethod: order.paymentMethod || "Cash On Delivery",
            paymentStatus: order.paymentStatus || "Pending",
            customerName:
              order.customer?.name ||
              order.shippingAddress?.name ||
              order.address?.name ||
              order.user?.name ||
              "Customer",
            customerPhone:
              order.customer?.phone ||
              order.shippingAddress?.phone ||
              order.address?.phone ||
              order.phone ||
              "",
            customerAddress: order.customer || order.shippingAddress || order.address || {},
            createdAt: order.createdAt,
            productName: item.name || "Custom Case",
            brand: item.brand || item.customDesign?.brand || "Custom",
            model: item.model || item.selectedModel || item.customDesign?.model || "Custom Model",
            caseType: item.customDesign?.caseType || item.caseType || "Custom Case",
            finish: item.customDesign?.finish || item.finish || "Glossy",
            qty: item.qty || item.quantity || 1,
            price: item.price || 0,
            image: item.image || item.selectedImage || item.customDesign?.preview || "",
            customDesign: item.customDesign || {},
          });
        }
      });
    });

    return list.filter((item) => {
      const value = search.toLowerCase().trim();
      if (!value) return true;

      return (
        item.customerName.toLowerCase().includes(value) ||
        item.customerPhone.includes(value) ||
        item.shortOrderId?.toLowerCase().includes(value) ||
        item.brand.toLowerCase().includes(value) ||
        item.model.toLowerCase().includes(value)
      );
    });
  }, [orders, search]);

  const totalRevenue = customDesigns.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0
  );

  const downloadDesign = (design) => {
    if (!design.image) {
      alert("Design preview image not available");
      return;
    }

    const link = document.createElement("a");
    link.href = design.image;
    link.download = `veltrixx-custom-design-${design.shortOrderId}.png`;
    link.click();
  };

  const openWhatsApp = (design) => {
    if (!design.customerPhone) {
      alert("Customer phone number not available");
      return;
    }

    const message = `
Hello ${design.customerName},

Thank you for placing your custom case order with THE VELTRIXX.

Order ID: #${design.shortOrderId}
Device: ${design.brand} ${design.model}
Case Type: ${design.caseType}
Finish: ${design.finish}
Status: ${design.orderStatus}

We will update you once your custom design is ready for processing.
`;

    window.open(
      `https://wa.me/91${design.customerPhone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Delete this custom order?")) return;

    try {
      const res = await fetch(`${API}/orders/admin/delete/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
        alert("Custom order deleted");
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (error) {
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="adminCustomWrap">
        <div className="adminCustomLoading">Loading custom designs...</div>
      </div>
    );
  }

  return (
    <div className="adminCustomWrap">
      <div className="adminCustomHead">
        <div>
          <p>CUSTOM CASE STUDIO</p>
          <h1>Custom Design Orders</h1>
          <span>Manage uploaded designs, customer customizations and production-ready cases.</span>
        </div>

        <div className="adminCustomSearch">
          <Search size={18} />
          <input
            placeholder="Search customer, phone, order ID, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="adminCustomStats">
        <div>
          <Palette size={26} />
          <span>Total Custom Orders</span>
          <b>{customDesigns.length}</b>
        </div>

        <div>
          <PackageCheck size={26} />
          <span>Ready For Review</span>
          <b>
            {
              customDesigns.filter(
                (item) =>
                  item.orderStatus !== "Delivered" &&
                  item.orderStatus !== "Cancelled"
              ).length
            }
          </b>
        </div>

        <div>
          <IndianRupee size={26} />
          <span>Custom Revenue</span>
          <b>₹{totalRevenue}</b>
        </div>
      </div>

      {customDesigns.length === 0 ? (
        <div className="adminNoCustom">
          <ImageIcon size={48} />
          <h2>No custom design orders found</h2>
          <p>When customers place custom case orders, they will appear here.</p>
        </div>
      ) : (
        <div className="adminCustomGrid">
          {customDesigns.map((design) => (
            <div className="adminCustomCard" key={design.id}>
              <div className="adminDesignImage">
                {design.image ? (
                  <img src={design.image} alt={design.productName} />
                ) : (
                  <div className="noPreviewBox">
                    <ImageIcon size={32} />
                    <span>No Preview</span>
                  </div>
                )}

                <span className="adminCustomBadge">Custom Design</span>
              </div>

              <div className="adminDesignInfo">
                <div className="adminDesignTop">
                  <div>
                    <h2>{design.productName}</h2>
                    <p>Order #{design.shortOrderId}</p>
                  </div>

                  <span className="adminStatusPill">{design.orderStatus}</span>
                </div>

                <div className="adminDesignMeta">
                  <p><User size={15} /> {design.customerName}</p>
                  <p><Phone size={15} /> {design.customerPhone || "No phone"}</p>
                  <p><CalendarDays size={15} /> {design.createdAt ? new Date(design.createdAt).toLocaleDateString() : "N/A"}</p>
                </div>

                <div className="adminDesignSpecs">
                  <span><b>Brand</b>{design.brand}</span>
                  <span><b>Model</b>{design.model}</span>
                  <span><b>Case</b>{design.caseType}</span>
                  <span><b>Finish</b>{design.finish}</span>
                  <span><b>Qty</b>{design.qty}</span>
                  <span><b>Price</b>₹{design.price}</span>
                </div>

                <div className="adminDesignAddress">
                  <MapPin size={15} />
                  <span>
                    {design.customerAddress?.address || "Address not available"}
                    {design.customerAddress?.city ? `, ${design.customerAddress.city}` : ""}
                    {design.customerAddress?.state ? `, ${design.customerAddress.state}` : ""}
                    {design.customerAddress?.pincode ? ` - ${design.customerAddress.pincode}` : ""}
                  </span>
                </div>

                <div className="adminCustomActions">
                  <button onClick={() => setSelectedDesign(design)}>
                    <Eye size={16} />
                    Preview
                  </button>

                  <button onClick={() => downloadDesign(design)}>
                    <Download size={16} />
                    Download
                  </button>

                  <button onClick={() => openWhatsApp(design)}>
                    <MessageCircle size={16} />
                    WhatsApp
                  </button>

                  <button className="dangerBtn" onClick={() => deleteOrder(design.orderId)}>
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDesign && (
        <div className="customPreviewOverlay" onClick={() => setSelectedDesign(null)}>
          <div className="customPreviewModal" onClick={(e) => e.stopPropagation()}>
            <button className="closePreview" onClick={() => setSelectedDesign(null)}>
              ×
            </button>

            <div className="previewModalImage">
              {selectedDesign.image ? (
                <img src={selectedDesign.image} alt="Custom preview" />
              ) : (
                <div>No Preview Available</div>
              )}
            </div>

            <div className="previewModalInfo">
              <span>ORDER #{selectedDesign.shortOrderId}</span>
              <h2>{selectedDesign.productName}</h2>

              <div className="previewModalRows">
                <p><b>Customer:</b> {selectedDesign.customerName}</p>
                <p><b>Phone:</b> {selectedDesign.customerPhone}</p>
                <p><b>Device:</b> {selectedDesign.brand} {selectedDesign.model}</p>
                <p><b>Case Type:</b> {selectedDesign.caseType}</p>
                <p><b>Finish:</b> {selectedDesign.finish}</p>
                <p><b>Quantity:</b> {selectedDesign.qty}</p>
                <p><b>Payment:</b> {selectedDesign.paymentMethod}</p>
                <p><b>Status:</b> {selectedDesign.orderStatus}</p>
              </div>

              <div className="productionChecklist">
                <h3>Production Checklist</h3>
                <p><CheckCircle size={16} /> Design preview checked</p>
                <p><CheckCircle size={16} /> Device model confirmed</p>
                <p><CheckCircle size={16} /> Print quality review pending</p>
                <p><CheckCircle size={16} /> Packaging after final approval</p>
              </div>

              <div className="previewModalActions">
                <button onClick={() => downloadDesign(selectedDesign)}>Download Design</button>
                <button onClick={() => openWhatsApp(selectedDesign)}>Message Customer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomDesigns;
