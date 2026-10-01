---
title: 编程语言学习记录（Python / C++ / Java）
published: 2026-10-01
description: "Python、C++、Java 三条线的学习清单与进度：从环境搭建、语法要点到练习方向，学完一项打一个勾。"
tags: [Python, C++, Java, 学习路线]
category: 编程语言
image: ""
---

## 这篇是干什么的

把三种语言的语法要点和练习方向列成清单，避免「感觉学过了」但一写就卡。每掌握一项就打勾，有对应的笔记就补链接。

## Python

上手最快，主要用于写脚本、做数据实验和 AI 方向的练习。

- [ ] 环境：安装 Python、venv 虚拟环境、pip 安装依赖
- [ ] 基础语法：变量、字符串、f-string 格式化、条件与循环
- [ ] 数据结构：list / tuple / dict / set 的常用操作与推导式
- [ ] 函数：默认参数、可变参数、lambda、作用域
- [ ] 文件与异常：`with open`、`try/except/finally`
- [ ] 面向对象：类、继承、魔术方法（`__init__`、`__str__`）
- [ ] 常用标准库：`os`、`pathlib`、`json`、`datetime`、`re`
- [ ] 进阶：生成器、装饰器、类型注解、`dataclass`
- [ ] 工程化：`requirements.txt`、虚拟环境隔离、打包

## C++

嵌入式和高性能场景的主力语言，重点在内存和类型。

- [ ] 环境：编译器（MSVC / GCC / Clang）、编译与链接过程、CMake 入门
- [ ] 基础语法：类型系统、`const`、引用与指针的区别
- [ ] 内存管理：栈与堆、`new/delete`、悬垂指针、内存泄漏
- [ ] 面向对象：类、构造/析构、拷贝构造、运算符重载、继承与多态
- [ ] 标准库：`std::string`、`std::vector`、`std::map`、迭代器
- [ ] 现代 C++：`auto`、范围 for、智能指针（`unique_ptr`/`shared_ptr`）、移动语义
- [ ] 模板与泛型编程入门
- [ ] 调试：断点、GDB / Visual Studio 调试器使用

## Java

- [ ] 环境：JDK 安装、`JAVA_HOME`、Maven / Gradle
- [ ] 基础语法：基本类型与包装类、字符串、流程控制
- [ ] 面向对象：类与对象、接口、抽象类、包管理
- [ ] 集合框架：`List`、`Map`、`Set` 及常用实现类的选择
- [ ] 异常处理与泛型
- [ ] 并发基础：线程、`synchronized`、线程池
- [ ] IO 与网络：文件读写、HTTP 请求
- [ ] 构建与测试：JUnit、Maven 生命周期

## 练习方向

语法学完必须靠写东西巩固，打算按这个顺序练：

- [ ] Python：写一个批量重命名文件的脚本
- [ ] Python：用 pandas 分析一份 CSV 数据并画图
- [ ] C++：手写一个动态数组，实现增删改查
- [ ] C++：实现一个简单的命令行计算器
- [ ] Java：写一个学生成绩管理的小程序（含文件存储）
- [ ] 通用：用每种语言各刷 20 道基础算法题

## 笔记索引

| 日期 | 笔记 | 语言 |
| --- | --- | --- |
| 2026-10-01 | 本篇 | Python / C++ / Java |

## 常用资源

- [Python 官方中文教程](https://docs.python.org/zh-cn/3/tutorial/)
- [cppreference（C++ 参考手册）](https://zh.cppreference.com/)
- [Java 官方教程](https://dev.java/learn/)
- [菜鸟教程](https://www.runoob.com/)：查语法速查表比较方便
