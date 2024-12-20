class GLM4API {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    }

    // Base64URL 编码
    base64UrlEncode(str) {
        return btoa(str)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    // 生成JWT token
    generateToken() {
        try {
            const [id, secret] = this.apiKey.split('.');
            
            // 创建 header
            const header = {
                "alg": "HS256",
                "sign_type": "SIGN"
            };
            
            // 创建 payload，使用毫秒时间戳
            const timestamp = Date.now();
            const exp = timestamp + (60 * 1000); // 60秒后过期
            
            const payload = {
                "api_key": id,
                "exp": exp,
                "timestamp": timestamp
            };

            // 编码 header 和 payload
            const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
            const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
            
            // 创建签名
            const signatureInput = `${encodedHeader}.${encodedPayload}`;
            const signature = CryptoJS.HmacSHA256(signatureInput, secret);
            const encodedSignature = signature.toString(CryptoJS.enc.Base64)
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');

            // 组合 JWT
            const token = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
            console.log('Generated token:', token); // 调试用
            console.log('Payload:', payload); // 调试用
            return token;
        } catch (error) {
            console.error('Token生成失败:', error);
            throw error;
        }
    }

    // 生成请求头
    getHeaders() {
        const token = this.generateToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // 发送请求到GLM-4V
    async sendRequest(messages, model = 'glm-4v-flash') {
        try {
            const headers = this.getHeaders();
            console.log('Request headers:', headers);
            console.log('Request body:', { model, messages });

            // 添加调试日志
            console.log('发送的消息内容:', JSON.stringify(messages, null, 2));

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API错误响应:', errorData);
                // 添加更详细的错误信息
                const errorMessage = errorData.error?.message || '未知错误';
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
            }

            const data = await response.json();
            console.log('API响应数据:', data); // 添加响应数据日志
            return data;
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    }
} 