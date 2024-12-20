// 立即执行的调试日志
console.log('Script loaded');

// API相关代码放在最前面
const api = new GLM4API('963c0b2e50c49f1b6744f23a0b126f91.dXxBsXQSeHRT1bau');

// 图片处理相关变量
// let selectedImages = [];  // 注释掉这行

// 其他DOM元素
const sendButton = document.getElementById('sendMessage');
const userInput = document.getElementById('userInput');
const chatHistory = document.getElementById('chatHistory');
// const imageInput = document.getElementById('imageInput');  // 注释掉这行
const backToTop = document.getElementById('backToTop');

// 立即输出元素状态
console.log('Initial elements state:', {
    sendButton: sendButton,
    userInput: userInput,
    chatHistory: chatHistory,
    // imageInput: imageInput,  // 注释掉这行
    backToTop: backToTop
});

// 添加发送状态标志
let isSending = false;

// 确保DOM加载完成后再添加事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 注释掉图片处理相关代码
    /*
    imageInput.addEventListener('change', async function(e) {
        const files = e.target.files;
        selectedImages = [];
        let loadedImages = 0;
        
        // 显示加载提示
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message system-message';
        loadingDiv.textContent = '正在处理图片...';
        chatHistory.appendChild(loadingDiv);
        
        for (let i = 0; i < Math.min(files.length, 5); i++) {
            const file = files[i];
            // 检查文件类型
            if (!file.type.startsWith('image/')) {
                continue;
            }
            
            try {
                const imageUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = new Image();
                        img.onload = function() {
                            // 转换为base64 URL
                            const base64Url = e.target.result;
                            resolve(base64Url);
                        };
                        img.onerror = reject;
                        img.src = e.target.result;
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                selectedImages.push({
                    type: "image_url",
                    image_url: {
                        url: imageUrl
                    }
                });
                loadedImages++;
                
                // 所有图片都加载完成后
                if (loadedImages === Math.min(files.length, 5)) {
                    loadingDiv.remove();
                    // 显示预览
                    const previewDiv = document.createElement('div');
                    previewDiv.className = 'message user-message';
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'message-images';
                    selectedImages.forEach(img => {
                        const imgElement = document.createElement('img');
                        imgElement.src = img.image_url.url;
                        imgElement.className = 'message-image';
                        imageContainer.appendChild(imgElement);
                    });
                    previewDiv.appendChild(imageContainer);
                    chatHistory.appendChild(previewDiv);
                    chatHistory.scrollTop = chatHistory.scrollHeight;
                }
            } catch (error) {
                console.error('图片处理错误:', error);
            }
        }
    });
    */

    // 点击窗口外部关闭
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // 修改发送消息函数
    async function sendMessage() {
        // 如果正在发送中，直接返回
        if (isSending) {
            return;
        }

        const message = userInput.value.trim();
        if (message || selectedImages.length > 0) {
            try {
                // 设置发送状态为true
                isSending = true;
                // 禁用发送按钮和输入框
                sendButton.disabled = true;
                userInput.disabled = true;
                sendButton.style.opacity = '0.5';
                
                const content = [];
                
                // 添加图片内容
                content.push(...selectedImages);
                
                // 添加文本内容
                if (message) {
                    content.push({
                        type: "text",
                        text: message
                    });
                }

                // 显示用户消息
                addMessage('user', message, selectedImages);

                // 显示加载状态
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'message ai-message loading';
                loadingDiv.textContent = '正在思考...';
                chatHistory.appendChild(loadingDiv);

                // 发送API请求
                const response = await api.sendRequest([
                    {
                        role: "user",
                        content: content
                    }
                ], 'glm-4v-flash');

                // 移除加载状态
                loadingDiv.remove();

                // 显示AI响应
                if (response.choices && response.choices.length > 0) {
                    addMessage('ai', response.choices[0].message.content);
                }
            } catch (error) {
                console.error('发送消息失败:', error);
                addMessage('ai', '抱歉，发生了一些错误，请稍后重试。');
            } finally {
                // 恢复发送状态和控件状态
                isSending = false;
                sendButton.disabled = false;
                userInput.disabled = false;
                sendButton.style.opacity = '1';
                
                // 清空输入
                userInput.value = '';
                selectedImages = [];
                // imageInput.value = '';  // 注释掉这行
                
                // 将焦点重新设置到输入框
                userInput.focus();
            }
        }
    }

    // 更新发送按钮事件
    sendButton.onclick = sendMessage;

    // 更新回车发送事件
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 添加消息到对话历史
    function addMessage(sender, text, images = []) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        // 添加图片预览
        if (images && images.length > 0) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'message-images';
            images.forEach(img => {
                if (img.type === 'image_url' && img.image_url && img.image_url.url) {
                    const imgElement = document.createElement('img');
                    imgElement.src = img.image_url.url;
                    imgElement.className = 'message-image';
                    imageContainer.appendChild(imgElement);
                }
            });
            messageDiv.appendChild(imageContainer);
        }
        
        // 添加文本
        if (text) {
            const textDiv = document.createElement('div');
            textDiv.textContent = text;
            messageDiv.appendChild(textDiv);
        }
        
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // 返回顶部按钮
    window.onscroll = () => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            backToTop.style.display = 'block';
        } else {
            backToTop.style.display = 'none';
        }
    }

    backToTop.onclick = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    // 等待 DOM 加载完成后再初始化 Swiper
    const portfolioSwiper = new Swiper('.portfolio-swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: false,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        // 响应式设计
        breakpoints: {
            768: {
                slidesPerView: Math.min(2, document.querySelectorAll('.swiper-slide').length),
            },
            1024: {
                slidesPerView: Math.min(3, document.querySelectorAll('.swiper-slide').length),
            },
        }
    });
});

// 如果需要Shift+Enter换行，可以保留默认行为
 