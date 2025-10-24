package com.example.Edu_Camp.config;

import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.services.SessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.AntPathMatcher;
import java.util.Set;

import java.io.IOException;
import java.util.List;

@Component
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    // DEV writable public patterns (adjust for development use; leave empty to disable)
    private static final List<String> DEV_PUBLIC_WRITE_PATTERNS = List.of(
            // Example: allow POST/PUT/DELETE to dev-only endpoints
            "/dev/public/**",
            "/api/dev/**"
    );

    private final SessionService sessionService;
    private static final Logger logger = LoggerFactory.getLogger(SessionAuthenticationFilter.class);

    // Public GET-only endpoints (Ant-style patterns)
    private static final List<String> PUBLIC_GET_PATTERNS = List.of(
            "/subjects/**",
            "/classes/**",
            "/teachers/**",
            "/api/teachers/**",
            "/payments/**",
            "/users/**",
            "/api/admin/**",
            "/admin/**",
            "/api/enrollments/**",
            "/api/enrollments/class/**",
            "/admin/enrollments/**"
    );

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Autowired
    public SessionAuthenticationFilter(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Skip authentication for public endpoints
        if (isPublicEndpoint(request)) {
            logger.debug("Public endpoint - skipping authentication: {} {}", request.getMethod(), request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        String sessionId = extractSessionId(request);

        if (sessionId == null) {
            logger.warn("Missing session ID for: {} {}", request.getMethod(), request.getRequestURI());
            sendUnauthorizedError(response, "Missing session ID");
            return;
        }

        if (!sessionService.isValidSession(sessionId)) {
            logger.warn("Invalid session: {} for: {} {}", sessionId, request.getMethod(), request.getRequestURI());
            sendUnauthorizedError(response, "Invalid or expired session");
            return;
        }

        // ✅ Session is valid — authenticate user in Spring Security context
        User user = sessionService.getUserFromSession(sessionId);
        if (user != null) {
            // Create authorities based on user role
            List<SimpleGrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase())
            );

            // Build authentication token
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(user, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            logger.debug("Authenticated user '{}' with role '{}' for {}", user.getEmail(), user.getRole(), request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Allow OPTIONS and existing public paths as before
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }
        if ((path.startsWith("/api/auth/register") && "POST".equalsIgnoreCase(method))
                || (path.equals("/api/auth/login") && "POST".equalsIgnoreCase(method))
                || path.startsWith("/public/")
                || path.equals("/error")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/webjars/")) {
            return true;
        }

        // Allow GETs to configured public GET patterns
        if ("GET".equalsIgnoreCase(method)) {
            for (String pattern : PUBLIC_GET_PATTERNS) {
                if (pathMatcher.match(pattern, path)) {
                    return true;
                }
            }
        }

        // Allow POST, PUT and DELETE to configured dev public write patterns (if any)
        if (("POST".equalsIgnoreCase(method)
                || "PUT".equalsIgnoreCase(method)
                || "DELETE".equalsIgnoreCase(method))
                && !DEV_PUBLIC_WRITE_PATTERNS.isEmpty()) {
            for (String pattern : DEV_PUBLIC_WRITE_PATTERNS) {
                if (pathMatcher.match(pattern, path)) return true;
            }
        }

        return false;
    }

    private String extractSessionId(HttpServletRequest request) {
        // Check cookies first
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("sessionId".equals(cookie.getName())) {
                    logger.debug("Extracted session ID from cookie");
                    return cookie.getValue();
                }
            }
        }

        // Check Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            logger.debug("Extracted session ID from Authorization header");
            return authHeader.substring(7);
        }

        // Check custom header
        String sessionHeader = request.getHeader("X-Session-Id");
        if (sessionHeader != null) {
            logger.debug("Extracted session ID from X-Session-Id header");
            return sessionHeader;
        }

        logger.debug("No session ID found in request");
        return null;
    }

    private void sendUnauthorizedError(HttpServletResponse response, String message)
            throws IOException {
        logger.warn("Sending unauthorized error: {}", message);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(String.format("{\"success\": false, \"message\": \"%s\"}", message));
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Skip filter for OPTIONS, public static resources, and matching public GET patterns
        boolean shouldNotFilter = "OPTIONS".equalsIgnoreCase(method)
                || path.startsWith("/public/")
                || path.contains("."); // static resources with extensions

        if (!shouldNotFilter && "GET".equalsIgnoreCase(method)) {
            for (String pattern : PUBLIC_GET_PATTERNS) {
                if (pathMatcher.match(pattern, path)) {
                    shouldNotFilter = true;
                    break;
                }
            }
        }

        if (shouldNotFilter) {
            logger.debug("Skipping filter for: {} {}", request.getMethod(), path);
        }

        return shouldNotFilter;
    }
}