
let model, ctx, videoWidth, videoHeight, video, canvas;

async function setupCamera() {
    video = document.getElementById('video');

    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': { facingMode: 'user' },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}


const renderPrediction = async () => {

    const returnTensors = false;
    const flipHorizontal = true;
    const annotateBoxes = true;
    const predictions = await model.estimateFaces(
        video, returnTensors, flipHorizontal, annotateBoxes);

    if (predictions.length > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < predictions.length; i++) {
            if (returnTensors) {
                predictions[i].topLeft = predictions[i].topLeft.arraySync();
                predictions[i].bottomRight = predictions[i].bottomRight.arraySync();
                if (annotateBoxes) {
                    predictions[i].landmarks = predictions[i].landmarks.arraySync();
                }
            }

            const start = predictions[i].topLeft;
            const end = predictions[i].bottomRight;
            const size = [end[0] - start[0], end[1] - start[1]];
            let fDistancePer = ((start[0]-end[0])/300)*100;
            document.getElementById('fDistancePer').innerHTML = fDistancePer;
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.fillRect(start[0], start[1], size[0], size[1]);

            if (annotateBoxes) {
                const landmarks = predictions[i].landmarks;
                console.log("Landmarks:", predictions[i].landmarks);

                ctx.fillStyle = "blue";
                for (let j = 0; j < landmarks.length; j++) {
                    const x = landmarks[j][0];
                    const y = landmarks[j][1];
                    ctx.fillRect(x, y, 5, 5);
                    let eyeDistance = landmarks[0][0] - landmarks[1][0];

                    let eyeDistancePer = (eyeDistance/150)*100;
                    if(eyeDistancePer <= 42 || fDistancePer <= 50){
                        document.getElementById('vStatus').style.color = 'red';
                        document.getElementById('vStatus').innerHTML = 'Not Looking';
                        document.getElementById('lStatus').style.color = 'red';
                        document.getElementById('lStatus').innerHTML = 'Not Listening';
                    }
                    else{
                        document.getElementById('vStatus').style.color = 'green';
                        document.getElementById('vStatus').innerHTML = 'Looking';
                        document.getElementById('lStatus').style.color = 'green';
                        document.getElementById('lStatus').innerHTML = 'Listening';
                    }

                    document.getElementById('iDistancePer').innerHTML = eyeDistancePer;

                    switch (j) {
                        case 0:
                            document.getElementById('ri-x').innerHTML = x;
                            document.getElementById('ri-y').innerHTML = y;
                            document.getElementById('ri-y').innerHTML = y;
                            break;
                        case 1:
                            document.getElementById('li-x').innerHTML = x;
                            document.getElementById('li-y').innerHTML = y;
                            break;
                        case 2:
                            document.getElementById('n-x').innerHTML = x;
                            document.getElementById('n-y').innerHTML = y;
                            break;
                        case 3:
                            document.getElementById('m-x').innerHTML = x;
                            document.getElementById('m-y').innerHTML = y;
                            break;
                        case 4:
                            document.getElementById('re-x').innerHTML = x;
                            document.getElementById('re-y').innerHTML = y;
                            break;
                        case 5:
                            document.getElementById('le-x').innerHTML = x;
                            document.getElementById('le-y').innerHTML = y;
                            break;
                        default:
                            break;
                    }

                }
            }
        }
    }


    requestAnimationFrame(renderPrediction);
};


const setupPage = async () => {
    await tf.setBackend('webgl');
    await setupCamera();
    video.play();

    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    video.width = videoWidth;
    video.height = videoHeight;

    canvas = document.getElementById('output');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";

    model = await blazeface.load();

    renderPrediction();
};


window.onload = async () => {
    setupPage();
};



async function main() {
    // Load the model.
    const model = await blazeface.load();

    // Pass in an image or video to the model. The model returns an array of
    // bounding boxes, probabilities, and landmarks, one for each detected face.
    let video = document.getElementById('myVid');

    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': { facingMode: 'user' },
    });
    video.srcObject = stream;

    const returnTensors = false; // Pass in `true` to get tensors back, rather than values.
    const predictions = await model.estimateFaces(video, returnTensors);

    if (predictions.length > 0) {
        /*
        `predictions` is an array of objects describing each detected face, for example:

        [
          {
            topLeft: [232.28, 145.26],
            bottomRight: [449.75, 308.36],
            probability: [0.998],
            landmarks: [
              [295.13, 177.64], // right eye
              [382.32, 175.56], // left eye
              [341.18, 205.03], // nose
              [345.12, 250.61], // mouth
              [252.76, 211.37], // right ear
              [431.20, 204.93] // left ear
            ]
          }
        ]
        */

        for (let i = 0; i < predictions.length; i++) {
            const start = predictions[i].topLeft;
            const end = predictions[i].bottomRight;
            const size = [end[0] - start[0], end[1] - start[1]];

            // Render a rectangle over each detected face.
            ctx.fillRect(start[0], start[1], size[0], size[1]);
        }
    }
}




