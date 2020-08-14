
let model, ctx, videoWidth, videoHeight, video;
let timer = false;
let recognition = new webkitSpeechRecognition();
let looking = false;

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-us";


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
        // ctx.clearRect(0, 0, canvas.width, canvas.height);

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
            // ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            // ctx.fillRect(start[0], start[1], size[0], size[1]);


            if (annotateBoxes) {
                const landmarks = predictions[i].landmarks;
                //console.log("Landmarks:", predictions[i].landmarks);

                // ctx.fillStyle = "blue";
                for (let j = 0; j < landmarks.length; j++) {
                    const x = landmarks[j][0];
                    const y = landmarks[j][1];
                    // ctx.fillRect(x, y, 5, 5);
                    let eyeDistance = landmarks[0][0] - landmarks[1][0];

                    let eyeDistancePer = (eyeDistance/150)*100;
                    if(eyeDistancePer <= 42 || fDistancePer <= 50){
                        document.getElementById('vStatus').style.color = 'red';
                        document.getElementById('vStatus').innerHTML = 'Not Looking';
                        document.getElementById('lStatus').style.color = 'red';
                        document.getElementById('lStatus').innerHTML = 'Not Listening';
                        looking = false;
                    }
                    else{
                        looking = true;
                        document.getElementById('vStatus').style.color = 'green';
                        document.getElementById('vStatus').innerHTML = 'Looking';
                        document.getElementById('lStatus').style.color = 'green';
                        document.getElementById('lStatus').innerHTML = 'Listening';
                        clearTimeout(timeout);
                        if(!timer){
                            sayText('Hello, welcome to santa fe court',1,1,1);
                            timer = true;
                            console.log("TIMER:", timer);
                        }
                        timeout = setTimeout(()=>{ timer = false; console.log("Timer: ", timer) }, 15000);
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

                            let cX = video.videoWidth/2;
                            let cY = video.videoHeight/2;
                            let offX = x-cX;
                            let offY = y-cY;
                            let rad = (Math.atan2(offY, offX) + 450 ) % 360;
                            let deg = (rad * 180) / Math.PI;

                            document.getElementById('angle').innerHTML = Math.floor(deg);

                            if(deg >= 4950 || deg <=5150){
                                continue;
                            }
                            else{
                                setGaze(Math.floor(deg),1);
                            }
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

    // canvas = document.getElementById('output');
    // canvas.width = videoWidth;
    // canvas.height = videoHeight;
    // ctx = canvas.getContext('2d');
    // ctx.fillStyle = "rgba(255, 0, 0, 0.5)";

    model = await blazeface.load();

    renderPrediction();
};

let startRec = function(){
    try{
        recognition.stop();
        recognition.start();
        console.log("Recognation Started");
    }
    catch (e) {
        console.log(e.message);
    }
};

let stopRec = function(){
    try{
        recognition.abort();
        recognition.stop();
        console.log("Recognation ended");
    }
    catch (e) {
        console.log(e.message);
    }
    finally {
        recognition.stop();
    }
};


recognition.onend = function(){
    startRec();
    // if(!clientApp.avatar.isTalking){
    //     startRec();
    //     console.log("Speech recognation =  ONEND REC START");
    // }
    // else{
    //     console.log("Speech recognation =  ONEND REC NOT TRIGGERED");
    // }
};

recognition.onresult = function(event){
    let transcript = event.results[event.results.length - 1][0].transcript;
    let spResult = event.results[event.resultIndex];

    if(looking){
        if(spResult.isFinal){

        }
        document.getElementById('sText').innerHTML = transcript;
    }
};


window.onload = async () => {
    setupPage();
    startRec();
};






