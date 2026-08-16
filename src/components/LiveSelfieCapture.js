import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

export default function LiveSelfieCapture({ onCapture }) {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);

  const capture = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setImage(screenshot);
    if (onCapture) onCapture(screenshot);
  };

  const retake = () => {
    setImage(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {!image ? (
        <>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: "user",
            }}
            style={{
              width: "100%",
              maxWidth: "320px",
              borderRadius: "12px",
            }}
          />
          <button
            type="button"
            onClick={capture}
            className="btn-primary-pro"
          >
            Capture Selfie
          </button>
        </>
      ) : (
        <>
          <img
            src={image}
            alt="selfie"
            style={{
              width: "100%",
              maxWidth: "320px",
              borderRadius: "12px",
            }}
          />
          <button
            type="button"
            onClick={retake}
            className="btn-secondary-pro"
          >
            Retake
          </button>
        </>
      )}
    </div>
  );
}