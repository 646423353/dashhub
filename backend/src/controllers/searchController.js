import { Project } from '../models/Project.js';
import { dbHelper } from '../config/database.js';

/**
 * 搜索项目
 * GET /api/search/projects?q=keyword
 *
 * 搜索推荐算法综合权重计算公式:
 *
 * relevance_score = (text_match_score * 0.4) +
 *                  (popularity_score * 0.3) +
 *                  (activity_score * 0.2) +
 *                  (recency_score * 0.1)
 *
 * 各组成部分:
 * 1. text_match_score (40%): 文本匹配度
 *    - 搜索范围: 项目名称、描述、类型
 *
 * 2. popularity_score (30%): 人气得分
 *    - 浏览次数 (view_count): 每次浏览 +1 分
 *    - 点击次数 (click_count): 每次点击 +2 分
 *
 * 3. activity_score (20%): 活跃度得分
 *    - 近一周交易金额 (weekly_transaction_amount)
 *    - 近一周分账金额 (weekly_revenue_share_amount)
 *
 * 4. recency_score (10%): 时间新鲜度得分
 *    - 项目创建时间越新，得分越高
 *
 * 排序规则:
 * 1. 首先按 relevance_score 降序排列
 * 2. 同等得分时，按 weekly_transaction_amount 降序排列
 * 3. 再按 created_at 降序排列
 */
export const searchProjects = async (req, res) => {
  try {
    const { q: query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Log search history
    if (req.user) {
      await dbHelper.searchHistory.create({
        user_id: req.user.id,
        query: query.trim(),
        result_count: 0
      });
    }

    // Search projects using the algorithm
    const projects = await Project.search(query.trim(), limit, offset);

    res.json({
      success: true,
      data: projects,
      meta: {
        query: query.trim(),
        page,
        limit,
        hasMore: projects.length === limit
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
};

/**
 * 获取热门搜索词
 * GET /api/search/trending
 */
export const getTrendingSearches = async (req, res) => {
  try {
    const allHistory = await dbHelper.searchHistory.getAllHistory(100);

    // 计算每个查询的出现次数
    const queryCount = {};
    allHistory.forEach(item => {
      queryCount[item.query] = (queryCount[item.query] || 0) + 1;
    });

    // 按频率排序，返回前10个
    const trending = Object.entries(queryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query]) => query);

    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    console.error('Get trending searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending searches'
    });
  }
};

/**
 * 获取搜索历史
 * GET /api/search/history
 */
export const getSearchHistory = async (req, res) => {
  try {
    const history = await dbHelper.searchHistory.getUserHistory(req.user.id);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search history'
    });
  }
};

/**
 * 清除搜索历史
 * DELETE /api/search/history
 */
export const clearSearchHistory = async (req, res) => {
  try {
    await dbHelper.searchHistory.clearUserHistory(req.user.id);

    res.json({
      success: true,
      message: 'Search history cleared'
    });
  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear search history'
    });
  }
};
