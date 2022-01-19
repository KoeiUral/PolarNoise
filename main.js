const maxCanvasW = 800;
const maxCanvasH = 800;
const faces = 100;
const minWob = 45;
const maxWob = 55;
const minRad = 1.5;
const maxRad = 5;
const minNoise = 1;
const maxNoise = 50;

// Config variables default values
let monoChrome = false;
let coolness = false;
let centerX;
let centerY;
let bgColor = {r: 0, g:0, b:0};
let wobblersList = [];

// Helper function fro random numbers in a range
function randRange(minVal, maxVal) {
    return fxrand() * (maxVal - minVal) + minVal;
}

// Class that draw a Wobbler, i.e. a polygon figure blobbing over time
class Wobbler {
    constructor(x, y, maxR, faces) {
        this.posX = x;
        this.posY = y;
        this.delta = TWO_PI / faces;
        this.maxR = maxR;
        this.minR = maxR / 2;

        this.noiseMag = 0;
        this.phaseInc = 0;
        this.tInc = 0.01;
        this.t = 0;
        this.noisePhase = 0;
        this.seed = randRange(0, 100);
        this.alpha = randRange(50,255);
        this.stroke = floor(map(maxR, 10, width/2, 1, 4));

        if (monoChrome) {
            this.color = {r:255, g:255, b: 255};
        } else if (coolness) {
            this.color = {r:0, g:0, b: 0};
            this.alpha = randRange(10, 255);
            this.stroke = 1;
        }
        else {
            this.color = {r:randRange(0, 255), g:randRange(0, 255), b:randRange(0, 255)};
        }
    }

    setDynamics(rotInc, timeInc, noiseMag, radMag) {
        this.phaseInc = rotInc;
        this.tInc = timeInc;
        this.noiseMag = noiseMag;
        this.minR = this.maxR / radMag;
    }

    draw() {
        noiseSeed(this.seed);

        strokeWeight(this.stroke);
        stroke(this.color.r, this.color.g, this.color.b, this.alpha);
        noFill();

        beginShape();
        for (let a = 0; a < TWO_PI; a += this.delta) {
            let xOff = map(cos(a + this.noisePhase), -1, 1, 0, this.noiseMag);
            let yOff = map(sin(a + this.noisePhase), -1, 1, 0, this.noiseMag);
            let r = map(noise(xOff, yOff, this.t), 0, 1, this.minR, this.maxR);
            let x = cos(a) * r + this.posX;
            let y = sin(a) * r + this.posY;
            vertex(x, y);
        }
        endShape(CLOSE);

        this.noisePhase = (this.noisePhase + this.phaseInc) % TWO_PI;
        this.t += this.tInc;
    }
}

// Function to radially blur part of the canvas
function addCircularBlur(cx, cy, blurR) {
    let sqrSize = 50;
    let dnw = dist(0, 0, cx, cy);
    let dne = dist(width, 0, cx, cy);
    let dsw = dist(0, height, cx, cy);
    let dse = dist(width, height, cx, cy);
    let maxDist = max(dnw, dne, dsw, dse);

    for (let x = 0; x < width; x+=sqrSize) {
        for (let y = 0; y < height; y+=sqrSize) {
            if (pow((x - cx), 2) + pow((y - cy), 2) >= pow(blurR, 2)) {
                let d = dist(x, y, cx, cy);
                let blurValue = map(d, blurR, maxDist, 0.5, 2);
                sqrImage = get(x, y, sqrSize, sqrSize);
                sqrImage.filter(BLUR, blurValue);
                image(sqrImage, x, y, sqrSize, sqrSize);
            }
        }
    }
}

// Standard p5 function to center the canvas
function centerCanvas() {
    let x = (windowWidth - width) / 2;
    let y = (windowHeight - height) / 2;
    canvas.position(x, y);
}

// Standard p5 function to handle resize of the window the canvas
function windowResized() {
    let currentW = Math.min(maxCanvasW, windowWidth);
    let currentH = Math.min(maxCanvasH, windowHeight);

    resizeCanvas(currentW, currentH);
    centerCanvas();

    background(bgColor.r, bgColor.g, bgColor.b);
    for (let i = 0; i < wobblersList.length; i++) {
        wobblersList[i].draw();
    }
    addCircularBlur(centerX, centerY, width / 4);
}

function setup() {
    let wobbNumber = round(randRange(minWob, maxWob));
    let radAtt = randRange(minRad, maxRad);
    let noiseAtt = randRange(minNoise, maxNoise);
    let typeProbability = fxrand();

    if (typeProbability <= 0.3) {
        monoChrome = true;
    } else if (typeProbability <= 0.7) {
        coolness = true;
    } // else is with colors on black bg

    // Init the canvas, center and resize it
    canvas = createCanvas(maxCanvasW, maxCanvasH);
    canvas.style('display', 'block');
    centerCanvas();

    // if coolness active, then add more wobblers, cause more wobblers are more cool!
    if (coolness) {
      bgColor = {r: 251, g:240, b:210};
      wobbNumber += 50;
    } 
    
    background(bgColor.r, bgColor.g, bgColor.b);
    
    centerX = floor(randRange(width / 4,  3 * width / 4));
    centerY = floor(randRange(height / 4, 3 * height / 4));    
    let delta = width / wobbNumber;

    for (let i = 0; i < wobbNumber; i++) {
      let wobbler = new Wobbler(centerX, centerY, delta * i, faces);
      wobbler.setDynamics(0, 0, delta * i / noiseAtt, radAtt);
      wobbler.draw();

      wobblersList.push(wobbler);
    }
  
    addCircularBlur(centerX, centerY, width / 4);
    noLoop();
}

function draw() {
    // Nothing to do here, no animation :-(
}