// 1. 替换成你的火山方舟AI接口密钥（下面会教你怎么获取）
const AI_API_KEY = "3c02537b-0941-42be-b7f1-2108763d433c";
const AI_API_URL = "https://ark-project.tos-cn-beijing.ivolces.com/images/view.jpeg";

// 2. 页面加载时，显示历史记录
document.addEventListener("DOMContentLoaded", () => {
    loadHistory();
    // 绑定提交按钮事件
    document.getElementById("submit-btn").addEventListener("click", submitMood);
});

// 3. 提交情绪记录 + 调用AI分析
async function submitMood() {
    const moodTag = document.getElementById("mood-tag").value.trim();
    const moodDesc = document.getElementById("mood-desc").value.trim();
    const analysisContent = document.getElementById("analysis-content");

    // 检查输入是否为空
    if (!moodTag || !moodDesc) {
        alert("请输入情绪标签和事件描述哦～");
        return;
    }

    // 显示加载中
    analysisContent.textContent = "AI正在分析...请稍等";

    try {
        // 调用AI接口获取分析结果
        const aiAnalysis = await callAIApi(moodTag, moodDesc);
        
        // 保存记录到浏览器（本地存储，不会消失）
        const record = {
            date: new Date().toLocaleString(), // 当前时间
            moodTag,
            moodDesc,
            aiAnalysis
        };
        saveRecord(record);

        // 显示AI结果
        analysisContent.textContent = aiAnalysis;

        // 刷新历史记录
        loadHistory();

        // 清空输入框
        document.getElementById("mood-tag").value = "";
        document.getElementById("mood-desc").value = "";

    } catch (error) {
        analysisContent.textContent = "AI分析出错了：" + error.message;
        console.error(error);
    }
}

// 4. 调用火山方舟AI接口（核心函数）
async function callAIApi(moodTag, moodDesc) {
    // AI提示词：告诉AI要做什么（可以自己修改）
    const prompt = `
    你是一个温和的心理咨询助手，用户分享了今日情绪和事件，请完成3件事：
    1. 确认情绪类型（比如：开心、轻度焦虑、低落、平静等）；
    2. 简单分析情绪背后的可能原因（基于用户描述）；
    3. 给出1-2条具体、温暖的疏导建议（不用太长，50字以内）。
    回复语气要亲切、鼓励，不要用专业术语。

    用户情绪标签：${moodTag}
    用户事件描述：${moodDesc}
    `;

    // 发送请求给AI
    const response = await fetch(AI_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${AI_API_KEY}` // 密钥验证
        },
        body: JSON.stringify({
            model: "Doubao-Seed-1.6", // 免费模型，直接用
            input: { prompt: prompt },
            parameters: { temperature: 0.7 } // 0-1之间，越高越灵活
        })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "AI接口调用失败");
    return result.data.output.text.trim();
}

// 5. 保存记录到浏览器本地存储
function saveRecord(record) {
    // 从本地存储获取已有记录（没有就为空数组）
    const history = JSON.parse(localStorage.getItem("moodHistory")) || [];
    // 添加新记录到最前面
    history.unshift(record);
    // 保存回本地存储
    localStorage.setItem("moodHistory", JSON.stringify(history));
}

// 6. 加载并显示历史记录
function loadHistory() {
    const historyList = document.getElementById("history-list");
    const history = JSON.parse(localStorage.getItem("moodHistory")) || [];

    if (history.length === 0) {
        historyList.innerHTML = "<p>还没有情绪记录，快去添加第一条吧～</p>";
        return;
    }

    // 渲染每条记录
    historyList.innerHTML = history.map((record, index) => `
        <div class="history-item">
            <div class="history-date">${record.date}</div>
            <div class="history-mood">情绪：${record.moodTag}</div>
            <div class="history-desc">描述：${record.moodDesc}</div>
            <div class="history-analysis">AI建议：${record.aiAnalysis}</div>
        </div>
    `).join("");
}