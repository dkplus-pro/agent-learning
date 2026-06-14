"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Database
    database_url: str = "sqlite:///./agent_demo.db"

    # DashScope API
    aliyun_dashscope_api_key: str = ""

    # Model names
    text_model: str = "qwen-plus"
    multimodal_model: str = "qwen-vl-plus"
    asr_model: str = "paraformer-v2"

    class Config:
        env_file = ".env"


settings = Settings()
