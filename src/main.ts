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

function hasUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if (hasUserMedia()) {
    enableWebcamButton.setAttribute('enabled', 'true');
    enableWebcamButton.addEventListener('click', enableWebcam);
} else {
    console.warn('getUserMedia is not supported on this device');
}

function enableWebcam() {
    if (webcamRunning) {
        webcamRunning = false;
    }
}
