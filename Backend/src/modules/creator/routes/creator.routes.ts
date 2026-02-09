// Stub Creator/Referral Routes - Fixes BUG-009
// Author: Sanket
// These are placeholder endpoints until full creator/referral system is built

import { FastifyPluginAsync } from 'fastify';

const creatorRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/creator/earnings
   * Get creator earnings data
   */
  fastify.get('/earnings', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    // TODO: Implement real earnings calculation from database
    // For now, return placeholder data
    return reply.send({
      success: true,
      data: {
        totalEarnings: 0,
        currentMonthEarnings: 0,
        pendingBalance: 0,
        totalUsers: 0,
      },
    });
  });

  /**
   * GET /api/v1/creator/top-workflows
   * Get creator's top performing workflows
   */
  fastify.get('/top-workflows', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    // TODO: Implement real workflow stats from database
    return reply.send({
      success: true,
      data: [],
    });
  });
};

export default creatorRoutes;
