import Webcam from "react-webcam";

function WebcamApp() {
  return (
    <div style={{ position: "absolute", width: "320px", height: "240px" }}>
      <Webcam
        id="video"
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 9,
          width: 320,
          height: 240,
        }}
      />
    </div>
  );
}

export default WebcamApp;
