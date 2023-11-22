// Start Scrollama
var main = document.querySelector("main");
var scrolly = main.querySelector("#scrolly");
var sticky = scrolly.querySelector(".sticky-thing");
var article = scrolly.querySelector("article");
var parts = article.querySelectorAll(".part");

var scroller2 = scrollama();

function handleStepEnter(response) {
    var el = response.element;

    // Remove 'is-active' class from all parts
    parts.forEach(part => part.classList.remove('is-active'));

    // Add 'is-active' class to the current part
    el.classList.add('is-active');

    // Update the graphic based on the current step
    // sticky.querySelector("p").innerText = el.dataset.step;

    // Dispatch the 'stepin' event
    const event = new CustomEvent('stepin', { detail: { direction: response.direction } });
    el.dispatchEvent(event);
}

function init() {
    scroller2
        .setup({
            step: "#scrolly article .part",
            offset: 0.50,
            debug: false
        })
        .onStepEnter(handleStepEnter)
        .onStepExit(function({ element, index, direction }) {
            const event = new CustomEvent('stepout', { detail: { direction: direction } });
            element.dispatchEvent(event);
        });

    window.addEventListener("resize", scroller2.resize);
}

init();