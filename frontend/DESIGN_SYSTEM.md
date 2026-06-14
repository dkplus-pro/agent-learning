# Agent Demo 设计系统

## 设计哲学

**风格**: 现代扁平化 + 轻微 Glassmorphism  
**目标**: 专业、清晰、高效的 AI 聊天界面  
**参考**: ChatGPT, Claude, Linear, Notion

## 色彩系统

### 主色调 (Professional Blue)

```css
/* Primary - 用于主要按钮、链接、焦点状态 */
--color-primary: #2563EB;
--color-primary-hover: #1D4ED8;
--color-primary-active: #1E40AF;
--color-on-primary: #FFFFFF;

/* Secondary - 用于次要操作 */
--color-secondary: #3B82F6;
--color-on-secondary: #FFFFFF;

/* Accent - 用于成功状态、强调 */
--color-accent: #059669;
--color-on-accent: #FFFFFF;

/* Destructive - 用于删除、危险操作 */
--color-destructive: #DC2626;
--color-on-destructive: #FFFFFF;
```

### 中性色

```css
/* Background & Surface */
--color-background: #F8FAFC;
--color-surface: #FFFFFF;
--color-surface-elevated: #FFFFFF;
--color-foreground: #0F172A;

/* Muted - 用于辅助文本、禁用状态 */
--color-muted: #F1F5FD;
--color-muted-foreground: #64748B;

/* Border */
--color-border: #E4ECFC;
--color-border-hover: #CBD5E1;

/* Ring - 焦点环 */
--color-ring: #2563EB;
```

### 渐变色

```css
/* Primary Gradient - 用于特殊按钮、头像背景 */
--gradient-primary: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);

/* Surface Gradient - 用于卡片背景 */
--gradient-surface: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);

/* Message User - 用户消息气泡 */
--gradient-message-user: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
```

## 排版系统

### 字体家族

```css
/* Primary Font - Inter (Google Fonts) */
--font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace - 用于代码块 */
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

### 字体大小

```css
/* Type Scale (基于 1.25 倍比例) */
--text-xs: 12px;      /* 辅助文本、标签 */
--text-sm: 14px;      /* 次要文本、时间戳 */
--text-base: 16px;    /* 正文（默认） */
--text-lg: 18px;      /* 小标题 */
--text-xl: 20px;      /* 对话标题 */
--text-2xl: 24px;     /* 页面标题 */
--text-3xl: 30px;     /* 大标题 */
```

### 字重

```css
--font-normal: 400;    /* 正文 */
--font-medium: 500;    /* 标签、次要标题 */
--font-semibold: 600;  /* 标题、按钮 */
--font-bold: 700;      /* 大标题 */
```

### 行高

```css
--leading-tight: 1.25;    /* 标题 */
--leading-normal: 1.5;    /* 正文 */
--leading-relaxed: 1.75;  /* 长文本 */
```

## 间距系统

### 基础间距 (4px 倍数)

```css
--space-0: 0;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### 组件间距

```css
/* 消息气泡间距 */
--message-padding-x: 16px;
--message-padding-y: 12px;
--message-gap: 16px;

/* 卡片间距 */
--card-padding: 20px;
--card-gap: 16px;

/* 输入框间距 */
--input-padding-x: 16px;
--input-padding-y: 12px;
```

## 圆角系统

```css
/* Border Radius */
--radius-sm: 6px;      /* 小按钮、标签 */
--radius-md: 8px;      /* 输入框、卡片 */
--radius-lg: 12px;     /* 大卡片、模态框 */
--radius-xl: 16px;     /* 消息气泡 */
--radius-2xl: 20px;    /* 特殊卡片 */
--radius-full: 9999px; /* 圆形按钮、头像 */
```

## 阴影系统

```css
/* Elevation Shadows */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

/* Glassmorphism - 毛玻璃效果 */
--glass-bg: rgba(255, 255, 255, 0.7);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-blur: 12px;
```

## 动画系统

### 时长

```css
--duration-fast: 100ms;     /* 微交互（hover、focus） */
--duration-base: 150ms;     /* 常规过渡 */
--duration-slow: 250ms;     /* 展开、折叠 */
--duration-slower: 350ms;   /* 模态框、页面过渡 */
```

### 缓动函数

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);        /* 常规 */
--ease-in: cubic-bezier(0.4, 0, 1, 1);               /* 进入 */
--ease-out: cubic-bezier(0, 0, 0.2, 1);              /* 退出 */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);         /* 进出 */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);    /* 弹性 */
```

### 常用动画

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}
```

## 组件规范

### 按钮 (Button)

```css
/* Primary Button */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: all var(--duration-base) var(--ease-default);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
  background: var(--color-primary-active);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--color-foreground);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  transition: all var(--duration-base) var(--ease-default);
}

.btn-ghost:hover {
  background: var(--color-muted);
}
```

### 消息气泡 (Message Bubble)

```css
/* User Message */
.message-user {
  background: var(--gradient-message-user);
  color: var(--color-on-primary);
  padding: var(--message-padding-y) var(--message-padding-x);
  border-radius: var(--radius-xl);
  border-bottom-right-radius: var(--radius-sm);
  max-width: 70%;
  box-shadow: var(--shadow-sm);
}

/* Assistant Message */
.message-assistant {
  background: var(--color-surface);
  color: var(--color-foreground);
  padding: var(--message-padding-y) var(--message-padding-x);
  border-radius: var(--radius-xl);
  border-bottom-left-radius: var(--radius-sm);
  max-width: 70%;
  box-shadow: var(--shadow-xs);
  border: 1px solid var(--color-border);
}
```

### 输入框 (Input)

```css
.input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--input-padding-y) var(--input-padding-x);
  color: var(--color-foreground);
  transition: all var(--duration-base) var(--ease-default);
}

.input:hover {
  border-color: var(--color-border-hover);
}

.input:focus {
  outline: none;
  border-color: var(--color-ring);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input::placeholder {
  color: var(--color-muted-foreground);
}
```

### 卡片 (Card)

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--card-padding);
  box-shadow: var(--shadow-xs);
  transition: all var(--duration-base) var(--ease-default);
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-hover);
}

/* Glassmorphism Card */
.card-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--card-padding);
}
```

## 布局系统

### 侧边栏 (Sidebar)

```css
.sidebar {
  width: 280px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.sidebar-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2);
}
```

### 主内容区 (Main Content)

```css
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  height: 100vh;
}

.chat-header {
  padding: var(--space-4);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
}

.chat-input {
  padding: var(--space-4);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}
```

## 响应式断点

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* 小屏手机 */
--breakpoint-md: 768px;   /* 平板 */
--breakpoint-lg: 1024px;  /* 小屏笔记本 */
--breakpoint-xl: 1280px;  /* 桌面 */
--breakpoint-2xl: 1536px; /* 大屏桌面 */
```

### 响应式布局

```css
/* Mobile (< 768px) */
@media (max-width: 767px) {
  .sidebar {
    display: none; /* 使用抽屉菜单 */
  }
  
  .message-user,
  .message-assistant {
    max-width: 85%;
  }
}

/* Tablet (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar {
    width: 240px;
  }
}

/* Desktop (≥ 1024px) */
@media (min-width: 1024px) {
  .sidebar {
    width: 280px;
  }
}
```

## 无障碍访问 (Accessibility)

### 颜色对比度

- 正文文本: 至少 4.5:1 (AA 级别)
- 大文本 (≥ 18px 或 14px bold): 至少 3:1
- 交互元素: 至少 3:1

### 焦点状态

```css
/* 所有可交互元素必须有可见的焦点环 */
:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}
```

### 减少动画

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 最佳实践

### ✅ 应该做的

1. **使用设计令牌** - 所有颜色、间距、字体都从 CSS 变量获取
2. **保持一致性** - 同一类型的组件使用相同的样式
3. **添加过渡动画** - 所有状态变化使用 150-300ms 的平滑过渡
4. **提供视觉反馈** - hover、focus、active 状态必须清晰可见
5. **使用语义化 HTML** - button 用 `<button>`，链接用 `<a>`
6. **支持键盘导航** - 所有交互元素可以通过 Tab 键访问
7. **优化移动端** - 触摸目标至少 44x44px

### ❌ 避免的

1. **使用 emoji 作为图标** - 改用 SVG 图标库 (Heroicons, Lucide)
2. **硬编码颜色值** - 始终使用 CSS 变量
3. **忽略焦点状态** - 每个可交互元素必须有焦点样式
4. **过度动画** - 每个视图最多 1-2 个动画元素
5. **纯黑色背景** - 使用深灰色 (#0F172A) 代替纯黑
6. **忽略响应式** - 必须在 375px - 1536px 范围内正常工作

## 设计检查清单

### 视觉质量

- [ ] 没有使用 emoji 作为图标
- [ ] 所有图标来自同一图标家族 (Lucide)
- [ ] 使用了语义化颜色令牌
- [ ] 悬停状态有平滑过渡 (150-300ms)
- [ ] 文本对比度至少 4.5:1

### 交互

- [ ] 所有可点击元素有 `cursor-pointer`
- [ ] 焦点状态清晰可见
- [ ] 禁用状态明确标识
- [ ] 加载状态有 spinner 或 skeleton

### 布局

- [ ] 响应式断点正确 (375px, 768px, 1024px, 1440px)
- [ ] 没有水平滚动
- [ ] 内容宽度合理 (max-width)
- [ ] 间距系统一致 (4px 倍数)

### 性能

- [ ] 图片使用 WebP/AVIF 格式
- [ ] 大列表使用虚拟化 (react-virtuoso)
- [ ] 动画使用 transform/opacity (GPU 加速)
- [ ] 支持 `prefers-reduced-motion`
