const videoElement = document.getElementById("video");
const canvas = document.getElementById("canvas");

const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const blurBtn = document.getElementById("blur-btn");
const unblurBtn = document.getElementById("unblur-btn");

const ctx = canvas.getContext("2d");

startBtn.addEventListener("click", (e) => {
  startBtn.disabled = true;
  stopBtn.disabled = false;

  unblurBtn.disabled = false;
  blurBtn.disabled = false;

  startVideoStream();
});

stopBtn.addEventListener("click", (e) => {
  startBtn.disabled = false;
  stopBtn.disabled = true;

  unblurBtn.disabled = true;
  blurBtn.disabled = true;

  unblurBtn.hidden = true;
  blurBtn.hidden = false;

  videoElement.hidden = false;
  canvas.hidden = true;

  stopVideoStream();
});

blurBtn.addEventListener("click", (e) => {
  blurBtn.hidden = true;
  unblurBtn.hidden = false;

  videoElement.hidden = true;
  canvas.hidden = false;

  loadBodyPix();
});

unblurBtn.addEventListener("click", (e) => {
  blurBtn.hidden = false;
  unblurBtn.hidden = true;

  videoElement.hidden = false;
  canvas.hidden = true;
});

videoElement.onplaying = () => {
  canvas.height = videoElement.videoHeight;
  canvas.width = videoElement.videoWidth;
};

var isMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function () {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function () {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function () {
    return (
      navigator.userAgent.match(/IEMobile/i) ||
      navigator.userAgent.match(/WPDesktop/i)
    );
  },
  any: function () {
    return (
      isMobile.Android() ||
      isMobile.BlackBerry() ||
      isMobile.iOS() ||
      isMobile.Opera() ||
      isMobile.Windows()
    );
  }
};
async function startVideoStream() {
  let params;
  if (!isMobile.any()) {
    alert("Desktop");
    var devices = await navigator.mediaDevices.enumerateDevices();
    let IriunDevice = devices.filter(
      (device) => device.label === "Iriun Webcam"
    )[0];
    params = { video: { deviceId: IriunDevice.deviceId }, audio: false };
  } else {
    alert("Mobile");

    params = { video: true, audio: false };
  }

  navigator.mediaDevices
    .getUserMedia(params)
    .then((stream) => {
      videoElement.srcObject = stream;
      videoElement.play();
    })
    .catch((err) => {
      startBtn.disabled = false;
      blurBtn.disabled = true;
      stopBtn.disabled = true;
      alert(`Following error occured: ${err}`);
    });
}

function stopVideoStream() {
  const stream = videoElement.srcObject;

  stream.getTracks().forEach((track) => track.stop());
  videoElement.srcObject = null;
}

function loadBodyPix() {
  options = {
    multiplier: 0.75,
    stride: 32,
    quantBytes: 4
  };
  bodyPix
    .load(options)
    .then((net) => perform(net))
    .catch((err) => console.log(err));
}

async function perform(net) {
  while (startBtn.disabled && blurBtn.hidden) {
    const segmentation = await net.segmentPerson(video);

    const backgroundBlurAmount = 6;
    const edgeBlurAmount = 2;
    const flipHorizontal = true;

    bodyPix.drawBokehEffect(
      canvas,
      videoElement,
      segmentation,
      backgroundBlurAmount,
      edgeBlurAmount,
      flipHorizontal
    );
  }
}
