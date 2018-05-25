function buildVideoFaceDetector(outputCanvas){

  let video = null;
  let videoHeight = 480
  let videoWidth = 640
  let stream = null;

  let cap = null
  let faceCascade = null;
  let src = null;
  let gray = null;

  let isNeedCaptureFace = false;
  let captureFaceOutputCanvas = null;

  init();


  function init(){
    console.log('cv.C')
    console.log(cv)
    console.log(cv.CascadeClassifier)

    faceCascade = new cv.CascadeClassifier();
    faceCascade.load("face.xml")

                
    video = document.createElement('video') 
    video.height = videoHeight;
    video.width = videoWidth;


    cap = new cv.VideoCapture(video)
    src = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
    gray = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC1);
  }

  function detectFace() {
    let startTime = Date.now();

    // Capture a frame
    cap.read(src)

    // Convert to greyscale 灰度
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);


    // Downsample 下采样，减少矩阵
    let downSampled = new cv.Mat();
    cv.pyrDown(gray, downSampled);
    cv.pyrDown(downSampled, downSampled);

    // Detect faces
    let faces = new cv.RectVector();
    faceCascade.detectMultiScale(downSampled, faces)

    // Draw boxes
    let size = downSampled.size();
    let xRatio = videoWidth / size.width;
    let yRatio = videoHeight / size.height;
    for (let i = 0; i < faces.size(); ++i) {
        let face = faces.get(i);
        let point1 = new cv.Point(face.x * xRatio, face.y * yRatio);
        let point2 = new cv.Point((face.x + face.width) * xRatio, (face.y + face.height) * xRatio);
        cv.rectangle(src, point1, point2, [255, 0, 0, 255])

        if(isNeedCaptureFace){
          let clipRect = new cv.Rect(face.x * xRatio, face.y * yRatio, face.width * xRatio, face.height * yRatio);
          // let result = cv.imencode('png',src)
          let tempCanvas = document.createElement('canvas')
          tempCanvas.width = videoWidth;
          tempCanvas.height = videoHeight;
          let tempCanvasCtx = tempCanvas.getContext('2d')
          cv.imshow(tempCanvas, src);

          let imageData = tempCanvasCtx.getImageData(face.x * xRatio, face.y * yRatio, face.width * xRatio, face.height * yRatio)
          captureFaceOutputCanvas.getContext('2d').putImageData(imageData,0,0)

          // console.log(result)
          isNeedCaptureFace = false;
          // cv.imshow(captureFaceOutputCanvas, src)
          // cv.resetImageROI()
        }
        

        let endTime = Date.now();
        let diffTime = endTime - startTime;
        let fps = parseInt(1000 / diffTime);

        cv.putText(src, `${diffTime} ms, ${fps} fps`, new cv.Point(50,50), cv.FONT_HERSHEY_SIMPLEX, 1, [0,0,255,1])
    }
    // Free memory
    downSampled.delete()
    faces.delete()

    // Show image
    cv.imshow(outputCanvas, src)

    let endTime = Date.now();
    let diffTime = endTime - startTime;
    let fps = parseInt(1000 / diffTime);
    // info.innerHTML = `${diffTime} ms, ${fps} fps`

    requestAnimationFrame(detectFace)
  }

  async function startCamera(){
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
          width: {
              exact: videoWidth
          },
          height: {
              exact: videoHeight
          }
      },
      audio: false
    })
    video.srcObject = stream;
    video.play();
  }

  

  return {
    startDetect(){
      startCamera()
      requestAnimationFrame(detectFace)
    },
    stopDetect(){
      if(stream.getTracks && stream.getTracks()[0]){
        stream.getTracks()[0].stop();
      }
    },
    captureImage(canvas){
      if(src){
        cv.imshow(canvas, src)
      }
    },
    captureFace(canvas){
      isNeedCaptureFace = true;
      captureFaceOutputCanvas = canvas;
    }

  }
}

export default buildVideoFaceDetector


