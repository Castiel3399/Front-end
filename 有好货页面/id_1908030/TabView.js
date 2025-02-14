import { enableGesture } from "./gesture.js"

const PROPERTY_SYMBOL = Symbol("property"); 
const ATTRIBUTE_SYMBOL = Symbol("attribute");
const EVENT_SYMBOL = Symbol("event");
const STATE_SYMBOL = Symbol("state");

export default class TabView {
    constructor() {
        this[PROPERTY_SYMBOL] = Object.create(null);
        this[ATTRIBUTE_SYMBOL] = Object.create(null);
        this[EVENT_SYMBOL] = Object.create(null);
        this[STATE_SYMBOL] = Object.create(null);
        this[PROPERTY_SYMBOL].children = [];
        this[PROPERTY_SYMBOL].headers = [];
        this.created();
    }
    appendTo(element) {
        element.appendChild(this.root);
        this.mounted();
    }
    created() {
        this.root = document.createElement("div");
        // this.root.style.width = "300px";
        // this.root.style.height = "300px";
        this.root.style.display = "flex";
        this.headerContainer = document.createElement("div");
        this.contentContainer = document.createElement("div");
        this.contentContainer.style.whiteSpace = "nowrap";
        this.contentContainer.style.overflow = "hidden";
        this.contentContainer.style.flex = "1";
        this.contentContainer.style.height = "93px";
        this.root.appendChild(this.headerContainer);
        this.root.appendChild(this.contentContainer);

        enableGesture(this.contentContainer);
        this[STATE_SYMBOL].position = 0;

        this.root.addEventListener("touchmove", e => {
            e.cancelBubble = true;
            e.stopImmediatePropagation();
        }, {
            passive: false
        });
        this.contentContainer.addEventListener("pan", e => {
            if (e.isVertical) {
                return;
            }
  
            //获取元素宽度
            let width = this.contentContainer.getBoundingClientRect().width;

             let dx = e.dx;

             if (this[STATE_SYMBOL].position == 0 && e.dx > 0) {
                dx = dx / 2;
            }
            if (this[STATE_SYMBOL].position == this.contentContainer.children.length - 1 && e.dx > 0) {
                dx = dx / 2;
            }

            for(let i = 0; i < this.contentContainer.children.length; i ++) {
                this.contentContainer.children[i].style.transform = `translateX(${ dx -width * this[STATE_SYMBOL].position }px)`;
                this.contentContainer.children[i].style.transition = `transform ease .5s`;
            }
        });
        this.contentContainer.addEventListener("panend", e => {
            if (e.isVertical) {
                return;
            }

            let width = this.contentContainer.getBoundingClientRect().width;

            let isLeft;
            if (e.isFlick) {
                if (e.vx > 0) {
                    this[STATE_SYMBOL].position--;
                    isLeft = true;
                }

                 if (e.vx < 0) {
                    this[STATE_SYMBOL].position++;
                    isLeft = false;
                }

             } else {
                if (e.dx > width / 2) {
                    this[STATE_SYMBOL].position--
                    isLeft = true;
                } else if (e.dx < - width / 2) {
                    this[STATE_SYMBOL].position++
                    isLeft = false;
                } else if (e.dx > 0) {
                    isLeft = false;
                } else {
                    isLeft = true;
                }
            }

             if (this[STATE_SYMBOL].position < 0) {
                this[STATE_SYMBOL].position = 0;
            }
            if (this[STATE_SYMBOL].position >= this.contentContainer.children.length) {
                this[STATE_SYMBOL].position = this.contentContainer.children.length - 1;
            }
            for(let i = 0; i < this.contentContainer.children.length; i ++) {
                this.contentContainer.children[i].style.transform = `translateX(${ -width * this[STATE_SYMBOL].position }px)`;
                this.contentContainer.children[i].style.transition = `transform ease .5s`;
            }
        });
    }
    mounted() {

    }
    unmounted() {

    }
    update() {

    }
    log() {
        console.log("width", this.width);
    }
    appendChild(child) {
        let n = this.children.length;

        this.children.push(child);

        let title = child.getAttribute("tab-title") || "";
        this[PROPERTY_SYMBOL].headers.push(title);

        let header = document.createElement("div");
        header.innerText = title;
        header.style.display = "inline-block";
        header.style.height = "93px";
        header.style.fontFamily = "PingFang SC";
        header.style.fontSize = "46px";
        header.style.margin = "20px 35px 0 35px";
        this.headerContainer.appendChild(header);

        child.appendTo(this.contentContainer);
        for(let i = 0; i < this.contentContainer.children.length; i ++) {
            this.contentContainer.children[i].style.width = "100%";
            this.contentContainer.children[i].style.height = "100%";
            this.contentContainer.children[i].style.verticalAlign = "top";
            this.contentContainer.children[i].style.display = "inline-block";
        }
    }
    get children() {
        return this[PROPERTY_SYMBOL].children;
    }
    getAttribute(name) {
        if (name == "style") {
            return this.root.getAttribute("style");
        }
        return this[ATTRIBUTE_SYMBOL][name];
    }
    setAttribute(name, value) {
        if (name = "style") {
            this.root.setAttribute("style", value);
            this.root.style.display = "flex";
            this.root.style.flexDirection = "column";
        }
        return this[ATTRIBUTE_SYMBOL][name] = value;
    }
    addEventListener(type, listener) {
        if (!this[EVENT_SYMBOL][type]) {
            this[EVENT_SYMBOL][type] = new Set();
        }
        this[EVENT_SYMBOL][type].add(listener);
    }
    removeEventListener(type, listener) {
        if (!this[EVENT_SYMBOL][type]) {
            return;
        }
        this[EVENT_SYMBOL][type].delete(listener);
    }
    triggerEvent(type) {
        if (!this[EVENT_SYMBOL][type]) {
            return;
        }
        for (let event of this[EVENT_SYMBOL][type]) {
            event.call(this);
        }
    }
}