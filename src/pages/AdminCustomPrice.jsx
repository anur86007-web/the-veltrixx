import { useEffect, useState } from "react";
import { IndianRupee, Save, RefreshCcw } from "lucide-react";

const API = "https://the-veltrixx-backend.onrender.com/api";

function AdminCustomPrice() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    basePrice: 499,
    imageUploadCharge: 50,
    caseTypePrices: {
      hardCase: 0,
      siliconeCase: 80,
      toughCase: 140,
    },
    finishPrices: {
      glossy: 0,
      matte: 60,
      frosted: 90,
    },
  });

  const token = localStorage.getItem("veltrixx_token");

  useEffect(() => {
    fetchPrice();
  }, []);

  const fetchPrice = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/custom-price`);
      const data = await res.json();

      if (data.success && data.price) {
        setForm({
          basePrice: data.price.basePrice ?? 499,
          imageUploadCharge: data.price.imageUploadCharge ?? 50,
          caseTypePrices: {
            hardCase: data.price.caseTypePrices?.hardCase ?? 0,
            siliconeCase: data.price.caseTypePrices?.siliconeCase ?? 80,
            toughCase: data.price.caseTypePrices?.toughCase ?? 140,
          },
          finishPrices: {
            glossy: data.price.finishPrices?.glossy ?? 0,
            matte: data.price.finishPrices?.matte ?? 60,
            frosted: data.price.finishPrices?.frosted ?? 90,
          },
        });
      }
    } catch (error) {
      alert("Custom price fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const updateValue = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  };

  const updateNestedValue = (group, key, value) => {
    setForm((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: Number(value),
      },
    }));
  };

  const savePrice = async () => {
    try {
      setSaving(true);

      const res = await fetch(`${API}/custom-price`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert("Custom case price updated successfully");
        fetchPrice();
      } else {
        alert(data.message || "Price update failed");
      }
    } catch (error) {
      alert("Price update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="adminPriceLoading">Loading custom price...</div>;
  }

  return (
    <div className="adminCustomPriceWrap">
      <div className="adminCustomPriceHead">
        <div>
          <p>CUSTOM CASE PRICING</p>
          <h1>Custom Case Price Settings</h1>
          <span>Set live pricing for customize case page. User side price will update automatically.</span>
        </div>

        <button onClick={fetchPrice}>
          <RefreshCcw size={17} />
          Refresh
        </button>
      </div>

      <div className="priceSettingsGrid">
        <div className="priceSettingCard mainPriceCard">
          <IndianRupee size={28} />
          <h2>Base Price</h2>
          <p>Main price for custom case before add-ons.</p>

          <label>Base Price</label>
          <input
            type="number"
            min="0"
            value={form.basePrice}
            onChange={(e) => updateValue("basePrice", e.target.value)}
          />

          <label>Image Upload Charge</label>
          <input
            type="number"
            min="0"
            value={form.imageUploadCharge}
            onChange={(e) => updateValue("imageUploadCharge", e.target.value)}
          />
        </div>

        <div className="priceSettingCard">
          <h2>Case Type Extra Price</h2>

          <label>Hard Case Extra</label>
          <input
            type="number"
            min="0"
            value={form.caseTypePrices.hardCase}
            onChange={(e) => updateNestedValue("caseTypePrices", "hardCase", e.target.value)}
          />

          <label>Silicone Case Extra</label>
          <input
            type="number"
            min="0"
            value={form.caseTypePrices.siliconeCase}
            onChange={(e) => updateNestedValue("caseTypePrices", "siliconeCase", e.target.value)}
          />

          <label>Tough Case Extra</label>
          <input
            type="number"
            min="0"
            value={form.caseTypePrices.toughCase}
            onChange={(e) => updateNestedValue("caseTypePrices", "toughCase", e.target.value)}
          />
        </div>

        <div className="priceSettingCard">
          <h2>Finish Extra Price</h2>

          <label>Glossy Extra</label>
          <input
            type="number"
            min="0"
            value={form.finishPrices.glossy}
            onChange={(e) => updateNestedValue("finishPrices", "glossy", e.target.value)}
          />

          <label>Matte Extra</label>
          <input
            type="number"
            min="0"
            value={form.finishPrices.matte}
            onChange={(e) => updateNestedValue("finishPrices", "matte", e.target.value)}
          />

          <label>Frosted Extra</label>
          <input
            type="number"
            min="0"
            value={form.finishPrices.frosted}
            onChange={(e) => updateNestedValue("finishPrices", "frosted", e.target.value)}
          />
        </div>
      </div>

      <div className="pricePreviewBox">
        <h2>Live Price Preview</h2>

        <div>
          <span>Hard Case + Glossy</span>
          <b>₹{form.basePrice + form.caseTypePrices.hardCase + form.finishPrices.glossy}</b>
        </div>

        <div>
          <span>Silicone Case + Matte</span>
          <b>₹{form.basePrice + form.caseTypePrices.siliconeCase + form.finishPrices.matte}</b>
        </div>

        <div>
          <span>Tough Case + Frosted + Image</span>
          <b>
            ₹
            {form.basePrice +
              form.caseTypePrices.toughCase +
              form.finishPrices.frosted +
              form.imageUploadCharge}
          </b>
        </div>
      </div>

      <button className="saveCustomPriceBtn" onClick={savePrice} disabled={saving}>
        <Save size={18} />
        {saving ? "Saving..." : "Save Custom Pricing"}
      </button>
    </div>
  );
}

export default AdminCustomPrice;
