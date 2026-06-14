"""应用配置，从环境变量或 .env 文件加载设置。"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用全局设置，包含数据库、DashScope API、模型名称等配置。"""

    model_config = SettingsConfigDict(env_file=".env")

    # 数据库连接 URL
    database_url: str = "sqlite:///./agent_demo.db"

    # 阿里云 DashScope API 密钥
    aliyun_dashscope_api_key: str = ""

    # 各场景使用的模型名称
    text_model: str = "qwen-plus"            # 文本对话模型
    multimodal_model: str = "qwen-vl-plus"   # 多模态视觉模型
    asr_model: str = "paraformer-v2"         # 语音识别模型


settings = Settings()