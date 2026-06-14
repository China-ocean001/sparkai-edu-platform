# SparkAI API 接口文档 & Mock 数据规范

> 版本：v1.2  
> 更新日期：2026-05-30  
> 状态：纯前端 Mock 阶段，无后端依赖，API 合约已完整定义，移动端已全面优化

---

## 目录

1. [项目概述](#1-项目概述)
2. [页面与路由](#2-页面与路由)
3. [数据模型](#3-数据模型)
4. [API 端点](#4-api-端点)
5. [Mock 数据规则](#5-mock-数据规则)
6. [localStorage 持久化约定](#6-localstorage-持久化约定)
7. [权限与登录守卫](#7-权限与登录守卫)
8. [需求范围](#8-需求范围)
9. [变更规则](#9-变更规则)
10. [文件清单](#10-文件清单)

---

## 1. 项目概述

SparkAI 是一个面向小学生和教师的 AI 驱动的 STEAM 编程教育平台。当前阶段为**纯静态前端开发**，使用 Mock 数据模拟所有后端接口，不依赖任何后端服务。

### 技术栈

| 层级 | 技术 |
|------|------|
| 页面结构 | HTML5 |
| 样式 | 纯 CSS（CSS Custom Properties + Media Queries） |
| 交互逻辑 | 原生 JavaScript（无框架） |
| 数据持久化 | localStorage |
| Mock API | `api.js`（Promise 异步模拟） |

### 角色体系

| 角色 | 标识 | 权限范围 |
|------|------|----------|
| Student（学生） | `student` | 查看已绑定课程、学习课件、使用 AI 功能 |
| Teacher（教师） | `teacher` | 管理课程、班级、学生，查看备课视频，使用 AI 功能 |

---

## 2. 页面与路由

### 页面地图

```
style-final.html        → SparkAI 首页（落地页，入口）
login.html              → 登录页（?role=student|teacher）
student-home.html       → 学生端-我的课程
student-learning.html   → 学生端-课件学习（Scratch 动画制作 + AI 对话 + 图片转视频）
course-director.html    → 学生端-AI 导演课（6步魔法工坊 + 视频浮层）
teacher-home.html       → 教师端-首页
teacher-course.html     → 教师端-课程详情（PPT + 6步魔法工坊 + 备课视频浮层）
teacher-class.html      → 教师端-班级管理（班级/学生 CRUD）
```

### 页面跳转关系

```
style-final.html ──→ login.html ──┬──→ student-home.html ──┬──→ student-learning.html
                                  │                        └──→ course-director.html
                                  │
                                  └──→ teacher-home.html ──┬──→ teacher-course.html
                                                           └──→ teacher-class.html
```

### URL 参数约定

| 页面 | 参数 | 说明 |
|------|------|------|
| `login.html` | `?role=student` | 预选学生角色 |
| `login.html` | `?role=teacher` | 预选教师角色 |

---

## 3. 数据模型

### 3.1 User（用户）

```
User {
  id:       string     — 唯一标识（如 "u1"）
  name:     string     — 显示名称（如 "小明同学"）
  role:     "student" | "teacher"
  avatar:   string     — emoji 头像（如 "🐼"）
  account:  string     — 登录账号
  password: string     — 登录密码
  classId?: string     — 所属班级 ID（仅 student）
  class?:   string     — 班级名称（仅 student，冗余字段方便展示）
}
```

**约束：**
- `account` 在同一角色内唯一
- `password` 明文存储（Mock 阶段，生产环境须改为哈希）
- `classId` 必须对应 Classes 数组中存在的班级

### 3.2 Course（课程）

```
Course {
  id:            string      — 唯一标识（如 "course-scratch"）
  name:          string      — 课程名称（如 "Scratch 动画制作"）
  category:      string      — 分类标签（如 "图形编程"）
  description:   string      — 课程简介
  icon:          string      — emoji 图标（如 "🐱"）
  color:         string      — 主题色 hex（如 "#B6EDFF"）
  thumbColor:    string      — 缩略图渐变色 hex（如 "#C8F2FF"）
  totalLessons:  number      — 总课时数
  slides:        Slide[]     — 课件幻灯片列表
  videos:        Video[]     — 备课视频列表
}
```

**约束：**
- `id` 命名规则：`course-{slug}`，slug 为英文短横线连写
- `totalLessons` 必须等于 `slides.length`
- `slides` 数组顺序即课时顺序

### 3.3 Slide（幻灯片 / 课时）

```
Slide {
  tag:       string                  — 标签文字（如 "第 1 课 · Scratch 动画制作"）
  tagClass:  string                  — 标签样式类（"" | "pink"）
  title:     string                  — 幻灯片标题
  body:      string                  — 正文（支持 <br> 换行）
  icon:      string                  — 装饰 emoji
  color:     string                  — 装饰色 hex
  chips:     [string, string][]      — 知识点芯片 [[emoji, label], ...]
  code:      string | null           — 代码块 HTML（可选）
  visual:    [string, string][] | null  — 可视化积木块（可选，同 chips 结构）
}
```

**约束：**
- `tagClass` 仅允许 `""` 或 `"pink"` 两个值
- `chips` 数组每个元素为 `[emoji, label]` 二元组，长度任意
- `code` 为 HTML 字符串，直接插入页面，需注意 XSS 安全

### 3.4 Video（备课视频）

```
Video {
  id:       string     — 唯一标识（如 "v1"）
  title:    string     — 视频标题（如 "Scratch 入门引导"）
  duration: string     — 时长格式 "mm:ss"
  thumb:    string     — 缩略图 emoji
  color:    string     — 背景色 hex
}
```

**约束：**
- `duration` 格式必须为 `mm:ss`（分:秒）
- `id` 命名规则：`v{n}`，n 为自增数字

### 3.5 Class（班级）

```
Class {
  id:           string      — 唯一标识（如 "class-1"）
  name:         string      — 班级名称（如 "三年级 2 班"）
  createdAt:    string      — 创建日期 YYYY-MM-DD
  boundCourses: string[]    — 已绑定课程 ID 列表
  students:     Student[]   — 班级学生列表
}
```

**约束：**
- `id` 命名规则：`class-{n}`，n 为自增数字；新创建的班级使用 `Date.now().toString(36)` 生成
- `boundCourses` 中的每个 ID 必须对应 Courses 中存在的课程
- `createdAt` 格式必须为 `YYYY-MM-DD`

### 3.6 Student（学生，班级内嵌）

```
Student {
  name:     string   — 姓名（如 "张小明"）
  account:  string   — 登录账号（如 "xiaoming01"）
  password: string   — 密码（明文，Mock 阶段）
  avatar:   string   — emoji 头像
  active:   boolean  — 是否已登录（会话状态标记）
}
```

**约束：**
- `account` 全局唯一（由教师手工保证）
- `avatar` 从预定义 emoji 池中随机分配
- `active` 仅表示页面级状态标记，非真实在线状态

---

## 4. API 端点

> **通用说明：**
> - 所有 Mock 函数返回 `Promise`，模拟延迟 0-2500ms（详见 [5.9 模拟延迟汇总](#59-模拟延迟汇总)）
> - 对接后端时，将 `SparkAPI.xxx()` 调用替换为 `fetch()` 调用即可
> - 所有接口默认返回 HTTP 200，通过响应体中的 `success` 字段区分成功/失败
> - 失败响应统一格式：`{ "success": false, "message": "错误描述" }`
> - 除 `getSession` 和 `logout` 外，所有接口均需携带登录态（后端通过 Cookie/Token 校验，Mock 阶段通过 localStorage 校验）

### 4.1 认证模块（Auth）

#### `POST /api/auth/login`

**Mock 函数：** `SparkAPI.login(role, account, password)`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| role | `"student" \| "teacher"` | 是 | 角色 |
| account | string | 是 | 登录账号 |
| password | string | 是 | 登录密码 |

**成功响应（200）：**
```json
{
  "success": true,
  "role": "student",
  "user": {
    "name": "小明同学",
    "avatar": "🐼",
    "class": "三年级2班"
  }
}
```

**失败响应（401）：**
```json
{
  "success": false,
  "message": "账号或密码错误"
}
```

**模拟延迟：** 300ms

---

#### `GET /api/auth/session`

**Mock 函数：** `SparkAPI.getSession()`

**成功响应（200）：**
```json
{
  "role": "student",
  "account": "student",
  "name": "小明同学"
}
```

**未登录（200，返回 null）：**
```json
null
```

---

#### `POST /api/auth/logout`

**Mock 函数：** `SparkAPI.logout()`

**响应（200）：**
```json
{
  "success": true
}
```

**副作用：** 清除 `sparkai_session` localStorage 键。

---

### 4.2 课程模块（Courses）

#### `GET /api/courses`

**Mock 函数：** `SparkAPI.getCourses()`

返回当前角色可见的课程列表（不含 slides 和 videos）。

**响应（200）：**
```json
[
  {
    "id": "course-scratch",
    "name": "Scratch 动画制作",
    "category": "图形编程",
    "description": "用 Scratch 积木块创作动画",
    "icon": "🐱",
    "color": "#B6EDFF",
    "thumbColor": "#C8F2FF",
    "totalLessons": 6
  }
]
```

**模拟延迟：** 200ms

---

#### `GET /api/courses/:id`

**Mock 函数：** `SparkAPI.getCourse(courseId)`

返回完整课程信息（含 slides 和 videos）。

**参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| courseId | string | 课程 ID（如 `"course-scratch"`） |

**响应（200）：**
```json
{
  "id": "course-scratch",
  "name": "Scratch 动画制作",
  "category": "图形编程",
  "description": "用 Scratch 积木块创作动画",
  "icon": "🐱",
  "color": "#B6EDFF",
  "thumbColor": "#C8F2FF",
  "totalLessons": 6,
  "slides": [ ... ],
  "videos": [ ... ]
}
```

**失败响应（404）：**
```json
{
  "message": "课程不存在"
}
```

**模拟延迟：** 200ms

---

### 4.3 班级模块（Classes）— 教师端

#### `GET /api/classes`

**Mock 函数：** `SparkAPI.getClasses()`

返回所有班级列表（含统计信息，不含学生详情）。

**响应（200）：**
```json
[
  {
    "id": "class-1",
    "name": "三年级 2 班",
    "createdAt": "2025-03-01",
    "studentCount": 4,
    "boundCourses": ["course-scratch", "course-director"],
    "boundCourseNames": ["Scratch 动画制作", "AI 导演课"]
  }
]
```

**模拟延迟：** 200ms

---

#### `POST /api/classes`

**Mock 函数：** `SparkAPI.createClass(name)`

**请求体：**
```json
{
  "name": "五年级 2 班"
}
```

**响应（201）：**
```json
{
  "id": "m5n2x8k3",
  "name": "五年级 2 班",
  "createdAt": "2025-05-25",
  "boundCourses": [],
  "students": []
}
```

**模拟延迟：** 200ms

---

#### `PUT /api/classes/:id`

**Mock 函数：** `SparkAPI.updateClass(classId, data)`

**请求体：**
```json
{
  "name": "三年级 2 班（调整）"
}
```

**响应（200）：** 返回更新后的 Class 对象。

**失败响应（404）：** `{ "message": "班级不存在" }`

---

#### `DELETE /api/classes/:id`

**Mock 函数：** `SparkAPI.deleteClass(classId)`

**响应（200）：**
```json
{
  "success": true
}
```

**副作用：** 级联删除该班级下所有学生数据。

---

### 4.4 学生模块（Students）— 教师端

#### `GET /api/classes/:classId/students`

**Mock 函数：** `SparkAPI.getStudents(classId)`

返回指定班级的学生列表。

**响应（200）：**
```json
[
  {
    "name": "张小明",
    "account": "xiaoming01",
    "password": "Sp2025*1",
    "avatar": "🐼",
    "active": true
  }
]
```

**模拟延迟：** 200ms

---

#### `POST /api/classes/:classId/students`

**Mock 函数：** `SparkAPI.addStudent(classId, data)`

**请求体：**
```json
{
  "name": "张小明",
  "account": "xiaoming01",
  "password": "Sp2025*1"
}
```

**响应（201）：**
```json
{
  "name": "张小明",
  "account": "xiaoming01",
  "password": "Sp2025*1",
  "avatar": "🐼",
  "active": false
}
```

**规则：** 若 `password` 为空，自动生成 `"Sp" + 6位随机字符`。

---

#### `PUT /api/classes/:classId/students/:studentIndex`

**Mock 函数：** `SparkAPI.updateStudent(classId, idx, data)`

**请求体：**
```json
{
  "name": "张小明（改）",
  "account": "xiaoming01",
  "password": "NewPass123"
}
```

**说明：** `studentIndex` 为学生在该班级 `students` 数组中的索引（0-based）。

**响应（200）：** 返回更新后的 Student 对象。

---

#### `DELETE /api/classes/:classId/students/:studentIndex`

**Mock 函数：** `SparkAPI.deleteStudent(classId, idx)`

**响应（200）：**
```json
{
  "success": true
}
```

---

### 4.5 课程绑定模块（Course Binding）— 教师端

#### `POST /api/classes/:classId/bind-course/:courseId`

**Mock 函数：** `SparkAPI.bindCourse(classId, courseId)`

将一个课程绑定到指定班级。

**响应（200）：**
```json
{
  "success": true
}
```

**幂等性：** 重复绑定同一课程不会产生重复记录。

---

#### `DELETE /api/classes/:classId/bind-course/:courseId`

**Mock 函数：** `SparkAPI.unbindCourse(classId, courseId)`

解除班级与课程的绑定。

**响应（200）：**
```json
{
  "success": true
}
```

**幂等性：** 解除不存在的绑定不会报错。

---

### 4.6 AI 功能模块

#### `POST /api/magic/generate`（图片转视频 / 图片变动画）

**Mock 函数：** `SparkAPI.generateAnimation(params)`

**请求体：**
```json
{
  "image": "data:image/png;base64,...",
  "prompt": "让小猫跳起来",
  "style": "水彩童话"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| image | string | 是 | Base64 编码的图片 |
| prompt | string | 否 | 创作提示词 |
| style | string | 是 | 风格选择（见下方） |

**可用风格：**

| 风格 | 标识 |
|------|------|
| 水彩童话 | `watercolor` |
| 像素复古 | `pixel` |
| 手绘线条 | `sketch` |
| 赛博朋克 | `cyberpunk` |

**响应（200）：**
```json
{
  "frames": 4,
  "style": "水彩童话",
  "status": "completed",
  "resultUrl": null
}
```

**模拟延迟：** 2500ms（模拟 AI 生成耗时）

**说明：** Mock 阶段 `resultUrl` 固定为 `null`，前端使用 upload-zone 的预览图片作为结果占位。

---

#### `POST /api/magic/download`（下载生成的视频）

**Mock 函数：** `SparkAPI.downloadVideo(taskId)`

**请求体：**
```json
{
  "taskId": "magic-abc123"
}
```

**响应（200）：**
```json
{
  "success": true,
  "downloadUrl": null
}
```

**说明：** Mock 阶段 `downloadUrl` 固定为 `null`。对接后端后返回实际的视频文件下载地址。

**模拟延迟：** 500ms

---

#### `POST /api/magic/share`（分享生成的视频）

**Mock 函数：** `SparkAPI.shareVideo(taskId)`

**请求体：**
```json
{
  "taskId": "magic-abc123"
}
```

**响应（200）：**
```json
{
  "success": true,
  "shareUrl": null
}
```

**说明：** Mock 阶段 `shareUrl` 固定为 `null`。对接后端后返回可分享的视频链接。

**模拟延迟：** 300ms

---

#### `POST /api/ai/chat`（AI 助手对话）

**Mock 函数：** `SparkAPI.chat(courseId, message)`

**请求体：**
```json
{
  "courseId": "course-director",
  "message": "什么是镜头语言？"
}
```

**响应（200）：**
```json
{
  "reply": "好问题！让我来帮你理解这个概念……"
}
```

**Mock 回复池（随机选取）：**

1. "好问题！让我来帮你理解这个概念……"
2. "试试这样思考：把问题分解成小步骤，一步一步来解决！"
3. "这是一个重要的知识点，理解了它后面的内容会更轻松～"
4. "非常好的问题！在编程里，这个概念就像是搭积木，一块一块来就好。"
5. "让我用一个生活中的例子来解释：就像你每天早上起床、刷牙、吃早餐一样，程序也是一步一步执行的！"

**模拟延迟：** 800ms

---

### 4.7 工具方法

#### `SparkAPI.getAllCourses()`

返回所有课程的简要列表（用于教师端课程绑定选择）。

**响应（200）：**
```json
[
  {
    "id": "course-scratch",
    "name": "Scratch 动画制作",
    "category": "图形编程",
    "totalLessons": 6
  }
]
```

---

## 5. Mock 数据规则

### 5.1 预设数据总览

`api.js` 在首次加载时（localStorage 无数据）初始化以下完整数据：

| 数据类型 | 数量 | 详情 |
|----------|------|------|
| 课程（Courses） | 3 | Scratch 动画制作、AI 导演课、创意像素画 |
| 幻灯片（Slides） | 15 | Scratch 6张 + AI导演 5张 + 像素画 4张 |
| 备课视频（Videos） | 10 | Scratch 3个 + AI导演 5个 + 像素画 2个 |
| 班级（Classes） | 2 | 三年级2班、四年级1班 |
| 学生（Students） | 7 | 三年级2班 4人 + 四年级1班 3人 |
| 用户（Users） | 2 | student / teacher 各 1 个 |

### 5.2 课程预设数据详情

#### 课程1：Scratch 动画制作 (`course-scratch`)

| 字段 | 值 |
|------|-----|
| category | 图形编程 |
| totalLessons | 6 |
| icon | 🐱 |
| color | #B6EDFF |
| thumbColor | #C8F2FF |

**6 张幻灯片：**

| # | tag | title | icon |
|---|-----|-------|------|
| 1 | 第 1 课 · Scratch 动画制作 | 欢迎来到 Scratch！ | 🐱 |
| 2 | 第 2 课 · Scratch 动画制作 | 认识积木块 | 🧩 |
| 3 | 第 3 课 · Scratch 动画制作 | 让角色动起来！ | 🏃 |
| 4 | 第 4 课 · Scratch 动画制作 | 加入声音效果 | 🎵 |
| 5 | 第 5 课 · Scratch 动画制作 | 背景切换与舞台 | 🎬 |
| 6 | 第 6 课 · Scratch 动画制作 | 完成我的第一个动画 🏆 | 🏆 |

**3 个备课视频：**

| id | title | duration |
|----|-------|----------|
| v1 | Scratch 入门引导 | 10:15 |
| v2 | 积木块使用演示 | 08:42 |
| v3 | 角色与舞台教学 | 12:30 |

#### 课程2：AI 导演课 (`course-director`)

| 字段 | 值 |
|------|-----|
| category | 影视创作 |
| totalLessons | 5 |
| icon | 🎬 |
| color | #FFD6E8 |
| thumbColor | #FFD6E8 |

**5 张幻灯片：**

| # | tag | title | tagClass |
|---|-----|-------|----------|
| 1 | AI 导演课 · 第1课 | 什么是 AI 导演？ | pink |
| 2 | AI 导演课 · 第2课 | 镜头语言入门 | pink |
| 3 | AI 导演课 · 第3课 | 用图片生成动画 ✨ | pink |
| 4 | AI 导演课 · 第4课 | 配音与音效设计 | pink |
| 5 | AI 导演课 · 第5课 | 我的第一部短片 🏆 | pink |

**5 个备课视频：**

| id | title | duration |
|----|-------|----------|
| v4 | 导演思维入门讲解 | 14:22 |
| v5 | 镜头语言示范课 | 11:08 |
| v6 | AI 图像生成演示 | 09:35 |
| v7 | 配音与音效教学 | 07:50 |
| v8 | 学生作品展示与点评 | 12:17 |

#### 课程3：创意像素画 (`course-pixel`)

| 字段 | 值 |
|------|-----|
| category | 创意设计 |
| totalLessons | 4 |
| icon | 🎨 |
| color | #E8E8E8 |
| thumbColor | #F4F4F4 |

**4 张幻灯片：**

| # | tag | title | icon |
|---|-----|-------|------|
| 1 | 像素画 · 第1课 | 什么是像素画？ | 🟦 |
| 2 | 像素画 · 第2课 | 调色与配色 | 🎨 |
| 3 | 像素画 · 第3课 | 创建角色 | 👾 |
| 4 | 像素画 · 第4课 | 作品展示与分享 | 🌟 |

**2 个备课视频：**

| id | title | duration |
|----|-------|----------|
| v9 | 像素画基础教学 | 08:50 |
| v10 | 配色技巧演示 | 06:30 |

### 5.3 班级与学生预设数据

#### 三年级 2 班 (`class-1`)

| 字段 | 值 |
|------|-----|
| createdAt | 2025-03-01 |
| boundCourses | course-scratch, course-director |

| # | name | account | password | avatar | active |
|---|------|---------|----------|--------|--------|
| 1 | 张小明 | xiaoming01 | Sp2025*1 | 🐼 | true |
| 2 | 李晓雨 | liyu02 | Sp2025*2 | 🐯 | false |
| 3 | 王大宝 | wangbao03 | Sp2025*3 | 🐸 | true |
| 4 | 陈思远 | chensiyuan04 | Sp2025*4 | 🐰 | false |

#### 四年级 1 班 (`class-2`)

| 字段 | 值 |
|------|-----|
| createdAt | 2025-03-15 |
| boundCourses | course-scratch |

| # | name | account | password | avatar | active |
|---|------|---------|----------|--------|--------|
| 1 | 刘小萌 | liumeng05 | Sp2025*5 | 🦊 | true |
| 2 | 赵宇航 | zhaoyu06 | Sp2025*6 | 🐨 | false |
| 3 | 周思涵 | zhousi07 | Sp2025*7 | 🐶 | true |

### 5.4 默认登录账号

| 角色 | 账号 | 密码 | 显示名称 | 头像 | 关联班级 |
|------|------|------|----------|------|----------|
| student | `student` | `123` | 小明同学 | 🐼 | 三年级2班 (class-1) |
| teacher | `teacher` | `123` | 王老师 | 王 | — |

### 5.5 数据关系图

```
Users (全局账号)
  ├── student ──→ Class: class-1 (三年级2班)
  └── teacher

Courses (3门)
  ├── course-scratch (Scratch 动画制作)
  │     ├── 6 slides
  │     └── 3 videos
  ├── course-director (AI 导演课)
  │     ├── 5 slides
  │     └── 5 videos
  └── course-pixel (创意像素画)
        ├── 4 slides
        └── 2 videos

Classes (2个)
  ├── class-1 (三年级2班)
  │     ├── boundCourses: [course-scratch, course-director]
  │     └── students: [张小明, 李晓雨, 王大宝, 陈思远]  (4人)
  └── class-2 (四年级1班)
        ├── boundCourses: [course-scratch]
        └── students: [刘小萌, 赵宇航, 周思涵]  (3人)
```

### 5.6 ID 生成规则

| 实体类型 | 预设 ID 格式 | 动态创建 ID 格式 |
|----------|-------------|-----------------|
| Course | `course-{slug}` | `Date.now().toString(36) + Math.random().toString(36).slice(2,6)` |
| Class | `class-{n}` (n=1,2) | `Date.now().toString(36) + Math.random().toString(36).slice(2,6)` |
| Video | `v{n}` (n=1..10) | 手动指定 |
| Slide | 无独立 ID | 通过数组索引定位 |

> **注意：** 所有动态创建的数据通过 `SparkAPI` 统一操作，存储在同一 localStorage 键下。旧版本遗留的 `sparkai_classes_v2` 键在首次加载时自动迁移后删除。

### 5.7 头像与颜色分配规则

**学生头像 emoji 池（16个）：**
```
🐼 🐯 🐸 🐰 🦊 🐨 🐶 🐱 🐻 🐮 🐷 🐔 🐧 🐤 🦄 🐙
```

**学生头像背景色板（8个，按索引循环）：**
```
#B6EDFF  #F8FCAA  #FFE4E4  #E8DCFF
#D4F8E8  #FFF3CC  #FFD6E8  #C8F2FF
```

新创建学生时，avatar 从 emoji 池随机选取，背景色按 students 数组长度取模分配。

### 5.8 各端点 Mock 行为详细说明

#### 认证模块

| 端点 | 延迟 | 行为 |
|------|------|------|
| `login` | 300ms | 比对 `users[role].account` 和 `users[role].password`。成功时写入 `sparkai_session`，返回 user 信息。失败时 reject `{success:false, message:'账号或密码错误'}` |
| `getSession` | 0ms | 同步读取 `sparkai_session`，无延迟直接 resolve |
| `logout` | 0ms | 删除 `sparkai_session`，直接 resolve |

#### 课程模块

| 端点 | 延迟 | 行为 |
|------|------|------|
| `getCourses` | 200ms | 返回所有课程摘要（不含 slides/videos），totalLessons 字段对应 slides 数组长度 |
| `getCourse` | 200ms | 按 courseId 查找课程，返回完整对象（含 slides/videos）。课程不存在时 reject `{message:'课程不存在'}` |

#### 班级模块

| 端点 | 延迟 | 行为 |
|------|------|------|
| `getClasses` | 200ms | 返回所有班级，自动计算 `studentCount`（students.length）和 `boundCourseNames`（根据 boundCourses ID 查找课程名） |
| `createClass` | 200ms | 创建新班级，`boundCourses` 和 `students` 初始为空数组 |
| `updateClass` | 200ms | 按 classId 查找并更新 name。不存在时 reject `{message:'班级不存在'}` |
| `deleteClass` | 200ms | 按 classId 过滤删除，不影响其他数据 |

#### 学生模块

| 端点 | 延迟 | 行为 |
|------|------|------|
| `getStudents` | 200ms | 按 classId 查找班级，返回其 students 数组。班级不存在时 reject |
| `addStudent` | 200ms | 在班级 students 数组末尾追加，avatar 随机分配，active 默认为 false |
| `updateStudent` | 200ms | 按数组索引 idx 更新，支持部分更新（name/account/password 选填） |
| `deleteStudent` | 200ms | 按数组索引 idx 删除（splice） |

#### 课程绑定模块

| 端点 | 延迟 | 行为 |
|------|------|------|
| `bindCourse` | 200ms | 将 courseId 加入班级的 boundCourses 数组（去重，幂等） |
| `unbindCourse` | 200ms | 将 courseId 从 boundCourses 数组中移除（幂等） |

#### AI 模块

| 端点 | 延迟 | 行为 |
|------|------|------|
| `chat` | 800ms | **不依赖 courseId 和 message 实际内容**。从 5 条预设中文教育类回复中随机选取一条返回。对接后端时替换为实际 LLM 调用 |
| `generateAnimation` | 2500ms | **不执行实际 AI 生成**。固定返回 `{taskId, frames:4, style, status:'completed', resultUrl:null}`。对接后端时替换为实际 AI 生成服务 |
| `downloadVideo` | 500ms | Mock 阶段 downloadUrl 固定为 null。对接后端时返回实际文件下载 URL |
| `shareVideo` | 300ms | Mock 阶段 shareUrl 固定为 null。对接后端时返回可分享的视频链接 |

#### AI 对话回复池（5条预设）

```
1. "好问题！让我来帮你理解这个概念……"
2. "试试这样思考：把问题分解成小步骤，一步一步来解决！"
3. "这是一个重要的知识点，理解了它后面的内容会更轻松～"
4. "非常好的问题！在编程里，这个概念就像是搭积木，一块一块来就好。"
5. "让我用一个生活中的例子来解释：就像你每天早上起床、刷牙、吃早餐一样，程序也是一步一步执行的！"
```

### 5.9 模拟延迟汇总

| 端点 | 延迟 | 模拟场景 |
|------|------|----------|
| `getSession` / `logout` | 0ms | 本地操作，无网络延迟 |
| `getCourses` / `getCourse` / `getClasses` / `getStudents` | 200ms | 简单数据库查询 |
| `createClass` / `updateClass` / `deleteClass` | 200ms | 简单写入操作 |
| `addStudent` / `updateStudent` / `deleteStudent` | 200ms | 简单写入操作 |
| `bindCourse` / `unbindCourse` | 200ms | 简单关联操作 |
| `getAllCourses` | 0ms | 读取内存缓存 |
| `login` | 300ms | 含密码验证 |
| `chat` | 800ms | 模拟 LLM 推理耗时 |
| `generateAnimation` | 2500ms | 模拟 AI 生成视频耗时 |
| `downloadVideo` | 500ms | 模拟文件准备耗时 |
| `shareVideo` | 300ms | 模拟分享链接生成 |

### 5.10 对接后端检查清单

后端开发人员对接时，需确保以下行为与 Mock 一致：

- [ ] 所有端点路径、请求方法、参数名与本文档第 4 节一致
- [ ] 响应 JSON 字段名和类型与文档一致（不要改名或改类型）
- [ ] 登录成功响应包含 `success`, `role`, `user: { name, avatar, class }`
- [ ] 登录失败响应格式 `{ success: false, message: "错误描述" }`
- [ ] `getCourses` 返回不含 slides/videos 的课程摘要
- [ ] `getCourse` 返回包含 slides/videos 的完整课程对象
- [ ] `getClasses` 自动包含 `studentCount` 和 `boundCourseNames` 计算字段
- [ ] ID 生成策略保持一致（或前端不依赖 ID 格式）
- [ ] 班级-学生为嵌套结构（学生存储在班级的 students 数组中）
- [ ] 课程-班级为多对多关系（通过 boundCourses 关联）
- [ ] `totalLessons` 字段值与 slides 数组长度一致
- [ ] 视频 `duration` 字段格式为 `mm:ss`
- [ ] 所有响应 Content-Type 为 `application/json`

---

## 6. localStorage 持久化约定

### 6.1 键名清单

| 键名 | 存储内容 | 使用者 | Schema |
|------|----------|--------|--------|
| `sparkai_role` | `"student"` 或 `"teacher"` | 所有页面（登录守卫） | string |
| `sparkai_user` | 当前登录账号名 | 登录后页面 | string |
| `sparkai_session` | `{ role, account, name }` | api.js | object |
| `sparkai_courses` | 完整 Course[] 数据 | api.js | Course[] |
| `sparkai_classes` | 完整 Class[] 数据 | api.js、teacher-class.html | Class[] |
| `sparkai_users` | `{ student: User, teacher: User }` | api.js | object |

> **v1.0 统一说明：** `teacher-class.html` 已重构为通过 `SparkAPI` 操作数据，所有班级/学生数据统一存储在 `sparkai_classes` 中。`sparkai_classes_v2`（旧格式）在页面首次加载时自动迁移至 `sparkai_classes` 后删除。

### 6.2 数据生命周期

```
首次访问 → api.js 检测 localStorage 为空 → 写入预设数据
         → teacher-class.html 执行 v2→v1 数据迁移（若存在旧数据）

后续访问 → 从 localStorage 读取，不重置

登出     → 删除 sparkai_role, sparkai_user, sparkai_session
         → sparkai_courses, sparkai_classes 保留
```

### 6.3 重置数据

浏览器开发者工具中执行：
```javascript
localStorage.clear();
location.reload();
```

---

## 7. 权限与登录守卫

### 7.1 守卫机制

每个需要登录的页面顶部有 IIFE（立即执行函数）检查：

```javascript
// 学生端页面
if (localStorage.getItem("sparkai_role") !== "student") {
  location.href = "login.html?role=student";
}

// 教师端页面
if (localStorage.getItem("sparkai_role") !== "teacher") {
  location.href = "login.html?role=teacher";
}
```

### 7.2 登出触发点

| 页面 | 触发元素 | 行为 |
|------|----------|------|
| student-home | 点击导航栏用户区域 | 清除 session → 跳转 style-final.html |
| teacher-home | 点击侧边栏底部用户区 | 清除 session → 跳转 style-final.html |
| teacher-course | 同 teacher-home（共用 sidebar） | 同上 |
| teacher-class | 同 teacher-home（共用 sidebar） | 同上 |
| student-learning | 点击导航栏用户区域 | 清除 session → 跳转 style-final.html |
| course-director | 点击导航栏用户区域 | 清除 session → 跳转 style-final.html |

### 7.3 登出清除的键

所有页面统一清除以下三个键：

```javascript
localStorage.removeItem("sparkai_role");
localStorage.removeItem("sparkai_user");
localStorage.removeItem("sparkai_session");
```

---

## 8. 需求范围

### 8.1 当前阶段（v1.1 — Mock 前端）

| 模块 | 范围 | 状态 |
|------|------|------|
| 登录/登出 | 角色选择、账号密码验证、跳转 | ✅ |
| 学生端-首页 | 课程卡片、进度条、问候横幅 | ✅ |
| 学生端-课件 | PPT 全屏播放、分页导航、键盘快捷键 | ✅ |
| 学生端-图片变动画 | 图片上传、风格选择、生成动画（Mock） | ✅ |
| 学生端-AI 对话 | 发送消息、Mock 回复、对话历史 | ✅ |
| 学生端-6步魔法工坊 | IP创作→场景→分镜→画作→故事线→一键生成动画 | ✅ |
| 教师端-首页 | 课程概览、班级概览、统计数据 | ✅ |
| 教师端-课程详情 | PPT 全屏、6步魔法工坊、备课视频浮层 | ✅ |
| 教师端-班级管理 | 课程/班级/学生 CRUD、密码重置 | ✅ |
| 备课视频浮层 | 视频播放器、播放/暂停、进度控制、视频列表 | ✅ |
| 全局登出 | 所有认证页面可登出，清除 session | ✅ |
| 移动端优化 | 滚动适配、折叠面板、步骤导航放大、底部导航优化 | ✅ |
| 课程讲义点击切换 | 浮层面板内5节课可点击跳转对应幻灯片 | ✅ |
| 动态数据加载 | 教师/学生首页从 API 动态加载课程与班级数据 | ✅ |
| 响应式适配 | 桌面/平板/手机/小屏手机四端 | ✅ |
| API 规范定义 | 端点、数据格式、Mock 实现、文档 | ✅ |

### 8.2 明确不在范围内（v1.1）

| 模块 | 说明 |
|------|------|
| 真实后端对接 | 无后端服务，无数据库 |
| 真实 AI 图片生成 / LLM 对话 | 使用 Mock 回复 |
| 视频播放 | 仅有视频列表 UI，无实际视频文件 |
| 图片上传到服务器 | 仅做 Base64 本地预览 |
| 真实的在线状态 | `Student.active` 仅为标记位 |
| 密码加密 | 明文存储（Mock 阶段可接受） |
| 学生成绩 / 作业批改 | 未实现 |
| 多机构 / 多租户 | 单一教师视角 |
| i18n 国际化 | 仅中文 |
| 浏览器兼容 < 2020 | 使用 CSS Custom Properties 等现代特性 |
| E2E 测试 / 单元测试 | 未编写 |

### 8.3 后续版本规划方向（v1.1+）

| 优先级 | 事项 |
|--------|------|
| P0 | ~~`teacher-class.html` 接入 `api.js`，统一数据存储~~ ✅ 已完成 |
| P0 | ~~学生端课程列表从 `api.js` 动态加载~~ ✅ 已完成 |
| P0 | ~~全局登出流程统一~~ ✅ 已完成 |
| P1 | 课程学习进度持久化 |
| P1 | 教师端班级-课程绑定可视化 UI |
| P2 | 真实后端对接（替换 Mock 函数为 `fetch()`） |
| P2 | 密码哈希存储 |
| P3 | 学生端学习记录（已完成课时、作业提交） |
| P3 | 教师端数据看板（学生进度总览） |

---

## 9. 变更规则

### 9.1 新增 API 端点

1. 在 `api.js` 的 `SparkAPI` 对象中添加新方法
2. 方法必须返回 `Promise`
3. 方法上方用 JSDoc 注释写明：
   - HTTP 方法和路径
   - 请求体参数及类型
   - 成功/失败响应格式
4. 同步更新本文档的第 4 节（API 端点）
5. 若涉及新数据结构，同步更新第 3 节（数据模型）

### 9.2 修改数据模型

1. 修改 `api.js` 顶部的数据模型注释
2. 修改对应的默认数据（`defaultCourses` / `defaultClasses` / `defaultUsers`）
3. 同步更新本文档的第 3 节
4. **向后兼容原则：** 新增字段必须有默认值，不删除已有字段
5. 若数据结构有破坏性变更，必须更新 `localStorage` 键名（如 `sparkai_courses_v2`），避免旧数据解析报错

### 9.3 修改 Mock 行为

1. 修改 `api.js` 中对应对 Mock 函数
2. 保持 `setTimeout` 延迟在 200-3000ms 范围内（模拟真实网络 + AI 生成）
3. 保持 Promise 的 resolve/reject 模式
4. 同步更新本文档第 4 节中的延迟时间

### 9.4 新增页面

1. 新建 HTML 文件，名为 `{角色}-{功能}.html`
2. 必须包含 `api.js` 引用
3. 必须包含登录守卫 IIFE
4. 必须包含 3 级响应式断点（Desktop / Tablet ≤1199px / Mobile ≤767px / Small Mobile ≤480px）
5. 复用 CSS 变量：`--blue`, `--yellow`, `--cyan`, `--dark`, `--muted`, `--border`, `--bg`, `--pink`
6. 同步更新本文档第 2 节（页面与路由）

### 9.5 修改现有页面

1. 优先使用 `Edit` 工具精确修改，避免全文重写
2. HTML 结构变更需同步检查所有 3 级媒体查询
3. 新增 CSS 类必须在所有响应式断点中验证
4. 涉及 localStorage 键的变更需考虑向后兼容

### 9.6 代码风格约定

| 项目 | 约定 |
|------|------|
| 缩进 | 2 空格（HTML/CSS），4 空格（JS） |
| 引号 | 单引号（JS），双引号（HTML 属性） |
| CSS 变量 | 在 `:root` 中统一定义，不在组件内覆盖 |
| 函数命名 | camelCase |
| CSS 类名 | BEM 风格短横线（如 `card-thumb`, `sb-item active`） |
| JS 注释 | 仅用 `/* ── 区块名 ── */` 风格分隔逻辑块 |
| 响应式 | 所有页面必须覆盖 Desktop / Tablet / Mobile / Small Mobile 四个断点 |
| Emoji | 仅用于图标和装饰，不用于功能性标识 |

### 9.7 文档同步规则

**触发条件：** 以下变更必须同步更新本文档：
- 新增/修改/删除 API 端点
- 数据模型字段变更
- 新增/删除页面
- localStorage 键名变更
- 新增/修改 Mock 数据规则

**不需更新文档的变更：**
- CSS 样式调整
- UI 文案修改
- 纯布局/动画调整
- Bug 修复（不改变接口行为）

---

## 10. 文件清单

| 文件 | 说明 |
|------|------|
| `style-final.html` | SparkAI 落地首页（入口） |
| `login.html` | 登录页 |
| `student-home.html` | 学生端首页 |
| `student-learning.html` | 学生端 Scratch 课件 + AI 对话 + 图片转视频 |
| `course-director.html` | 学生端 AI 导演课（6步魔法工坊） |
| `teacher-home.html` | 教师端首页 |
| `teacher-course.html` | 教师端课程详情（6步魔法工坊 + 备课视频） |
| `teacher-class.html` | 教师端班级管理 |
| `api.js` | Mock API 服务层（含所有端点实现） |
| `API-DOCS.md` | API 接口文档（本文档） |

---

> **v1.2 更新内容（2026-05-30）：**
> - 移动端全面优化：页面滚动适配、魔法工坊折叠面板、步骤导航放大
> - 课程讲义面板支持点击课节切换幻灯片
> - 教师/学生首页改为动态加载 API 数据
> - 下载/分享按钮接入 SparkAPI 方法
> - CSS 变量统一为 9 个（新增 --danger）
> - 修复多项 bug 与死代码
>
> **下次评审日期：** 后端对接前（v2.0 启动时）
