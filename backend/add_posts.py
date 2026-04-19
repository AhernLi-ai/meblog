     1|#!/usr/bin/env python3
     2|"""Insert 12 sample blog posts into the meblog database."""
     3|
     4|from sqlalchemy import create_engine
     5|from sqlalchemy.orm import sessionmaker
     6|from app.models.post import Post
     7|from app.models.category import Category
     8|from app.models.tag import Tag
     9|from app.models.user import User
    10|from app.models.tag import post_tags
    11|from datetime import datetime
    12|import random
    13|
    14|DATABASE_URL = "sqlite:///./meblog.db"
    15|engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    16|SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    17|
    18|posts_data = [
    19|    {
    20|        "title": "Python 异步编程完全指南",
    21|        "slug": "python-async-programming-guide",
    22|        "content": """## 什么是异步编程？
    23|
    24|异步编程是一种并发模型，允许程序在等待 I/O 操作完成时继续执行其他任务。
    25|
    26|## async/await 语法
    27|
    28|```python
    29|import asyncio
    30|
    31|async def fetch_data():
    32|    await asyncio.sleep(1)
    33|    return "data"
    34|
    35|async def main():
    36|    result = await fetch_data()
    37|    print(result)
    38|
    39|asyncio.run(main())
    40|```
    41|
    42|## 异步 vs 同步
    43|
    44|| 特性 | 同步 | 异步 |
    45||------|------|------|
    46|| 性能 | 低 | 高 |
    47|| 复杂度 | 低 | 高 |
    48|| 适用场景 | CPU密集 | I/O密集 |
    49|
    50|## 最佳实践
    51|
    52|1. 不要在异步函数中使用同步阻塞操作
    53|2. 使用 `asyncio.gather()` 并发执行多个任务
    54|3. 合理使用信号量控制并发数量
    55|""",
    56|        "summary": "全面介绍 Python 异步编程的核心概念与实战技巧",
    57|        "project_slug": "ji-zhu",
    58|        "tag_names": ["Python"],
    59|        "status": "published",
    60|    },
    61|    {
    62|        "title": "React 18 新特性深度解析",
    63|        "slug": "react-18-new-features",
    64|        "content": """## Concurrent Mode
    65|
    66|React 18 引入了并发模式，让渲染可以被中断和恢复。
    67|
    68|## Automatic Batching
    69|
    70|自动批处理减少了不必要的重新渲染：
    71|
    72|```jsx
    73|setTimeout(() => {
    74|  setCount(c => c + 1);
    75|  setFlag(f => !f);
    76|  // 只触发一次重新渲染
    77|}, 1000);
    78|```
    79|
    80|## Suspense for Data Fetching
    81|
    82|```jsx
    83|function App() {
    84|  return (
    85|    <Suspense fallback={<Loading />}>
    86|      <Comments />
    87|    </Suspense>
    88|  );
    89|}
    90|```
    91|
    92|## useTransition
    93|
    94|```jsx
    95|import { useTransition } from 'react';
    96|
    97|function App() {
    98|  const [isPending, startTransition] = useTransition();
    99|
   100|  startTransition(() => {
   101|    setTab('posts');
   102|  });
   103|}
   104|```
   105|""",
   106|        "summary": "深入解析 React 18 的并发特性与最佳实践",
   107|        "project_slug": "ji-zhu",
   108|        "tag_names": ["Python"],
   109|        "status": "published",
   110|    },
   111|    {
   112|        "title": "TypeScript 高级类型技巧",
   113|        "slug": "typescript-advanced-types",
   114|        "content": """## 条件类型
   115|
   116|```typescript
   117|type IsString<T> = T extends string ? true : false;
   118|
   119|type A = IsString<"hello">; // true
   120|type B = IsString<123>;    // false
   121|```
   122|
   123|## 映射类型
   124|
   125|```typescript
   126|type Readonly<T> = {
   127|  readonly [P in keyof T]: T[P];
   128|};
   129|
   130|type Optional<T> = {
   131|  [P in keyof T]?: T[P];
   132|};
   133|```
   134|
   135|## 模板字面量类型
   136|
   137|```typescript
   138|type EventName = `on${Capitalize<string>}`;
   139|type ButtonEvent = EventName; // "onClick" | "onFocus" | ...
   140|```
   141|
   142|## 递归类型
   143|
   144|```typescript
   145|type DeepReadonly<T> = {
   146|  readonly [P in keyof T]: T[P] extends object
   147|    ? DeepReadonly<T[P]>
   148|    : T[P];
   149|};
   150|```
   151|""",
   152|        "summary": "掌握 TypeScript 高级类型系统提升代码质量",
   153|        "project_slug": "ji-zhu",
   154|        "tag_names": ["Python"],
   155|        "status": "published",
   156|    },
   157|    {
   158|        "title": "FastAPI 高性能 Web 开发",
   159|        "slug": "fastapi-high-performance-web",
   160|        "content": """## 为什么选择 FastAPI？
   161|
   162|- 🚀 性能卓越（与 Node.js 和 Go 相当）
   163|- 📝 自动生成 OpenAPI 文档
   164|- ✅ 类型安全
   165|
   166|## 基础示例
   167|
   168|```python
   169|from fastapi import FastAPI
   170|
   171|app = FastAPI()
   172|
   173|@app.get("/")
   174|async def root():
   175|    return {"message": "Hello World"}
   176|```
   177|
   178|## 请求体验证
   179|
   180|```python
   181|from pydantic import BaseModel
   182|
   183|class User(BaseModel):
   184|    name: str
   185|    email: str
   186|    age: int
   187|
   188|@app.post("/users")
   189|async def create_user(user: User):
   190|    return user
   191|```
   192|
   193|## 依赖注入
   194|
   195|```python
   196|from fastapi import Depends
   197|
   198|def get_db():
   199|    db = SessionLocal()
   200|    try:
   201|        yield db
   202|    finally:
   203|        db.close()
   204|
   205|@app.get("/items")
   206|async def get_items(db = Depends(get_db)):
   207|    return db.query(Item).all()
   208|```
   209|""",
   210|        "summary": "使用 FastAPI 构建高性能 Python Web 应用",
   211|        "project_slug": "ji-zhu",
   212|        "tag_names": ["Python"],
   213|        "status": "published",
   214|    },
   215|    {
   216|        "title": "SQLAlchemy 2.0 完全指南",
   217|        "slug": "sqlalchemy-2-guide",
   218|        "content": """## ORM vs Core
   219|
   220|SQLAlchemy 2.0 统一了 ORM 和 Core 的使用体验。
   221|
   222|## 定义模型
   223|
   224|```python
   225|from sqlalchemy import String, Integer, ForeignKey
   226|from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
   227|
   228|class Base(DeclarativeBase):
   229|    pass
   230|
   231|class User(Base):
   232|    __tablename__ = "users"
   233|
   234|    id: Mapped[int] = mapped_column(Integer, primary_key=True)
   235|    name: Mapped[str] = mapped_column(String(50))
   236|    posts: Mapped[list["Post"]] = relationship(back_populates="author")
   237|```
   238|
   239|## 查询
   240|
   241|```python
   242|# 新式查询
   243|session.execute(
   244|    select(User).where(User.name == "Alice")
   245|).scalars().all()
   246|```
   247|
   248|## 关系
   249|
   250|```python
   251|class Post(Base):
   252|    __tablename__ = "posts"
   253|
   254|    id: Mapped[int] = mapped_column(Integer, primary_key=True)
   255|    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
   256|    author: Mapped["User"] = relationship(back_populates="posts")
   257|```
   258|""",
   259|        "summary": "SQLAlchemy 2.0 新特性详解与实战技巧",
   260|        "project_slug": "ji-zhu",
   261|        "tag_names": ["Python"],
   262|        "status": "published",
   263|    },
   264|    {
   265|        "title": "Docker 容器化部署实战",
   266|        "slug": "docker-deployment-practice",
   267|        "content": """## Dockerfile 最佳实践
   268|
   269|```dockerfile
   270|FROM python:3.12-slim
   271|
   272|WORKDIR /app
   273|
   274|COPY requirements.txt .
   275|RUN pip install --no-cache-dir -r requirements.txt
   276|
   277|COPY . .
   278|
   279|CMD ["python", "main.py"]
   280|```
   281|
   282|## Docker Compose
   283|
   284|```yaml
   285|version: '3.8'
   286|
   287|services:
   288|  web:
   289|    build: .
   290|    ports:
   291|      - "8000:8000"
   292|    environment:
   293|      - DATABASE_URL=postgresql://user:***@db:5432/mydb
   294|
   295|  db:
   296|    image: postgres:15
   297|    volumes:
   298|      - postgres_data:/var/lib/postgresql/data
   299|
   300|volumes:
   301|  postgres_data:
   302|```
   303|
   304|## 健康检查
   305|
   306|```dockerfile
   307|HEALTHCHECK --interval=30s --timeout=3s \\
   308|  CMD curl -f http://localhost:8000/health || exit 1
   309|```
   310|""",
   311|        "summary": "Docker 容器化部署完整指南与最佳实践",
   312|        "project_slug": "ji-zhu",
   313|        "tag_names": ["Python"],
   314|        "status": "published",
   315|    },
   316|    {
   317|        "title": "Git 工作流完全指南",
   318|        "slug": "git-workflow-guide",
   319|        "content": """## Git Flow
   320|
   321|```
   322|main (生产环境)
   323|  └── develop (开发分支)
   324|        ├── feature-xxx
   325|        ├── feature-yyy
   326|        └── release-1.0
   327|```
   328|
   329|## 常用命令
   330|
   331|### 创建特性分支
   332|```bash
   333|git checkout -b feature/new-feature develop
   334|```
   335|
   336|### 合并分支
   337|```bash
   338|git checkout develop
   339|git merge --no-ff feature/new-feature
   340|git branch -d feature/new-feature
   341|```
   342|
   343|## Rebase vs Merge
   344|
   345|**Merge**:
   346|- 保留完整历史
   347|- 可能产生很多合并提交
   348|
   349|**Rebase**:
   350|- 历史更线性
   351|- 不要 rebase 公共分支！
   352|
   353|## 常见问题
   354|
   355|### 撤销最后一次提交
   356|```bash
   357|git reset --soft HEAD~1
   358|```
   359|""",
   360|        "summary": "Git 工作流详解与团队协作最佳实践",
   361|        "project_slug": "ji-zhu",
   362|        "tag_names": ["Python"],
   363|        "status": "published",
   364|    },
   365|    {
   366|        "title": "TailwindCSS 实用技巧",
   367|        "slug": "tailwindcss-tips",
   368|        "content": """## 响应式设计
   369|
   370|```html
   371|<div class="text-sm md:text-lg lg:text-xl">
   372|  响应式文本
   373|</div>
   374|```
   375|
   376|## 深色模式
   377|
   378|```html
   379|<div class="bg-white dark:bg-gray-900">
   380|  <h1 class="text-black dark:text-white">标题</h1>
   381|</div>
   382|```
   383|
   384|## 自定义配置
   385|
   386|```javascript
   387|// tailwind.config.js
   388|module.exports = {
   389|  theme: {
   390|    extend: {
   391|      colors: {
   392|        brand: {
   393|          500: '#3b82f6',
   394|          600: '#2563eb',
   395|        }
   396|      }
   397|    }
   398|  }
   399|}
   400|```
   401|
   402|## 组件化
   403|
   404|```jsx
   405|function Button({ variant = 'primary', children }) {
   406|  const variants = {
   407|    primary: 'bg-blue-500 text-white',
   408|    secondary: 'bg-gray-200 text-gray-800',
   409|  };
   410|
   411|  return (
   412|    <button className={`px-4 py-2 rounded ${variants[variant]}`}>
   413|      {children}
   414|    </button>
   415|  );
   416|}
   417|```
   418|""",
   419|        "summary": "TailwindCSS 高效开发技巧与最佳实践",
   420|        "project_slug": "ji-zhu",
   421|        "tag_names": ["Python"],
   422|        "status": "published",
   423|    },
   424|    {
   425|        "title": "程序员健康生活指南",
   426|        "slug": "programmer-health-guide",
   427|        "content": """## 久坐危害
   428|
   429|程序员每天坐着敲代码的时间可能超过 8 小时，这对身体危害很大。
   430|
   431|## 解决方案
   432|
   433|### 1. 定时休息
   434|- 使用 20-20-20 法则：每 20 分钟，看 20 英尺外的物体 20 秒
   435|
   436|### 2. 站立办公
   437|考虑使用升降桌，交替站立和坐着工作
   438|
   439|### 3. 简单运动
   440|
   441|```python
   442|# 每小时做一组简单拉伸
   443|stretches = [
   444|    "颈部旋转",
   445|    "肩部耸动",
   446|    "手腕伸展",
   447|    "躯干扭转"
   448|]
   449|```
   450|
   451|## 视力保护
   452|
   453|1. 调节显示器亮度与环境光匹配
   454|2. 使用护眼模式
   455|3. 保持屏幕与眼睛至少 50cm 距离
   456|
   457|## 心理健康
   458|
   459|- 保持社交，不要孤立
   460|- 培养工作之外的兴趣爱好
   461|- 学会说"不"，管理预期
   462|""",
   463|        "summary": "程序员健康生活实用建议与日常保养",
   464|        "project_slug": "sheng-huo",
   465|        "tag_names": ["Python"],
   466|        "status": "published",
   467|    },
   468|    {
   469|        "title": "高效工作的时间管理",
   470|        "slug": "time-management-tips",
   471|        "content": """## 番茄工作法
   472|
   473|```
   474|🍅 工作 25 分钟
   475|  ↓
   476|☕ 休息 5 分钟
   477|  ↓
   478|🍅 工作 25 分钟
   479|  ↓
   480|☕ 休息 5 分钟
   481|  ↓
   482|🍅🍅🍅🍅
   483|  ↓
   484|🛷 长休息 15-30 分钟
   485|```
   486|
   487|## 优先级矩阵
   488|
   489|| | 紧急 | 不紧急 |
   490||---|---|---|
   491|| **重要** | 🔴 立即做 | 🟡 计划做 |
   492|| **不重要** | 🟠 委托做 | 🔵 删除做 |
   493|
   494|## 减少切换成本
   495|
   496|- 批量处理相似任务
   497|- 使用快捷键减少鼠标操作
   498|- 自动化重复性工作
   499|
   500|## 代码示例：待办事项
   501|