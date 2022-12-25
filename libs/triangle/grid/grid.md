
# Grid 栅格
24 栅格系统。
### 设计理念
<!-- deprecated-example(grid:grid:grid-demo) -->
在多数业务情况下，Ant Design需要在设计区域内解决大量信息收纳的问题，因此在 12 栅格系统的基础上，我们将整个设计建议区域按照 24 等分的原则进行划分。
划分之后的信息区块我们称之为『盒子』。建议横向排列的盒子数量最多四个，最少一个。『盒子』在整个屏幕上占比见上图。设计部分基于盒子的单位定制盒子内部的排版规则，以保证视觉层面的舒适感。
概述

### 概述
布局的栅格化系统，我们是基于行（row）和列（col）来定义信息区块的外部框架，以保证页面的每个区域能够稳健地排布起来。下面简单介绍一下它的工作原理：

- 通过 `row` 在水平方向建立一组 `column` （简写col）
- 你的内容应当放置于 `col` 内，并且，只有 `col` 可以作为 `row` 的直接元素
- 栅格系统中的列是指1到24的值来表示其跨越的范围。例如，三个等宽的列可以使用 `.col-8` 来创建
- 如果一个 `row` 中的 `col` 总和超过 24，那么多余的 `col` 会作为一个整体另起一行排列


Flex 布局


我们的栅格化系统支持 Flex 布局，允许子元素在父节点内的水平对齐方式 - 居左、居中、居右、等宽排列、分散排列。子元素与子元素之间，支持顶部对齐、垂直居中对齐、底部对齐的方式。同时，支持使用 order 来定义元素的排列顺序。
Flex 布局是基于 24 栅格来定义每一个『盒子』的宽度，但排版则不拘泥于栅格。

### Flex 布局
我们的栅格化系统支持 Flex 布局，允许子元素在父节点内的水平对齐方式 - 居左、居中、居右、等宽排列、分散排列。子元素与子元素之间，支持顶部对齐、垂直居中对齐、底部对齐的方式。同时，支持使用 order 来定义元素的排列顺序。
Flex 布局是基于 24 栅格来定义每一个『盒子』的宽度，但排版则不拘泥于栅格。
从堆叠到水平排列。
<!-- example(grid:grid-basic-example) -->
栅格常常需要和间隔进行配合，你可以使用  `tri-row`  的  `gutter`  属性，我们推荐使用  `(16+8n)px`  作为栅格间隔。

<!-- deprecated-example(grid:grid:grid-gutter) -->
列偏移
<!-- deprecated-example(grid:grid:grid-offset) -->
列排序
<!-- deprecated-example(grid:grid:grid-sort) -->
Flex布局基础
<!-- deprecated-example(grid:grid:grid-flex) -->
Flex 子元素垂直对齐。
<!-- deprecated-example(grid:grid:grid-flex-align) -->
通过 Flex 布局的 Order 来改变元素的排序。
<!-- deprecated-example(grid:grid:grid-flex-order) -->
参照 Bootstrap 的
<a href="[object Object]">响应式设计</a>
，预设四个响应尺寸： `xs`   `sm`   `md`   `lg`   `xl` 。

<!-- deprecated-example(grid:grid:grid-responsive) -->

`span`    `pull`   `push`   `offset`   `order`  属性可以通过内嵌到  `xs`   `sm`   `md`   `lg`   `xl`  属性中来使用。

<!-- deprecated-example(grid:grid:grid-responsive-more) -->
可以简单配置几种等分栅格和间距。
<!-- deprecated-example(grid:grid:grid-gutter-config) -->
