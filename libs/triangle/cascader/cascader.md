
# Cascader 级联选择
级联选择框。
### 何时使用

需要从一组相关联的数据集合进行选择，例如省市区，公司层级，事物分类等。
从一个较大的数据集合中进行选择时，用多级分类进行分隔，方便选择。
比起 Select 组件，可以在同一个浮层中完成选择，有较好的体验。

### 代码演示

省市区级联。
<!-- example(cascader:cascader-basic-example) -->
切换按钮和结果分开。
<!-- example(cascader:cascader-custom-trigger-example) -->
通过指定 nzOptions 里的  `disabled`  字段。
<!-- example(cascader:cascader-disabled-example) -->
不同大小的级联选择器。
<!-- example(cascader:cascader-size-example) -->
默认值通过数组的方式指定。
<!-- example(cascader:cascader-default-value-example) -->
通过移入展开下级菜单，点击完成选择。
<!-- example(cascader:cascader-hover-example) -->
这种交互允许只选中父级选项。设置  `nzChangeOnSelect`  或者  `nzChangeOn`  。
<!-- example(cascader:cascader-change-on-select-example) -->
例如给最后一项加上邮编链接。
<!-- example(cascader:cascader-custom-render-example) -->
使用事件  `nzLoad`  实现动态加载选项。
<!-- example(cascader:cascader-lazy-example) -->
创建响应式表单组件，并通过  `reset()`  方法重置数值。
<!-- example(cascader:cascader-reactive-form-example) -->