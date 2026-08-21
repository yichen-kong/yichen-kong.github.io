---
title: 智能自主控制可回收探空系统 | Intelligent Autonomous Recoverable Sounding System
date: 2026-08-21
summary: 独立研发的"智能自主控制可回收探空系统"项目视频与研究报告
links:
  - type: pdf
    url: /uploads/research-report.pdf
  - type: video
    url: /uploads/project-video.mp4
tags:
  - 探空系统
  - 飞行器设计
  - 自主控制
  - 高空气象探测
---

## 项目视频 | Project Video

<video controls preload="metadata" style="width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
  <source src="/uploads/project-video.mp4" type="video/mp4">
  您的浏览器不支持 HTML5 视频播放，请 <a href="/uploads/project-video.mp4" target="_blank">点击下载视频</a>。
</video>

> [!NOTE]
> 视频文件较大（约 43MB），加载可能需要一些时间。您也可以直接 [下载视频文件](/uploads/project-video.mp4) 观看。

## 研究报告 | Research Report

本项目的完整研究报告（V4.1）已整理为 PDF 文档，包含系统设计、气动布局、控制算法、通信链路、制造工艺与实地测试等全部技术细节。

<div style="margin-top: 20px; margin-bottom: 20px;">
  <a href="/uploads/research-report.pdf" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">📄 下载研究报告 V4.1 (PDF)</a>
</div>

## 项目简介 | About the Project

系统由通信链路、飞行器（含探空装置）、地面站及业务计算终端等多部分构成，通过标准 750g 高空气球搭载升空，飞行器在约 30000 米高空与气球分离后，以可变斜翼无动力滑翔实现远程精确回收。

- **气动布局**：设计"变斜翼融合弹翼"气动布局，实现无操控面下的高效姿态调节
- **仿真验证**：Solidworks 参数化建模及 Xflow、Xflr5、ANSYS-Fluent/Star CCM 多尺度 CFD 仿真
- **硬件设计**：自主设计车规级六层高频 PCB
- **地面站**：基于 MAVlink 协议开发地面站及内嵌 ISA 大气模型的业务计算终端
- **制造工艺**：CNC 加工 PMI 泡沫、FDM 打印 HT-PLA-GF、MJF 打印 PA11 等极端环境制造工艺
- **飞控算法**：基于 MBD 方法开发非线性全耦合飞控算法，应用自整定 PID 与总能量管理策略实现稳定自主返航
- **通信链路**：自研特高频 LoRa CSS 射频链路结合 12 单元八木天线，实现低功率超远程双向通信

<!--more-->