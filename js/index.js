import { ScrollImageInfo, ParallaxImageScroll, LoadingScreen } from "./parallax.js";

let loadingScreen;

onload = (() => {
    new ParallaxImageScroll(
        new ScrollImageInfo(120, 15, "./sequence/image_NUMBER.png"),
        function() {
            loadingScreen = new LoadingScreen(1000);
            document.body.append(loadingScreen.returnElement());
        },
        () => loadingScreen.stateVisible(false)
    );
});