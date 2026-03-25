# OKR 全栈管理系统：Windows Server 终极部署与更新手册

本手册汇集了在真实 Windows Server 环境下的实战验证经验，特别针对内网 IP 访问、Prisma 引擎下载拦截、Next.js 独立包等典型踩坑点，总结出了这条最高效、最稳健的**纯原生脱水托管部署方案**。

---

## 🎯 核心运行架构
*   **前端服务**：原生 Next.js 服务 (`npm run start`)，运行在 `3000` 端口。
*   **后端 API**：原生 NestJS 服务 (`dist/main.js`)，运行在 `3001` 端口。
*   **数据库底层**：预先创建好的 MySQL 以及无需配置的 Windows 移植版 Redis。
*   **后台管家**：利用 NSSM 工具，让两个 Node.js 程序化身为没黑框的“纯后台隐身系统服务”。
*   **核心特性**：完全抛弃了笨重的打包 `.exe` 行为和出错率极高的 IIS 转发映射。通过直接访问 `:3000` 端口实现纯天然物理大直通。

---

## ⚙️ 一、全新机器：基础支撑环境准备

### 1. 刚需运行环境与工具
*   **Node.js (LTS 版)**：浏览器去 Node 官网下载 `.msi` 安装包，勾选默认环境变量并一路 Next。
*   **NSSM 工具**：前往 [nssm.cc](http://nssm.cc/) 下载 zip 包，解压后将其路径塞进微软系统高级系统设置的**环境变量 `Path`** 里。

### 2. 本地数据库设施搭台
*   **准备 MySQL**：在您的机器上安装好 MySQL 并启动它。**必须**通过管理工具手动新建一个名为 `okr_db` 的空数据库（字符集选 `utf8mb4`），备好账密。
*   **准备 Redis**：抛弃用不惯的 Docker。去 Github 下载 [tporadowski/redis 安装版](https://github.com/tporadowski/redis/releases)，双击后全程 Next 到底。它会自动注册为 Windows 服务并在默认 `6379` 端口静默奔跑。免密，即插即用。

---

## 🔧 二、部署阶段：代码编译与初次上线之旅

把开发好的最新 OKR 源码（不含庞大 `node_modules`）复制到服务器固定路径下（如 `C:\APPs\project\OKR_mgmt_system`）。

### 步骤 1：精确匹配您的服务器 IP 配置
打开并修改这两个最重要的密码凭证文件（确保它们存在，且以下值符合实际情况）：

*   **修定 `apps/api/.env` (后端的命脉配置)**
    ```env
    DATABASE_URL="mysql://root:您的MySQL密码@127.0.0.1:3306/okr_db"
    REDIS_URL="redis://localhost:6379"
    WEB_ORIGIN="http://10.246.97.159:3000"
    PORT=3001
    ```
*   **修定 `apps/web/.env.production` (前端寻找数据的指南针)**
    ```env
    NEXT_PUBLIC_API_BASE_URL="http://10.246.97.159:3001/api"
    ```

### 步骤 2：破解墙外封锁并推库建表
打开 PowerShell 或是命令提示符。
```powershell
# 1. 进屋：切入到您的总代码目录
cd C:\APPs\project\OKR_mgmt_system

# 2. 安装：狂揽依赖代码包
npm install

# 3. 强拆 SSL 证书护盾：并生成 Prisma 数据库内核引挚（此举专门治愈 unable to get local issuer certificate 黑洞防火墙报错）
$env:NODE_TLS_REJECT_UNAUTHORIZED=0
npm run prisma:generate

# 4. 下旋入 api 子目录：这是为了向刚建好的 MySQL 推送长达数百行的精美表结构
cd apps\api
npx prisma db push
```

### 步骤 3：全栈大火收汁（统一编译）
完成造表以后。
```powershell
# 1. 登堂退回根目录
cd ..\..

# 2. 对 NestJS 后端 and Next.js 前端应用进行双倍提纯和精简压缩
npm run build
```

---

## 🔌 三、免打扰服务挂载阶段

用最地道原生的系统守护精灵 NSSM。

### 挂起 1号小阿弟：后端应用 (OkrApiBackend)
输入并在弹出的图形面板中填写：
```cmd
nssm install OkrApiBackend
```
* **Path**：`C:\Program Files\nodejs\node.exe`
* **Arguments**：`C:\APPs\project\OKR_mgmt_system\apps\api\dist\main.js` 
* **AppDirectory**：`C:\APPs\project\OKR_mgmt_system\apps\api`

### 挂起 2号小阿弟：前端应用 (OkrWebFrontend)
输入配置：
```cmd
nssm install OkrWebFrontend
```
* **Path**：`C:\Program Files\nodejs\npm.cmd`
* **Arguments**：`run start --workspace apps/web` 
* **AppDirectory**：`C:\APPs\project\OKR_mgmt_system`

🚨 *（注意：使用完全原生的 NPM 引擎能够根本上根治 Next.js standalone 导致的组件样式撕裂和丢失 css 包寻找路径深远的顽疾。）*

保存以上两支队伍建立完毕后，直接敲命令启动：
```cmd
nssm start OkrApiBackend
nssm start OkrWebFrontend
```

> **恭喜您通关！🎊 您的老板现在已经可以通过浏览器输入 `http://10.246.97.159:3000` 进入花花绿绿且带有动态图表的数据空间了！**

---

## 💡 附录核心：以后的日常升级与发版流程
如果您以后接手了这个项目的长期维护，需要把本地改好的新功能（比如新页面、新接口）发布到这台 Windows 服务器上，这是一个非常标准的、“机械化”的 6 步流水线操作：

### 🔄 日常更新的全自动 6 步曲：

#### 1. 将新代码放入服务器
把您写好的新代码（或者直接在 GitHub 上 `git pull`）覆盖掉服务器上 `c:\APPs\project\OKR_mgmt_system` 里旧的源码文件夹。
*(⚠️ 唯一禁忌：**千万别覆盖替换掉那两个 `.env` 配置密码文件！**，并且不要去搬运庞大的 `node_modules` 文件夹。)*

#### 2. 下载可能的新依赖包（可选但防翻车）
在服务器的命令行（该项目根目录下）敲入：
```powershell
npm install
```
*(这是为了防止您这次更新加了什么新的第三方包库，比如图表插件，npm 会自动把缺失的包下载补齐。)*

#### 3. 更新数据库表结构（仅当您改了 Prisma 表时必做）
如果您这次更新给 OKR 增加了一个新功能（比如“评论表”），您必须让 MySQL 同步加上这张表：
```powershell
# 第一句：进入含有配置密码的真实后端目录
cd apps\api

# 第二句：把新表的结构暴力推给 MySQL
npx prisma db push

# 第三句：切回外层大目录准备接下来的全栈编译
cd ..\..
```
*(如果您只是前端页面改了个按钮颜色，后端没加新表，这一步可以直接跳过！)*

#### 4. 暂时切断动力（重要：防止 Windows 文件锁死造成编译卡死）
在 Windows 上，如果旧版程序正在运行，它会锁死编译目录。**必须**先停掉服务：
```powershell
nssm stop OkrApiBackend
nssm stop OkrWebFrontend
```

#### 5. 全栈强行粉碎重生（必做核心）
在根目录敲入指令：
```powershell
npm run build
```
*(这一行代码会把源码重新打包。如果报错提示文件夹不可用，请手动删除 `apps/web/.next` 目录。)*

**⚠️ 重中之重：资源同步（仅针对 Standalone 模式）**
Next.js 的独立包模式不包含静态资源。构建完成后，必须手动或用脚本同步 `static` 和 `public` 文件夹，否则页面会失去样式（CSS 丢失）：
```powershell
# 将编译好的静态资源复制到独立部署包的对应路径下
xcopy /E /I /Y "apps\web\.next\static" "apps\web\.next\standalone\apps\web\.next\static"
xcopy /E /I /Y "apps\web\public" "apps\web\.next\standalone\apps\web\public"
```
#### 6. 让后台服务重新苏醒（必做封顶）
最后，把服务重新启动以加载新代码：
```powershell
nssm start OkrApiBackend
nssm start OkrWebFrontend
``````

---

## 🆘 常见故障排除 (Troubleshooting)

### 1. 启动异常：Unexpected token 'M'...is not valid JSON
*   **现象**：浏览器打开后白屏，F12 控制台报错。
*   **原因**：浏览器缓存了旧版本的登录信息（纯字符串），导致无法被新版系统正确解析。
*   **解决**：
    1.  手动清理浏览器缓存：按下 `F12` -> `Application` -> `Local Storage` -> 选中网址 -> 右键 `Clear`。
    2.  或者：我已经更新了 `store.ts` 代码，系统检测到异常会自动清除并强制重新登录。

### 2. 页面“支离破碎”：CSS 样式丢失
*   **现象**：网页只有纯文本，没有任何排版。
*   **解决**：务必确认上述 **Step 5** 中的 `xcopy` 命令执行成功，确保 `.next/standalone/apps/web/.next/static` 路径下有内容。
