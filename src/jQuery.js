window.$ = window.jQuery = function (selectorOrArrayOrTemplate) {
    // 将 jQuery 命名为 $
    let elements
    if (typeof selectorOrArrayOrTemplate === "string") {
        if (selectorOrArrayOrTemplate[0] === "<") {
            // 创建 div
            elements = [createElement(selectorOrArrayOrTemplate)];
        } else {
            // 查找 div
            elements = document.querySelectorAll(selectorOrArrayOrTemplate);
        }
    } else if (selectorOrArrayOrTemplate instanceof Array) {
        elements = selectorOrArrayOrTemplate;
    }

    function createElement(string) {
        const container = document.createElement('template');
        // 只有 template 标签才能放入任意元素，比如 td，必须要在 tr 里边，但是 template 可以解除限制
        container.innerHTML = string.trim();
        // 截掉首尾空格、换行，否则有可能拿到文本
        return container.content.firstChild;
        // template 不能用 children[0] 来获取元素，必须用 firstChild
        // 代码不全：如果 string = '<div>1</div><div>2</div>'，那么只能返回 div 1 元素，第二个不会返回
    }

    const api = Object.create(jQuery.prototype);
    // 等价于 api.__proto__ = jQuery.prototype
    // 创建对象，指向原型，原型包括 addClass、find、end 等函数。节省存储空间。
    Object.assign(api, {
        oldApi: selectorOrArrayOrTemplate.oldApi,
        elements: elements // 由于之前直接返回对象时，原型中的函数在这个代码块里，所以 elements 可以通过闭包来调用，但是原型放到这个代码块外面后，就要通过这句代码将 elements 联系起来。
    })
    // 等价于：
    // api.oldApi = selectorOrArrayOrTemplate.oldApi;

    return api;
};

// 将以下函数封装为原型时要注意两点：
// 1. 原型中添加 constructor: jQuery。
// 2. 所有 elements 前面都要加 this。
$.fn = $.prototype = {
    // 将属性 prototype 命名为 fn
    constructor: jQuery, // 创建原型，这句代码必须写
    addClass(className) {
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i].classList.add(className);
        }
        return this;
        // 套用公式，obj.addClass(...)，此时 addClass 的 this 就指代 obj。
        // 链式操作，返回 this，就不用在这里命名对象，且链式使用方便，详情见 main.js 对该函数的调用。
    },
    find(selector) {
        let arr = [];
        for (let i = 0; i < this.elements.length; i++) {
            arr = arr.concat(Array.from(this.elements[i].querySelectorAll(selector)));
        }
        arr.oldApi = this;
        return jQuery(arr);
    },

    end() {
        return this.oldApi;
    },

    each(fn) {
        for (let i = 0; i < this.elements.length; i++) {
            fn.call(null, this.elements[i], i);
        }
        return this;
    },
    parent() {
        let arr = [];
        this.each((node) => {
            if (arr.indexOf(node.parentNode) === -1) {
                arr.push(node.parentNode);
            }
        });
        return jQuery(arr);
    },
    children() {
        let arr = [];
        this.each((node) => {
            arr.push(...node.children);
        })
        return jQuery(arr);
    },

    appendTo(node) {
        if (node instanceof Element) {
            this.each(el => node.appendChild(el));
        } else if (node.jquery === true) {
            this.each(el => node.get(0).appendChild(el));
        }
    },

    print() {
        this.each((node) => console.log(node));
    }
};