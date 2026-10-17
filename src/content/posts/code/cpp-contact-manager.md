---
title: C++ 通讯录管理系统（8.14 作业总结）
published: 2026-08-14
description: "通讯录管理系统的 8.14 作业总结：结构体聚合、指针传参、数组删除迁移与输入校验，并附五道错题纠偏和代码模板备忘。"
tags: [C++, 结构体, 指针传参, 数组删除迁移, 输入校验]
category: 编程语言
image: ""
series: C++ 学习日志
seriesOrder: 3
---

> **核心主题**：结构体数据聚合、指针传参、数组删除迁移、健壮性输入校验
> **实践文件**：`AddressBookManager_1.cpp`（通讯录管理系统完整版）
> **关联知识**：结构体嵌套、线性查找、switch-case 菜单控制、三目运算符

------

## 一、核心知识点图谱

### 1. 结构体（Struct）与数据聚合

- **作用**：将不同类型的数据（姓名、性别、年龄、号码、地址）绑定为一个自定义类型 `Person`
- **嵌套使用**：`Addressbooks` 结构体中包含 `Person` 结构体数组 `personArray[MAX]`，实现数据的层级管理
- **访问方式**：指针访问成员用 `->`，结构体成员用 `.`，如 `abs->personArray[i].m_Name`

### 2. 指针传参（地址传递）

- **为什么用指针**：`void addPerson(Addressbooks *abs)` 使用指针传递，是为了在函数内部**直接修改**主函数中的原始数据
- **对比**：若使用值传递（`Addressbooks abs`），函数内操作的是副本，退出后原数据不变，且拷贝 1000 人的大数组极其浪费性能
- **调用方式**：`addPerson(&abs)`，取地址传入

### 3. 数组元素的删除与迁移

- **核心逻辑**：数组在内存中是连续的，删除中间元素后，必须将后续所有元素**向前移动一位**以填补空缺
- **实现方式**：`for(int i = ret; i < m_Size - 1; i++) { arr[i] = arr[i+1]; }`，最后 `m_Size--`
- **清空操作**：`abs->m_Size = 0`，只需重置计数器即可逻辑清空

### 4. 健壮性输入校验

- **防卡死机制**：使用 `while(true)` 循环包裹 `cin`，配合 `break` 实现"输入错误则重试，输入正确则跳出"的交互逻辑
- **关键规则**：处理完有效输入后**必须 break**，否则死循环

### 5. 三目运算符

- `(sex == 1 ? "男" : "女")` 用于在输出时直接将数字映射为文本
- **注意必须加括号**以保证运算优先级，否则 `cout << sex == 1 ? "男" : "女"` 会被解析为 `(cout << sex) == 1 ? "男" : "女"`

### 6. 线性查找

- `is_Exist` 函数：遍历数组逐一比对姓名，存在返回索引值，不存在返回 -1
- **返回值约定**：返回 -1 表示未找到，返回 ≥ 0 的整数表示找到位置

### 7. Switch-case 菜单控制

- 主循环 `while(true)` + `switch(selete)` 实现菜单重复显示
- 每个 case 末尾 `break` 防止穿透
- `case 0` 中直接 `return 0` 退出程序

------

## 二、今日错题与代码纠偏

### 错题1：addPerson 边界条件判断错误

- **错误代码**：`if(abs->m_Size >= MAX - 1)`
- **错因分析**：`MAX = 1000`，数组下标范围是 `0 ~ 999`。当 `m_Size == 999` 时，下标 999 的位置还是空的，还能再加 1 个人。但代码在 `m_Size >= 999` 时就拒绝了，浪费了最后一个名额。
- **正确写法**：`if(abs->m_Size >= MAX)`，只有当人数达到 1000 时才拒绝添加

### 错题2：deletePerson 迁移循环越界访问

- **错误代码**：`for(int i=ret; i<abs->m_Size; i++)`
- **错因分析**：当 `i = m_Size - 1` 时，`arr[i+1]` 即 `arr[m_Size]` 越界访问（数组最大下标是 `m_Size - 1`）。虽然这次读的是"垃圾数据"但不影响正确性（因为紧接着 `m_Size--` 会丢弃它），但属于未定义行为，应修正。
- **正确写法**：`for(int i=ret; i<abs->m_Size - 1; i++)`，确保 `i+1` 最大为 `m_Size - 1`

### 错题3：deletePerson 选择"否"时死循环

- 错误代码

  ：

  ```cpp
  if(select_delete == 1||select_delete ==0){
      if(select_delete == 1){
          // 删除逻辑
          break;
      }
      //  select_delete == 0 时，外层 if 为真但内层 if 为假，无 break！
  }
  else{
      cout<<"输入无效,请重新输入"<<endl;
  }
  ```

- **错因分析**：输入 `0`（否）时，外层 `if(select_delete == 1||select_delete ==0)` 条件为真，进入 if 块；但内层 `if(select_delete == 1)` 为假，不执行任何操作也不 break，循环回到开头继续等待输入 → 死循环。

- 正确写法

  ：

  ```cpp
  if(select_delete == 1){
      // 删除逻辑
      break;
  } else if(select_delete == 0){
      cout<<"取消删除,即将返回主界面"<<endl;
      break;
  } else{
      cout<<"输入无效,请重新输入"<<endl;
  }
  ```

### 错题4：modifyPerson 变量名遮蔽

- 问题代码

  ：

  ```cpp
  string name;          // 外层：要查找的联系人姓名
  cin >> name;
  int ret = is_Exist(abs, name);
  // ...
  string name;          //  内层：新输入的姓名，遮蔽了外层 name
  cin >> name;
  ```

- **错因分析**：虽然 C++ 允许内层变量遮蔽外层变量（编译不报错），但 `name` 的含义从"查找用"变成了"新姓名输入"，极易引发混淆和后续维护困难。

- **正确写法**：内层变量改名为 `newName`，保持语义清晰

### 错题5：clearPerson 的 break 缺失（历史 Bug，已在本次提交中修复）

- **原始问题**：输入 `1` 后执行了清空操作，但没有 `break`，`while(true)` 没有出口 → 死循环
- **当前代码已修复**：`if(clear_select==1)` 和 `else if(clear_select==0)` 两处都加了 `break` ✅

------

## 三、代码模板备忘（最佳实践版）

### 1. 安全的边界检查

```cpp
// ✅ 正确：m_Size 从 0 开始，最大有效值为 MAX-1
// 只有当 m_Size 达到 MAX 时才拒绝
if (abs->m_Size >= MAX) {
    cout << "当前通讯录人数已达到最大值" << endl;
}
```

### 2. 安全的删除迁移逻辑

```cpp
// 从 ret 位置开始，将后面的元素全部前移一位
// 注意循环条件是 i < m_Size - 1，避免访问 arr[m_Size] 越界
for (int i = ret; i < abs->m_Size - 1; i++) {
    abs->personArray[i] = abs->personArray[i + 1];
}
abs->m_Size--; // 总数减 1
cout << "删除成功" << endl;
```

### 3. 健壮的输入校验模板（确认/取消模式）

```cpp
int select = 0;
while (true) {
    cin >> select;
    if (select == 1) {
        // 处理确认操作
        break; // 处理完必须跳出
    } else if (select == 0) {
        // 处理取消操作
        cout << "取消操作" << endl;
        break; // 取消也要跳出
    } else {
        cout << "输入无效,请重新输入: ";
        // 这里不加 break，继续循环等待输入
    }
}
```

### 4. 安全的清空逻辑

```cpp
void clearPerson(Addressbooks* abs) {
    cout << "是否清空联系人(清除所有数据,无法撤回)" << endl;
    cout << "1---是  0---否" << endl;
    int clear_select = 0;
    while (true) {
        cin >> clear_select;
        if (clear_select == 1) {
            abs->m_Size = 0;
            cout << "联系人已清空" << endl;
            break; // 关键：跳出循环
        } else if (clear_select == 0) {
            cout << "取消清空,即将返回主界面" << endl;
            break; // 关键：跳出循环
        } else {
            cout << "输入无效,请重新输入(1或0): ";
        }
    }
    system("pause");
    system("cls");
}
```

------

## 四、通讯录系统架构速查

| 功能模块   | 核心函数       | 关键技术点                                         |
| ---------- | -------------- | -------------------------------------------------- |
| 添加联系人 | `addPerson`    | 边界检查（`>= MAX`）、输入校验、`m_Size++`         |
| 显示联系人 | `showPerson`   | 遍历数组、三目运算符格式化输出                     |
| 删除联系人 | `deletePerson` | 查找索引、数组元素前移（`< m_Size-1`）、`m_Size--` |
| 查找联系人 | `findPerson`   | 线性查找、返回索引或 -1                            |
| 修改联系人 | `modifyPerson` | 查找 + 覆盖写入、变量命名不遮蔽                    |
| 清空联系人 | `clearPerson`  | `while(true)` + `break`、`m_Size = 0`              |

------

## 五、学习里程碑自评

-  掌握结构体的定义、嵌套及数组化使用
-  理解指针传参在修改大型数据结构中的必要性
-  掌握数组删除时的元素迁移算法
-  熟练使用 `while(true) + break` 构建健壮的输入校验循环
-  明确三目运算符的优先级与括号使用规范
-  掌握线性查找的实现与返回值约定（-1 表示未找到）
-  修复 `addPerson` 边界条件（应为 `>= MAX` 而非 `>= MAX-1`）
-  修复 `deletePerson` 迁移循环越界（应为 `< m_Size - 1`）
-  修复 `deletePerson` 选择"否"时的死循环（补 `else if(select_delete == 0)` + `break`）
-  修复 `modifyPerson` 变量名遮蔽（内层改名为 `newName`）

> **明日衔接建议**：当前通讯录使用固定大小数组（`MAX=1000`），存在空间浪费和上限限制。下一步建议学习 **`std::vector` 动态数组**，实现真正的动态扩容；同时可以尝试将文件读写（`fstream`）加入系统，实现数据的持久化存储（程序关闭后数据不丢失）。
