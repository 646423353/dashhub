import { Project } from '../models/Project.js';
import { User } from '../models/User.js';

/**
 * 获取首页项目列表
 * GET /api/projects/home
 */
export const getHomeProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12; // 一页显示12个项目，一屏3-4个左右
    const offset = (page - 1) * limit;

    // Get pinned projects
    const pinnedProjects = await Project.getPinnedProjects();

    // Get hot projects
    const hotProjects = await Project.getHotProjects(limit, offset);

    res.json({
      success: true,
      data: {
        pinned: pinnedProjects,
        hot: hotProjects
      },
      pagination: {
        page,
        limit,
        hasMore: hotProjects.length === limit
      }
    });
  } catch (error) {
    console.error('Get home projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get projects'
    });
  }
};

/**
 * 获取项目详情
 * GET /api/projects/:id
 */
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    // Increment view count
    await Project.incrementViewCount(id);

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project'
    });
  }
};

/**
 * 跳转到项目URL
 * GET /api/projects/:id/visit
 */
export const visitProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Increment click count
    await Project.incrementClickCount(id);

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Redirect to project URL
    res.redirect(project.url);
  } catch (error) {
    console.error('Visit project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to visit project'
    });
  }
};

/**
 * 创建项目
 * POST /api/projects
 */
export const createProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      url,
      type,
      logo,
      coverImage,
      videoUrl,
      disclosureProtocol,
      cooperationForm,
      useDashtro,
      dashtroAgreement
    } = req.body;

    // Validate required fields
    if (!name || !url || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name, URL, and type are required'
      });
    }

    // Validate type
    const validTypes = ['brand', 'traffic', 'ai_agent'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be brand, traffic, or ai_agent'
      });
    }

    // Create project
    const project = await Project.create({
      creatorId: userId,
      name,
      description,
      url,
      type,
      logo,
      coverImage,
      videoUrl,
      disclosureProtocol,
      cooperationForm,
      useDashtro,
      dashtroAgreement,
      isPinned: false
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
};

/**
 * 更新项目
 * PUT /api/projects/:id
 */
export const updateProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    // Check if project exists and belongs to user
    const existingProject = await Project.findById(id);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (existingProject.creator_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this project'
      });
    }

    // 将数组类型的源字段转换为 JSON 字符串以符合数据库预编译要求
    const updateData = { ...updates };
    if (Array.isArray(updateData.coverImage)) {
      updateData.cover_image = JSON.stringify(updateData.coverImage);
      delete updateData.coverImage;
    }
    if (Array.isArray(updateData.videoUrl)) {
      updateData.video_url = JSON.stringify(updateData.videoUrl);
      delete updateData.videoUrl;
    }

    // 如果没有被包含在 updates 里但在原值里存在，也防止覆盖时结构错乱
    if (updateData.disclosureProtocol !== undefined) {
      updateData.disclosure_protocol = updateData.disclosureProtocol;
      delete updateData.disclosureProtocol;
    }
    if (updateData.cooperationForm !== undefined) {
      updateData.cooperation_form = updateData.cooperationForm;
      delete updateData.cooperationForm;
    }
    if (updateData.useDashtro !== undefined) {
      updateData.use_dashtro = updateData.useDashtro ? 1 : 0;
      delete updateData.useDashtro;
    }
    if (updateData.dashtroAgreement !== undefined) {
      updateData.dashtro_agreement = updateData.dashtroAgreement;
      delete updateData.dashtroAgreement;
    }

    // Update project
    const project = await Project.update(id, updateData);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
};

/**
 * 删除项目
 * DELETE /api/projects/:id
 */
export const deleteProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const project = await Project.delete(id, userId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
};

/**
 * 获取我的项目
 * GET /api/projects/my
 */
export const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await User.getUserProjects(userId);

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get projects'
    });
  }
};

/**
 * 按类型获取项目
 * GET /api/projects/type/:type
 */
export const getProjectsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const validTypes = ['brand', 'traffic', 'ai_agent'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type'
      });
    }

    const projects = await Project.findAll({ type, limit, offset });

    res.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        hasMore: projects.length === limit
      }
    });
  } catch (error) {
    console.error('Get projects by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get projects'
    });
  }
};

/**
 * 更新项目统计数据
 * PUT /api/projects/:id/stats
 */
export const updateProjectStats = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = req.body;

    const projectStats = await Project.updateProjectStats(id, stats);

    res.json({
      success: true,
      message: 'Project stats updated successfully',
      data: projectStats
    });
  } catch (error) {
    console.error('Update project stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project stats'
    });
  }
};

/**
 * 获取总财富排行榜
 * GET /api/projects/leaderboard/total
 */
export const getTotalLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const projects = await Project.getTotalLeaderboard(limit);
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Get total leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to get total leaderboard' });
  }
};

/**
 * 获取本周新星上升排行榜
 * GET /api/projects/leaderboard/rising
 */
export const getRisingLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const projects = await Project.getRisingLeaderboard(limit);
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Get rising leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to get rising leaderboard' });
  }
};
