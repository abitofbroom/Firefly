---
title: C 语言课堂笔记：控制结构、关系与逻辑表达式（10.16）
published: 2026-10-16
description: "10.16 第七周课堂笔记：三种控制结构（顺序、循环、选择）、六种关系运算符与关系表达式、三种逻辑运算符与短路求值规则，以及 C 语言的数据类型分类。"
tags: [C语言, 控制结构, 关系运算符, 逻辑运算符, 短路求值, 数据类型]
category: 编程语言
image: ""
series: C 语言入门笔记
seriesOrder: 6
---

## 三种控制结构

### 顺序结构

```c
//按照顺序
```

### 循环结构

```c
//if语句
1-if(express)
2-if(express)else
3-if(express)else if(express)else if(express)...else
```

### 选择结构

```c
//switch
switch(express)
case express_1://当express=express_1时，执行对应case express_1的部分执行对应代码
	 code;
	 break;
case express_2:
	 code;
	 break;
......
case express_n:
	 code;
	 break;
```

## 关系表达式

### 关系运算符-6种

```c
	1.<    2.<=    3.>    4.>=	  //同一优先级 高
  //小于   小于等于  大于    大于等于
	5.==   6.!=			  		  //同一优先级 低
  //等于	  不等于      
```

### 关系表达式

- def：关系运算符连接运算量形成的表达式

    关系表达式的逻辑值为：<span style="color:#0080FF;">真</span>或<span style="color:#3399FF;">假</span>

- C 中以非 0 为真，0 为假
- 当关系表达式为真时值为 1，为假时值 0

## 逻辑表达式

### 逻辑运算符-3种

```c
! 	//逻辑非			优先级高
&&	//逻辑与	全1则1
||	//逻辑或	全0则0	    低
```

优先级高低：

**! < 算术运算符 < 关系运算符 < && || < 赋值运算符**

### 逻辑表达式

- def：逻辑运算符连接操作数形成的表达式

    逻辑表达式的逻辑值为：<span style="color:#0080FF;">真</span>或<span style="color:#3399FF;">假</span>

- C 中以非 0 为真，0 为假
- 当关系表达式为真时值为 1，为假时值 0

### 逻辑表达式的<span style="color:#FF6666;">短路</span>求值规则

1. a&&b

   只有 a 为真时才需要求解 b 的值，当 a 为假时无需求解 b 的值

2. a||b

   只有 a 为假时才需要求解 b 的值，当 a 为真时无需求解 b 的值

`if` 后括号中几乎可以是任意表达式，但其结果当作逻辑值使用，非 0 为真，0 为假

`if` 和 `else` 后的 `()` 中可以是简单语句也可以是复合语句

## 数据类型

- **整型**：int、long [int]、short [int]、long long
- **浮点型**：float、double、long double
- **字符型 / 字节型**：char、unsigned char、signed char
