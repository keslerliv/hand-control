import RecognitionHook from "./hook";

function WebcamApp() {
  const { videoElement, maxVideoWidth, maxVideoHeight, canvasEl } =
    RecognitionHook();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 10,
      }}
    >
      <video
        style={{ display: "none" }}
        className="video"
        playsInline
        ref={videoElement}
      />
      <canvas ref={canvasEl} width={maxVideoWidth} height={maxVideoHeight} />
    </div>
  );
}

export default WebcamApp;
