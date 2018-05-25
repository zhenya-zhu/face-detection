import buildVideoFaceDetector from './faceDetector.js'

window.Module = {
    locateFile: function (name) {
        console.log('locateFile')
        let files = {
            "opencv_js.wasm": '/scripts/opencv/opencv_js.wasm'
        }
        return files[name]
    },
    preRun: [() => {
        console.log('preRun')
        Module.FS_createPreloadedFile("/", "face.xml", "model/haarcascade_frontalface_default.xml",
            true, false);
    }],
    postRun: [
        run
    ],
    logReadFiles:true,
    
}

function run(){
    console.log('run')
    let detector = buildVideoFaceDetector(document.querySelector('#outputCanvas'))
    let imageCanvas = document.querySelector('#imageCanvas')
    detector.startDetect();
    
    document.querySelector('.start-btn').addEventListener('click',detector.startDetect)
    document.querySelector('.stop-btn').addEventListener('click',detector.stopDetect)
    document.querySelector('.capture-img')
        .addEventListener('click', ()=>detector.captureImage(imageCanvas))
    document.querySelector('.capture-face')
    .addEventListener('click', ()=>detector.captureFace(imageCanvas))
    
}

