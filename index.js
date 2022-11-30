// ON LOAD
window.onload = function () {
    window.mode = true;

    window.modelUrl = 'https://raw.githubusercontent.com/Alok-Chudasama/model/main/model.json'

    window.model = await tf.loadGraphModel('https://raw.githubusercontent.com/Alok-Chudasama/model/main/model.json');
    
    consel.log(model);
    
    window.canvas = document.getElementById('snapshot');
    window.ctx = canvas.getContext('2d');

    window.canvasPlate = document.getElementById('cropPlate');
    window.ctxPlate = canvasPlate.getContext('2d');

    window.canvasPhoto = document.getElementById('snapshot1');
    window.ctxPhoto = canvasPhoto.getContext('2d');

    window.modeCanvas = document.getElementById("snapshot1");
    window.modePhoto = document.getElementById("imageView");
    window.answer = document.getElementById("numberPlate");

    modeCanvas.remove();
    modePhoto.remove();
    answer.remove();

    photoMode();
};

// IMAGE
document.getElementById("FileAttachment").onchange = function () {
    document.getElementById("fileuploadurl").value = this.value;
};

document.getElementById("FileAttachment").onchange = function () {
    $("img").fadeIn("fast").attr('src', URL.createObjectURL(event.target.files[0]));
};

// $('#FileAttachment').change(function (event) {
//     $("img").fadeIn("fast").attr('src', URL.createObjectURL(event.target.files[0]));
// });


// CAMERA 
var stop = function () {
    var stream = video.srcObject;
    var tracks = stream.getTracks();
    for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        track.stop();
    }
    // video.srcObject = null;
}
var start = function () {
    var video = document.getElementById('video'),
        vendorUrl = window.URL || window.webkitURL;
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
            }).catch(function (error) {
                console.log("Something went wrong!");
            });
    }
}


var player = document.getElementById('video');
var captureButton = document.getElementById('capture');

var handleSuccess = function (stream) {
    // Attach the video stream to the video element and autoplay.
    player.srcObject = stream;
};

captureButton.addEventListener('click', function () {
    // var context = snapshot.getContext('2d');
    // Draw the video frame to the canvas.
    ctxPhoto.drawImage(player, 0, 0, canvasPhoto.width, canvasPhoto.height);
    // console.log(context.canvas.toDataURL());
});

navigator.mediaDevices.getUserMedia({ video: true }).then(handleSuccess);


// SWITCH CODE
function photoMode() {
    mode = true;
    let photo = document.getElementById("container1");
    let camera = document.getElementById("container2");

    modeCanvas.remove();
    answer.remove();
    document.getElementById("container3").appendChild(modePhoto);
    document.getElementById("container3").appendChild(answer);

    photo.style.visibility = "visible";
    camera.style.visibility = "hidden";

    document.getElementById("UP").style.color = "#9AA4EC";
    document.getElementById("UP").style.backgroundColor = "#F9FAF4";

    document.getElementById("UC").style.color = "#F9FAF4";
    document.getElementById("UC").style.backgroundColor = "#9AA4EC";


}

function cameraMode() {
    start();
    mode = false;

    let photo = document.getElementById("container1");
    let camera = document.getElementById("container2");

    modePhoto.remove();
    answer.remove();
    document.getElementById("container3").appendChild(modeCanvas);
    document.getElementById("container3").appendChild(answer);

    photo.style.visibility = "hidden";
    camera.style.visibility = "visible";

    document.getElementById("UC").style.color = "#9AA4EC";
    document.getElementById("UC").style.backgroundColor = "#F9FAF4";

    document.getElementById("UP").style.color = "#F9FAF4";
    document.getElementById("UP").style.backgroundColor = "#9AA4EC";
}



// CODE
// async function load_model() {
//     let m = await tf.loadGraphModel('https://raw.githubusercontent.com/Alok-Chudasama/model/main/model.json')
//     return m;
// }
// let model = load_model();

async function getNumber() {

    const modelUrl = 'https://raw.githubusercontent.com/Alok-Chudasama/model/main/model.json'

    const model = await tf.loadGraphModel('https://raw.githubusercontent.com/Alok-Chudasama/model/main/model.json');

    // const zeros = tf.zeros([1, 224, 224, 3]);
    // model.predict(zeros).print();
    // console.log(model);

    let input_tensor
    if (mode) {
        input_tensor = tf.browser.fromPixels(document.getElementById("imageView"));
    } else {
        window.image = ctxPhoto.getImageData(0, 0, canvasPhoto.width, canvasPhoto.height);
        console.log(image);
        input_tensor = tf.browser.fromPixels(image);
        console.log(input_tensor);
    }

    // console.log(input_tensor)    
    window.pred = await model.executeAsync(input_tensor.expandDims(0));
    // console.log(pred[1].dataSync());


    const thresHold = 0.75;
    // detection scores 1
    const scores = pred[1].arraySync();
    // detection boxes 6
    const boxes = pred[6].arraySync();
    // detection classes 0
    const classes = pred[0].dataSync();

    let classDir = {
        1: {
            name: "licence",
            id: 1,
        }
    }

    // buildDetectedObjects(scores, thresHold, boxes, classes, classDir);
    window.detectionObject = buildDetectedObjects(scores, thresHold, boxes, classes, classDir);
    console.log(detectionObject);

    fill_canvas();


    // let x1 = detectionObject[0]['bbox'][0];
    // let y1 = detectionObject[0]['bbox'][1];
    // let x2 = detectionObject[0]['bbox'][2];
    // let y2 = detectionObject[0]['bbox'][3];

    window.x1 = detectionObject[0]['bbox'][0];
    window.y1 = detectionObject[0]['bbox'][1];
    window.x2 = detectionObject[0]['bbox'][2];
    window.y2 = detectionObject[0]['bbox'][3];

    // drawRect(detectionObject[0]['bbox'][0], detectionObject[0]['bbox'][1], detectionObject[0]['bbox'][2], detectionObject[0]['bbox'][3]);
    drawRect(x1, y1, x2, y2);

    if (mode) {
        var imageView = document.getElementById("imageView");
    } else {
        var imageView = document.getElementById("snapshot1");
    }

    // contex.drawImage(canImage, detectionObject[0]['bbox'][0], detectionObject[0]['bbox'][1], detectionObject[0]['bbox'][2], detectionObject[0]['bbox'][3]);


    canvasPlate.width = imageView.width;
    canvasPlate.height = imageView.height;
    // ctxPlate.drawImage(imageView, detectionObject[0]['bbox'][0], detectionObject[0]['bbox'][1], detectionObject[0]['bbox'][2], detectionObject[0]['bbox'][3], 0, 0, imageView.width, imageView.height);
    // ctxPlate.drawImage(imageView, x1, y1, x2, y2, 0, 0, imageView.width, imageView.height);

    canvasPlate.width = x2;
    canvasPlate.height = y2;

    ctxPlate.drawImage(imageView, x1, y1, x2, y2, 0, 0, x2, y2);

    // console.log(ctxPlate.width + " " + ctxPlate.height)

    let ww = document.getElementById("cropPlate").width;
    let hh = document.getElementById("cropPlate").height;


    const img = document.getElementById('cropPlate');
    img.src = canvasPlate.toDataURL(document.getElementById("cropPlate"));
    runOCR(img.src);
}

function runOCR(url) {
    const worker = new Tesseract.TesseractWorker();
    worker.recognize(url).then(function (result) {
        console.log(result.text);
        document.getElementById('numberPlate').innerHTML = result.text;
    }).progress(function (result) {
        document.getElementById('numberPlate').innerHTML = result["status"] + " (" + (result["progress"] * 100) + "%)";
        console.log(result["status"] + " (" + (result["progress"] * 100) + "%)");
        // document.getElementById("ocr_status").innerText = result["status"] + " (" +(result["progress"] * 100) + "%)";
    });
}

function buildDetectedObjects(scores, threshold, boxes, classes, classesDir) {
    const detectionObjects = [];
    if (mode) {
        var video_frame = document.getElementById('imageView');
        console.log(video_frame);
    } else {
        var video_frame = document.getElementById('snapshot1');
        console.log(video_frame);
    }

    scores[0].forEach((score, i) => {
        if (score > threshold) {
            const bbox = [];
            const minY = boxes[0][i][0] * video_frame.offsetHeight;
            const minX = boxes[0][i][1] * video_frame.offsetWidth;
            const maxY = boxes[0][i][2] * video_frame.offsetHeight;
            const maxX = boxes[0][i][3] * video_frame.offsetWidth;
            bbox[0] = minX;
            bbox[1] = minY;
            bbox[2] = maxX - minX;
            bbox[3] = maxY - minY;
            detectionObjects.push({
                class: classes[i],
                label: classesDir[classes[i]].name,
                score: score.toFixed(4),
                bbox: bbox
            })
        }
    })
    return detectionObjects
}


function fill_canvas() {
    // CREATE CANVAS CONTEXT.

    var img = new Image();
    if (mode) {
        img.src = document.getElementById("imageView").src;
    } else {
        let x = document.getElementById("snapshot1");
        canvas.width = x.width;
        canvas.height = x.height;
        ctx.drawImage(x, 0, 0);
        return;
        // img.src = ctxPhoto.canvas.toDataURL();
    }

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);       // DRAW THE IMAGE TO THE CANVAS.
}

function drawRect(x1, x2, y1, y2) {
    ctx.beginPath();
    ctx.lineWidth = "3";
    ctx.strokeStyle = "red";
    ctx.rect(x1, x2, y1, y2);
    ctx.stroke();
}


function drawCirc(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.stroke();
}

async function getImage() {
    var img = new Image();
    img.src = document.getElementById("imageView").src;
    img.onload = () => {
        var output = tf.browser.fromPixels(img);
        console.log(output);
        return output;
    }
}
