# 🤖 SparkAI 编程教育平台

> AI 驱动的 STEAM 编程教育平台 — 面向小学生和教师的互动学习系统

<div align="center">

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Responsive](https://img.shields.io/badge/Responsive-✓-brightgreen?style=flat)](https://www.w3.org/Style/CSS/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat)](LICENSE)

</div>

---

## 📑 目录

- [📖 项目简介](#-项目简介)
- [🎯 目标用户](#-目标用户)
- [📄 页面详解](#-页面详解)
- [🏗️ 路由与导航](#️-路由与导航)
- [🛠 技术方案](#-技术方案)
- [📁 项目结构](#-项目结构)
- [🔌 Mock API 设计](#-mock-api-设计)
- [📊 数据模型](#-数据模型)
- [🚀 快速开始](#-快速开始)
- [📱 响应式适配](#-响应式适配)

---

## 📖 项目简介

**SparkAI** 是一个面向小学生和教师的 **AI 驱动的 STEAM 编程教育平台前端原型**。当前阶段为纯静态前端开发（无后端依赖），使用 Mock 数据模拟所有后端接口，专注于 UI/UX 设计与交互验证。

### 核心设计理念

- 🧒 **低门槛**：面向小学生，界面简洁直观，大字体大图标
- 🤖 **AI 辅助**：集成 AI 对话，引导编程学习
- 📱 **全适配**：PC 端 + 移动端完美适配
- 🎨 **活泼风格**：多彩配色，卡通图标体系

---

## 🎯 目标用户

| 角色 | 描述 | 核心需求 |
|------|------|----------|
| 👨‍🎓 **小学生** | 6-12 岁编程初学者 | 趣味学习、AI 辅助、进度追踪 |
| 👩‍🏫 **教师** | 编程课程教师 | 班级管理、课程编排、学情监控 |
| 📋 **课程主任** | 课程体系设计者 | 课程目录规划、教学大纲 |

---

## 📄 页面详解

### 🔐 登录页 (`login.html`)
- 角色选择：学生 / 教师
- 表单验证
- 记住密码 & 自动登录
- 密码找回入口

### 👨‍🎓 学生端
| 页面 | 路由 | 功能 |
|------|------|------|
| 学生首页 | `student-home.html` | 学习进度概览、今日任务、课程推荐、AI 助手入口 |
| 学习界面 | `student-learning.html` | 交互式编程环境、AI 对话辅导、代码练习、闯关进度 |

### 👩‍🏫 教师端
| 页面 | 路由 | 功能 |
|------|------|------|
| 教师首页 | `teacher-home.html` | 班级总览、教学日程、待批作业数 |
| 班级管理 | `teacher-class.html` | 班级创建/编辑、学生名单、学习报告 |
| 课程管理 | `teacher-course.html` | 课程创建、章节编排、资源上传 |

### 📋 管理端
| 页面 | 路由 | 功能 |
|------|------|------|
| 课程体系 | `course-director.html` | 课程目录树、课程关联、发布状态管理 |

---

## 🏗️ 路由与导航

```
                    ┌─────────────┐
                    │  login.html │
                    │   登录页    │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              ↓                         ↓
    ┌─────────────────┐       ┌─────────────────┐
    │ student-home    │       │ teacher-home    │
    │ 学生首页        │       │ 教师首页        │
    └────────┬────────┘       └────────┬────────┘
             ↓                         ↓
    ┌─────────────────┐       ┌─────────────────┐
    │ student-learning│       │ teacher-class   │
    │ 学习界面        │       │ 班级管理        │
    └─────────────────┘       └────────┬────────┘
                                       ↓
                              ┌─────────────────┐
                              │ teacher-course  │
                              │ 课程管理        │
                              └─────────────────┘
                                       ↓
                              ┌─────────────────┐
                              │course-director  │
                              │ 课程体系        │
                              └─────────────────┘
```

---

## 🛠 技术方案

### 前端技术

| 层面 | 技术 | 说明 |
|------|------|------|
| **结构** | HTML5 语义化标签 | 无障碍访问支持 |
| **样式** | CSS3 Grid + Flexbox | 响应式布局 |
| **交互** | Vanilla JavaScript ES6+ | 无框架依赖 |
| **API** | Mock API 层 (`api.js`) | 模拟 REST 接口 |
| **存储** | localStorage | 客户端数据持久化 |
| **图标** | PNG 精灵图 | 两套尺寸 (大/小) |

### Mock API 设计

```javascript
// api.js - 核心 API 对象
const API = {
  auth: {
    login(credentials)      → Promise<User>,
    logout()                → Promise<void>,
    getCurrentUser()        → Promise<User>,
  },
  courses: {
    getList(filters)        → Promise<PageResult<Course>>,
    getDetail(id)           → Promise<Course>,
    getChapters(courseId)   → Promise<Chapter[]>,
  },
  students: {
    getProgress()           → Promise<StudentProgress>,
    getTaskList()           → Promise<Task[]>,
  },
  ai: {
    chat(message, context)  → Promise<AIResponse>,
    getSuggestions()        → Promise<Suggestion[]>,
  },
  teacher: {
    getClassList()          → Promise<Class[]>,
    getStudentList(classId) → Promise<Student[]>,
  },
};
```

所有 API 返回符合规范的 Promise，延迟 200-500ms 模拟网络请求。

---

## 📁 项目结构

```
sparkai-edu-platform/
├── login.html                    # 🔐 登录页 (角色选择)
├── student-home.html             # 🏠 学生首页 (学习仪表盘)
├── student-learning.html         # 📚 学习界面 (AI互动编程)
├── teacher-home.html             # 🏠 教师首页 (教学管理)
├── teacher-class.html            # 👥 班级管理
├── teacher-course.html           # 📖 课程管理
├── course-director.html          # 🏗️ 课程体系管理
├── style-final.html              # 🎨 样式规范预览
├── api.js                        # 🔌 Mock API 核心层
├── API-DOCS.md                   # 📄 API 完整文档
├── icons-final/                  # 🖼️ 大图标 (教师/学生入口)
│   ├── blue-dark.png
│   ├── blue-light.png
│   ├── blue-round.png
│   ├── cyan.png
│   ├── green.png
│   ├── orange.png
│   ├── pink-1.png
│   ├── pink-2.png
│   ├── purple.png
│   ├── yellow-1.png
│   └── yellow-2.png
├── icons-small/                  # 🔹 小图标 (功能入口)
│   ├── blue-dark.png      # 深蓝 - 编程挑战
│   ├── blue-light.png     # 浅蓝 - 学习资源
│   ├── cyan.png           # 青色 - AI助手
│   ├── green.png          # 绿色 - 已完成
│   ├── orange.png         # 橙色 - 进行中
│   ├── pink-1.png         # 粉色 - 创意项目
│   └── purple.png         # 紫色 - 进阶课程
├── entry-student.png             # 📸 学生端入口截图
├── entry-teacher.png             # 📸 教师端入口截图
├── float-elements.png            # 🖼️ 浮动元素参考
└── float-ref.png                 # 🖼️ 浮动元素参考线
```

---

## 📊 数据模型

### User (用户)

```typescript
interface User {
  id: number;
  username: string;
  realName: string;
  role: 'STUDENT' | 'TEACHER' | 'DIRECTOR';
  avatar: string;           // 头像 URL
  grade?: string;           // 年级 (学生)
  subject?: string;         // 学科 (教师)
}
```

### Course (课程)

```typescript
interface Course {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  teacherId: number;
  teacherName: string;
  chapterCount: number;
  studentCount: number;     // 学习人数
  difficulty: 1 | 2 | 3;   // 难度等级
  status: 'DRAFT' | 'PUBLISHED';
  createTime: string;
}
```

### StudentProgress (学习进度)

```typescript
interface StudentProgress {
  completedCourses: number;
  totalCourses: number;
  totalPoints: number;
  currentStreak: number;    // 连续学习天数
  weeklyTasks: Task[];
}
```

---

## 🚀 快速开始

### 零依赖预览

直接用浏览器打开任意 `.html` 文件即可预览：

```bash
# Windows
start login.html

# macOS
open login.html
```

### 本地服务器（推荐）

```bash
# 使用 npx (无需安装)
npx serve .

# 或使用 Python
python -m http.server 8080

# 或使用 Node.js
npx http-server -p 8080
```

访问 http://localhost:8080/login.html

### 推荐的浏览器

| 浏览器 | 版本 |
|--------|------|
| Chrome | 90+ ✅ |
| Edge | 90+ ✅ |
| Firefox | 88+ ✅ |
| Safari | 14+ ✅ |

---

## 📱 响应式适配

| 断点 | 宽度 | 适配 |
|------|------|------|
| 📱 手机 | < 768px | 单列布局, 底部导航 |
| 📲 平板 | 768px - 1024px | 双列布局, 侧边栏收起 |
| 🖥️ 桌面 | > 1024px | 完整布局, 侧边栏常驻 |

---

## 📝 API 文档

完整 API 文档见 [API-DOCS.md](./API-DOCS.md)，包含：
- 数据模型定义
- 全部 REST 端点
- Mock 数据规则
- localStorage 持久化约定
- 权限与登录守卫
- 变更规则

---

## 📄 License

MIT License — 仅供学习交流使用

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star！**

</div>
