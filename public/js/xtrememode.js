let googleUserId;
// Client ID and API key from the Developer Console
var CLIENT_ID = '185013042583-6qagtpd0mcqmlpejkq041gs930r17sao.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDJxECjrZxTpk4klp-irf8h2pxTqp6ngmQ';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
/**
 *  On load, called to load the auth2 library and API client library.
 */

const video = document.getElementById('video');

let count = 0;
const allowedSeconds = 5;
const refreshRate = 100;

function initClient() {
    gapi.auth.authorize({
        client_id: CLIENT_ID,
        scope: SCOPES,
        immediate: true
    }, function (authResult) {
    })
}

window.onload = (event) => {
    // Use this to retain user state between html pages.
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            gapi.load('client:auth2', initClient);
            console.log('Logged in as: ' + user.displayName);
            googleUserId = user.uid;

        } else {
            // If not logged in, navigate back to login page.
            window.location = 'index.html';
        };
    });
};

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
  faceapi.matchDimensions(canvas, displaySize);

  dragElement(canvas, video);

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




function dragElement(elmnt, secondaryElement) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

    secondaryElement.style.top = (elmnt.offsetTop - pos2) + "px";
    secondaryElement.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}