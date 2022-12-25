
# Layout 布局
协助进行页面级整体布局。
### 设计规则
尺寸

一级导航项偏左靠近 logo 放置，辅助菜单偏右放置。
- 顶部导航（大部分系统）：一级导航高度  `64px` 二级导航  `48px`
- 顶部导航（展示类页面）：一级导航高度  `80px` 二级导航  `56px`
- 顶部导航高度的范围计算公式为： `48+8n`
- 侧边导航宽度的范围计算公式： `200+8n`

交互
- 一级导航和末级的导航需要在可视化的层面被强调出来；
- 当前项应该在呈现上优先级最高；
- 当导航收起的时候，当前项的样式自动赋予给它的上一个层级；
- 左侧导航栏的收放交互同时支持手风琴和全展开的样式，根据业务的要求进行适当的选择。

视觉


导航样式上需要根据信息层级合理的选择样式：

- **大色块强调**
建议用于底色为深色系时，当前页面父级的导航项。
- **高亮火柴棍**
当导航栏底色为浅色系时使用，可用于当前页面对应导航项，建议尽量在导航路径的最终项使用。
- **字体高亮变色**
从可视化层面，字体高亮的视觉强化力度低于大色块，通常在当前项的上一级使用。
- **字体放大**
`12px` `14px` 是导航的标准字号，14 号字体用在一、二级导航中。字号可以考虑导航项的等级做相应选择。

组件概述
- `tri-layout` 布局容器，其下可嵌套
- `tri-header` `tri-sider` `tri-content` `tri-footer` 或
- `tri-layout` 本身，可以放在任何父容器中。
- `tri-header` 顶部布局，自带默认样式，其下可嵌套任何元素，只能放在  `tri-layout` 中。
- `tri-sider` 侧边栏，自带默认样式及基本功能，其下可嵌套任何元素，只能放在  `tri-layout` 中。
- `tri-content` 内容部分，自带默认样式，其下可嵌套任何元素，只能放在  `tri-layout` 中。
- `tri-footer` 底部布局，自带默认样式，其下可嵌套任何元素，只能放在  `tri-layout` 中。

> 注意：采用 flex 布局实现，请注意
>  <a href="[object Object]">浏览器兼容性</a>
> 问题。


### 代码演示

典型的页面布局。
<!-- example(layout:layout-basic-example) -->
最基本的『上-中-下』布局。
<!-- deprecated-example(layout:layout:layout-top) -->
同样拥有顶部导航及侧边栏，区别是两边未留边距，多用于应用型的网站。
<!-- deprecated-example(layout:layout:layout-top-side2) -->
拥有顶部导航及侧边栏的页面，多用于展示类网站。
<!-- deprecated-example(layout:layout:layout-top-side) -->
侧边两列式布局。页面横向空间有限时，侧边导航可收起。
<!-- deprecated-example(layout:layout:layout-side) -->
要使用自定义触发器，可以设置  `nzTrigger="null"`  来隐藏默认设定。
<!-- deprecated-example(layout:layout:layout-trigger) -->
tri-sider 支持响应式布局。
<!-- deprecated-example(layout:layout:layout-responsive) -->