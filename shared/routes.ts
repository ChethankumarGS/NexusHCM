import { z } from 'zod';
import { insertUserSchema, insertAttendanceSchema, insertLeaveSchema, insertSalarySchema, users, attendance, leaves, salaries } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/users/:id',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/users/:id',
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  attendance: {
    clockIn: {
      method: 'POST' as const,
      path: '/api/attendance/clock-in',
      responses: {
        201: z.custom<typeof attendance.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    clockOut: {
      method: 'POST' as const,
      path: '/api/attendance/clock-out',
      responses: {
        200: z.custom<typeof attendance.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/attendance', // Optional query param ?userId for managers
      input: z.object({ userId: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof attendance.$inferSelect>()),
      },
    },
    today: {
      method: 'GET' as const,
      path: '/api/attendance/today',
      responses: {
        200: z.custom<typeof attendance.$inferSelect>().optional(),
      },
    },
  },
  leaves: {
    create: {
      method: 'POST' as const,
      path: '/api/leaves',
      input: insertLeaveSchema,
      responses: {
        201: z.custom<typeof leaves.$inferSelect>(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/leaves', // ?userId for specific user, otherwise all for manager or own for employee
      responses: {
        200: z.array(z.custom<typeof leaves.$inferSelect>()),
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/leaves/:id/status',
      input: z.object({ status: z.enum(["APPROVED", "REJECTED"]) }),
      responses: {
        200: z.custom<typeof leaves.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  salaries: {
    list: {
      method: 'GET' as const,
      path: '/api/salaries',
      responses: {
        200: z.array(z.custom<typeof salaries.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
