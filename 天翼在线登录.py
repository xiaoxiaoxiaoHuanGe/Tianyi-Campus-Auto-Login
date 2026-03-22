import ddddocr
from flask import Flask, request
from flask_cors import CORS
import base64
import os
import sys
import webbrowser
import subprocess
import winreg

app = Flask(__name__)
CORS(app)
ocr = ddddocr.DdddOcr(show_ad=False)


# 1. 设置开机自启 (替代 VBS 和启动文件夹)
def set_autostart():
    exe_path = sys.executable
    # 如果是在开发环境运行，就不写入注册表
    if not getattr(sys, 'frozen', False):
        return

    key = winreg.HKEY_CURRENT_USER
    key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
    try:
        registry_key = winreg.OpenKey(key, key_path, 0, winreg.KEY_WRITE)
        winreg.SetValueEx(registry_key, "CampusNetAutoLogin", 0, winreg.REG_SZ, exe_path)
        winreg.CloseKey(registry_key)
    except WindowsError:
        pass


# 2. 检测网络并自动打开网页 (替代 NetCheck.bat)
def check_network_and_open():
    # ping 8.8.8.8 一次，等待1秒
    result = subprocess.run(['ping', '-n', '1', '-w', '1000', '8.8.8.8'], stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE)
    if result.returncode != 0:
        # ping 不通，说明没网，打开浏览器触发重定向
        webbrowser.open("http://8.8.8.8")


# --- 原有的 Flask 路由保持不变 ---
@app.route('/ocr', methods=['POST'])
def recognize():
    try:
        data = request.get_json()
        img_base64 = data.get('image')
        if not img_base64:
            return 'No image provided', 400
        if ',' in img_base64:
            img_base64 = img_base64.split(',')[1]
        img_bytes = base64.b64decode(img_base64)
        result = ocr.classification(img_bytes)
        return result
    except Exception as e:
        return str(e), 500


if __name__ == '__main__':
    set_autostart()  # 自动写入开机启动
    check_network_and_open()  # 检测网络
    app.run(port=8899)  # 启动 OCR 服务