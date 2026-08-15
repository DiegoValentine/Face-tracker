import {
    HandLandmarker,
    FilesetResolver
}
from
"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22";


const video =
    document.getElementById("video");

const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");

const button =
    document.getElementById("start");

const status =
    document.getElementById("status");


let detector = null;

let cameraLigada = false;


/*
========================================
INICIAR DETECTOR
========================================
*/

async function iniciarDetector() {

    try {

        status.textContent =
            "Carregando detector da mão...";


        const vision =
            await FilesetResolver
                .forVisionTasks(

                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"

                );


        detector =
            await HandLandmarker
                .createFromOptions(

                    vision,

                    {

                        baseOptions: {

                            modelAssetPath:

                                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",

                            delegate: "GPU"

                        },

                        runningMode: "VIDEO",

                        numHands: 1

                    }

                );


        status.textContent =
            "Detector carregado!";


        iniciarCamera();

    }

    catch (erro) {

        console.error(erro);

        status.textContent =
            "Erro ao carregar detector.";

    }

}


/*
========================================
INICIAR CÂMERA
========================================
*/

async function iniciarCamera() {

    try {

        const stream =
            await navigator
                .mediaDevices
                .getUserMedia({

                    video: {

                        facingMode: "user",

                        width: {
                            ideal: 640
                        },

                        height: {
                            ideal: 480
                        }

                    },

                    audio: false

                });


        video.srcObject =
            stream;

        cameraLigada =
            true;


        status.textContent =
            "Câmera funcionando!";


        video.onloadeddata =
            function () {

                canvas.width =
                    video.videoWidth;

                canvas.height =
                    video.videoHeight;

                rastrear();

            };

    }

    catch (erro) {

        console.error(erro);

        status.textContent =
            "Erro ao acessar câmera.";

    }

}


/*
========================================
RASTREAMENTO
========================================
*/

function rastrear() {

    if (

        detector === null ||

        video.readyState < 2

    ) {

        requestAnimationFrame(
            rastrear
        );

        return;

    }


    const tempo =
        performance.now();


    const resultado =
        detector.detectForVideo(

            video,

            tempo

        );


    ctx.clearRect(

        0,
        0,

        canvas.width,
        canvas.height

    );


    if (

        resultado.landmarks &&

        resultado.landmarks.length > 0

    ) {

        const mao =
            resultado.landmarks[0];


        desenharMao(mao);


        status.textContent =
            "Mão detectada!";

    }

    else {

        status.textContent =
            "Procurando mão...";

    }


    requestAnimationFrame(
        rastrear
    );

}


/*
========================================
DESENHAR MÃO
========================================
*/

function desenharMao(mao) {


    const conexoes = [

        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],

        [0, 5],
        [5, 6],
        [6, 7],
        [7, 8],

        [5, 9],
        [9, 10],
        [10, 11],
        [11, 12],

        [9, 13],
        [13, 14],
        [14, 15],
        [15, 16],

        [13, 17],
        [17, 18],
        [18, 19],
        [19, 20],

        [0, 17]

    ];


    /*
    LINHAS
    */

    ctx.strokeStyle =
        "#00ff66";

    ctx.lineWidth = 3;


    for (
        const conexao
        of conexoes
    ) {

        const pontoA =
            mao[conexao[0]];

        const pontoB =
            mao[conexao[1]];


        const x1 =
            pontoA.x *
            canvas.width;

        const y1 =
            pontoA.y *
            canvas.height;

        const x2 =
            pontoB.x *
            canvas.width;

        const y2 =
            pontoB.y *
            canvas.height;


        ctx.beginPath();

        ctx.moveTo(
            x1,
            y1
        );

        ctx.lineTo(
            x2,
            y2
        );

        ctx.stroke();

    }


    /*
    PONTOS
    */

    ctx.fillStyle =
        "#ff3333";


    for (
        const ponto
        of mao
    ) {

        const x =
            ponto.x *
            canvas.width;

        const y =
            ponto.y *
            canvas.height;


        ctx.beginPath();

        ctx.arc(

            x,
            y,

            5,

            0,
            Math.PI * 2

        );

        ctx.fill();

    }

}


/*
========================================
BOTÃO
========================================
*/

button.addEventListener(

    "click",

    function () {

        if (
            cameraLigada === false
        ) {

            iniciarDetector();

        }

    }

);