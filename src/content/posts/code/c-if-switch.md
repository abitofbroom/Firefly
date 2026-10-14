---
title: C 语言的 if 与 switch 判断
published: 2026-08-23
description: "介绍 C 语言 if 判断的基础语法与嵌套用法，以及 switch 多路分支的语法和 break 穿透机制。"
tags: [C语言, 条件判断, if语句, switch语句, 流程控制]
category: 编程语言
image: ""
series: C 语言入门笔记
seriesOrder: 4
---

### if 判断

#### 1. 基础语法

```c
if (条件1) {
    代码1;
} else if (条件2) {
    代码2;
} else if (...) {
    // ...
} else {
    代码n;
}
```

#### 2. if 嵌套

在一个 `if/else` 语句中，还包含另外的 `if` 语句，即为嵌套。

**示例：三个数比大小**

```c
int a, b, c;
scanf("%d %d %d", &a, &b, &c); // 注意：scanf 修改数据一定要有 &

int max = a;
if (a < b) {
    max = b; 
    if (b < c) {
        max = c;
    }
} else {
    if (a < c) {
        max = c;
    }
}

printf("%d", max);
```

------

### switch 多路分支

适用于多个固定值（如数字、字符）的情况。

#### 1. 基础语法

```c
switch (表达式) {
    case exp1:
        st1;
        break; // 跳出 switch
    case exp2:
        std;
        break; // 没有 break 会按顺序执行下面的 case（穿透）
    default:   // 输入 case 以外的其他值时执行
        stdn;
        break; // 到结尾执行完毕自动退出 switch 语句，但建议加上 break
}
```

------

