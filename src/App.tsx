import { useEffect, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

import { getGlobalDistance } from "./utils";
import WebcamApp from "./components/Cam";
import { SceneApp } from "./components/Scene";

function App() {
  const [zoom, setZoom] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  let initialRotateX = 0;
  let initialRotateY = 0;

  let lastRotateX = 0;
  let lastRotateY = 0;

  // process landmarks functions
  const processResults = (detections: any) => {
    if (detections.worldLandmarks[0]) {
      const lm = detections.worldLandmarks[0];

      // palm hand position
      if (getGlobalDistance(lm[12], lm[9]) > 0.07) {
        const positionX = detections.landmarks[0][0].x;
        const positionY = detections.landmarks[0][0].y;

        if (
          (lastRotateX === 0 && lastRotateY === 0) ||
          positionX - lastRotateX > 0.1 ||
          positionX - lastRotateX < -0.1 ||
          positionY - lastRotateY > 0.1 ||
          positionY - lastRotateY < -0.1
        ) {
          lastRotateX = positionX;
          lastRotateY = positionY;
        }

        // set current rotations
        initialRotateX = initialRotateX + (positionX - lastRotateX);
        setRotateX(initialRotateX);

        initialRotateY = initialRotateY + (positionY - lastRotateY);
        setRotateY(initialRotateY);

        lastRotateX = positionX;
        lastRotateY = positionY;

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
        setZoom(Math.round(percent));
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
    <>
      <WebcamApp />
      <SceneApp />
    </>
  );
}

export default App;
