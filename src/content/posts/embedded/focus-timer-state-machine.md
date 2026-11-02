---
title: 专注计时器：状态机 + 8 位数码管 + 串口协议
published: 2026-11-02
description: "用 STC15F2K60S2 做一个专注计时器：4 状态机 + 2 视图、HC573 锁存器、动态扫描与显存分离、按键松手检测、SET/STA/PAS 串口文本协议、5 秒完成提示屏蔽输入。附验收清单与代码里值得改的 4 处。"
tags: [51单片机, STC15, 状态机, 数码管, 串口, 蓝桥杯]
category: 嵌入式开发
image: ""
series: 嵌入式学习笔记
seriesOrder: 12
---

## 需求：一个"专注计时器"

一块蓝桥杯/4T 学习板（STC15F2K60S2），要做成这样一个东西：

| 模块 | 要求 |
| --- | --- |
| 时钟界面 | 数码管显示 `23-55-55`（时-分-秒，来自 DS1302） |
| 专注界面 | 第 1 位显示 `P`，第 2~6 位灭，第 7~8 位显示剩余秒数 |
| 按键 S4 | 时钟 ⇄ 专注 来回切 |
| 按键 S5 | 专注界面下：启动 → 暂停 → 继续 |
| 按键 S8 / S9 | 未启动时加减时长（1~60 秒） |
| 按键 S12 | 运行/暂停中按下：结束计时，回到未启动 |
| LED | L1 运行、L2 暂停、L3 完成（亮 5 秒） |
| 串口 | 9600 8N1，`SET,xx` / `STA` / `PAS`，回 `OK` 或 `ERR` |
| 蜂鸣器 | 倒计时归零时响 5 秒，期间强制切回专注界面 |

难点不在某一个外设，而在**这些状态之间怎么不打架**：正在响铃的 5 秒里按键和串口必须全失效，切界面不能打断计时，暂停再继续不能丢秒。

## 架构：两个维度 + 一个心跳

```c
unsigned char sys_state  = SYS_IDLE;    // IDLE → RUNNING ⇄ PAUSED → FINISHING → IDLE
unsigned char view_state = VIEW_CLOCK;  // CLOCK ⇄ FOCUS
```

**两个维度是独立的：**
- `sys_state` 管"计时器在干什么"（4 个状态）
- `view_state` 管"屏幕在看什么"（2 个界面）

正常模式下这两维互相独立，只有**完成提示**会强制把 `view_state` 拉回 `FOCUS`。

**一个心跳**：整个系统只开一个 1ms 定时器中断，所有"时间"都由它数出来：

| 用途 | 计数 | 换算 |
| --- | --- | --- |
| 倒计时 | `++tick_1s >= 1000` | 1 秒 |
| 完成提示 | `++finish_tick >= 5000` | 5 秒 |
| 按键扫描 | `++key_tick >= 10` | 10ms 扫一次 |
| 数码管刷新 | 每次中断扫一位 | 8ms 扫完一屏 ≈ 125Hz |

> 好处：不用为"闪灯""消抖""倒计时"各开一个定时器，也不会互相打架。

## HC573 锁存器：顺序错就全乱

这块板子的 LED、蜂鸣器、数码管位选、段选都挂在同一组 P0 上，靠 74HC573 分四路锁存：

```c
void Write_HC573(unsigned char channel, unsigned char dat) {
    P0 = dat;                                // 1. 先把数据放到总线上
    switch(channel) {
        case 4: P2 = (P2 & 0x1F) | 0x80; break;  // LED
        case 5: P2 = (P2 & 0x1F) | 0xA0; break;  // 蜂鸣器
        case 6: P2 = (P2 & 0x1F) | 0xC0; break;  // 数码管位选
        case 7: P2 = (P2 & 0x1F) | 0xE0; break;  // 数码管段选
    }
    P2 &= 0x1F;                              // 2. 关锁存，把数据锁住
}
```

三句话记住：
1. **先放数据，再开锁存** —— 反了就锁进上一次的数据
2. `P2 & 0x1F` 是"只改高 3 位、不动低 5 位"
3. 写完之后 `P2 &= 0x1F` 关锁存，数据就定住了

## 数码管：消影 → 位选 → 段选

```c
void Display_Scan() {
    static unsigned char pos = 0;

    Write_HC573(7, 0xFF);                  // ① 消影（段全灭）
    Write_HC573(6, (1 << pos));            // ② 位选（只选中一位）
    Write_HC573(7, Seg_Table[disp_buf[pos]]);  // ③ 段选
    pos = (pos + 1) & 0x07;                // 8 位轮转
}
```

**为什么必须消影**：换位的时候，上一位的段码还亮着，会残影到新的一位（串位）。先用 `0xFF` 把段全灭，再切位。

## 段码表怎么读

```c
unsigned char code Seg_Table[] = {
    0xC0, 0xF9, 0xA4, 0xB0, 0x99, 0x92, 0x82, 0xF8, 0x80, 0x90,
    0xBF, // 10: '-'
    0x8C, // 11: 'P'
    0xFF  // 12: 全灭
};
```

共阳极：**0 亮 1 灭**。以 `0xC0 = 1100 0000` 为例，从低位到高位依次是 `a b c d e f g dp`：

```
 0xC0 → a=0 b=0 c=0 d=0 e=0 f=0 g=1 dp=1
              ↓ 亮 a~f，g 和 dp 灭  → 显示 "0"
```

所以特殊符号也很好写：`'-'` 只要 g 亮 → `1111 1111` 里把 g 清 0 = `0xBF`；`'P'` 是 a、b、e、f、g 亮 = `0x8C`。

## 最值钱的设计：显存与扫描分离

```c
unsigned char disp_buf[8] = {12,12,12,12,12,12,12,12};  // 12 = 全灭

void Update_Display_Buffer() {
    if (view_state == VIEW_CLOCK) {
        disp_buf[0] = h/10; disp_buf[1] = h%10; disp_buf[2] = 10; // '-'
        ...
    } else {
        disp_buf[0] = 11;                                       // 'P'
        for (int i = 1; i <= 5; i++) disp_buf[i] = 12;           // 中间全灭
        disp_buf[6] = remain/10; disp_buf[7] = remain%10;
    }
}
```

**分工**：
- `Update_Display_Buffer()` 只负责"每一位该显示什么"（业务逻辑）
- `Display_Scan()` 只负责"把 buf 刷到屏上"（硬件时序）

好处：切界面、闪 00、恢复设定值，全都只是改数组；扫描函数一行都不用动。**这一版最值得抄走的就是这个结构。**

## 按键：中断采集、主循环处理、松手检测

```c
// 中断里只做采集
void Key_Scan() {
    unsigned char temp = 0;
    static unsigned char key_up = 1;

    P3 = 0x0F; P44 = 0; P42 = 1; P35 = 1; P34 = 1;   // 扫第 1 列
    if (P33 == 0) temp = 4; else if (P32 == 0) temp = 5;
    // …… 第 2 列（S8/S9）、第 3 列（S12）

    if (temp != 0) { if (key_up) { key_up = 0; key_val = temp; } }
    else           { key_up = 1; }
}

// 主循环里只做处理
if (key_val != 0) { Key_Process(key_val); key_val = 0; }
```

**松手检测**（学名：按键边沿检测）是这三行的核心：

```c
if (temp != 0) { if (key_up) { key_up = 0; key_val = temp; } }
else           { key_up = 1; }
```

按住不放只触发一次；不写这个，长按加时间会"嗖"地跳到 60。

**为什么采集放中断、处理放主循环**：主循环可能在算别的东西（比如解析串口），放中断里会拖长中断时间；放主循环里就能保证"一次只干一件事"。

## 串口：中断收字节，主循环解析文本协议

```c
void UART_Isr() interrupt 4 {
    if (RI) {
        RI = 0;                       // 串口标志必须软件清！
        unsigned char dat = SBUF;
        if (dat == '\n' || dat == '\r') uart_flag = 1;   // 收到换行 = 一帧结束
        else if (uart_cnt < 29) uart_buf[uart_cnt++] = dat;
    }
}

void UART_Process() {
    if (!uart_flag) return;
    uart_flag = 0;

    if (strncmp((char*)uart_buf, "SET,", 4) == 0) {
        unsigned char val = 0, i = 4;
        while (uart_buf[i] >= '0' && uart_buf[i] <= '9') { val = val*10 + (uart_buf[i]-'0'); i++; }
        if (val >= 1 && val <= 60) { focus_set_time = val; focus_remain_time = val; Uart_SendString("OK\r\n"); }
        else Uart_SendString("ERR\r\n");
    }
    else if (strncmp((char*)uart_buf, "STA", 3) == 0) { ... }
    else if (strncmp((char*)uart_buf, "PAS", 3) == 0) { ... }
    else Uart_SendString("ERR\r\n");

    uart_cnt = 0; memset(uart_buf, 0, 30);
}
```

文本协议的三个要点：
1. **用换行断帧**（`\r` / `\n`），不用定时器判帧尾
2. **前缀匹配**（`strncmp`）+ 数字自己累乘解析，不依赖 `sscanf`（省 ROM、也更可控）
3. 解析完立刻清缓冲，避免下一帧粘上上一帧的尾巴

## 完成提示：用状态机表达"现在不接受输入"

```c
void Key_Process(unsigned char key) {
    if (sys_state == SYS_FINISHING) return;      // 响铃期间按键全失效
    ...
}

void UART_Process() {
    if (sys_state == SYS_FINISHING) { uart_cnt = 0; memset(uart_buf, 0, 30); return; }
    ...
}
```

倒计时归零那一刻（在中断里）：

```c
if (focus_remain_time == 0) {
    sys_state = SYS_FINISHING;
    view_state = VIEW_FOCUS;      // 强制切回专注界面
    finish_tick = 0;
    Write_HC573(5, 0x40);         // 蜂鸣器响
}
```

5 秒到点（`++finish_tick >= 5000`）：关蜂鸣器、`sys_state = SYS_IDLE`、`focus_remain_time = focus_set_time`（恢复设定值）。

> 把"现在不许操作"做成一个**状态**，比到处写 `if (!响铃中)` 干净得多 —— 这是状态机最实用的地方。

## 参数是算出来的，不是背的

**1ms 定时**（12MHz、1T 模式）：

```c
AUXR |= 0x80;              // T0 工作在 1T
TL0 = 0x20; TH0 = 0xD1;    // 0xD120 = 53536
// 65536 - 53536 = 12000
// 12000 / 12MHz = 1ms  ✓
```

**9600 波特率**（T2 做波特率发生器）：

```c
AUXR |= 0x01;              // T2 也是 1T
T2L = 0xC7; T2H = 0xFE;    // 0xFEC7 → 重装 313
// 12MHz / 313 / 4 ≈ 9585 ≈ 9600  （误差 0.16%）
```

**换晶振这两组数就都作废** —— 所以一定要会算，别背。

## 验收清单（照着按）

| # | 操作 | 期望现象 |
| --- | --- | --- |
| 1 | 上电 | `23-55-55`、蜂鸣器静音、LED 全灭 |
| 2 | 按 S4 | `P-----12` ↔ `23-55-55` |
| 3 | S8/S9 长按 | 1~60 平稳加减；启动后按它们无反应 |
| 4 | S5 启动 | 倒计时开始，**L1 亮**、L2/L3 灭 |
| 5 | S5 再按 | 数字停住，**L2 亮**、L1 灭 |
| 6 | S5 再按 | 继续倒计时，**L1 亮**、L2 灭 |
| 7 | S12 | 立刻恢复设定值，L1/L2 全灭 |
| 8 | 设 3 秒启动，等归零 | 强制回专注界面、`P-----00`、蜂鸣 5 秒、**L3 亮**、所有按键失效 |
| 9 | 硬等 5 秒 | 蜂鸣停、显示恢复 `P-----03`、L3 灭 |
| 10 | 串口 `SET,20` | 回 `OK`，数码管变 20 |
| 11 | 串口 `SET,70` | 回 `ERR`（越界） |
| 12 | 串口 `STA` / 再 `STA` | `OK` / `ERR`（已在运行） |
| 13 | 串口 `PAS` | `OK`，暂停 |
| 14 | 串口 `ABC` | `ERR`（未定义命令） |

## 代码里值得改的 4 处

1. **中断与主循环抢锁存器**
   `Timer0_Isr` 每 1ms 调一次 `Write_HC573`（写 P0/P2），主循环的 `Update_LED()` 也写同一组口。如果主循环那次刚好在"P0 已写、P2 还没选通道"的瞬间被打断，LED 数据就可能被锁进数码管的锁存器 → 偶发显示错位。
   **改法**：把主循环里的锁存器写入用 `EA = 0; ... EA = 1;` 包成临界区，或者干脆把 LED 更新也放进 1ms 中断。

2. **DS1302 只定义了引脚，还没实现**
   `Update_Display_Buffer()` 里的 `h = 23, m = 55, s = 55` 是假数据。接上就用之前 DS1302 那套 `DS1302_ReadTime()` + BCD 转换。

3. **魔法数字**
   `disp_buf[0] = 11` 里的 11 是 `'P'` 的段码索引。建议 `#define SEG_DASH 10` / `SEG_P 11` / `SEG_BLANK 12`，过两周自己都认不出。

4. **串口是阻塞发送**
   `Uart_SendString` 里 `while(!TI)` 一字节约 1ms，发 `ERR\r\n` 卡主循环 5ms。现在无害，但要"边发边扫描"就得改成中断发送 + 环形缓冲。

## 完整代码

```c
#include <stc15f2k60s2.h>
#include <stdio.h>
#include <string.h>

// ==================== 引脚定义 ====================
sbit DS1302_SCLK = P1^7;
sbit DS1302_IO   = P2^3;
sbit DS1302_RST  = P1^3;

// 状态机
#define SYS_IDLE      0
#define SYS_RUNNING   1
#define SYS_PAUSED    2
#define SYS_FINISHING 3

#define VIEW_CLOCK    0
#define VIEW_FOCUS    1

// ==================== 全局变量 ====================
unsigned char sys_state = SYS_IDLE;
unsigned char view_state = VIEW_CLOCK;

unsigned char focus_set_time = 12;    
unsigned char focus_remain_time = 12; 
unsigned int  tick_1s = 0;            
unsigned int  finish_tick = 0;        

// 显存 (全为12代表全灭)
unsigned char disp_buf[8] = {12, 12, 12, 12, 12, 12, 12, 12};

// 【必须】共阳极段码表 (0亮1灭)
unsigned char code Seg_Table[] = {
    0xC0, 0xF9, 0xA4, 0xB0, 0x99, 0x92, 0x82, 0xF8, 0x80, 0x90, 
    0xBF, // 10: '-'
    0x8C, // 11: 'P'
    0xFF  // 12: 全灭
};

unsigned char key_val = 0;
unsigned char uart_buf[30];
unsigned char uart_cnt = 0;
bit uart_flag = 0;

// ==================== 底层硬件操作 ====================
// 【核心修复】先放数据，再开锁存器，最后关锁存器
void Write_HC573(unsigned char channel, unsigned char dat) {
    P0 = dat; // 1. 先把数据放到总线上
    switch(channel) {
        case 4: P2 = (P2 & 0x1F) | 0x80; break; // LED
        case 5: P2 = (P2 & 0x1F) | 0xA0; break; // 蜂鸣器
        case 6: P2 = (P2 & 0x1F) | 0xC0; break; // 数码管位选
        case 7: P2 = (P2 & 0x1F) | 0xE0; break; // 数码管段选
    }
    P2 &= 0x1F; // 2. 关闭锁存器，把数据锁住
}

void Sys_Init() {
    P0M1 = 0; P0M0 = 0; 
    P2M1 = 0; P2M0 = 0;
    P1M1 = 0; P1M0 = 0;
    P3M1 = 0; P3M0 = 0;
    P4M1 = 0; P4M0 = 0;
    
    Write_HC573(4, 0xFF); // 关所有LED (低电平亮)
    Write_HC573(5, 0x00); // 关蜂鸣器
    Write_HC573(6, 0x00); // 关数码管位选 (全0不选)
    Write_HC573(7, 0xFF); // 关数码管段选 (共阳极全1全灭)
}

void Timer0_Init() {
    AUXR |= 0x80; TMOD &= 0xF0; TL0 = 0x20; TH0 = 0xD1;
    TF0 = 0; TR0 = 1; ET0 = 1; EA = 1;
}

void UART_Init() {
    SCON = 0x50; 
    AUXR |= 0x01; AUXR |= 0x04; T2L = 0xC7; T2H = 0xFE;
    ES = 1; EA = 1;
}

void Uart_SendString(char *str) {
    while(*str != '\0') { SBUF = *str++; while(!TI); TI = 0; }
}

void Key_Scan() {
    unsigned char temp = 0;
    static unsigned char key_up = 1; // 默认按键处于松开状态
    
    // 扫描第 1 列 (COL1 = P4.4)
    P3 = 0x0F; P44 = 0; P42 = 1; P35 = 1; P34 = 1;
    if (P33 == 0) temp = 4; 
    else if (P32 == 0) temp = 5; 
    
    // 扫描第 2 列 (COL2 = P4.2)
    P3 = 0x0F; P44 = 1; P42 = 0; P35 = 1; P34 = 1;
    if (P33 == 0) temp = 8; 
    else if (P32 == 0) temp = 9; 
    
    // 扫描第 3 列 (COL3 = P3.5)
    P3 = 0x0F; P44 = 1; P42 = 1; P35 = 0; P34 = 1;
    if (P33 == 0) temp = 12; 
    
    // 【核心修改】松手检测逻辑
    if (temp != 0) {         // 如果检测到有键按下
        if (key_up) {        // 并且上一次的状态是松开
            key_up = 0;      // 标记为已按下，防止连续触发
            key_val = temp;  // 把键值传给主循环去处理
        }
    } else {                 // 如果没有键按下
        key_up = 1;          // 恢复为松开状态，允许下一次触发
    }
}

// 数码管动态扫描 (必须在定时器里持续调用)
void Display_Scan() {
    static unsigned char pos = 0;
    
    // 1. 消影 (关闭所有段)
    Write_HC573(7, 0xFF); 
    
    // 2. 位选 (选中当前pos位，高电平有效)
    Write_HC573(6, (1 << pos)); 
    
    // 3. 段选 (写入对应数字的段码)
    Write_HC573(7, Seg_Table[disp_buf[pos]]); 
    
    pos++;
    if(pos >= 8) pos = 0;
}

void Update_Display_Buffer() {
    // 假数据，等DS1302调通了替换掉
    unsigned char h=23, m=55, s=55; 
    
    if (view_state == VIEW_CLOCK) {
        disp_buf[0] = h/10; disp_buf[1] = h%10;
        disp_buf[2] = 10; // '-'
        disp_buf[3] = m/10; disp_buf[4] = m%10;
        disp_buf[5] = 10; // '-'
        disp_buf[6] = s/10; disp_buf[7] = s%10;
    } else {
        disp_buf[0] = 11; // 'P'
        disp_buf[1] = 12; disp_buf[2] = 12; disp_buf[3] = 12; disp_buf[4] = 12; disp_buf[5] = 12; 
        
        if (sys_state == SYS_FINISHING) {
            disp_buf[6] = 0; disp_buf[7] = 0;
        } else {
            disp_buf[6] = focus_remain_time / 10;
            disp_buf[7] = focus_remain_time % 10;
        }
    }
}

void Update_LED() {
    unsigned char led_val = 0xFF; // 全灭
    if (sys_state == SYS_RUNNING)   led_val &= ~0x01; // L1亮
    if (sys_state == SYS_PAUSED)    led_val &= ~0x02; // L2亮
    if (sys_state == SYS_FINISHING) led_val &= ~0x04; // L3亮
    
    Write_HC573(4, led_val);
}

void Key_Process(unsigned char key) {
    if (sys_state == SYS_FINISHING) return;

    switch (key) {
        case 4: view_state = !view_state; break; 
        case 5: 
            if (view_state == VIEW_FOCUS) {
                if (sys_state == SYS_IDLE)         sys_state = SYS_RUNNING;
                else if (sys_state == SYS_RUNNING) sys_state = SYS_PAUSED;
                else if (sys_state == SYS_PAUSED)  sys_state = SYS_RUNNING;
            }
            break;
        case 8: 
            if (view_state == VIEW_FOCUS && sys_state == SYS_IDLE) {
                if (focus_set_time < 60) { focus_set_time++; focus_remain_time = focus_set_time; }
            }
            break;
        case 9: 
            if (view_state == VIEW_FOCUS && sys_state == SYS_IDLE) {
                if (focus_set_time > 1) { focus_set_time--; focus_remain_time = focus_set_time; }
            }
            break;
        case 12: 
            if (view_state == VIEW_FOCUS && (sys_state == SYS_RUNNING || sys_state == SYS_PAUSED)) {
                sys_state = SYS_IDLE; focus_remain_time = focus_set_time;
            }
            break;
    }
}

void UART_Process() {
    if (uart_flag) {
        uart_flag = 0;
        if (sys_state == SYS_FINISHING) { uart_cnt=0; memset(uart_buf,0,30); return; }

        if (strncmp((char*)uart_buf, "SET,", 4) == 0) {
            if (sys_state == SYS_IDLE) {
                unsigned char val = 0, i = 4;
                while (uart_buf[i] >= '0' && uart_buf[i] <= '9') { val = val * 10 + (uart_buf[i] - '0'); i++; }
                if (val >= 1 && val <= 60) { focus_set_time = val; focus_remain_time = val; Uart_SendString("OK\r\n"); } 
                else Uart_SendString("ERR\r\n");
            } else Uart_SendString("ERR\r\n");
        } 
        else if (strncmp((char*)uart_buf, "STA", 3) == 0) {
            if (sys_state == SYS_IDLE || sys_state == SYS_PAUSED) { sys_state = SYS_RUNNING; Uart_SendString("OK\r\n"); } 
            else Uart_SendString("ERR\r\n");
        } 
        else if (strncmp((char*)uart_buf, "PAS", 3) == 0) {
            if (sys_state == SYS_RUNNING) { sys_state = SYS_PAUSED; Uart_SendString("OK\r\n"); } 
            else Uart_SendString("ERR\r\n");
        } else Uart_SendString("ERR\r\n");
        
        uart_cnt = 0; memset(uart_buf, 0, 30);
    }
}

void Timer0_Isr() interrupt 1 {
    static unsigned char key_tick = 0; 
    
    Display_Scan();
    
    if (++key_tick >= 10) { key_tick = 0; Key_Scan(); }

    if (sys_state == SYS_RUNNING) {
        if (++tick_1s >= 1000) {
            tick_1s = 0;
            if (focus_remain_time > 0) focus_remain_time--;
            if (focus_remain_time == 0) {
                sys_state = SYS_FINISHING; view_state = VIEW_FOCUS; finish_tick = 0;
                Write_HC573(5, 0x40); // 蜂鸣器响 (P0.6=1)
            }
        }
    }
    
    if (sys_state == SYS_FINISHING) {
        if (++finish_tick >= 5000) {
            sys_state = SYS_IDLE;
            Write_HC573(5, 0x00); // 蜂鸣器关
            focus_remain_time = focus_set_time;
        }
    }
}

void UART_Isr() interrupt 4 {
    unsigned char dat;
    if (RI) {
        RI = 0; dat = SBUF;
        if (dat == '\n' || dat == '\r') uart_flag = 1; 
        else { if (uart_cnt < 29) uart_buf[uart_cnt++] = dat; }
    }
}

void main() {
    Sys_Init();      
    
    // 上电先给一次正确数据再开中断
    Update_Display_Buffer();
    Update_LED();
    
    Timer0_Init();   
    UART_Init();     

    while (1) {
        Update_Display_Buffer();
        Update_LED();
        
        if (key_val != 0) {
            Key_Process(key_val);
            key_val = 0;
        }
        UART_Process();
    }
}
```

---

**一句话总结**：外设驱动都是套路（锁存器、扫描、消影、松手检测、换行断帧），真正决定这个工程好不好维护的，是**状态机 + 显存分离**这两件事。
