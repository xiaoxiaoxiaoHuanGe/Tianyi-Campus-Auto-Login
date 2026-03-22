// ==UserScript==
// @name         天翼校园全自动登录 (跳转+OCR本地识别)
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  自动跳过过渡页，到达登录页后自动填写账号密码并识别验证码提交
// @author       Gemini-Huan
// @match        http://enet.10000.gd.cn:10001/qs/index.jsp?wlanacip=14.148.0.67&wlanuserip=*
// @match        http://enet.10000.gd.cn:10001/zs/default/index.jsp?wlanacip=14.148.0.67&wlanuserip=*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @connect      enet.10000.gd.cn
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    // 获取当前页面的URL
    const currentUrl = window.location.href;

    // ================= 阶段一：网页跳转逻辑 =================
    // 检查URL是否包含过渡页 "zs/default"
    if (currentUrl.includes("zs/default")) {
        console.log("检测到过渡页，正在跳转到登录页...");
        // 替换 "zs/default" 为 "qs"
        const newUrl = currentUrl.replace("zs/default", "qs");
        // 执行跳转
        window.location.href = newUrl;

        // return 极其重要：防止跳转期间执行下面的登录代码导致报错
        return;
    }

    // ================= 阶段二：自动登录逻辑 =================
    // 只有URL中包含 "qs" (真正的登录页) 时，才执行打码和登录
    if (currentUrl.includes("qs")) {

        // ⚠️ 在这里修改为你的实际账号和密码
        const MY_USERNAME = '111111';
        const MY_PASSWORD = '11111';

        // 将图片元素转换为 Base64 编码的函数
        function getBase64Image(imgElement) {
            const canvas = document.createElement("canvas");
            canvas.width = imgElement.width;
            canvas.height = imgElement.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);
            return canvas.toDataURL("image/png");
        }

        const initLogin = () => {
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const codeInput = document.getElementById('code');
            const submitBtn = document.querySelector('button[onclick="login()"]');

            // 🎯 精准定位验证码图片
            const captchaImg = document.getElementById('image_code');

            // 1. 自动填充账号和密码
            if (usernameInput && passwordInput) {
                usernameInput.value = MY_USERNAME;
                passwordInput.value = MY_PASSWORD;
                usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
                passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // 2. 提取验证码并发送给本地 Python 服务
            if (codeInput && captchaImg) {
                // 等待图片加载完成后再提取
                if(captchaImg.complete) {
                    processOCR();
                } else {
                    captchaImg.onload = processOCR;
                }

                function processOCR() {
                    const base64Str = getBase64Image(captchaImg);

                    // 向本地的 Python 服务发送请求
                    GM_xmlhttpRequest({
                        method: "POST",
                        url: "http://127.0.0.1:8899/ocr",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        data: JSON.stringify({ image: base64Str }),
                        onload: function(response) {
                            if (response.status === 200) {
                                const codeResult = response.responseText;
                                console.log("OCR 识别结果:", codeResult);

                                // 填入验证码
                                codeInput.value = codeResult;
                                codeInput.dispatchEvent(new Event('input', { bubbles: true }));

                                // 3. 自动点击登录
                                setTimeout(() => {
                                    if (submitBtn) {
                                        submitBtn.click();
                                    } else if (typeof window.login === 'function') {
                                        window.login();
                                    }
                                }, 300);

                            } else {
                                console.error("OCR 识别失败，服务器返回:", response.status);
                            }
                        },
                        onerror: function(err) {
                            alert("无法连接到本地 OCR 服务！请检查 Python 脚本是否已运行。");
                            console.error(err);
                        }
                    });
                }
            }
        };

        // 延迟 1 秒执行，确保网页和图片都完全加载完毕
        setTimeout(initLogin, 1000);
    }
})();