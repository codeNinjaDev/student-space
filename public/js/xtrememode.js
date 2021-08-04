const video = document.getElementById('video')

let count = 0;
const allowedSeconds = 5;
const refreshRate = 100;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
]).then(startVideo)

function startVideo() {
  navigator.mediaDevices.getUserMedia(
    { video: true }
  ).then(function(stream) {
	video.srcObject = stream;
}).catch(function(err) {
	console.log(err);
});
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());

    if (detections.length === 0) {
        count += refreshRate;
    } else {
        count = 0;
    }
    console.log(count);

    if (count > allowedSeconds * 1000) {
        alert("GET BACK TO WORK");
    }

    //console.log(detections);
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
  }, refreshRate)
})
