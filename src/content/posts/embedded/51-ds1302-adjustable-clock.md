---
title: 51 单片机 DS1302 可调时钟：MODE 切换、字段闪烁与一个 C51 编译坑
published: 2026-10-22
description: "在只读时钟基础上加「设置时间」：MODE 切换、按键选择字段与加减、1Hz 闪烁提示，以及实际踩到的 C208 参数过多、KEIL 不认 UTF-8 BOM、溢出清零清错下标三个问题。"
tags: [51单片机, DS1302, LCD1602, 按键, Keil, 编译错误]
category: 嵌入式开发
image: ""
series: 嵌入式学习笔记
seriesOrder: 11
---

## 这个项目要做什么

`10-1` 只是「读出时间、显示出来」。`10-2` 要在它上面加一个功能：**能改时间**。

交互设计是这样：

- 一个按键切模式：**MODE 0 = 正常走时**，**MODE 1 = 设置模式**
- 设置模式下，按键 2 换字段（年 → 月 → 日 → 时 → 分 → 秒 → 回年），按键 3 加一，按键 4 减一
- 当前选中的字段**闪烁**（一秒亮一秒灭），告诉你"正在改这个"
- 退出设置模式时，把数组里的新值一次性写进 DS1302

## 整体结构

```c
void main()
{
	LCD_Init();
	DS1302_Init();
	Timer0Init();
	LCD_ShowString(1, 1, "  -  -  ");   // 固定显示的分隔符
	LCD_ShowString(2, 1, "  :  :  ");
	DS1302_SetTime();

	while(1)
	{
		KeyNum = Key();                 // 每轮扫一次按键
		if(KeyNum == 1)
		{
			if(MODE == 0) { MODE = 1; }
			else if(MODE == 1) { MODE = 0; DS1302_SetTime(); }   // 退出时写入
		}
		switch(MODE)
		{
			case 0: TimeShow(); break;   // 只读显示
			case 1: TimeSet();  break;   // 设置界面
		}
	}
}
```

两个函数分工很干净：

| 函数 | 作用 |
| --- | --- |
| `TimeShow()` | `DS1302_ReadTime()` 读一遍，6 个字段各 `LCD_ShowNum` 显示 |
| `TimeSet()` | 处理按键、改数组、带闪烁地重画 6 个字段 |

## 闪烁是怎么做出来的

闪烁不靠 `Delay`，靠定时器给一个标志位。定时器每 1ms 中断一次，数到 1000 次（约 1 秒）翻转一次：

```c
void Timer0_Routine() interrupt 1
{
	static unsigned int T0Count;
	TL0 = 0x66;
	TH0 = 0xFC;
	T0Count++;
	if(T0Count >= 1000)
	{
		T0Count = 0;
		TimeSetFlashFlag = !TimeSetFlashFlag;   // 每秒翻转
	}
}
```

然后在显示的时候判断「**是不是当前选中字段** + **这一刻该不该亮**」：

```c
if(TimeSetSelect == 0 && TimeSetFlashFlag == 1) { LCD_ShowString(1, 1, "  "); }  // 灭：写两个空格
else                                            { LCD_ShowNum(1, 1, DS1302_Time[0], 2); }  // 亮：写数字
```

六个字段重复六遍，位置分别是 `(1,1) (1,4) (1,7)` 和 `(2,1) (2,4) (2,7)`，中间的空位留给静态的 `-` 和 `:`。

## 编译错误：`error C208: too many actual parameters`

改完保存、按编译，Hex 没有生成，Errors 窗口里是 6 条：

```
main.c(98):  error C208: '_LCD_ShowString': too many actual parameters
main.c(100): error C208: '_LCD_ShowString': too many actual parameters
... 一直到 main.c(108)
```

第一反应是"是不是调用太多了"，其实 `too many actual parameters` 的意思是：**实参个数（actual parameters）超过了形参个数**。回去看 `LCD1602.h`：

```c
void LCD_ShowString(unsigned char Line, unsigned char Column, char *String);                        // 3 个参数
void LCD_ShowNum(unsigned char Line, unsigned char Column, unsigned int Number, unsigned char Length);  // 4 个参数
```

而写的是：

```c
else { LCD_ShowString(1, 1, DS1302_Time[0], 2); }   // 传了 4 个 → 编译报错
```

`LCD_ShowString` 只收「行、列、字符串」，想显示"两位数字"应该用 `LCD_ShowNum`。把 6 个 else 分支里的函数名换掉就好：

```c
else { LCD_ShowNum(1, 1, DS1302_Time[0], 2); }
```

改完重新编译：**0 Error(s)，4 Warning(s)**。这 4 个警告都是 `L16: UNCALLED SEGMENT`——`LCD_ShowChar`、`LCD_ShowSignedNum`、`LCD_ShowHexNum`、`LCD_ShowBinNum` 这几个函数没被调用，链接器把它们排除掉，属于正常现象，不用管。

> 小经验：C51 的报错里，凡是带 `parameters`、`arguments` 的，基本都是参数个数或类型对不上；照着 `.h` 里的原型数一遍参数最省事。

## 另一个坑：Keil C51 不认 UTF-8 BOM

改完文件再编译，突然冒出一串更吓人的错误：

```
main.c(1): error C100: unprintable character 0xEF skipped
main.c(1): error C100: unprintable character 0xBB skipped
main.c(1): error C100: unprintable character 0xBF skipped
main.c(1): error C141: syntax error near '#', expected 'hdata'
main.c(1): error C129: missing ';' before '<'
```

`0xEF 0xBB 0xBF` 正是 UTF-8 的 **BOM**（文件头标记）。Keil C51 不认它，直接把 `#include` 那一行当成乱码。用 VS Code 保存 `main.c` 时如果编码选了「UTF-8 with BOM」就会这样，改回「UTF-8」（无 BOM）立刻正常。

## 代码里还有个逻辑 bug（当时没发现，回头看才看见）

`TimeSet()` 里加法越界的处理，三行都清错了下标：

```c
if(DS1302_Time[3] > 23) { DS1302_Time[0] = 0; }   // 时越界，清成了「年」
if(DS1302_Time[4] > 59) { DS1302_Time[0] = 0; }   // 分越界，也清「年」
if(DS1302_Time[0] > 59) { DS1302_Time[0] = 0; }   // 这一行判断的其实是「年」
```

结果就是：调时分秒越界时，被清零的是年份。应该是：

```c
if(DS1302_Time[3] > 23) { DS1302_Time[3] = 0; }
if(DS1302_Time[4] > 59) { DS1302_Time[4] = 0; }
if(DS1302_Time[5] > 59) { DS1302_Time[5] = 0; }
```

典型的复制粘贴后忘记改下标。这类 bug 编译器不会报，只能自己看，或者靠实测。

## 怎么快速验证一次编译

不打开 Keil 界面也能编译，用命令行：

```bat
UV4.exe -b Project.uvproj -o build.log
```

返回码的含义：`0` = 无错误无警告，`1` = 只有警告，`2` = 有错误，`3` = 致命错误。日志里看 `Program Size: data=48.0 xdata=0 code=2278` 和 `0 Error(s)` 就够了。

## 小结

- 可调时钟 = **读显示（TimeShow）** + **编辑界面（TimeSet）** + **一个 1Hz 标志位做闪烁**
- 改时间不要在中断里写，退出设置模式时统一 `DS1302_SetTime()` 一次
- `C208 too many actual parameters` = 参数给多了，对着 `.h` 数参数
- `C100 unprintable character 0xEF` = 文件带 BOM，存成 UTF-8 无 BOM
- 编译器管不了逻辑：像「越界清零清错下标」这种，只能靠走查和实测

接下来想做的：删掉那两行调试显示（`TimeSetSelect`、`TimeSetFlashFlag`），加上星期显示，以及按键长按加速加减。
