const WidgetEvent = {
  Resize: 'resize'
}

const Creative = {
  environment: "design-view",
};

const Widget = {
  properties: {
    starsMode: ["Animated", "Static", "Hidden"],
    starsQuantity: 160,
    starsColor: "#ffff9e",
    fieldWidth: 50,
    fieldHeight: 50,
    fieldX: 0,
    fieldY: 0,
    fieldRotation: 0,
  },

  on(event, callback) {
    window.removeEventListener(event, callback, false);
    window.addEventListener(event, callback, false);
  },

  ...getWrapperDimensions()
};

function getWrapperDimensions() {
  const wrapper = document.getElementById('wrapper');

  return {
    width: wrapper.offsetWidth,
    height: wrapper.offsetHeight
  }
}

class Star {
  x;
  y;
  size;
  image;
  imageType;
  ctx;

  willTwinkle = false;

  // progress values;
  currentPropgress;

  // star size
  minSize;
  maxSize;

  // twinkle effect size
  tImage;
  twinkleSize = 0;
  minTwinkleSize = 0;
  maxTwinkleSize;

  changeStep = Math.floor(minmax(1, 3));

  constructor(options) {
    // every big star will have a twinkle effect or 20% of small stars
    this.willTwinkle = options.imageType === "big" || Math.random() < 0.2;
    this.x = options.x;
    this.y = options.y;
    this.size = options.size;
    this.minSize = options.minSize;
    this.maxSize = options.maxSize;

    this.image = options.image;
    this.imageType = options.imageType;
    this.tImage = options.tImage;
    this.maxTwinkleSize = options.maxTwinkleSize;
    
    this.ctx = options.ctx;
    this.currentPropgress = minmax(0, 100);
  }

  update() {
    // do nothing if this star are not going to twinkle
    if (!this.willTwinkle) return;

    if (this.currentPropgress <= 0 || this.currentPropgress >= 100) {
      this.changeStep = -this.changeStep;
    }

    this.currentPropgress += this.changeStep;

    let p = this.currentPropgress / 100;

    this.size = lerp(this.minSize, this.maxSize, p);
    this.twinkleSize = lerp(this.minTwinkleSize, this.maxTwinkleSize, p);
  }

  draw() {
    this.ctx.drawImage(
      this.image,
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );

    this.ctx.drawImage(
      this.tImage,
      this.x - this.twinkleSize / 2,
      this.y - this.twinkleSize / 2,
      this.twinkleSize,
      this.twinkleSize
    );
  }
}

class Starfield {
  container = document.getElementById("stars-holder");
  canvas = document.getElementById("canvas");
  ctx = this.canvas.getContext("2d");

  stars = [];

  sizes = {
    small: {
      min: 5,
      max: 12,
    },
    big: {
      min: 45,
      max: 90,
    },
  };

  angles = {
    min: -90 * Math.PI / 180,
    max: 0,
  };

  imagesDataUrl = {
    small: "data:image/png;base64,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",
    big: "data:image/png;base64,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",
  };

  images = {
    small: null,
    big: null,
  };

  twinkleImage = null;

  starsQuantity;
  starsColor;

  w;
  h;
  left;
  top;
  rotation;

  mode;
  paused;

  raf;

  constructor(options) {
    this.starsQuantity = Math.max(0, options.starsQuantity);
    this.starsColor = options.starsColor;
    this.w = Math.max(1, options.fieldWidth) * 10;
    this.h = Math.max(1, options.fieldHeight) * 10;
    this.left = options.fieldX;
    this.top = options.fieldY;
    this.rotation = options.fieldRotation;

    this.mode = options.starsMode.toLowerCase();
    this.paused = true;

    this.createImages().then(() => {
      this.resize();
      this.setPosition();
      this.setRotation();
      this.setupResize();
      this.createStars();
      this.changeMode();
      this.render();
    });
  }

  async refreshSettings(options) {
    const width = Math.max(1, options.fieldWidth) * 10;
    const height = Math.max(1, options.fieldHeight) * 10;

    const top = options.fieldY;
    const left = options.fieldX;
    const rotation = options.fieldRotation;

    const quantity = Math.max(0, options.starsQuantity);
    const color = options.starsColor;

    const mode = options.starsMode.toLowerCase();

    const quantityChanged = quantity !== this.starsQuantity;

    const sizeChanged = width !== this.w || height !== this.h;

    const rotationChanged = rotation !== this.rotation;

    const positionChanged = left !== this.left || top !== this.top;

    const colorChanged = color !== this.starsColor;

    const modeChanged = mode !== this.mode;

    // refresh widget mode
    if (modeChanged) {
      this.mode = mode;

      this.changeMode();
    }

    // refresh position
    if (positionChanged) {
      this.left = left;
      this.top = top;
      this.setPosition();
    }

    // refresh roation
    if (rotationChanged) {
      this.rotation = rotation;
      this.setRotation();
    }

    // refresh stars color in case if it was changes
    if (colorChanged) {
      this.starsColor = color;

      await this.createImages();

      this.stars.forEach((star) => {
        star.image = this.images[star.imageType];
      });
    }

    // recreate stars in case if either quantity or canvas size was changed
    if (sizeChanged || quantityChanged) {
      if (sizeChanged) {
        this.resize();
        this.setPosition();
      }

      if (quantityChanged) {
        this.starsQuantity = quantity;
      }

      this.createStars();
    }

    this.render();

    if (Creative.environment === "design-view") {
      console.log(
        "%c Current starfield statement: \n",
        "color: green; font-weight: bold; text-shadow: 0 0 3px rgba(0,0,0, .2)",
        this
      );
    }
  }

  changeMode() {
    let mode = this.mode; // hidden or static or animated

    // show or hide the stars
    if (mode === "hidden") {
      this.container.style.display = "none";
    } else {
      this.container.style.display = "block";
    }

    // run or stop animation
    if (mode !== "animated") {
      this.stop();
    } else {
      this.play();
    }
  }

  resize() {
    this.w = Math.max(1, Widget.properties.fieldWidth) * 10;
    this.h = Math.max(1, Widget.properties.fieldHeight) * 10;
    this.canvas.width = this.w;
    this.canvas.height = this.h;

    this.container.style.width = `${this.w}px`;
    this.container.style.height = `${this.h}px`;
  }

  setupResize() {
    const onResize = () => {
      this.resize();
      this.createStars();
      this.setPosition();
      this.render();
    }

    Widget.on(WidgetEvent.Resize, onResize);
  }

  setPosition() {
    let top = (Widget.height / 2 - this.h / 2) + this.top;
    let left = this.left;

    this.container.style.left = `${left}px`;
    this.container.style.top = `${top}px`;
  }

  setRotation() {
    this.container.style.transform = `rotate(${this.rotation}deg)`;
  }

  createImages() {
    return Promise.all(
      Object.keys(this.imagesDataUrl).map((key) => {
        return new Promise((res) => {
          let image = new Image();

          image.onload = () => {
            // draw first image with color from settings
            let canvas = document.createElement("canvas");
            let ctx1 = canvas.getContext("2d");
            let w = (canvas.width = image.width);
            let h = (canvas.height = image.height);

            ctx1.drawImage(image, 0, 0, w, h);
            ctx1.globalCompositeOperation = "source-in";
            ctx1.fillStyle = this.starsColor;
            ctx1.fillRect(0, 0, w, h);
            ctx1.globalCompositeOperation = "source-over";

            // draw second image with white color in the center of the previous image
            let canvas2 = document.createElement("canvas");
            let ctx2 = canvas2.getContext("2d");
            let w2 = (canvas2.width = w / 2.5);
            let h2 = (canvas2.height = h / 2.5);
            ctx2.drawImage(image, 0, 0, w2, h2);
            ctx2.globalCompositeOperation = "source-in";
            ctx2.fillStyle = "white";
            ctx2.fillRect(0, 0, w2, h2);

            ctx1.drawImage(canvas2, w / 2 - w2 * 0.5, h / 2 - h2 * 0.5, w2, h2);
            this.images[key] = canvas;

            // create white image from big star for twinkle effect
            if (key === "big") {
              // refresh sizes
              w2 = canvas2.width = w;
              h2 = canvas2.height = h;
              //clear existing image
              ctx2.clearRect(0, 0, w2, h2);

              ctx2.drawImage(image, 0, 0, w2, h2);
              ctx2.globalCompositeOperation = "source-in";
              ctx2.fillStyle = "white";
              ctx2.fillRect(0, 0, w2, h2);

              this.twinkleImage = canvas2;
            }

            res("image created");
          };

          image.src = this.imagesDataUrl[key];
        });
      })
    );
  }

  removeStars() {
    this.stars = [];
  }

  createStars() {
    this.removeStars();

    for (let i = 0; i < this.starsQuantity; i++) {
      let imageType = Math.random() < 0.02 ? "big" : "small";

      // add atleast one big star in case if there is still no such a star
      if (i === this.starsQuantity - 1) {
        if (!this.stars.some(star => star.imageType === "big")) {
          imageType = "big";
        }
      }

      //calc size for star
      let size = minmax(this.sizes[imageType].min, this.sizes[imageType].max);

      // calc values for animation
      let minSize = size * 0.8;
      let maxSize = size * 1.2;
      let maxTwinkleSize = imageType === 'small' ? (maxSize * 2) : (maxSize / 2);
      
      // calculate half of the biggest available size to set proper offsets
      let halfSize = Math.max(maxSize, maxTwinkleSize) / 2;

      let ellipseCenter = {
        x: this.w,
        y: 0
      };

      // define max allowed radiuses according to the half of max size
      let horizontalRadius = this.w - halfSize;
      let verticalRadius = this.h - halfSize; 

      let minR1 = horizontalRadius * 0.5;
      let maxR1 = horizontalRadius;

      let minR2 = verticalRadius * 0.5;
      let maxR2 = verticalRadius;

      // define final radiuses
      horizontalRadius = minmax(minR1, maxR1); 
      verticalRadius = minmax(minR2, maxR2);

      // calcualte angle offset to avoid placing a star out of visible area
      let minAngleOffset = Math.asin(halfSize / verticalRadius);
      let maxAngleOffset = Math.asin(halfSize / horizontalRadius);
      
      // calculate final angle
      let minAngle = this.angles.min + minAngleOffset;
      let maxAngle = this.angles.max - maxAngleOffset;
      let angle = minmax(minAngle, maxAngle);

      // calculate x and y star coordinates depending on angle and radius
      let x = ellipseCenter.x + Math.sin(angle) * horizontalRadius;
      let y = ellipseCenter.y + Math.cos(angle) * verticalRadius;
      
      this.stars.push(
        new Star({
          image: this.images[imageType],
          imageType: imageType,
          tImage: this.twinkleImage,
          x,
          y,
          size,
          minSize,
          maxSize,
          maxTwinkleSize,
          ctx: this.ctx
        })
      );
    }
  }

  render() {
    this.clearCanvas();

    this.stars.forEach((star) => {
      star.draw();
      star.update();
    });

    window.cancelAnimationFrame(this.raf);

    if (!this.paused) {
      this.raf = window.requestAnimationFrame(this.render.bind(this));
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  play() {
    this.paused = false;
  }

  stop() {
    this.paused = true;
  }
}

//helpers
// returns a random value between min and max
function minmax(min, max) {
  return Math.random() * (max - min) + min;
}

// lerp returns the number between a and b depending on progress (t). t-parameter should be between 0 and 1;
function lerp(a, b, t) {
  return a * (1 - t) + b * t;
}

let starfield;

// do not copy to bannerflow
new GUISettings(
  Widget,
  () => {
    if (!starfield) {
      starfield = new Starfield(Widget.properties);
    }

    starfield.refreshSettings(Widget.properties);
  },
  true
);

function getBase64Image(url) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");

  const img = document.createElement("img");

  img.onload = () => {
    let w = (c.width = img.width);
    let h = (c.height = img.height);

    ctx.drawImage(img, 0, 0, w, h);

    console.log(url, ": ", c.toDataURL());
  };

  img.src = url;
}

// getBase64Image('../img/star-small(v2).png')
