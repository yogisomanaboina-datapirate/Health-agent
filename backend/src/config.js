import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'lifelink_default_secret_2025',
  featherless: {
    apiKey: process.env.FEATHERLESS_API_KEY || 'rc_cc08eb21050268a792bcb8d0a2ef1388d6ca702ed8783224aeb6ffc3cf7f20a8',
    baseUrl: process.env.FEATHERLESS_BASE_URL || 'https://api.featherless.ai/v1',
    model: process.env.FEATHERLESS_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
    userAgent: process.env.USER_AGENT || 'LifeLink-Agent/1.0'
  }
};
