import { useState } from "react";
import { Link } from "react-router-dom";

function Profile({ user }) {
  const savedProfile =
    JSON.parse(localStorage.getItem("veltrixx_profile")) || {};

  const [profile, setProfile] = useState({
    name: savedProfile.name || user?.name || "",
    email: savedProfile.email || user?.email || "",
    phone: savedProfile.phone || "",
    address: savedProfile.address || "",
    landmark: savedProfile.landmark || "",
    city: savedProfile.city || "",
    state: savedProfile.state || "",
    pincode: savedProfile.pincode || "",
  });

  const saveProfile = () => {
    localStorage.setItem("veltrixx_profile", JSON.stringify(profile));
    alert("Profile saved successfully");
  };

  return (
    <div className="authPage">
      <div className="authBox paymentBox">
        <Link to="/" className="backLink">← Back to shop</Link>

        <h1>My Profile</h1>

        <input
          placeholder="Full Name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />

        <input
          placeholder="Email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        />

        <input
          placeholder="Phone Number"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        />

        <input
          placeholder="House No, Street, Area"
          value={profile.address}
          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
        />

        <input
          placeholder="Landmark"
          value={profile.landmark}
          onChange={(e) => setProfile({ ...profile, landmark: e.target.value })}
        />

        <input
          placeholder="City"
          value={profile.city}
          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
        />

        <input
          placeholder="State"
          value={profile.state}
          onChange={(e) => setProfile({ ...profile, state: e.target.value })}
        />

        <input
          placeholder="Pincode"
          value={profile.pincode}
          onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
        />

        <button onClick={saveProfile}>Save Profile</button>
      </div>
    </div>
  );
}

export default Profile;