---
title: 51 单片机模块化编程与 C 预编译
published: 2026-09-20
description: "把功能拆成独立的 .c/.h 文件、C 预编译指令（#define / #include / #ifndef 等）与 Delay 模块化实例，附 LCD1602 调试踩坑。"
tags: [51单片机, C语言, 模块化编程, 预编译]
category: 嵌入式开发
image: ""
series: 嵌入式学习笔记
seriesOrder: 3
---

把实现某一功能的一个个模块封装在不同的 `.c` 文件中，其他 `.c` 文件若想使用只需 `#include xxx.h` 来调用

## 注意事项

`.c` 文件：函数、变量的定义

`.h` 文件：可被外部调用的函数变量的声明

任何自定义的变量、函数在调用前必须有定义或声明（同一个 `.c`）；使用到的自定义函数的 `.c` 文件必须添加到工程参与编译；使用到的 `.h` 文件必须要放在编译器可寻找到的地方（工程文件夹根目录、安装目录、自定义）

## C预编译

C 语言的预编译以 `#` 开头，作用是在真正的编译开始之前，对代码做一些处理（预编译）

比如：

| 预编译              | 意义                      |
| ------------------- | ------------------------- |
| #define PI 3.14     | --定义PI，将PI替换为3.14  |
| #include \<REG52.H> | 把REG52.H文件的内容搬过来 |
| #define ABC         | 定义ABC                   |
| #ifndef \__XX__X_H  | 如果没有定义\__XX__X_H    |

此外还有 `#ifdef`、`#if`、`#else`、`#elif`、`#undef` 等

## Delay模块化

### Delay.h

```c
#ifndef __DELAY_H__

#define __DELAY_H__

void Delay(unsigned int xms); #endif
```

### Delay.c

```c
void Delay(unsigned int xms) 
{ 
	unsigned char i, j;
	while(xms--) 
	{ 
		i = 2; 
		j = 239; 
		do 
		{ 
			while (--j); 
		} 
		while (--i); 
	}
}
```

`#include "头文件"` 引号中一般不区分大小写

## 小插曲

### lcd1602调试的坑

1. 接线帽没有接 OE 和 VCC
2. 电阻过低，导致过亮
3. 接口没有完全插入
