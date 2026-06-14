/**
 * SparkAI API Specification & Mock Service
 * ==========================================
 *
 * 本文档定义所有前端调用的 API 接口与数据格式。
 * 当前为纯前端 Mock 实现，使用 localStorage 持久化。
 * 对接后端时，将每个 mock 函数替换为 fetch() 调用即可。
 *
 * ── 数据模型 Data Models ─────────────────────────────
 *
 * User {
 *   id:       string     - 唯一标识
 *   name:     string     - 显示名称
 *   role:     "student" | "teacher"
 *   avatar:   string     - emoji 头像
 *   account:  string     - 登录账号
 *   password: string     - 登录密码
 *   classId?: string     - 学生所属班级ID（仅 student）
 *   class?:   string     - 班级名称
 * }
 *
 * Course {
 *   id:          string     - 唯一标识
 *   name:        string     - 课程名称
 *   category:    string     - 分类标签
 *   description: string     - 简介
 *   icon:        string     - emoji 图标
 *   color:       string     - 主题色 (hex)
 *   thumbColor:  string     - 缩略图渐变色 (hex)
 *   totalLessons: number    - 总课时数
 *   slides:      Slide[]    - 课件幻灯片
 *   videos:      Video[]    - 备课视频
 * }
 *
 * Slide {
 *   tag:      string       - 标签文字
 *   tagClass: string       - 标签样式类
 *   title:    string       - 幻灯片标题
 *   body:     string       - 正文 (支持 <br>)
 *   icon:     string       - 装饰 emoji
 *   color:    string       - 装饰色
 *   chips:    [string,string][] - 知识点芯片 [emoji, label]
 *   code:     string|null  - 代码块 (HTML)
 *   visual:   [string,string][]|null - 可视化积木块
 * }
 *
 * Video {
 *   id:       string     - 唯一标识
 *   title:    string     - 视频标题
 *   duration: string     - 时长 "mm:ss"
 *   thumb:    string     - 缩略图 emoji
 *   color:    string     - 背景色
 * }
 *
 * Class {
 *   id:           string     - 唯一标识
 *   name:         string     - 班级名称
 *   createdAt:    string     - 创建日期 YYYY-MM-DD
 *   boundCourses: string[]   - 已绑定课程ID列表
 *   students:     Student[]  - 学生列表
 * }
 *
 * Student {
 *   name:     string   - 姓名
 *   account:  string   - 登录账号
 *   password: string   - 密码
 *   avatar:   string   - emoji 头像
 *   active:   boolean  - 是否已登录
 * }
 *
 *
 * ── API 端点 Endpoints ────────────────────────────────
 *
 * POST   /api/auth/login          body: { role, account, password }
 * GET    /api/auth/session         → { role, user, account }
 * POST   /api/auth/logout
 *
 * GET    /api/courses              → Course[]  (当前角色可见的课程)
 * GET    /api/courses/:id          → Course    (含 slides + videos)
 *
 * GET    /api/classes              → Class[]   (教师端)
 * POST   /api/classes              body: { name }
 * PUT    /api/classes/:id          body: { name }
 * DELETE /api/classes/:id
 *
 * GET    /api/classes/:id/students           → Student[]
 * POST   /api/classes/:id/students           body: { name, account, password }
 * PUT    /api/classes/:id/students/:idx      body: { name, account, password }
 * DELETE /api/classes/:id/students/:idx
 *
 * POST   /api/classes/:id/bind-course/:courseId
 * DELETE /api/classes/:id/bind-course/:courseId
 *
 * POST   /api/magic/generate       body: { image?, prompt, style }
 *                                   → { taskId, frames, style, status }
 * POST   /api/magic/download        body: { taskId }
 *                                   → { success, downloadUrl }
 * POST   /api/magic/share           body: { taskId }
 *                                   → { success, shareUrl }
 *
 * POST   /api/ai/chat              body: { courseId, message }
 *                                   → { reply }
 */

/* ══════════════════════════════════════════════════════
   Mock Data Store
   ══════════════════════════════════════════════════════ */

var SparkAPI = (function() {
  'use strict';

  /* ── 工具函数 ── */
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function load(key, fallback) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch(e) { return fallback; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {} }

  /* ── 预设数据 ── */
  var defaultCourses = [
    {
      id: 'course-scratch',
      name: 'Scratch 动画制作',
      category: '图形编程',
      description: '用 Scratch 积木块创作动画',
      icon: '🐱', color: '#B6EDFF', thumbColor: '#C8F2FF',
      totalLessons: 6,
      slides: [
        { tag:'第 1 课 · Scratch 动画制作', tagClass:'', title:'欢迎来到 Scratch！', body:'今天我们要学习 Scratch，用积木块来编写动画程序。<br>Scratch 是全世界小朋友都在用的创意编程工具！', icon:'🐱', color:'#B6EDFF', chips:[['🎉','开始探索'],['🐱','认识角色'],['🎨','选择背景']], code:null, visual:[['🎉','开始探索'],['🐱','认识角色'],['🎨','选择背景']] },
        { tag:'第 2 课 · Scratch 动画制作', tagClass:'', title:'认识积木块', body:'积木块就像乐高，把它们拼在一起就能控制角色做各种动作。<br>蓝色积木控制移动，紫色积木改变外观！', icon:'🧩', color:'#F8FCAA', chips:[['🔵','动作积木'],['🟣','外观积木'],['🟡','控制积木']], code:null, visual:[['🔵','动作积木'],['🟣','外观积木'],['🟡','控制积木']] },
        { tag:'第 3 课 · Scratch 动画制作', tagClass:'', title:'让角色动起来！', body:'在 Scratch 里，我们用积木块来控制角色的动作。<br>下面这些积木可以让小猫走路，你试试看！', icon:'🏃', color:'#B6EDFF', chips:[['🚩','当绿旗被点击'],['🔁','重复执行'],['👣','移动 10 步']], code:null, visual:[['🚩','当绿旗被点击'],['🔁','重复执行 10 次'],['👣','移动 10 步'],['⏱','等待 0.1 秒']] },
        { tag:'第 4 课 · Scratch 动画制作', tagClass:'', title:'加入声音效果', body:'动画配上声音会更生动！<br>Scratch 提供了很多有趣的声音，还可以录制自己的声音哦。', icon:'🎵', color:'#FFD6E8', chips:[['🔊','播放声音'],['🎵','背景音乐'],['🎙','录制声音']], code:null, visual:[['🔊','播放声音'],['🎵','背景音乐'],['🎙','录制声音']] },
        { tag:'第 5 课 · Scratch 动画制作', tagClass:'', title:'背景切换与舞台', body:'舞台就是动画的场景。<br>通过切换背景，可以让角色进入不同的世界！', icon:'🎬', color:'#F8FCAA', chips:[['🌟','宇宙场景'],['🌊','海底世界'],['🏙','城市街道']], code:null, visual:[['🌟','宇宙场景'],['🌊','海底世界'],['🏙','城市街道']] },
        { tag:'第 6 课 · Scratch 动画制作', tagClass:'', title:'完成我的第一个动画 🏆', body:'今天把所有学到的积木块组合起来，<br>做出一个完整的 Scratch 动画，和同学分享吧！', icon:'🏆', color:'#B6EDFF', chips:[['✅','完成作品'],['🌟','分享展示'],['🎉','班级表扬']], code:null, visual:[['✅','完成作品'],['🌟','分享展示'],['🎉','班级表扬']] }
      ],
      videos: [
        { id:'v1', title:'Scratch 入门引导', duration:'10:15', thumb:'🎬', color:'#B6EDFF' },
        { id:'v2', title:'积木块使用演示', duration:'08:42', thumb:'🧩', color:'#F8FCAA' },
        { id:'v3', title:'角色与舞台教学', duration:'12:30', thumb:'🐱', color:'#FFD6E8' }
      ]
    },
    {
      id: 'course-director',
      name: 'AI 导演课',
      category: '影视创作',
      description: '用 AI 创作短片和动画',
      icon: '🎬', color: '#FFD6E8', thumbColor: '#FFD6E8',
      totalLessons: 5,
      slides: [
        { tag:'AI 导演课 · 第1课', tagClass:'pink', title:'什么是 AI 导演？', body:'AI 导演课让同学们化身导演，用 AI 工具创作属于自己的短片和动画。<br>每节课都有创作挑战，让创意自由飞翔！', icon:'🎬', color:'#FFD6E8', chips:[['🎬','导演思维'],['🤖','AI 工具'],['✨','创意表达']], code:null },
        { tag:'AI 导演课 · 第2课', tagClass:'pink', title:'镜头语言入门', body:'镜头是讲故事的工具。<br>远景交代环境，近景表现情绪，特写抓住细节——试试用三种镜头拍一个场景！', icon:'🎥', color:'#B6EDFF', chips:[['🏔','远景'],['😊','近景'],['👁','特写']], code:null },
        { tag:'AI 导演课 · 第3课', tagClass:'pink', title:'用图片生成动画 ✨', body:'画一张图，让 AI 把它变成会动的动画！<br>可以选择水彩、手绘、像素等风格，完成你的第一帧动画作品。', icon:'🪄', color:'#F8FCAA', chips:[['🖼','上传图片'],['🎨','选择风格'],['🪄','一键生成']], code:null },
        { tag:'AI 导演课 · 第4课', tagClass:'pink', title:'配音与音效设计', body:'声音是电影的第二张脸。<br>合适的背景音乐能让观众感受到紧张、快乐或感动——今天让 AI 为你的短片配上音效吧！', icon:'🎵', color:'#E8DCFF', chips:[['🎵','背景音乐'],['🔊','音效'],['🎙','配音']], code:null },
        { tag:'AI 导演课 · 第5课', tagClass:'pink', title:'我的第一部短片 🏆', body:'把前几课学到的镜头语言、AI 动画和配音融合在一起，<br>制作一部属于你的 30 秒短片——这是你的导演处女作！', icon:'🏆', color:'#B6EDFF', chips:[['🎞','完整短片'],['🎬','导演署名'],['🌟','班级展映']], code:null }
      ],
      videos: [
        { id:'v4', title:'导演思维入门讲解', duration:'14:22', thumb:'🎬', color:'#FFD6E8' },
        { id:'v5', title:'镜头语言示范课', duration:'11:08', thumb:'🎥', color:'#B6EDFF' },
        { id:'v6', title:'AI 图像生成演示', duration:'09:35', thumb:'🪄', color:'#F8FCAA' },
        { id:'v7', title:'配音与音效教学', duration:'07:50', thumb:'🎵', color:'#E8DCFF' },
        { id:'v8', title:'学生作品展示与点评', duration:'12:17', thumb:'🏆', color:'#E4F8E4' }
      ]
    },
    {
      id: 'course-pixel',
      name: '创意像素画',
      category: '创意设计',
      description: '像素艺术入门',
      icon: '🎨', color: '#E8E8E8', thumbColor: '#F4F4F4',
      totalLessons: 4,
      slides: [
        { tag:'像素画 · 第1课', tagClass:'', title:'什么是像素画？', body:'像素画是用一个个小格子组成的图画。<br>就像乐高积木一样，把小方块拼在一起，就能画出有趣的图案！', icon:'🟦', color:'#B6EDFF', chips:[['🟩','像素格子'],['🎨','调色盘'],['🧱','拼图思维']], code:null },
        { tag:'像素画 · 第2课', tagClass:'', title:'调色与配色', body:'学习用三原色混合出丰富的颜色。<br>好的配色能让作品更加生动！', icon:'🎨', color:'#F8FCAA', chips:[['🔴','三原色'],['🌈','调色'],['🖼','配色方案']], code:null },
        { tag:'像素画 · 第3课', tagClass:'', title:'创建角色', body:'用 16×16 的网格设计一个属于你自己的像素角色。<br>先画草稿，再一格一格填充！', icon:'👾', color:'#FFD6E8', chips:[['📐','网格设计'],['✏️','草稿'],['🧑','角色创作']], code:null },
        { tag:'像素画 · 第4课', tagClass:'', title:'作品展示与分享', body:'完成你的像素画作品，分享给同学欣赏。<br>每个像素都是创意的颗粒！', icon:'🌟', color:'#B6EDFF', chips:[['✅','完成作品'],['📤','分享'],['🎉','班级展览']], code:null }
      ],
      videos: [
        { id:'v9', title:'像素画基础教学', duration:'08:50', thumb:'🟦', color:'#E8E8E8' },
        { id:'v10', title:'配色技巧演示', duration:'06:30', thumb:'🎨', color:'#F8FCAA' }
      ]
    }
  ];

  var avatars  = ['🐼','🐯','🐸','🐰','🦊','🐨','🐶','🐱','🐻','🐮','🐷','🐔','🐧','🐤','🦄','🐙'];
  var colors  = ['#B6EDFF','#F8FCAA','#FFE4E4','#E8DCFF','#D4F8E8','#FFF3CC','#FFD6E8','#C8F2FF'];

  var defaultClasses = [
    {
      id:'class-1', name:'三年级 2 班', createdAt:'2025-03-01',
      boundCourses:['course-scratch','course-director'],
      students:[
        { name:'张小明', account:'xiaoming01', password:'Sp2025*1', avatar:'🐼', active:true },
        { name:'李晓雨', account:'liyu02', password:'Sp2025*2', avatar:'🐯', active:false },
        { name:'王大宝', account:'wangbao03', password:'Sp2025*3', avatar:'🐸', active:true },
        { name:'陈思远', account:'chensiyuan04', password:'Sp2025*4', avatar:'🐰', active:false }
      ]
    },
    {
      id:'class-2', name:'四年级 1 班', createdAt:'2025-03-15',
      boundCourses:['course-scratch'],
      students:[
        { name:'刘小萌', account:'liumeng05', password:'Sp2025*5', avatar:'🦊', active:true },
        { name:'赵宇航', account:'zhaoyu06', password:'Sp2025*6', avatar:'🐨', active:false },
        { name:'周思涵', account:'zhousi07', password:'Sp2025*7', avatar:'🐶', active:true }
      ]
    }
  ];

  var defaultUsers = {
    'student': { id:'u1', name:'小明同学', role:'student', avatar:'🐼', account:'student', password:'123', classId:'class-1', class:'三年级2班' },
    'teacher': { id:'u2', name:'王老师', role:'teacher', avatar:'王', account:'teacher', password:'123' }
  };

  /* ── 初始化数据存储 ── */
  var courses = load('sparkai_courses', defaultCourses);
  var classes = load('sparkai_classes', defaultClasses);
  var users   = load('sparkai_users', defaultUsers);

  function saveAll() {
    save('sparkai_courses', courses);
    save('sparkai_classes', classes);
    save('sparkai_users', users);
  }

  /* ══════════════════════════════════════════════════════
     Mock API 实现
     ══════════════════════════════════════════════════════ */

  var api = {};

  /* ── Auth ── */
  api.login = function(role, account, password) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        var u = users[role];
        if (u && u.account === account && u.password === password) {
          save('sparkai_session', { role:role, account:account, name:u.name });
          resolve({ success:true, role:role, user:{ name:u.name, avatar:u.avatar, class:u.class||'' } });
        } else {
          reject({ success:false, message:'账号或密码错误' });
        }
      }, 300);
    });
  };

  api.getSession = function() {
    return Promise.resolve(load('sparkai_session', null));
  };

  api.logout = function() {
    localStorage.removeItem('sparkai_session');
    return Promise.resolve({ success:true });
  };

  /* ── Courses ── */
  api.getCourses = function() {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve(courses.map(function(c) {
          return {
            id:c.id, name:c.name, category:c.category,
            description:c.description, icon:c.icon,
            color:c.color, thumbColor:c.thumbColor,
            totalLessons:c.totalLessons
          };
        }));
      }, 200);
    });
  };

  api.getCourse = function(courseId) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        var c = null;
        for (var i = 0; i < courses.length; i++) { if (courses[i].id === courseId) { c = courses[i]; break; } }
        if (c) { resolve(JSON.parse(JSON.stringify(c))); }
        else { reject({ message:'课程不存在' }); }
      }, 200);
    });
  };

  /* ── Classes (Teacher) ── */
  api.getClasses = function() {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve(classes.map(function(c) {
          return {
            id:c.id, name:c.name, createdAt:c.createdAt,
            studentCount:c.students.length,
            studentAvatars:c.students.map(function(s) { return s.avatar; }),
            boundCourses:c.boundCourses.slice(),
            boundCourseNames:c.boundCourses.map(function(cid) {
              var found = null;
              for (var i = 0; i < courses.length; i++) { if (courses[i].id === cid) { found = courses[i]; break; } }
              return found ? found.name : cid;
            })
          };
        }));
      }, 200);
    });
  };

  api.createClass = function(name) {
    return new Promise(function(resolve) {
      setTimeout(function() {
        var c = { id:uid(), name:name, createdAt:new Date().toISOString().slice(0,10), boundCourses:[], students:[] };
        classes.push(c);
        saveAll();
        resolve(c);
      }, 200);
    });
  };

  api.updateClass = function(classId, data) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        for (var i = 0; i < classes.length; i++) {
          if (classes[i].id === classId) { if (data.name) classes[i].name = data.name; saveAll(); resolve(classes[i]); return; }
        }
        reject({ message:'班级不存在' });
      }, 200);
    });
  };

  api.deleteClass = function(classId) {
    return new Promise(function(resolve) {
      setTimeout(function() {
        classes = classes.filter(function(c) { return c.id !== classId; });
        saveAll();
        resolve({ success:true });
      }, 200);
    });
  };

  /* ── Students ── */
  api.getStudents = function(classId) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        for (var i = 0; i < classes.length; i++) {
          if (classes[i].id === classId) { resolve(classes[i].students.slice()); return; }
        }
        reject({ message:'班级不存在' });
      }, 200);
    });
  };

  api.addStudent = function(classId, data) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        for (var i = 0; i < classes.length; i++) {
          if (classes[i].id === classId) {
            var s = { name:data.name, account:data.account, password:data.password, avatar:avatars[Math.floor(Math.random()*avatars.length)], active:false };
            classes[i].students.push(s);
            saveAll();
            resolve(s);
            return;
          }
        }
        reject({ message:'班级不存在' });
      }, 200);
    });
  };

  api.updateStudent = function(classId, idx, data) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        for (var i = 0; i < classes.length; i++) {
          if (classes[i].id === classId) {
            if (idx >= 0 && idx < classes[i].students.length) {
              var s = classes[i].students[idx];
              if (data.name) s.name = data.name;
              if (data.account) s.account = data.account;
              if (data.password) s.password = data.password;
              saveAll();
              resolve(s);
              return;
            }
          }
        }
        reject({ message:'学生不存在' });
      }, 200);
    });
  };

  api.deleteStudent = function(classId, idx) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        for (var i = 0; i < classes.length; i++) {
          if (classes[i].id === classId) {
            classes[i].students.splice(idx, 1);
            saveAll();
            resolve({ success:true });
            return;
          }
        }
        reject({ message:'班级不存在' });
      }, 200);
    });
  };

  /* ── Course Binding ── */
  api.bindCourse = function(classId, courseId) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        for (var i = 0; i < classes.length; i++) {
          if (classes[i].id === classId) {
            if (classes[i].boundCourses.indexOf(courseId) === -1) { classes[i].boundCourses.push(courseId); }
            saveAll();
            resolve({ success:true });
            return;
          }
        }
        reject({ message:'班级不存在' });
      }, 200);
    });
  };

  api.unbindCourse = function(classId, courseId) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        for (var i = 0; i < classes.length; i++) {
          if (classes[i].id === classId) {
            var idx = classes[i].boundCourses.indexOf(courseId);
            if (idx !== -1) classes[i].boundCourses.splice(idx, 1);
            saveAll();
            resolve({ success:true });
            return;
          }
        }
        reject({ message:'班级不存在' });
      }, 200);
    });
  };

  /* ── AI Chat ── */
  api.chat = function(courseId, message) {
    return new Promise(function(resolve) {
      setTimeout(function() {
        var replies = [
          '好问题！让我来帮你理解这个概念……',
          '试试这样思考：把问题分解成小步骤，一步一步来解决！',
          '这是一个重要的知识点，理解了它后面的内容会更轻松～',
          '非常好的问题！在编程里，这个概念就像是搭积木，一块一块来就好。',
          '让我用一个生活中的例子来解释：就像你每天早上起床、刷牙、吃早餐一样，程序也是一步一步执行的！'
        ];
        resolve({ reply:replies[Math.floor(Math.random()*replies.length)] });
      }, 800);
    });
  };

  /* ── Magic: Image to Animation ── */
  api.generateAnimation = function(params) {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve({
          taskId: uid(),
          frames:4, style:params.style||'水彩童话',
          status:'completed',
          resultUrl:null
        });
      }, 2500);
    });
  };

  api.downloadVideo = function(taskId) {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve({ success:true, downloadUrl:null });
      }, 500);
    });
  };

  api.shareVideo = function(taskId) {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve({ success:true, shareUrl:null });
      }, 300);
    });
  };

  /* ── Utility: get all courses list (for binding) ── */
  api.getAllCourses = function() {
    return Promise.resolve(courses.map(function(c) {
      return { id:c.id, name:c.name, category:c.category, totalLessons:c.totalLessons };
    }));
  };

  return api;
})();

/* 导出全局 */
if (typeof module !== 'undefined' && module.exports) { module.exports = SparkAPI; }
