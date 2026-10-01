---
title: AI 与机器学习学习路线（持续更新）
published: 2026-10-01
description: "我在 AI 与机器学习方向的学习路线与进度清单：数学基础、Python 工具链、经典机器学习、深度学习、模型应用。"
tags: [学习路线, 机器学习, 深度学习, Python]
category: AI 与机器学习
image: ""
series: AI 学习笔记
seriesOrder: 1
---

## 这篇是干什么的

这是我学习 AI 与机器学习的**总索引**：上面是路线和进度，下面是已经写完的笔记链接。

每学完一块就回来打勾，并把这部分的笔记链接补到「笔记索引」表里。

## 阶段一：数学基础

不用一上来就啃完整本教材，够用就行，遇到不懂的再回来补。

- [ ] 线性代数：向量与矩阵运算、矩阵乘法、转置与逆、特征值与特征向量
- [ ] 概率统计：条件概率、贝叶斯公式、常见分布（正态/伯努利/泊松）、期望与方差
- [ ] 微积分：导数、偏导数、链式法则、梯度与极值
- [ ] 信息论：熵、交叉熵、KL 散度（理解损失函数要用）

## 阶段二：Python 工具链

- [ ] NumPy：ndarray、广播机制、向量化运算
- [ ] pandas：DataFrame 的读写、筛选、分组聚合
- [ ] Matplotlib / Seaborn：常用图表
- [ ] 环境管理：venv / conda，把依赖固定到 `requirements.txt`
- [ ] Jupyter Notebook：交互式实验与记录

## 阶段三：经典机器学习

- [ ] 线性回归与逻辑回归（含梯度下降推导）
- [ ] 决策树、随机森林、GBDT
- [ ] 支持向量机（SVM）
- [ ] 聚类：K-Means、层次聚类
- [ ] 降维：PCA
- [ ] 模型评估：训练/验证/测试集划分、交叉验证、混淆矩阵、精确率/召回率、ROC-AUC
- [ ] 特征工程：缺失值、归一化/标准化、类别编码、特征选择
- [ ] 过拟合与正则化：L1/L2、偏差-方差权衡

## 阶段四：深度学习

- [ ] 神经网络基础：感知机、前向传播、反向传播、激活函数
- [ ] PyTorch 基础：Tensor、autograd、`nn.Module`、`Dataset`/`DataLoader`
- [ ] 卷积神经网络 CNN 与图像分类（LeNet → ResNet）
- [ ] 循环神经网络 RNN / LSTM 与序列建模
- [ ] Transformer 与注意力机制
- [ ] 训练技巧：批归一化、学习率调度、Dropout、早停、权重初始化

## 阶段五：应用与大模型

- [ ] 迁移学习：加载预训练模型做微调
- [ ] 提示工程与结构化输出
- [ ] RAG：向量检索 + 上下文拼接
- [ ] 部署：本地推理、封装成 API 服务

## 笔记索引

| 日期 | 笔记 | 主题 |
| --- | --- | --- |
| 2026-10-01 | 本篇 | 学习路线与进度总览 |

## 常用资源

- 课程：[吴恩达 Machine Learning](https://www.coursera.org/specializations/machine-learning-introduction)、[动手学深度学习](https://zh.d2l.ai/)
- 文档：[PyTorch 官方教程](https://pytorch.org/tutorials/)、[scikit-learn 用户指南](https://scikit-learn.org/stable/user_guide.html)
- 工具：[Kaggle](https://www.kaggle.com/) 练手数据集与竞赛

> [!TIP]
> 这个方向最容易「看会了但写不出来」。每个知识点尽量配一个能跑的小例子，代码跑通再写笔记。
