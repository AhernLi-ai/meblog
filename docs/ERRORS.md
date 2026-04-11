# 开发错误记录

> 记录 meblog 项目开发过程中遇到的问题及解决方案，避免重蹈覆辙。

---

## 1. JWT Token 解析错误

**问题：** JWT 的 `sub` 字段传了整数，导致 `jwt.decode` 失败

**错误信息：**
```
Error: Subject must be a string.
```

**原因：** 
```python
# 错误写法
data={"sub": user.id}  # user.id 是整数

# 正确写法
data={"sub": str(user.id)}  # 转成字符串
```

**修复位置：** `backend/app/routers/auth.py`

---

## 2. 可选认证依赖返回 None

**问题：** 公开 API（如获取文章列表）因认证依赖报错返回 401

**原因：** 
- `OAuth2PasswordBearer(auto_error=False)` 在无 token 时不报错，但后续手动解析失败
- 手动 JWT 解析时使用了错误的依赖注入方式

**解决方案：** 使用 `Request` 对象手动从 header 获取 token，解析失败时返回 `None`

**修复位置：** `backend/app/utils/security.py`

```python
async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    # ... 手动解析 JWT
```

---

## 3. SQLAlchemy joinedload 与 join 冲突

**问题：** 使用 `joinedload` 加载关联数据后，再进行条件过滤时 category 为 None

**错误信息：**
```
sqlalchemy.exc.InvalidRequestError: Can't construct a join from Mapper[Post(posts)] to Mapper[Post(posts)], they are the same entity
```

**原因：** 
```python
# 错误写法 - 先 joinedload 再 join 同一表
query = db.query(Post).options(joinedload(Post.category))
query = query.join(Category).filter(Category.slug == category_slug)

# 正确写法 - 用 relationship 的 has() 方法过滤
query = query.filter(Post.category.has(Category.slug == category_slug))
```

**修复位置：** `backend/app/crud/post.py`

---

## 4. 标签统计查询 SQL 错误

**问题：** 通过多对多关联表统计标签下的文章数时 SQL 写法错误

**错误信息：**
```
sqlalchemy.exc.InvalidRequestError: Can't construct a join...
```

**原因：** 直接 `outerjoin(Post, Post.tags)` 导致 SQL 无法正确生成

**解决方案：** 分开查询，先获取所有标签，再单独统计每个标签的文章数

```python
def get_tags(db: Session):
    tags = db.query(Tag).all()
    for tag in tags:
        count = db.query(Post).join(
            post_tags, Post.id == post_tags.c.post_id
        ).filter(
            post_tags.c.tag_id == tag.id,
            Post.is_deleted == False,
            Post.status == "published"
        ).count()
        tag.post_count = count
    return tags
```

**修复位置：** `backend/app/crud/tag.py`

---

## 5. passlib 与 bcrypt 版本兼容问题

**问题：** `passlib[bcrypt]` 与新版 `bcrypt` 库不兼容

**错误信息：**
```
AttributeError: module 'bcrypt' has no attribute '__about__'
ValueError: password cannot be longer than 72 bytes
```

**解决方案：** 直接使用 `bcrypt` 库，不再依赖 `passlib`

```python
import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')
```

**修复位置：** `backend/app/utils/security.py`  
**依赖变更：** `pyproject.toml` 中 `passlib[bcrypt]` → `bcrypt>=4.1.0`

---

## 6. API 字段名大小写

**问题：** 创建分类/标签时使用了大写 `Name` 而非小写 `name`

**原因：** Pydantic schema 使用小写字段名

**教训：** 
- JSON 字段名一律使用小写 `camelCase` 或全小写
- 测试时注意字段名匹配

---

## 7. SQLite 多线程访问问题

**问题：** SQLite 数据库文件被锁定

**错误信息：**
```
ERROR: [Errno 48] error while attempting to bind on address (0.0.0.0, 8000): address already in use
```

**教训：** 
- 开发时注意端口占用情况
- 使用 `pkill -9 -f uvicorn` 彻底杀死进程
- SQLite 不适合高并发环境，生产环境使用 PostgreSQL

---

## 8. 后端重启后数据库丢失

**问题：** 每次删除 `meblog.db` 或重启后数据丢失

**原因：** 使用 SQLite 开发数据库，每次 `Base.metadata.create_all(bind=engine)` 会重新创建表

**教训：** 
- 考虑使用 `alembic` 进行数据库迁移管理
- 生产环境务必使用 PostgreSQL

---

## 9. 前端热更新未生效

**问题：** 后端代码修改后前端没有响应

**原因：** Vite 开发服务器需要正确配置 API 代理

**解决：** `vite.config.ts` 中配置代理
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
},
```

---

## 10. Pydantic v2 与 SQLAlchemy 兼容

**问题：** Pydantic v2 的 `from_attributes` 配置方式变化

**正确写法：**
```python
class Config:
    from_attributes = True
```

---

## 11. Git 初始分支命名

**问题：** 默认 Git 分支名为 `main`，但项目规范要求 `master`

**解决：**
```bash
git branch -m main master
```

---

## 12. curl 命令中 JSON 字段名

**问题：** Shell 脚本中 JSON 字段名大小写不一致

**教训：** 
- JSON API 规范：字段名统一小写
- 测试时使用 `python3 -m json.tool` 格式化输出便于调试

---

## 经验总结

### 后端开发
1. **认证**：JWT 的 `sub` 必须是字符串
2. **可选认证**：使用 `Request` 对象手动解析，返回 `Optional[User]`
3. **ORM 查询**：避免在同一查询中同时使用 `joinedload` 和 `join` 同一实体
4. **密码哈希**：直接用 `bcrypt`，不用 `passlib`
5. **数据库**：生产环境用 PostgreSQL，开发用 SQLite 但注意迁移
6. **重命名实体**：涉及数据库表重命名时，先改数据库再改代码，避免 FK 引用错误
7. **可选外键**：用 `'field_name' in post.model_fields_set` 判断是否显式传值，而非 `is not None`

### 前端开发
1. **主题切换**：使用 Context + localStorage + 系统监听
2. **API 代理**：开发环境配置 Vite proxy
3. **热更新**：后端修改需要重启，前端 Vite HMR 自动生效
4. **.env 配置**：Vite 项目需要 `VITE_` 前缀的环境变量
5. **可选字段**：访问嵌套对象如 `post.project?.name` 加可选链，避免 null 错误

### 测试技巧
1. **API 测试**：先用 curl 测试后端，确认正常后再调前端
2. **端口检查**：`lsof -i :8000` 确认端口未被占用
3. **进程清理**：`pkill -9 -f uvicorn` 彻底杀死进程

---

## 13. Markdown 内容中的转义字符

**问题：** 文章内容里的代码块标记 `\`` 被错误转义存储，导致 Markdown 渲染异常

**原因：** Python 字符串处理时 `
` 被当作字面量写入数据库

**教训：**
- 内容写入数据库前用原生字符串 `'''...'''` 避免转义
- 或用参数化查询 `cursor.execute('UPDATE ... SET content = ?', (content,))`

**修复位置：** `backend/fix_content.py` 重新写入正确内容

---

## 14. 分类 → 项目 大重命名

**问题：** 将 "分类" 改为 "项目" 涉及大量文件联动修改

**涉及范围：**
- 数据库表 `categories` → `projects`
- `Post.category_id` → `Post.project_id`
- `Project.posts` 关系配置外键
- API 路由 `/categories` → `/projects`
- `app/routers/categories.py` → `app/routers/projects.py`
- `routers/__init__.py` 导入更新
- `crud/__init__.py` 导入更新
- Pydantic schema field `category` → `project`
- 前端 `categoriesApi` → `projectsApi`
- 前端类型 `Category` → `Project`

**教训：**
- 大规模重命名应分步骤：数据库 → 模型 → CRUD → 路由 → Schema → 前端
- 每步完成后测试 API 是否正常
- 善用 `grep -r` 查找所有引用位置

---

## 15. SQLAlchemy 关系配置与数据库表名不匹配

**问题：** 模型 `Project.__tablename__ = "categories"` 但 `Post.project_id` FK 指向 `projects` 表

**错误信息：**
```
sqlalchemy.exc.NoForeignKeysError: Could not determine join condition between parent/child tables on relationship Project.posts
```

**原因：** 模型表名与数据库表名不一致，导致 SQLAlchemy 无法确定外键关系

**教训：**
- 模型 `__tablename__` 必须与数据库实际表名完全一致
- 修改表名后检查所有相关模型和 FK 配置

---

## 16. Pydantic validation_alias 用于字段映射

**问题：** API 返回字段名 `project` 但数据库/ORM 用 `category`

**解决：** 使用 `Field(None, validation_alias="category")` 让 Pydantic 接受 `category` 输入但输出 `project`

```python
project: Optional[ProjectInfo] = Field(None, validation_alias="category")
```

**教训：** 字段重命名时用 `validation_alias` 保持向后兼容

---

## 17. 可选外键设置为 null 无效

**问题：** 将文章的 `category_id` 设为 null（无项目）时无法生效

**原因：**
```python
if post.category_id is not None:  # null 值跳过此分支
    db_post.category_id = post.category_id
```

**解决：**
```python
if 'category_id' in post.model_fields_set:  # 检测字段是否被显式设置
    db_post.category_id = post.category_id
```

**教训：** Pydantic v2 用 `model_fields_set` 检测显式设置的字段

---

## 18. 前端登录后 token 未及时存储

**问题：** 登录成功后立即调用 `getMe()` 但 token 还未存入 localStorage

**原因：** 异步操作顺序问题，getMe 请求发出时 Authorization header 中无 token

**解决：** 先存 token 再调用 API
```typescript
localStorage.setItem('token', data.access_token);
const user = await authApi.getMe();
```

---

## 19. 前端缺少环境变量配置

**问题：** 前端 API 请求地址未配置

**解决：** 创建 `.env` 文件
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**教训：** Vite 项目环境变量必须以 `VITE_` 开头

---

## 20. 嵌套对象访问未做空值保护

**问题：** `post.category.name` 在 category 为 null 时报错

**解决：** 使用可选链 `post.category?.name || '-'`

**教训：** 前端渲染列表时注意可选字段的空值处理
