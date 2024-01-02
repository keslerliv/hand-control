import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Hands, HAND_CONNECTIONS, Results } from "@mediapipe/hands";
import { AppDispatch } from "../../../store";
import {
  applyZoom,
  setHorizontalRotation,
  setNumber,
  setVerticalRotation,
} from "../../../store/global";
import { getGlobalDistance } from "../../../utils";

const maxVideoWidth = 920 / 2;
const maxVideoHeight = 540 / 2;

function RecognitionHook() {
  const dispatch = useDispatch<AppDispatch>();

  const videoElement = useRef<any>(null);
  const hands = useRef<any>(null);
  const camera = useRef<any>(null);
  const canvasEl = useRef<any>(null);

  let lastPalmX: number | null = null;
  let lastPalmY: number | null = null;

  let lastNumber = 0;
  let handNumberFrames = 0;

  function applyHand(screen: number) {
    handNumberFrames = lastNumber === screen ? handNumberFrames + 1 : 0;
    if (handNumberFrames > 2) dispatch(setNumber(screen));
    lastNumber = screen;
  }

  // get hand informations
  async function processHands(results: Results) {
    if (canvasEl.current) {
      const glms = results.multiHandWorldLandmarks[0];
      const lms = results.multiHandLandmarks[0];

      const ctx = await canvasEl.current.getContext("2d");
      ctx.save();
      ctx.clearRect(0, 0, canvasEl.current.width, canvasEl.current.height);
      ctx.drawImage(results.image, 0, 0, maxVideoWidth, maxVideoHeight);

      if (lms && glms) {
        const openFingers = [
          getGlobalDistance(glms[8], glms[5]) > 0.055 ? 1 : 0,
          getGlobalDistance(glms[12], glms[9]) > 0.07 ? 1 : 0,
          getGlobalDistance(glms[16], glms[13]) > 0.065 ? 1 : 0,
          getGlobalDistance(glms[20], glms[17]) > 0.055 ? 1 : 0,
          getGlobalDistance(glms[4], glms[5]) > 0.05 ? 1 : 0,
        ];

        // Apply zoom in and zoom out
        if (
          getGlobalDistance(glms[8], glms[5]) > 0.045 &&
          !openFingers[1] &&
          !openFingers[2] &&
          !openFingers[3] &&
          getGlobalDistance(glms[4], glms[5]) > 0.04
        ) {
          const distance = getGlobalDistance(glms[4], glms[8]);
          const percent = (distance / 0.01) * 10;
          dispatch(applyZoom(percent));
        }

        // Verify finger number
        if (
          !openFingers[0] &&
          !openFingers[1] &&
          !openFingers[2] &&
          !openFingers[3] &&
          openFingers[4]
        )
          applyHand(0);

        if (
          openFingers[0] &&
          !openFingers[1] &&
          !openFingers[2] &&
          !openFingers[3] &&
          !openFingers[4]
        )
          applyHand(1);

        if (
          openFingers[0] &&
          openFingers[1] &&
          !openFingers[2] &&
          !openFingers[3] &&
          !openFingers[4]
        )
          applyHand(2);

        if (
          openFingers[0] &&
          openFingers[1] &&
          openFingers[2] &&
          !openFingers[3] &&
          !openFingers[4]
        )
          applyHand(3);

        // verify palm rotation
        if (lastPalmX === null || lastPalmY === null) {
          lastPalmX = lms[0].x;
          lastPalmY = lms[0].y;
        } else {
          if (
            openFingers[0] &&
            openFingers[1] &&
            openFingers[2] &&
            openFingers[3]
          ) {
            // set horizontal rotation
            if (lms[0].x - lastPalmX < 0.1 && lms[0].x - lastPalmX > -0.1) {
              dispatch(setHorizontalRotation(lastPalmX - lms[0].x));
            }

            // set vertical rotation
            if (lms[0].y - lastPalmY < 0.1 && lms[0].y - lastPalmY > -0.1) {
              dispatch(setVerticalRotation(lastPalmY - lms[0].y));
            }

            lastPalmX = lms[0].x;
            lastPalmY = lms[0].y;
          }
        }

        // draw hand landmarks and lines
        drawConnectors(ctx, lms, HAND_CONNECTIONS, {
          color: "#00ffff",
          lineWidth: 0.5,
        });

        drawLandmarks(ctx, lms, {
          color: "#ffff29",
          lineWidth: 0.1,
        });
      }

      ctx.restore();
    }
  }

  // load hand medidapipe model
  const loadHands = () => {
    if (!hands.current) {
      hands.current = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });
      hands.current.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      hands.current.onResults(processHands);
    }
  };

  useEffect(() => {
    // start camera and capture frames
    async function initCamara() {
      camera.current = new Camera(videoElement.current, {
        onFrame: async () => {
          await hands.current.send({ image: videoElement.current });
        },
        width: maxVideoWidth,
        height: maxVideoHeight,
      });
      camera.current.start();
    }

    initCamara();
    loadHands();
  });

  return { maxVideoHeight, maxVideoWidth, canvasEl, videoElement };
}

export default RecognitionHook;
