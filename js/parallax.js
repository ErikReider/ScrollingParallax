export class ParallaxImageScroll {
    /**
     * @param {ScrollImageInfo} scrollImageInfo The image information Object
     * @param {HTMLDivElement} parentElement The element to attach the canvas to
     * @param {Function} onLoadingStart Callback for when the caching of the images has started
     * @param {Function} onLoadingFinished Callback for when the caching of the images has finished
     * @param {HTMLElement} scrollEventParent The Element to attach a scroll event listener to. Usually it's window
     * @param {Boolean} scrollTop Whether to scroll to the top of the screen after caching or not
     */
    constructor(scrollImageInfo, onLoadingStart, onLoadingFinished, parentElement = null, scrollEventParent = window, scrollTop = true) {
        this.scrollPos = 0;
        this.listOfImages = [];
        this.listOfImagePromises = [];
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");


        if (parentElement != null) {
            this.parent = parentElement;
        } else {
            this.parent = document.createElement("div");
            document.body.appendChild(this.parent);
        }
        this.imageInfo = scrollImageInfo;


        this.parent.append(this.canvas);
        this.parent.style.width = document.body.clientWidth;
        this.parent.style.position = "relative";

        this.canvas.width = document.body.clientWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.position = "sticky";
        this.canvas.style.position = "-webkit-sticky";
        this.canvas.style.position = "-moz-sticky";
        this.canvas.style.position = "-ms-sticky";
        this.canvas.style.position = "-o-sticky";
        this.canvas.style.top = 0;


        onLoadingStart.call();

        for (let index = 1, len = this.imageInfo.frames + 1; index < len; index++) {
            this.listOfImagePromises.push(
                new Promise((resolve) => {
                    let image = new Image();
                    image.src = this.imageInfo.fullPath.replace("NUMBER", index);
                    this.listOfImages.push(image);
                    image.onload = (() => { resolve(true); });
                })
            );
        }

        this.onScroll = () => {
            let scroll = parseInt(window.pageYOffsetx | window.scrollY);
            if (scroll <= this.parent.offsetTop || scroll >= this.parent.clientHeight + this.parent.offsetTop - window.innerHeight) return;
            this.scrollPos = Math.round((scroll - this.parent.offsetTop) / this.imageInfo.fps);
            this.raf();
        }

        this.onResize = () => {
            this.onScroll.call();
            this.parent.style.height = (this.imageInfo.frames * this.imageInfo.fps + window.innerHeight) + "px";

            let aspectRatio = this.listOfImages[0].height / this.listOfImages[0].width;
            for (let index = 0; index < this.listOfImages.length; index++) {
                let image = this.listOfImages[index];
                if (aspectRatio < 1) {
                    //wide
                    image.height = document.body.clientWidth * aspectRatio;
                    image.width = document.body.clientWidth;
                } else {
                    //tall
                    image.height = window.innerHeight;
                    image.width = window.innerHeight * aspectRatio;
                }
            }
            let fullHeight = window.innerHeight;
            let fullWidth = document.body.clientWidth;
            if (aspectRatio < 1) {
                //wide
                let height = fullWidth * aspectRatio;
                this.canvas.height = height;
                this.canvas.width = fullWidth - 2;
            } else {
                //tall
                this.canvas.height = fullHeight;
                this.canvas.width = fullWidth * aspectRatio;
                this.canvas.style.top = -(fullHeight - fullHeight) / 2 + "px";
            }
            this.raf();
        }

        Promise.all(this.listOfImagePromises).then(() => {
            onLoadingFinished.call();
            if (scrollTop) window.scrollTo(0, 0);
            this.parent.style.height = (this.imageInfo.frames * this.imageInfo.fps + window.innerHeight) + "px";
            this.onResize();
            scrollEventParent.addEventListener("scroll", this.onScroll);
        });

        scrollEventParent.addEventListener("resize", () => this.onResize());
    }

    raf = () => (window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame
    ).call(window, () => {
        if (this.scrollPos < 0 || isNaN(this.scrollPos)) this.scrollPos = 0;
        if (this.scrollPos > this.imageInfo.frames - 1) this.scrollPos = this.imageInfo.frames - 1;
        let image = this.listOfImages[this.scrollPos];
        this.context.drawImage(image, -(image.width - this.canvas.width) / 2, -(image.height - this.canvas.height) / 2, image.width, image.height);
    });
}

export class ScrollImageInfo {
    /**
     * @param {Number} frames The total amount of images in the sequence. If shorter than the full amount, the scroll height will be shorter
     * @param {Number} fps The fps of the original video
     * @param {String} fullPath The full path "/your_folder/NUMBER.jpg" (Has to be "NUMBER")
     */
    constructor(frames, fps, fullPath) {
        this.frames = frames;
        this.fps = fps;
        this.fullPath = fullPath;
    }
}

export class LoadingScreen {
    constructor(minTime) {
        if (!minTime || typeof (minTime) != typeof (69)) throw `MinTime is ${typeof (minTime)} and is not a Number`;
        let startTime = performance.now();
        document.body.style.overflow = "hidden";

        this.loadingScreen = document.createElement("div");
        this.loadingScreen.className = "loadingScreen";

        var loadingCircle = document.createElement("div");
        loadingCircle.className = "loadingCircle";

        this.loadingScreen.append(loadingCircle);

        this.stateVisible = (visible) => {
            let now = performance.now();
            if (visible) {
                this.show();
            } else {
                if (now - startTime < minTime) {
                    setTimeout(() => this.hide(), minTime - (now - startTime));
                } else {
                    this.hide();
                }
            }
        };
    }

    hide() {
        this.loadingScreen.style.display = "none";
        document.body.style.overflow = "visible";
    }

    show() {
        this.loadingScreen.style.display = "block";
        document.body.style.overflow = "hidden";
    }

    returnElement = () => this.loadingScreen;

}