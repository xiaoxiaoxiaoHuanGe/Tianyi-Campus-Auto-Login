<h1 align="center">天翼校园网自动登录</h1>

<p align="center">浏览器自动填表，本机 OCR 识别验证码。</p>

<p align="center">
  <a href="https://github.com/xiaoxiaoxiaoHuanGe/Tianyi-Campus-Auto-Login/releases/latest"><img alt="Release" src="https://img.shields.io/github/v/release/xiaoxiaoxiaoHuanGe/Tianyi-Campus-Auto-Login?style=flat-square"></a>
  <img alt="Windows" src="https://img.shields.io/badge/Windows-526273?style=flat-square">
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/License-MIT-526273?style=flat-square"></a>
</p>

<p align="center">
  <a href="#快速开始">快速开始</a> ·
  <a href="tianyi-autologin.user.js">浏览器脚本</a> ·
  <a href="#停止与卸载">停止与卸载</a> ·
  <a href="https://github.com/xiaoxiaoxiaoHuanGe/Tianyi-Campus-Auto-Login/issues">反馈问题</a>
</p>

---

这套工具由 **Windows 本地 OCR 服务 + Tampermonkey 用户脚本**组成，用于减少校园网网页登录时的重复操作。
浏览器负责跳转、填写账号和提交；本机服务接收验证码图片并返回识别结果。

> [!IMPORTANT]
> 当前脚本针对 **ZSC 的天翼校园网**页面编写。其他学校需核对登录网址、`@match`、表单 ID 和跳转逻辑，不能直接保证可用。

## 可以做什么

| 功能 | 实际行为 |
| --- | --- |
| 🖥️ 本地识别 | 使用 ddddocr，在 `127.0.0.1:8899/ocr` 识别验证码图片 |
| 🌐 启动检测 | 服务启动时 ping 一次 `8.8.8.8`；失败则打开 HTTP 页面，尝试触发校园网跳转 |
| 🧩 自动填表 | 在匹配页面跳过过渡页，填写账号、密码和识别结果，再提交登录 |
| 🔄 开机启动 | 打包 EXE 运行时写入当前用户的 Windows 启动项；源码运行不写入 |

**服务不会持续检测网络，也没有定时重连。** 切换到校园网后如未出现登录页，需要手动打开网页触发认证。
OCR 识别和登录结果受验证码、页面结构及网络影响；未提供固定的 CPU 或内存占用保证。

## 快速开始

### 1. 启动本地服务

从 [Releases](https://github.com/xiaoxiaoxiaoHuanGe/Tianyi-Campus-Auto-Login/releases/latest) 下载 `CampusNet-OCR-Server.exe`，
放在固定目录后运行。移位或改名后，应从新位置重新运行以更新启动项。

源码入口是 [天翼在线登录.py](天翼在线登录.py)。不使用 EXE 时，在 Windows 的 Python 环境运行：

```powershell
git clone https://github.com/xiaoxiaoxiaoHuanGe/Tianyi-Campus-Auto-Login.git
cd Tianyi-Campus-Auto-Login
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install ddddocr flask flask-cors
python .\天翼在线登录.py
```

仓库没有锁定 Python 和依赖版本；以上为源码依赖安装方式。首次安装需要网络，服务启动后识别在本机进行。

### 2. 安装浏览器脚本

1. 在浏览器安装 Tampermonkey 扩展。
2. 新建用户脚本，复制 [tianyi-autologin.user.js](tianyi-autologin.user.js) 的内容。
3. 搜索 `MY_USERNAME` 和 `MY_PASSWORD`，在本机填入自己的校园网账号和密码。
4. 保存脚本，确认扩展有权在对应登录页运行。

### 3. 验证登录

保持 OCR 服务运行，在校园网中打开网页进入认证页面。
脚本应填写账号、识别验证码并提交；如果提示无法连接 OCR，先检查本机服务和 `8899` 端口。
验证码错误时需重新加载页面再试，当前脚本没有自动重试循环。

## 凭据与使用范围

- 账号和密码以明文保存在本机用户脚本中。公开仓库中的数字仅作示例，不可直接用于登录。
- 不要提交填写后的脚本，也不要在截图、日志或导出的浏览器配置中公开凭据。
- OCR 接口仅供本机使用；当前 Flask 服务没有鉴权并允许跨域请求，不应将 `8899` 端口转发到公网。
- 请使用自己的账号，并遵守学校及网络服务的使用规则。

## 停止与卸载

临时停止：在任务管理器结束 `CampusNet-OCR-Server.exe`；源码运行时在终端按 `Ctrl+C`。

完全卸载：停止进程，禁用或删除 Tampermonkey 脚本，删除 EXE，并移除启动项：

```powershell
Remove-ItemProperty -LiteralPath 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'CampusNetAutoLogin' -ErrorAction SilentlyContinue
```

## 作者与许可证

项目由 [xiaoxiaoxiaoHuanGe](https://github.com/xiaoxiaoxiaoHuanGe) 维护，浏览器脚本保留原署名 **Gemini-Huan**。
源码采用 [MIT License](LICENSE)，第三方依赖遵循各自许可证。
