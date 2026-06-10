export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/api/activities/:path*', '/api/footprint/:path*'],
};
