import { OAuthClient, OAuthCode, OAuthToken } from '../models/OAuth.js';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

export const authorize = async (req, res) => {
  try {
    const { response_type, client_id, redirect_uri, state, scope } = req.query;

    if (response_type !== 'code') {
      return res.status(400).json({
        success: false,
        error: 'unsupported_response_type',
        error_description: '仅支持"code"响应类型'
      });
    }

    const client = await OAuthClient.findByClientId(client_id);
    if (!client) {
      return res.status(400).json({
        success: false,
        error: 'invalid_client',
        error_description: '客户端未注册'
      });
    }

    if (!await OAuthClient.validateRedirectUri(client, redirect_uri)) {
      return res.status(400).json({
        success: false,
        error: 'invalid_redirect_uri',
        error_description: '回调地址不在允许列表中'
      });
    }

    if (!state) {
      return res.status(400).json({
        success: false,
        error: 'invalid_request',
        error_description: '缺少state参数'
      });
    }

    if (!req.user) {
      const loginUrl = new URL('/oauth/authorize', process.env.FRONTEND_URL || 'http://localhost:5174');
      loginUrl.searchParams.set('response_type', response_type);
      loginUrl.searchParams.set('client_id', client_id);
      loginUrl.searchParams.set('redirect_uri', redirect_uri);
      loginUrl.searchParams.set('state', state);
      if (scope) loginUrl.searchParams.set('scope', scope);
      return res.redirect(loginUrl.toString());
    }

    const scopes = scope ? scope.split(' ') : ['openid', 'profile', 'email'];
    
    const code = await OAuthCode.create(req.user.id, client_id, redirect_uri, scopes);
    
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set('code', code);
    redirectUrl.searchParams.set('state', state);
    
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('OAuth authorize error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      error_description: '服务器内部错误'
    });
  }
};

export const authorizeWithToken = async (req, res) => {
  try {
    const { response_type, client_id, redirect_uri, state, scope } = req.query;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'unauthorized',
        error_description: '缺少授权信息或授权信息格式无效'
      });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({
        success: false,
        error: 'invalid_token',
        error_description: '令牌无效或已过期'
      });
    }

    if (response_type !== 'code') {
      return res.status(400).json({
        success: false,
        error: 'unsupported_response_type',
        error_description: '仅支持"code"响应类型'
      });
    }

    const client = await OAuthClient.findByClientId(client_id);
    console.log('OAuth client lookup:', client_id, client ? 'found' : 'not found');
    if (!client) {
      return res.status(400).json({
        success: false,
        error: 'invalid_client',
        error_description: '客户端未注册'
      });
    }

    if (!await OAuthClient.validateRedirectUri(client, redirect_uri)) {
      return res.status(400).json({
        success: false,
        error: 'invalid_redirect_uri',
        error_description: '回调地址不在允许列表中'
      });
    }

    if (!state) {
      return res.status(400).json({
        success: false,
        error: 'invalid_request',
        error_description: '缺少state参数'
      });
    }

    const scopes = scope ? scope.split(' ') : ['openid', 'profile', 'email'];
    const userId = decoded.userId || decoded.sub;
    
    const code = await OAuthCode.create(userId, client_id, redirect_uri, scopes);
    
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set('code', code);
    redirectUrl.searchParams.set('state', state);
    
    res.json({
      success: true,
      redirect_url: redirectUrl.toString()
    });
  } catch (error) {
    console.error('OAuth authorize error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      error_description: '服务器内部错误'
    });
  }
};

export const token = async (req, res) => {
  try {
    const { grant_type } = req.body;

    if (grant_type === 'authorization_code') {
      return await handleAuthorizationCodeGrant(req, res);
    } else if (grant_type === 'refresh_token') {
      return await handleRefreshTokenGrant(req, res);
    } else {
      return res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: 'Only "authorization_code" and "refresh_token" grant types are supported'
      });
    }
  } catch (error) {
    console.error('OAuth token error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error'
    });
  }
};

async function handleAuthorizationCodeGrant(req, res) {
  const { code, redirect_uri, client_id, client_secret } = req.body;

  const client = await OAuthClient.findByClientId(client_id);
  if (!client || client.client_secret !== client_secret) {
    return res.status(401).json({
      error: 'invalid_client',
      error_description: 'Client authentication failed'
    });
  }

  const authCode = await OAuthCode.findByCode(code);
  if (!authCode) {
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Invalid or expired authorization code'
    });
  }

  if (authCode.client_id !== client_id || authCode.redirect_uri !== redirect_uri) {
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Authorization code mismatch'
    });
  }

  await OAuthCode.markAsUsed(code);

  const token = await OAuthToken.create(authCode.user_id, client_id, JSON.parse(authCode.scopes || '[]'));

  res.json({
    access_token: token.accessToken,
    token_type: 'Bearer',
    expires_in: 7200,
    refresh_token: token.refreshToken
  });
}

async function handleRefreshTokenGrant(req, res) {
  const { refresh_token, client_id, client_secret } = req.body;

  const client = await OAuthClient.findByClientId(client_id);
  if (!client || client.client_secret !== client_secret) {
    return res.status(401).json({
      error: 'invalid_client',
      error_description: 'Client authentication failed'
    });
  }

  const existingToken = await OAuthToken.findByRefreshToken(refresh_token);
  if (!existingToken) {
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Invalid refresh token'
    });
  }

  await OAuthToken.revoke(existingToken.access_token);

  const newToken = await OAuthToken.create(existingToken.user_id, client_id, JSON.parse(existingToken.scopes || '[]'));

  res.json({
    access_token: newToken.accessToken,
    token_type: 'Bearer',
    expires_in: 7200,
    refresh_token: newToken.refreshToken
  });
}

export const userinfo = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Missing or invalid authorization header'
      });
    }

    const accessToken = authHeader.substring(7);
    const token = await OAuthToken.findByAccessToken(accessToken);
    
    if (!token) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Invalid or expired access token'
      });
    }

    const user = await User.findById(token.user_id);
    if (!user) {
      return res.status(404).json({
        error: 'user_not_found',
        error_description: 'User not found'
      });
    }

    res.json({
      sub: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role || 'user'
    });
  } catch (error) {
    console.error('OAuth userinfo error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Internal server error'
    });
  }
}

// Trigger reload
