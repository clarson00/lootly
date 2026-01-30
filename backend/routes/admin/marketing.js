/**
 * Marketing Posts API
 * Handles creating, scheduling, and publishing social media posts
 */
const express = require('express');
const router = express.Router();
const { db, schema, generateId } = require('../../db');
const { eq, and, desc, gte, lte, or, isNull, sql } = require('drizzle-orm');
const { decrypt } = require('../../lib/crypto');
const { describeRule, describeVoyage, generateMarketingSummary } = require('../../lib/rules/plain-language');

const { marketingPosts, socialIntegrations, rules, rulesets, locations, businesses, rewards } = schema;

// Middleware to extract businessId from query (consistent with rules routes)
const extractBusinessId = (req, res, next) => {
  req.staff = {
    business_id: req.query.business_id || req.body?.business_id
  };

  if (!req.staff.business_id) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_BUSINESS', message: 'business_id is required' }
    });
  }

  next();
};

// ============================================
// LIST POSTS
// ============================================

/**
 * GET /api/admin/marketing/posts
 * List marketing posts with filters
 */
router.get('/posts', extractBusinessId, async (req, res) => {
  try {
    const { business_id } = req.staff;
    const { status, platform, location_id, limit = 50, offset = 0 } = req.query;

    // Build conditions
    const conditions = [eq(marketingPosts.businessId, business_id)];

    if (status) {
      conditions.push(eq(marketingPosts.status, status));
    }

    if (location_id) {
      conditions.push(
        or(
          eq(marketingPosts.locationId, location_id),
          isNull(marketingPosts.locationId) // Business-wide posts also show
        )
      );
    }

    // Filter by platform (JSONB array contains)
    if (platform) {
      conditions.push(
        sql`${marketingPosts.platforms}::jsonb ? ${platform}`
      );
    }

    const posts = await db
      .select()
      .from(marketingPosts)
      .where(and(...conditions))
      .orderBy(desc(marketingPosts.createdAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(marketingPosts)
      .where(and(...conditions));

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          total: parseInt(count),
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
  } catch (error) {
    console.error('[MARKETING] Error listing posts:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch posts' }
    });
  }
});

/**
 * GET /api/admin/marketing/posts/:id
 * Get single post details
 */
router.get('/posts/:id', extractBusinessId, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.staff;

    const [post] = await db
      .select()
      .from(marketingPosts)
      .where(and(
        eq(marketingPosts.id, id),
        eq(marketingPosts.businessId, business_id)
      ));

    if (!post) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Post not found' }
      });
    }

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('[MARKETING] Error fetching post:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch post' }
    });
  }
});

// ============================================
// CREATE POST
// ============================================

/**
 * POST /api/admin/marketing/posts
 * Create a new marketing post (draft or scheduled)
 */
router.post('/posts', extractBusinessId, async (req, res) => {
  try {
    const { business_id, id: staff_id } = req.staff;
    const {
      content,
      image_url,
      platforms,
      source_type,
      source_id,
      location_id,
      scheduled_at,
      publish_now
    } = req.body;

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CONTENT', message: 'Post content is required' }
      });
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_PLATFORMS', message: 'At least one platform is required' }
      });
    }

    // Check if Instagram is selected but no image
    if (platforms.includes('instagram') && !image_url) {
      return res.status(400).json({
        success: false,
        error: { code: 'IG_REQUIRES_IMAGE', message: 'Instagram posts require an image' }
      });
    }

    // Verify location ownership if specified
    if (location_id) {
      const [location] = await db
        .select()
        .from(locations)
        .where(and(
          eq(locations.id, location_id),
          eq(locations.businessId, business_id)
        ));

      if (!location) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_LOCATION', message: 'Location not found' }
        });
      }
    }

    // Determine status
    let status = 'draft';
    let scheduledDate = null;

    if (scheduled_at) {
      const scheduleTime = new Date(scheduled_at);
      if (scheduleTime <= new Date()) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_SCHEDULE', message: 'Scheduled time must be in the future' }
        });
      }
      status = 'scheduled';
      scheduledDate = scheduleTime;
    }

    // Create post
    const postId = generateId('mpost');
    await db.insert(marketingPosts).values({
      id: postId,
      businessId: business_id,
      locationId: location_id || null,
      sourceType: source_type || null,
      sourceId: source_id || null,
      content: content.trim(),
      imageUrl: image_url || null,
      platforms: platforms,
      status,
      scheduledAt: scheduledDate,
      createdBy: staff_id,
    });

    console.log(`[MARKETING] Post created: ${postId} (${status})`);

    // If publish_now is true, publish immediately
    if (publish_now) {
      const publishResult = await publishPost(postId, business_id, location_id);
      if (!publishResult.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'PUBLISH_FAILED', message: publishResult.error }
        });
      }
    }

    // Fetch and return created post
    const [post] = await db
      .select()
      .from(marketingPosts)
      .where(eq(marketingPosts.id, postId));

    res.status(201).json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('[MARKETING] Error creating post:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create post' }
    });
  }
});

// ============================================
// UPDATE POST
// ============================================

/**
 * PATCH /api/admin/marketing/posts/:id
 * Update a draft or scheduled post
 */
router.patch('/posts/:id', extractBusinessId, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.staff;
    const { content, image_url, platforms, location_id, scheduled_at } = req.body;

    // Get existing post
    const [post] = await db
      .select()
      .from(marketingPosts)
      .where(and(
        eq(marketingPosts.id, id),
        eq(marketingPosts.businessId, business_id)
      ));

    if (!post) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Post not found' }
      });
    }

    // Can only update draft or scheduled posts
    if (!['draft', 'scheduled'].includes(post.status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'NOT_EDITABLE', message: 'Published posts cannot be edited' }
      });
    }

    // Build update object
    const updates = { updatedAt: new Date() };

    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_CONTENT', message: 'Post content is required' }
        });
      }
      updates.content = content.trim();
    }

    if (image_url !== undefined) {
      updates.imageUrl = image_url || null;
    }

    if (platforms !== undefined) {
      if (!Array.isArray(platforms) || platforms.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_PLATFORMS', message: 'At least one platform is required' }
        });
      }
      updates.platforms = platforms;
    }

    if (location_id !== undefined) {
      updates.locationId = location_id || null;
    }

    if (scheduled_at !== undefined) {
      if (scheduled_at) {
        const scheduleTime = new Date(scheduled_at);
        if (scheduleTime <= new Date()) {
          return res.status(400).json({
            success: false,
            error: { code: 'INVALID_SCHEDULE', message: 'Scheduled time must be in the future' }
          });
        }
        updates.scheduledAt = scheduleTime;
        updates.status = 'scheduled';
      } else {
        updates.scheduledAt = null;
        updates.status = 'draft';
      }
    }

    // Check IG image requirement
    const finalPlatforms = updates.platforms || post.platforms;
    const finalImageUrl = updates.imageUrl !== undefined ? updates.imageUrl : post.imageUrl;
    if (finalPlatforms.includes('instagram') && !finalImageUrl) {
      return res.status(400).json({
        success: false,
        error: { code: 'IG_REQUIRES_IMAGE', message: 'Instagram posts require an image' }
      });
    }

    await db.update(marketingPosts)
      .set(updates)
      .where(eq(marketingPosts.id, id));

    // Fetch updated post
    const [updatedPost] = await db
      .select()
      .from(marketingPosts)
      .where(eq(marketingPosts.id, id));

    res.json({
      success: true,
      data: { post: updatedPost }
    });
  } catch (error) {
    console.error('[MARKETING] Error updating post:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update post' }
    });
  }
});

// ============================================
// DELETE POST
// ============================================

/**
 * DELETE /api/admin/marketing/posts/:id
 * Delete a marketing post
 */
router.delete('/posts/:id', extractBusinessId, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.staff;

    const [post] = await db
      .select()
      .from(marketingPosts)
      .where(and(
        eq(marketingPosts.id, id),
        eq(marketingPosts.businessId, business_id)
      ));

    if (!post) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Post not found' }
      });
    }

    await db.delete(marketingPosts).where(eq(marketingPosts.id, id));

    console.log(`[MARKETING] Post deleted: ${id}`);

    res.json({
      success: true,
      message: 'Post deleted'
    });
  } catch (error) {
    console.error('[MARKETING] Error deleting post:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete post' }
    });
  }
});

// ============================================
// PUBLISH POST
// ============================================

/**
 * POST /api/admin/marketing/posts/:id/publish
 * Publish a draft or scheduled post immediately
 */
router.post('/posts/:id/publish', extractBusinessId, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.staff;

    // Get post
    const [post] = await db
      .select()
      .from(marketingPosts)
      .where(and(
        eq(marketingPosts.id, id),
        eq(marketingPosts.businessId, business_id)
      ));

    if (!post) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Post not found' }
      });
    }

    if (post.status === 'published') {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_PUBLISHED', message: 'Post is already published' }
      });
    }

    const result = await publishPost(id, business_id, post.locationId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'PUBLISH_FAILED', message: result.error }
      });
    }

    // Fetch updated post
    const [updatedPost] = await db
      .select()
      .from(marketingPosts)
      .where(eq(marketingPosts.id, id));

    res.json({
      success: true,
      data: {
        post: updatedPost,
        results: result.platformResults
      }
    });
  } catch (error) {
    console.error('[MARKETING] Error publishing post:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to publish post' }
    });
  }
});

// ============================================
// CLONE POST
// ============================================

/**
 * POST /api/admin/marketing/posts/:id/clone
 * Clone a post (optionally to a different location)
 */
router.post('/posts/:id/clone', extractBusinessId, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id, id: staff_id } = req.staff;
    const { location_id } = req.body;

    // Get original post
    const [originalPost] = await db
      .select()
      .from(marketingPosts)
      .where(and(
        eq(marketingPosts.id, id),
        eq(marketingPosts.businessId, business_id)
      ));

    if (!originalPost) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Post not found' }
      });
    }

    // Create clone
    const cloneId = generateId('mpost');
    await db.insert(marketingPosts).values({
      id: cloneId,
      businessId: business_id,
      locationId: location_id !== undefined ? location_id : originalPost.locationId,
      sourceType: originalPost.sourceType,
      sourceId: originalPost.sourceId,
      content: originalPost.content,
      imageUrl: originalPost.imageUrl,
      platforms: originalPost.platforms,
      status: 'draft',
      createdBy: staff_id,
    });

    console.log(`[MARKETING] Post cloned: ${id} -> ${cloneId}`);

    // Fetch cloned post
    const [clonedPost] = await db
      .select()
      .from(marketingPosts)
      .where(eq(marketingPosts.id, cloneId));

    res.status(201).json({
      success: true,
      data: { post: clonedPost }
    });
  } catch (error) {
    console.error('[MARKETING] Error cloning post:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to clone post' }
    });
  }
});

// ============================================
// CONTENT PREVIEW (from Rule/Voyage)
// ============================================

/**
 * GET /api/admin/marketing/preview
 * Generate marketing content preview from a rule or voyage
 */
router.get('/preview', extractBusinessId, async (req, res) => {
  try {
    const { business_id } = req.staff;
    const { source_type, source_id } = req.query;

    if (!source_type || !source_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'source_type and source_id are required' }
      });
    }

    // Get business info
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, business_id));

    // Get all locations for context
    const businessLocations = await db
      .select()
      .from(locations)
      .where(eq(locations.businessId, business_id));

    let content = '';
    let summary = '';

    if (source_type === 'rule') {
      const [rule] = await db
        .select()
        .from(rules)
        .where(and(
          eq(rules.id, source_id),
          eq(rules.businessId, business_id)
        ));

      console.log('[MARKETING] Preview rule lookup:', { source_id, business_id, found: !!rule });
      if (rule) {
        console.log('[MARKETING] Rule data:', JSON.stringify({ name: rule.name, displayName: rule.displayName, conditions: rule.conditions, awards: rule.awards }, null, 2));
      }

      if (!rule) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Rule not found' }
        });
      }

      // Look up reward name if awardType is 'reward'
      let rewardName = null;
      if (rule.awardType === 'reward' && rule.awardValue) {
        const [reward] = await db
          .select()
          .from(rewards)
          .where(eq(rewards.id, rule.awardValue));
        rewardName = reward?.name;
      }

      // Add rewardName to rule object for plain language generation
      const ruleWithReward = { ...rule, rewardName };

      summary = describeRule(ruleWithReward, businessLocations);
      content = generateMarketingSummary('rule', ruleWithReward, businessLocations, [], business?.name);
      console.log('[MARKETING] Generated content:', { summaryLen: summary?.length, contentLen: content?.length, rewardName, contentPreview: content?.substring(0, 100) });
    } else if (source_type === 'voyage') {
      const [voyage] = await db
        .select()
        .from(rulesets)
        .where(and(
          eq(rulesets.id, source_id),
          eq(rulesets.businessId, business_id)
        ));

      if (!voyage) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Voyage not found' }
        });
      }

      // Get voyage steps (rules)
      const steps = await db
        .select()
        .from(rules)
        .where(eq(rules.rulesetId, source_id))
        .orderBy(rules.sequenceOrder);

      summary = describeVoyage(voyage, steps, businessLocations);
      content = generateMarketingSummary('voyage', { ...voyage, steps }, businessLocations, [], business?.name);
    } else {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_SOURCE_TYPE', message: 'source_type must be "rule" or "voyage"' }
      });
    }

    res.json({
      success: true,
      data: {
        summary,
        content,
        businessName: business?.name
      }
    });
  } catch (error) {
    console.error('[MARKETING] Error generating preview:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to generate preview' }
    });
  }
});

// ============================================
// CALENDAR VIEW
// ============================================

/**
 * GET /api/admin/marketing/calendar
 * Get scheduled posts for calendar view
 */
router.get('/calendar', extractBusinessId, async (req, res) => {
  try {
    const { business_id } = req.staff;
    const { start_date, end_date, location_id } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'start_date and end_date are required' }
      });
    }

    const conditions = [
      eq(marketingPosts.businessId, business_id),
      or(
        eq(marketingPosts.status, 'scheduled'),
        eq(marketingPosts.status, 'published')
      ),
      gte(sql`COALESCE(${marketingPosts.scheduledAt}, ${marketingPosts.publishedAt})`, new Date(start_date)),
      lte(sql`COALESCE(${marketingPosts.scheduledAt}, ${marketingPosts.publishedAt})`, new Date(end_date))
    ];

    if (location_id) {
      conditions.push(
        or(
          eq(marketingPosts.locationId, location_id),
          isNull(marketingPosts.locationId)
        )
      );
    }

    const posts = await db
      .select({
        id: marketingPosts.id,
        content: marketingPosts.content,
        platforms: marketingPosts.platforms,
        status: marketingPosts.status,
        scheduledAt: marketingPosts.scheduledAt,
        publishedAt: marketingPosts.publishedAt,
        locationId: marketingPosts.locationId,
      })
      .from(marketingPosts)
      .where(and(...conditions))
      .orderBy(sql`COALESCE(${marketingPosts.scheduledAt}, ${marketingPosts.publishedAt})`);

    // Transform for calendar display
    const events = posts.map(post => ({
      id: post.id,
      title: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
      date: post.scheduledAt || post.publishedAt,
      platforms: post.platforms,
      status: post.status,
      locationId: post.locationId,
    }));

    res.json({
      success: true,
      data: { events }
    });
  } catch (error) {
    console.error('[MARKETING] Error fetching calendar:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch calendar' }
    });
  }
});

// ============================================
// INTERNAL: Publish to platforms
// ============================================

async function publishPost(postId, businessId, locationId) {
  const platformResults = {};
  const platformErrors = {};
  let allFailed = true;

  // Get post
  const [post] = await db
    .select()
    .from(marketingPosts)
    .where(eq(marketingPosts.id, postId));

  if (!post) {
    return { success: false, error: 'Post not found' };
  }

  // Mark as publishing
  await db.update(marketingPosts)
    .set({ status: 'publishing', updatedAt: new Date() })
    .where(eq(marketingPosts.id, postId));

  for (const platform of post.platforms) {
    try {
      // Get integration for this platform
      const integrationConditions = [
        eq(socialIntegrations.businessId, businessId),
        eq(socialIntegrations.platform, platform),
        eq(socialIntegrations.isActive, true)
      ];

      // If post is location-specific, try location-specific integration first
      if (locationId) {
        integrationConditions.push(
          or(
            eq(socialIntegrations.locationId, locationId),
            isNull(socialIntegrations.locationId)
          )
        );
      }

      const integrations = await db
        .select()
        .from(socialIntegrations)
        .where(and(...integrationConditions))
        .orderBy(desc(socialIntegrations.locationId)); // Location-specific first

      const integration = integrations[0];

      if (!integration) {
        platformErrors[platform] = 'No connected account';
        continue;
      }

      // Decrypt token
      const accessToken = decrypt(integration.accessToken);
      if (!accessToken) {
        platformErrors[platform] = 'Invalid access token';
        continue;
      }

      // Publish based on platform
      let result;
      if (platform === 'facebook') {
        result = await publishToFacebook(integration.platformPageId, post.content, post.imageUrl, accessToken);
      } else if (platform === 'instagram') {
        result = await publishToInstagram(integration.platformAccountId, integration.platformPageId, post.content, post.imageUrl, accessToken);
      }

      if (result.success) {
        platformResults[platform] = result.postId;
        allFailed = false;
      } else {
        platformErrors[platform] = result.error;
      }
    } catch (error) {
      console.error(`[MARKETING] Error publishing to ${platform}:`, error);
      platformErrors[platform] = error.message;
    }
  }

  // Determine final status
  const finalStatus = allFailed ? 'failed' : (Object.keys(platformErrors).length > 0 ? 'partial' : 'published');

  // Update post
  await db.update(marketingPosts)
    .set({
      status: finalStatus,
      publishedAt: allFailed ? null : new Date(),
      platformPostIds: Object.keys(platformResults).length > 0 ? platformResults : null,
      platformErrors: Object.keys(platformErrors).length > 0 ? platformErrors : null,
      errorMessage: allFailed ? Object.values(platformErrors).join('; ') : null,
      updatedAt: new Date(),
    })
    .where(eq(marketingPosts.id, postId));

  console.log(`[MARKETING] Post ${postId} published: ${finalStatus}`);

  return {
    success: !allFailed,
    error: allFailed ? Object.values(platformErrors).join('; ') : null,
    platformResults,
    platformErrors
  };
}

async function publishToFacebook(pageId, content, imageUrl, accessToken) {
  try {
    let endpoint;
    let body;

    if (imageUrl) {
      // Photo post
      endpoint = `https://graph.facebook.com/v18.0/${pageId}/photos`;
      body = {
        url: imageUrl,
        caption: content,
        access_token: accessToken,
      };
    } else {
      // Text post
      endpoint = `https://graph.facebook.com/v18.0/${pageId}/feed`;
      body = {
        message: content,
        access_token: accessToken,
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.error) {
      return { success: false, error: data.error.message };
    }

    return { success: true, postId: data.id || data.post_id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function publishToInstagram(igAccountId, pageId, content, imageUrl, accessToken) {
  try {
    if (!imageUrl) {
      return { success: false, error: 'Instagram requires an image' };
    }

    // Step 1: Create media container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: content,
          access_token: accessToken,
        }),
      }
    );

    const containerData = await containerResponse.json();

    if (containerData.error) {
      return { success: false, error: containerData.error.message };
    }

    const containerId = containerData.id;

    // Step 2: Publish the container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();

    if (publishData.error) {
      return { success: false, error: publishData.error.message };
    }

    return { success: true, postId: publishData.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = router;
