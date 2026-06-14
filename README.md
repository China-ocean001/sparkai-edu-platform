# 🤖 SparkAI 编程教育平台

> AI 驱动的 STEAM 编程教育平台 — 面向小学生和教师的互动学习系统

[![HTML5](https://img.shields.io/badge/HTML5-E34F26.svg)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📖 项目简介

SparkAI 是一个面向小学生和教师的 AI 驱动的 STEAM 编程教育平台前端原型。当前阶段为纯静态前端开发，使用 Mock 数据模拟后端接口。

## ✨ 页面与功能

| 页面 | 角色 | 功能描述 |
|------|------|----------|
| `login.html` | 公共 | 登录入口，角色选择（学生/教师） |
| `student-home.html` | 学生 | 学习仪表盘，课程概览 |
| `student-learning.html` | 学生 | AI 互动编程学习界面 |
| `teacher-home.html` | 教师 | 教学管理首页 |
| `teacher-class.html` | 教师 | 班级管理 |
| `teacher-course.html` | 教师 | 课程管理 |
| `course-director.html` | 课程主任 | 课程体系管理 |
| `style-final.html` | 全局 | 样式规范预览 |

## 🛠 技术栈

- 纯静态 HTML5 + CSS3 + JavaScript (ES6+)
- 完整 Mock API 层 (`api.js`)
- localStorage 数据持久化
- 响应式设计，移动端适配
- 图标精灵图系统

## 📁 项目结构

```
style-preview/
├── login.html                 # 登录页
├── student-home.html          # 学生首页
├── student-learning.html      # 学生学习页
├── teacher-home.html          # 教师首页
├── teacher-class.html         # 教师班级页
├── teacher-course.html        # 教师课程页
├── course-director.html       # 课程主任页
├── style-final.html           # 样式规范页
├── api.js                     # Mock API 层
├── API-DOCS.md                # API 接口文档
├── icons-final/               # 图标资源（大尺寸）
├── icons-small/               # 图标资源（小尺寸）
└── entry-*.png                # 入口截图
```

## 🚀 快速开始

直接用浏览器打开任意 `.html` 文件即可预览，无需任何构建工具。

```bash
# 或用简单的 HTTP 服务器
npx serve .
```

## 📝 API 文档

详见 [API-DOCS.md](./API-DOCS.md)，包含完整的数据模型、接口定义、Mock 规则说明。

## 📄 License

MIT License — 仅供学习交流使用
