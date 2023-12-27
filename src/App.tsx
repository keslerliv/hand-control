import { useEffect } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import Webcam from "react-webcam";

import { getGlobalDistance } from "./utils";

function App() {
  // process landmarks functions
  const processResults = (detections: any) => {
    if (detections.worldLandmarks[0]) {
      const lm = detections.worldLandmarks[0];

      // palm hand position
      if (getGlobalDistance(lm[12], lm[9]) > 0.07) {
        console.log("opened");
        return;
      }

      // get zoom lenght
      if (
        getGlobalDistance(lm[12], lm[9]) > 0.02 &&
        getGlobalDistance(lm[12], lm[9]) < 0.05 &&
        getGlobalDistance(lm[8], lm[5]) > 0.05
      ) {
        const distance = getGlobalDistance(lm[4], lm[8]);
        const percent = ((distance - 0.005) / (0.1 - 0.005)) * 100;

        console.log(percent);
        return;
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // get render landmarker model
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      // hand landmarker config
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });

      // video capture loop
      let lastVideoTime = -1;
      function renderLoop(): void {
        const video: any = document.getElementById("video");

        if (video?.currentTime !== lastVideoTime) {
          const detections = handLandmarker.detectForVideo(
            video,
            lastVideoTime
          );

          // process landmarks points
          processResults(detections);
          lastVideoTime = video.currentTime;
        }

        requestAnimationFrame(() => {
          renderLoop();
        });
      }

      renderLoop();
    };

    fetchData().catch(console.error);
  }, []);

  return (
    <center>
      <div className="App">
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
            width: 640,
            height: 480,
          }}
        />
      </div>
    </center>
  );
}

export default App;
