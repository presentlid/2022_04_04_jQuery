<!-- 04.04: 5h -->
# jQuery 设计模式和常用函数
设计模式通俗地说就是程序员的黑话、术语，对通用代码取个名字。

jQuery 用到了哪些设计模式？

文中介绍了 jQuery 的六种设计思想：
* <a href='#a'>闭包和链式风格</a>
* <a href='#b'>简洁的别名</a>
* <a href='#c'>使用原型</a>
* <a href='#d'>提供各种强大的过滤器</a>
* <a href='#e'>提供两组方法来移动元素位置</a>
* <a href='#f'>getter/setter。</a>

除此之外还有：
1. 不用 new 构造函数；
2. $(支持各种参数)，这个模式叫重载；
3. jQuery 针对不同浏览器使用不同代码（本质是 if ... else ...），这叫适配器。

设计模式不是用来学的，而是用来总结的。首先直接写代码，作为新手代码写得烂是件很正常的事情，既然觉得代码烂，有时间就重写，如果有很多的空余时间，那么就不断重写。在这之中，总结代码，把觉得写得好的地方抽象出来，看看符合哪些设计模式。之后，你就可以告诉别人你用了哪些设计模式，显得高端。

jQuey 重新封装了 DOM。jQuery 中的代码是许多程序员多年摸索出来的经典代码，刚接触这些代码时不要问太多的为什么，我们更加需要站在巨人的肩膀上，继续向前探索。

## 目录
1. <a href='#1'>jQuery 是不是构造函数？</a>
2. <a href='#2'>闭包和链式风格</a>
3. <a href='#3'>命名风格</a>
4. <a href='#4'>使用原型</a>
5. <a href='#5'>jQuery 常用函数</a>
   * 如何获取元素
   * 如何创建元素
   * 如何移动元素
   * 如何修改元素属性

## jQuery 是不是构造函数？<a id='1'></a>
可以说是。因为 jQuery 函数确实构造出了一个对象。

也可以说不是。因为不需要写 new jQuery() 就能构造出对象，一般说的构造函数都要结合 new 才行。

总之，jQuery 是一个 <strong>不需要加 new</strong>、<strong>非常规意义上</strong> 的构造函数，jQuery 用了一些技巧来实现的。

口头约定：jQuery 对象指的是 jQuery 函数构造出来的对象，而不是想表达 jQuery 是个对象，jQuery 本身是个函数。

## 闭包和链式风格<a id='2'></a>
闭包操作就是调用函数外部的变量来使用。闭包的好处：外部变量被隐藏了起来，用户无法直接访问，必须通过调用函数来访问外部变量。

链式风格就是，jQuery(选择器) 获取对应的元素，但不返回这些元素，而是封装成一个对象，这个对象可以操作对应的元素。

jQuery 第一个设计思想<a id='a'></a>，闭包和链式风格。

具体例子：
``` JavaScript
window.jQuery = function (selector) {
    let elements = document.querySelectorAll(selector);
    return {
        addClass(className) {
            for (let i = 0; i < elements.length; i++) {
                elements[i].classList.add(className);
                // 闭包维持 elements，只要函数不死，elements 就保留着。
            }
            return this;
            // 链式风格，返回 this。
            // 套用公式，假如obj.addClass(...)，那么此时 addClass 的 this 就指代 obj。
        }
    };
};

// 下面看看闭包和链式操作对写代码带来的好处：
jQuery('div').addClass('red').addClass('blue').addClass('green');
// 代码运行结果：<div class='red blue green'></div>
// 可以看到，找到元素 div 后，可以通过 .函数名(参数) 可以不断地对元素进行操作，非常方便。
```

## 命名风格<a id='3'></a>
jQuery 第二个设计思想<a id='b'></a>，简洁的别名。


``` JavaScript
    window.$ = window.jQuery = function(...) {...}
    // 等式从右到左赋值，因此 jQuery 函数最终只要简写为 $(...) 就能够调用函数。
```

约定俗成，jQuery 对象的变量名要以符号 $ 开头，这样就能让所有人明白该对象需要调用 jQuery 对象函数，而不是 DOM 对象函数。

建议代码中所有 jQuery 对象都以 $ 开头来命名。

``` JavaScript
    const $div = $('div#test'); // 正确变量名
    const  div = $('div#test'); // 错误变量名，别人有可能误以为这是 DOM 创建的对象，导致调用与 DOM 对应的函数（如 querySelector(...) 等）。
```

## 使用原型<a id='4'></a>
jQuery 第三个设计思想<a id='c'></a>，使用原型。

jQuery 将共有属性和函数封装为一个对象，作为 jQuery 对象的原型，这样在创建 jQuery 对象时就能节省共有属性和函数占用的存储空间。

对比两份代码来感受使用原型前后，代码的改变：
使用原型前：
``` JavaScript
window.$ = window.jQuery = function(selectorOrArray){
  let elements;
    if (typeof selectorOrArrayOrTemplate === "string") {
        if (selectorOrArrayOrTemplate[0] === "<") {
            elements = [createElement(selectorOrArrayOrTemplate)];
        } else {
            elements = document.querySelectorAll(selectorOrArrayOrTemplate);
        }
    } else if (selectorOrArrayOrTemplate instanceof Array) {
        elements = selectorOrArrayOrTemplate;
    }
  return {
    addClass(className){
        for (let i = 0; i < elements.length; i++) {
          elements[i].classList.add(className);
        }
        return this;
    },
    find(selector){
        let arr = [];
        for (let i = 0; i < elements.length; i++) {
          arr.push(...elements[i].querySelectorAll(selector));
        }
        return jQuery(arr);
    }
  }
}
```

使用原型后：
``` JavaScript
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
        // 代码有 bug：如果 string = '<div>1</div><div>2</div>'，那么只能返回 div 1 元素，第二个不会返回
    }

    const api = Object.create(jQuery.prototype);
    // 等价于 api.__proto__ = jQuery.prototype
    // 创建对象，指向原型，原型包括 addClass、find、end 等函数。节省存储空间。
    Object.assign(api, {
        elements: elements // 由于之前直接返回对象时，原型中的函数在这个代码块里，所以 elements 可以通过闭包来调用，但是原型放到这个代码块外面后，就要通过这句代码将 elements 联系起来。
    })
    // 等价于：
    // api.oldApi = selectorOrArrayOrTemplate.oldApi;

    return api;
};

// 将以下函数封装为原型时要注意两点：
// 1. 原型中添加 constructor: jQuery。
// 2. 对比“使用原型前”的代码，原型中所有 elements 前面都要加 this。
$.fn = $.prototype = {
    // 将属性 prototype 命名为 fn
    constructor: jQuery, // 创建原型，这句代码必须写
    addClass(className) {
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i].classList.add(className);
        }
        return this;
    },
    find(selector) {
        let arr = [];
        for (let i = 0; i < this.elements.length; i++) {
            arr = arr.concat(Array.from(this.elements[i].querySelectorAll(selector)));
        }
        arr.oldApi = this;
        return jQuery(arr);
    }
};
```

## jQuery 常用函数<a id='5'></a>
以下将结合 jQuery 设计思想来介绍一些常用函数，参考了阮一峰的<a href='http://www.ruanyifeng.com/blog/2011/07/jquery_fundamentals.html'>jQuery设计思想</a>。

### 如何获取元素<a id='6'></a>
选择页面某个元素，但不返回这个元素给用户，而是返回 jQuery 构造出来的对象，这个对象封装了各种函数，用户调用这些函数可以很方便地对该元素进行操作。

通过代码 $(选择器表达式) 来获取用户想要的元素。选择器表达式可以用 CSS 风格来写，也可以用 jQuery 特有的表达式来写。

选择器表达式（CSS 写法）：
``` JavaScript
    $(document) // 选择整个文档对象
    $('#idName') // 选择 id 为 idName 的页面元素
    $('div.className') // 选择 class = 'className' 的 div 元素
    $('input[name=myName]') // 从 input 元素中选择 name = 'myName' 的元素
```

选择器表达式（jQuery 特有写法）：
``` JavaScript
    $('a:first') //选择网页中第一个a元素
    $('tr:odd') //选择表格的奇数行
    $('#myForm:input') // 选择表单中的input元素
    $('div:visible') //选择可见的div元素
    $('div:gt(2)') // 选择所有的div元素，除了前三个
    $('div:animated') // 选择当前处于动画状态的div元素
```

jQuery 第四个设计思想<a id='d'></a>，提供各种强大的过滤器对结果集进行筛选。

``` JavaScript
    $('div').has('p'); // 选择包含p元素的div元素
    $('div').not('.myClass'); //选择class不等于myClass的div元素
    $('div').filter('.myClass'); //选择class等于myClass的div元素
    $('div').first(); //选择第1个div元素
    $('div').eq(5); //选择第6个div元素
```

相对定位，有时候，我们需要从结果集出发，将结果集移动到附近的相关元素。
``` JavaScript
    $('div').next('p'); //选择div元素后面的第一个p元素
　　$('div').parent(); //选择div元素的父元素
　　$('div').closest('form'); //选择离div最近的那个form父元素
　　$('div').children(); //选择div的所有子元素
　　$('div').siblings(); //选择div的同级元素
```

### 如何创建元素<a id='7'></a>
创建新元素的方法非常简单，只要把新元素直接传入jQuery的构造函数就行了：
``` JavaScript
    $('<p>Hello</p>');
    $('ul').append('<li>list item</li>');
```

### 如何移动元素<a id='8'></a>
特别地，jQuery 提供两组方法来移动元素位置，这是第五个设计思想<a id='e'></a>。

``` JavaScript
    $('div1').insertAfter($('div2')); // 方法一
    $('div2').after($('div1')); // 方法二
```
两种方法都是将 div1 放到 div2 后面，区别是第一种方法返回的操作元素是 div1，而第二种返回的操作元素是 div2。你可以根据需要，选择到底使用哪一种方法。

### 如何修改元素属性和内容<a id='9'></a>
jQuery 第六个设计思想<a id='f'></a>，就是使用同一个函数，来完成取值（getter）和赋值/修改（setter），即"取值器"与"赋值器"合一。到底是取值还是修改，由函数的参数决定。

``` JavaScript
    $('h1').html(); //html()没有参数，表示取出h1的值
    $('h1').html('Hello'); //html()有参数Hello，表示对h1进行赋值
```

常见的取值和赋值函数如下：

``` JavaScript
　　.html(); // 取出或设置html内容
　　.text(); // 取出或设置text内容
　　.attr(); // 取出或设置某个属性的值
　　.width(); // 取出或设置某个元素的宽度
　　.height(); // 取出或设置某个元素的高度
　　.val(); // 取出某个表单元素的值
```

需要注意的是，如果结果集包含多个元素，那么赋值的时候，将对其中所有的元素赋值；取值的时候，则是只取出第一个元素的值（.text()例外，它取出所有元素的text内容）。






