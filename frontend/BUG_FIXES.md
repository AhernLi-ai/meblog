# Bug Fixes Log

## Bug: 导航栏误匹配代码块中的 #

**现象：** 右侧目录出现 `# .zshrc` 等不存在的标题
**原因：** 代码块里的 `# xxx` 被正则表达式误识别为标题。正则 `/^#{1,6}\s+(.+)$/gm` 会匹配代码块中的注释行
**解决方案：** 提取标题前先用正则移除代码块内容

```javascript
function extractHeadings(content: string) {
  // 1. 先移除代码块
  const withoutCodeBlocks = content
    .replace(/```[\s\S]*?```/g, '')  // 移除 ```...``` 块
    .replace(/`[^`\n]*`/g, '');       // 移除 `...` 行内代码

  // 2. 再提取标题
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  // ...
}
```

**修复日期：** 2026-04-12
**修复文件：** `src/pages/PostDetail.tsx`

---

## Bug: 任务列表颜色错误

**现象：** Markdown 任务列表中，完成的任务颜色显示不正确
**原因：** 原代码只设置了 checkbox 的基础样式，没有根据 `checked` 状态区分颜色
**解决方案：** 根据 `checked` 状态动态设置颜色 - 完成=绿色填充，未完成=灰色边框

```tsx
// 已完成 [x] = 绿色填充 + 白色勾号
<span className="inline-flex items-center justify-center w-4 h-4 rounded bg-green-500 border border-green-500">
  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
</span>

// 未完成 [ ] = 灰色边框 + 透明背景
<span className="inline-flex items-center justify-center w-4 h-4 rounded border-2 border-gray-400 bg-transparent">
  <span className="w-2 h-2 rounded-full bg-transparent" />
</span>
```

**修复日期：** 2026-04-12
**修复文件：** `src/components/MarkdownRenderer.tsx`

---

## Bug: 标签页/项目页缓存未实时更新

**现象：** 文章设置了项目和标签后，标签页和项目页没有立即显示更新，需要手动刷新
**原因：** 创建/更新文章后只清理了 `admin-posts` 和 `post` 缓存，没有清理 `categories` 和 `tags` 缓存
**解决方案：** 在 `onSuccess` 回调中清理所有相关缓存

```tsx
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
  queryClient.invalidateQueries({ queryKey: ['posts'] });
  queryClient.invalidateQueries({ queryKey: ['categories'] });
  queryClient.invalidateQueries({ queryKey: ['tags'] });
  navigate('/admin/posts');
},
```

**修复日期：** 2026-04-12
**修复文件：** `src/pages/AdminPostNew.tsx`、`src/pages/AdminPostEdit.tsx`

---

## Bug: 文章详情页目录导航无法跳转

**现象：** 右侧目录点击后无法正确跳转到对应章节
**原因：**
1. 中文标题的 slug 生成错误（`slugify` 函数移除了中文字符）
2. Markdown 组件中 `String(children)` 处理 React 节点时无法正确提取纯文本
3. 滚动目标被固定导航栏遮挡

**解决方案：**
1. 添加 `extractText` 函数正确提取 React 节点纯文本
2. `slugify` 函数支持中文字符 `[\w\s\u4e00-\u9fa5-]`
3. 滚动时计算导航栏高度偏移

```javascript
function extractText(children: ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    return extractText(children.props.children);
  }
  return '';
}

// 滚动时考虑导航栏高度
const navbarHeight = 80;
const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
window.scrollTo({ top: elementPosition - navbarHeight, behavior: 'smooth' });
```

**修复日期：** 2026-04-12
**修复文件：** `src/components/MarkdownRenderer.tsx`、`src/components/TableOfContents.tsx`

---

## Bug: 设置页面 500 错误

**现象：** 访问 `/api/v1/settings` 时返回 500 Internal Server Error
**原因：** `get_current_user` 返回 `Optional[User]`，但 settings 路由直接访问 `current_user.id` 导致空指针
**解决方案：** 在 settings 路由中正确处理 `Optional[User]`，未认证时返回 401

```python
@router.get("", response_model=UserSettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return get_or_create_settings(db, current_user.id)
```

**修复日期：** 2026-04-12
**修复文件：** `backend/app/routers/settings.py`

---

## Bug: 点赞接口跨设备访问 404

**现象：** 从平板访问时点赞接口返回 404，但本地访问正常
**原因：** `.env` 设置 `VITE_API_BASE_URL=http://localhost:8000/api/v1`，从平板访问时 JavaScript 尝试连接平板本地的 `localhost:8000`，而不是 Mac mini 上的后端
**解决方案：** 改用相对路径 `/api/v1`，通过 Vite 代理转发到后端

```diff
# .env
- VITE_API_BASE_URL=http://localhost:8000/api/v1
+ VITE_API_BASE_URL=/api/v1
```

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  },
},
```

**修复日期：** 2026-04-12
**修复文件：** `frontend/.env`、`frontend/vite.config.ts`
