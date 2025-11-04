/* eslint-disable react/prop-types */
import Button from "./Button";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useState } from "react";

// ✅ fallback added for safety (no structural change)
const baseUrl =
  import.meta.env.VITE_BACKEND_BASE_URL ||
  "https://full-stack-mini-task-management.onrender.com";

const OAuth = ({ title }) => {
  const auth = getAuth(app);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleClick = async () => {
    if (loading) return; // prevent double click
    setLoading(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);

      // ✅ Confirm backend URL before sending
      console.log("🔥 Backend URL in use:", baseUrl);

      const res = await fetch(`${baseUrl}/api/v1/user/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoUrl: resultsFromGoogle.user.photoURL,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(setCredentials(data));
        toast.success("Login successful!");
        navigate("/");
      } else {
        console.error("Google Login Response Error:", data);
        toast.error(data?.message || "Google login failed");
      }
    } catch (error) {
      console.error("🔥 Google Login Error:", error);
      toast.error("Google Sign-in failed or was cancelled. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      className="bg-blue-600 text-white mx-auto block rounded-md p-2 m-4 justify-center"
      onClick={handleGoogleClick}
      disabled={loading}
    >
      {loading ? "Connecting..." : title}
    </Button>
  );
};

export default OAuth;
