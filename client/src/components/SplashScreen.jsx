// client/src/components/SplashScreen.jsx (or wherever your component lives)
import React, { useEffect } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import handshakeAnimation from "../animations/handshake.json";
import "./SplashScreen.css";

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    if (!sessionStorage.getItem("splashShown")) {
      const timer = setTimeout(() => {
        sessionStorage.setItem("splashShown", "yes");
        onFinish();
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      onFinish();
    }
  }, [onFinish]);

  if (sessionStorage.getItem("splashShown")) return null;

  return (
    <div className="splash-screen">
       <div className="splash-animation">
        <div className="card card1"></div>
        <div className="card card2"></div>
        <div className="card card3"></div>
      </div>
      <div className="animation-container">
        <Player
          autoplay
          keepLastFrame
          src={handshakeAnimation}
          style={{ height: 200, width: 450 }}
        />
      </div>
     
      <h1 className="splash-title">
        Domain <span className="highlight-expert">Expert</span> Discovery
      </h1>
      <h2 className="splash-subtitle">Connecting You to the Right Experts</h2>
    </div>
  );
}
