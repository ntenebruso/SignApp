import { FilesetResolver, GestureRecognizer, DrawingUtils, GestureRecognizerResult } from "@mediapipe/tasks-vision";

const video = <HTMLVideoElement>document.getElementById('webcam');
const canvasElement = <HTMLCanvasElement>(
    document.getElementById('output-canvas')
);
const canvasCtx = canvasElement.getContext('2d');
const gestureOutput = <HTMLDivElement>document.getElementById('gesture-output');
const enableWebcamButton = <HTMLButtonElement>(
    document.getElementById('enable-webcam-btn')
);

let webcamRunning = false;

let gestureRecognizer: GestureRecognizer;
const videoWidth = "720px";
const videoHeight = "540px";

async function createGestureRecognizer() {
    const vision = await FilesetResolver.forVisionTasks("node_modules/@mediapipe/tasks-vision/wasm");
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
    });
    enableWebcamButton.innerText = "Enable webcam";
    enableWebcamButton.disabled = false;
}

createGestureRecognizer();

function hasUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if (hasUserMedia()) {
    enableWebcamButton.addEventListener('click', enableWebcam);
} else {
    console.warn('getUserMedia is not supported on this device');
}

function enableWebcam() {
    if (!webcamRunning) {
        webcamRunning = true;
        enableWebcamButton.innerText = "Disable predictions";
    } else {
        webcamRunning = false;
        enableWebcamButton.innerText = "Enable predictions";
    }

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", processVideo);
    })
}

let lastVideoTime = -1;
let result: GestureRecognizerResult;

function processVideo() {
    if (video.currentTime !== lastVideoTime) {
        result = gestureRecognizer.recognizeForVideo(video, video.currentTime);
        lastVideoTime = video.currentTime;
    }

    canvasCtx?.save();
    canvasCtx?.clearRect(0, 0, canvasElement.width, canvasElement.height);

    const drawingUtils = new DrawingUtils(canvasCtx!);

    canvasElement.style.width = videoWidth;
    video.style.width = videoWidth;
    canvasElement.style.height = videoHeight;
    video.style.height = videoHeight;

    if (result.landmarks.length > 0) {
        for (const landmarks of result.landmarks) {
            drawingUtils.drawLandmarks(landmarks, {
                color: "#FF0000",
                lineWidth: 2
            });
            drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
                color: "#00ff00",
                lineWidth: 5
            });
        }
    }

    canvasCtx?.restore();

    if (result.gestures.length > 0) {
        gestureOutput.style.display = "block";
        const gestureName = result.gestures[0][0].categoryName;
        const gestureScore = (result.gestures[0][0].score * 100).toFixed(2);
        gestureOutput.innerText = `Name: ${gestureName}\nScore: ${gestureScore}`;
    } else {
        gestureOutput.style.display = "none";
    }

    if (webcamRunning) {
        requestAnimationFrame(processVideo);
    }
}
